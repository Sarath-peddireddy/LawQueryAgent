# backend/main.py

from fastapi import FastAPI, HTTPException
from fastapi.responses import FileResponse
from pydantic import BaseModel
from typing import List, Optional
from fastapi.middleware.cors import CORSMiddleware
import os
from pathlib import Path

from utils.pdfProcessing import load_and_split_pdfs
from embeddings.embedding_manager import build_or_load_vectorstores
from chains.rag_chain import get_rag_chain, process_query, set_vectorstore, get_chat_history
from config import settings
from langchain_openai import ChatOpenAI

# ---------- Initialize FastAPI ----------
app = FastAPI(title="LEXGEN API")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # More permissive for development
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ---------- Pydantic Schema ----------
class QueryRequest(BaseModel):
    query: str
    category: str
    use_web: Optional[bool] = True

class Source(BaseModel):
    name: str
    url: str

class QueryResponse(BaseModel):
    legal_analysis: str
    additional_context: str
    punishments_and_fines: str
    sources: List[Source]
    pdf_path: Optional[str] = None

# ---------- Global Resources ----------
print("[INFO] Loading documents...")
try:
    chunks = load_and_split_pdfs("data")  # <-- You can replace with settings.DATA_DIR
    vectorstore = build_or_load_vectorstores(chunks)
    set_vectorstore(vectorstore)
except Exception as e:
    print(f"[ERROR] Failed to load vectorstore: {str(e)}")
    raise RuntimeError("Failed during vectorstore initialization.")

print("[INFO] Initializing LLM...")
try:
    llm = ChatOpenAI(
        api_key=settings.OPENAI_API_KEY,
        model="gpt-3.5-turbo",  # Optional: use settings.LLM_MODEL
        temperature=0.7
    )
except Exception as e:
    print(f"[ERROR] Failed to initialize LLM: {str(e)}")
    raise RuntimeError("LLM initialization failed.")

print("[INFO] Setting up QA chain...")
try:
    qa_chain = get_rag_chain(vectorstore, llm)
except Exception as e:
    print(f"[ERROR] Failed to set up RAG chain: {str(e)}")
    raise RuntimeError("QA chain setup failed.")

# Add this near the top of the file, after imports
PDF_DIR = Path("pdfs")
PDF_DIR.mkdir(exist_ok=True)  # Create pdfs directory if it doesn't exist

# ---------- Query Endpoint ----------
@app.post("/query", response_model=QueryResponse)
async def query_endpoint(request: QueryRequest):
    try:
        response = await process_query(
            query=request.query,
            category=request.category,
            use_web=request.use_web
        )
        
        # Ensure response is a dictionary
        if not isinstance(response, dict):
            response = {"error": "Invalid response format from process_query"}
            raise HTTPException(status_code=500, detail="Invalid response format")

        # Handle PDF path if it exists
        if "pdf_path" in response and response["pdf_path"]:
            # Ensure the PDF is in the correct directory
            pdf_filename = os.path.basename(response["pdf_path"])
            response["pdf_path"] = pdf_filename  # Store only the filename

        # Format the response with default values
        formatted_response = {
            "legal_analysis": str(response.get("legal_analysis", "No legal analysis available")),
            "additional_context": str(response.get("additional_context", "No additional context available")),
            "punishments_and_fines": str(response.get("punishments_and_fines", "No information about punishments and fines available")),
            "sources": response.get("sources", []),
            "pdf_path": response.get("pdf_path")
        }

        # Validate the response structure
        if not all(isinstance(formatted_response[field], str) for field in ["legal_analysis", "additional_context", "punishments_and_fines"]):
            raise HTTPException(status_code=500, detail="Invalid response structure")

        return formatted_response

    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

# ---------- Chat History Endpoint ----------
@app.get("/chat-history")
async def get_chat_history():
    try:
        return get_chat_history()
    except Exception as e:
        print(f"[ERROR] Failed to get chat history: {str(e)}")
        raise HTTPException(status_code=500, detail="Failed to retrieve chat history")

# ---------- PDF Download Endpoint ----------
@app.get("/download-pdf/{pdf_path}")
async def download_pdf(pdf_path: str):
    try:
        # Clean the path to prevent directory traversal
        pdf_path = os.path.basename(pdf_path)
        
        # Construct the full path
        full_path = PDF_DIR / pdf_path
        
        if not full_path.exists():
            print(f"[ERROR] PDF not found at path: {full_path}")
            raise HTTPException(
                status_code=404, 
                detail=f"PDF file not found. Please ensure the file exists at: {pdf_path}"
            )
            
        return FileResponse(
            str(full_path),
            media_type="application/pdf",
            filename="legal_response.pdf",
            headers={
                "Content-Disposition": f"attachment; filename=legal_response.pdf"
            }
        )
    except Exception as e:
        print(f"[ERROR] Failed to download PDF: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))
