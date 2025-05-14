from langchain_community.vectorstores import FAISS
from langchain_huggingface import HuggingFaceEmbeddings
from config import settings
import os

def get_embedding_model():
    """Initializes the HuggingFace embedding model with CPU and normalization."""
    try:
        return HuggingFaceEmbeddings(
            model_name=settings.EMBEDDING_MODEL,
            model_kwargs={'device': 'cpu'},  # Ensure consistent device usage
            encode_kwargs={'normalize_embeddings': True}  # Improves similarity search
        )
    except Exception as e:
        print(f"[ERROR] Failed to initialize embeddings: {str(e)}")
        raise

def build_or_load_vectorstores(chunks):
    """Builds or loads a FAISS vector store from provided document chunks."""
    try:
        embeddings = get_embedding_model()

        # Ensure vector store directory exists
        os.makedirs(settings.VECTOR_DB_PATH, exist_ok=True)

        vector_store_path = os.path.join(settings.VECTOR_DB_PATH, "faiss_index")

        if os.path.exists(vector_store_path):
            print('[INFO] Loading existing FAISS index...')
            db = FAISS.load_local(
                vector_store_path,
                embeddings=embeddings,
                allow_dangerous_deserialization=True  # Safe if controlled
            )
        else:
            print("[INFO] Building new FAISS index...")
            db = FAISS.from_documents(chunks, embeddings)
            db.save_local(vector_store_path)

        return db

    except Exception as e:
        print(f"[ERROR] Failed to build/load vector store: {str(e)}")
        raise
