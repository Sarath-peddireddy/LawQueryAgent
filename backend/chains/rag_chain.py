# backend/chains/rag_chain.py

import re
from rank_bm25 import BM25Okapi
from langchain.chains import RetrievalQA
from langchain_community.tools import Tool
from langchain_community.utilities import SerpAPIWrapper
from langchain_core.prompts import PromptTemplate
from langchain.schema import BaseRetriever, Document
from typing import Any, List, Optional, Dict
from langchain.callbacks.manager import CallbackManagerForRetrieverRun
from pydantic import BaseModel, Field
import asyncio
from config import settings
from embeddings.embedding_manager import build_or_load_vectorstores
from fpdf import FPDF
import os
import uuid
from langchain_openai import ChatOpenAI

# Initialize LLM
llm = ChatOpenAI(
    api_key=settings.OPENAI_API_KEY,
    model="gpt-3.5-turbo",
    temperature=0.7
)

# Initialize vectorstore (this should be done in main.py and passed here)
vectorstore = None

def set_vectorstore(vs):
    global vectorstore
    vectorstore = vs

# --- Text Cleaning ---
def clean_text(text):
    return re.sub(r'\W+', ' ', text.lower())

# --- Custom Retriever ---
class HybridRetriever(BaseRetriever):
    """Custom retriever that combines vector similarity with BM25 ranking"""

    def __init__(
        self,
        vectorstore: Any,
        top_k: int = 4,
    ):
        """Initialize the hybrid retriever"""
        super().__init__()
        self._vectorstore = vectorstore
        self._top_k = top_k

    @property
    def vectorstore(self):
        return self._vectorstore

    @property
    def top_k(self):
        return self._top_k

    def _get_relevant_documents(
        self,
        query: str,
        *,
        run_manager: Optional[CallbackManagerForRetrieverRun] = None,
    ) -> List[Document]:
        """Get relevant documents using hybrid search"""
        try:
            # Get initial candidates from vector similarity
            texts = self.vectorstore.similarity_search(query, k=30)

            # Prepare corpus for BM25
            corpus = [doc.page_content for doc in texts]
            tokenized_corpus = [clean_text(doc).split() for doc in corpus]

            bm25 = BM25Okapi(tokenized_corpus)

            # Get BM25 scores
            tokenized_query = clean_text(query).split()
            bm25_scores = bm25.get_scores(tokenized_query)

            # Combine and sort results
            scored_docs = list(zip(texts, bm25_scores))
            scored_docs = sorted(scored_docs, key=lambda x: x[1], reverse=True)[:self.top_k]

            return [doc for doc, _ in scored_docs]
        except Exception as e:
            print(f"Error in hybrid retrieval: {str(e)}")
            return self.vectorstore.similarity_search(query, k=self.top_k)

    async def _aget_relevant_documents(
        self,
        query: str,
        *,
        run_manager: Optional[CallbackManagerForRetrieverRun] = None,
    ) -> List[Document]:
        """Async implementation of document retrieval"""
        return self._get_relevant_documents(query, run_manager=run_manager)

# --- Main RAG Chain Generator ---
def get_rag_chain(vectorstore, llm):
    """Create enhanced RAG chain with hybrid retriever"""

    template = """You are a legal expert assistant. Use the following pieces of context to answer the question at the end.
If you don't know the answer, just say that you don't have enough information - don't try to make up an answer.

Context: {context}

Question: {question}

Please provide a detailed, well-structured answer with the following format:

Legal Analysis:
- Provide a comprehensive legal analysis combining information from legal documents and web sources
- Include relevant case laws, statutes, and legal principles
- Highlight key legal implications and interpretations

Additional Context:
- Provide detailed background information
- Include relevant precedents and case studies
- Explain legal concepts and their practical applications

Punishments and Fines:
- List applicable penalties, fines, or punishments if relevant
- Include maximum and minimum punishments where applicable
- Note any special circumstances that affect penalties

Sources:
- List all relevant legal sources with clickable links
- Include case citations, statute references, and web sources
- Format links as [Source Name](URL)

Answer:"""

    prompt = PromptTemplate(
        template=template,
        input_variables=["context", "question"]
    )

    retriever = HybridRetriever(vectorstore=vectorstore, top_k=4)

    qa_chain = RetrievalQA.from_chain_type(
        llm=llm,
        chain_type="stuff",
        retriever=retriever,
        return_source_documents=True,
        chain_type_kwargs={
            "prompt": prompt,
            "verbose": True
        }
    )

    return qa_chain

# --- SerpAPI Fallback Tool ---
def get_fallback_tool():
    """Create web search tool"""

    search = SerpAPIWrapper(serpapi_api_key=settings.SERPAPI_API_KEY)
    return Tool.from_function(
        func=search.run,
        name="Web Search",
        description="Search the web for legal information and recent updates"
    )

async def get_web_search_results(query: str) -> str:
    """Get results from SerpAPI"""
    try:
        search = SerpAPIWrapper(serpapi_api_key=settings.SERPAPI_API_KEY)
        return await asyncio.to_thread(search.run, query)
    except Exception as e:
        print(f"Web search error: {str(e)}")
        return "Web search unavailable."

def merge_responses(llm, rag_answer: str, web_answer: str) -> str:
    """Merge RAG and web search responses using OpenAI"""
    try:
        prompt = f"""As a legal expert, analyze and merge these two responses into a comprehensive answer:

LEGAL DOCUMENTS RESPONSE:
{rag_answer}

WEB SEARCH RESPONSE:
{web_answer}

Provide a well-structured answer that:
1. Combines key insights from both sources
2. Highlights important legal principles
3. Notes any discrepancies or updates
4. Cites specific laws when available

MERGED ANSWER:"""

        response = llm.predict(prompt)
        return response if response else "Unable to merge responses."
    except Exception as e:
        print(f"Error merging responses: {str(e)}")
        return f"Legal Documents Answer: {rag_answer}\n\nWeb Search Results: {web_answer}"

# --- PDF Generation ---
def generate_pdf(content: str, filename: str) -> str:
    """Generate a PDF from the given content and save it"""
    pdf = FPDF()
    pdf.add_page()
    pdf.set_auto_page_break(auto=True, margin=15)
    pdf.set_font("Arial", size=12)

    for line in content.split('\n'):
        pdf.multi_cell(0, 10, line)

    pdf_path = os.path.join("pdfs", filename)
    os.makedirs("pdfs", exist_ok=True)
    pdf.output(pdf_path)
    return pdf_path

# --- Chat History Management ---
chat_history = []

def add_to_chat_history(user_query: str, response: str):
    """Add the interaction to chat history"""
    chat_history.append({
        "query": user_query,
        "response": response
    })

def get_chat_history() -> List[Dict[str, str]]:
    """Retrieve the chat history"""
    return chat_history

# --- Process Query ---
async def process_query(query: str, category: str, use_web: bool = True) -> dict:
    try:
        print(f"Processing query: {query}, category: {category}")

        # Get RAG results
        rag_response = await get_rag_response(query, category)
        print(f"RAG response: {rag_response}")

        # Get web results if enabled
        web_response = None
        if use_web:
            web_response = await get_web_response(query)
            print(f"Web response: {web_response}")

        # Combine results
        combined_response = await combine_responses(rag_response, web_response, query)

        # Extract sources
        sources = extract_sources(rag_response, web_response)

        # Generate PDF
        pdf_filename = f"{uuid.uuid4()}.pdf"
        pdf_path = generate_pdf(combined_response, pdf_filename)

        # Update chat history
        add_to_chat_history(query, combined_response)

        result = {
            "legal_analysis": extract_section(combined_response, "Legal Analysis"),
            "additional_context": extract_section(combined_response, "Additional Context"),
            "punishments_and_fines": extract_section(combined_response, "Punishments and Fines"),
            "sources": sources,
            "pdf_path": pdf_path,
            "chat_history": get_chat_history()
        }

        print(f"Final result: {result}")
        return result

    except Exception as e:
        print(f"Error in process_query: {str(e)}")
        raise e

# --- Helper Functions ---
def extract_section(text: str, section_title: str) -> str:
    """Extract a specific section from the text based on the section title"""
    pattern = rf"{section_title}:\n(.*?)(\n\n|$)"
    match = re.search(pattern, text, re.DOTALL)
    return match.group(1).strip() if match else ""

async def get_rag_response(query: str, category: str) -> str:
    """Get response from RAG system"""
    try:
        # Create a prompt template for legal queries
        prompt_template = """You are a legal expert assistant. Answer the following legal question based on the provided context:

Context: {context}

Question: {question}

Please provide a detailed response that includes:
1. A clear explanation of the relevant legal principles
2. Specific references to laws, sections, or cases when applicable
3. Practical implications or applications
4. Any important exceptions or limitations

Answer:"""

        # Get relevant documents
        retriever = HybridRetriever(vectorstore=vectorstore, top_k=4)
        docs = await retriever._aget_relevant_documents(query)
        
        # Combine context from documents
        context = "\n\n".join([doc.page_content for doc in docs])
        
        # Generate response using LLM
        prompt = prompt_template.format(context=context, question=query)
        response = llm.predict(prompt)
        
        return response if response else "No relevant information found in the legal documents."
    except Exception as e:
        print(f"Error in RAG response: {str(e)}")
        return "Error retrieving legal information."

async def get_web_response(query: str) -> str:
    """Get response from web search"""
    try:
        # Add legal context to the search query
        enhanced_query = f"legal information about {query} in Indian law site:indiankanoon.org OR site:legislative.gov.in OR site:indiancourts.nic.in"
        web_results = await get_web_search_results(enhanced_query)
        
        if not web_results or web_results == "Web search unavailable.":
            return "No additional web information available."
            
        # Process web results to extract structured information
        prompt = f"""Process the following web search results about legal information and structure them:

{web_results}

Please extract and organize the following information:
1. Relevant legal provisions and sections
2. Case laws and precedents
3. Official government sources
4. Recent updates or amendments

Format the response with clear sections and include clickable links where available."""

        processed_results = llm.predict(prompt)
        return processed_results if processed_results else web_results
    except Exception as e:
        print(f"Error in web response: {str(e)}")
        return "Error retrieving web information."

def extract_sources(rag_response: str, web_response: str) -> list:
    """Extract and format sources from both RAG and web responses"""
    sources = []
    
    try:
        # Extract sources from RAG response
        rag_sources = re.findall(r'\[([^\]]+)\]\(([^\)]+)\)', rag_response)
        sources.extend([{"name": name, "url": url} for name, url in rag_sources])
        
        # Extract sources from web response
        web_sources = re.findall(r'\[([^\]]+)\]\(([^\)]+)\)', web_response)
        sources.extend([{"name": name, "url": url} for name, url in web_sources])
        
        # Extract case citations
        case_citations = re.findall(r'(\d+)\s+([A-Z]+)\s+(\d+)', rag_response + web_response)
        for citation in case_citations:
            sources.append({
                "name": f"Case Citation: {' '.join(citation)}",
                "url": f"https://indiankanoon.org/search/?formInput={' '.join(citation)}"
            })
        
        # Extract statute references
        statute_refs = re.findall(r'(Section|Article)\s+(\d+[A-Za-z]*)', rag_response + web_response)
        for ref in statute_refs:
            sources.append({
                "name": f"Statute Reference: {' '.join(ref)}",
                "url": f"https://legislative.gov.in/sites/default/files/A{ref[1]}.pdf"
            })
        
        # Remove duplicates while preserving order
        seen = set()
        unique_sources = []
        for source in sources:
            source_key = f"{source['name']}|{source['url']}"
            if source_key not in seen:
                seen.add(source_key)
                unique_sources.append(source)
        
        # Ensure all sources have valid URLs
        for source in unique_sources:
            if source['url'] == 'insert link':
                source['url'] = '#'
        
        return unique_sources
    except Exception as e:
        print(f"Error extracting sources: {str(e)}")
        return [{"name": "Error extracting sources", "url": "#"}]

async def combine_responses(rag_response: str, web_response: str, original_query: str) -> str:
    """Combine RAG and web responses into a comprehensive answer"""
    try:
        prompt = f"""As a legal expert, analyze and merge these two responses into a comprehensive answer:

LEGAL DOCUMENTS RESPONSE:
{rag_response}

WEB SEARCH RESPONSE:
{web_response}

Original Question: {original_query}

Please provide a well-structured answer that:
1. Starts with a clear summary of the key points
2. Provides detailed legal analysis
3. Includes relevant laws and sections
4. Notes any important precedents or cases
5. Highlights practical implications
6. Lists sources and citations

Format the response with clear sections:
- Legal Analysis
- Additional Context
- Punishments and Fines
- Sources

For each source, use the format [Source Name](URL) to create clickable links.
Include specific case citations and statute references where applicable.

Answer:"""

        response = llm.predict(prompt)
        return response if response else "Unable to generate a comprehensive response."
    except Exception as e:
        print(f"Error combining responses: {str(e)}")
        return f"Legal Documents Answer: {rag_response}\n\nWeb Search Results: {web_response}"
