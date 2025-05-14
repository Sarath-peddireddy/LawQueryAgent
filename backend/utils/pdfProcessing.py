from langchain_community.document_loaders import PyPDFLoader
from langchain_text_splitters import RecursiveCharacterTextSplitter
from pathlib import Path

def load_and_split_pdfs(pdf_dir:str):
    documents = []
    for file in Path(pdf_dir).glob("*.pdf"):
        loader = PyPDFLoader(str(file))
        docs = loader.load()
        documents.extend(docs)
    splitter = RecursiveCharacterTextSplitter(chunk_size=500, chunk_overlap=100)
    chunks = splitter.split_documents(documents)
    return chunks