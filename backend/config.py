from pydantic_settings import BaseSettings
from dotenv import load_dotenv
import os
import certifi

# Load environment variables from .env file
load_dotenv()

# Ensure secure SSL certificate path for external requests
os.environ['SSL_CERT_FILE'] = certifi.where()

class Settings(BaseSettings):
    # Required API keys
    OPENAI_API_KEY: str
    SERPAPI_API_KEY: str

    # Hugging Face optional token (for authenticated access if needed)
    HUGGINGFACEHUB_API_TOKEN: str | None = None

    # Model and vector store settings
    EMBEDDING_MODEL: str = "sentence-transformers/all-MiniLM-L6-v2"
    VECTOR_DB_PATH: str = "vectorstore"

    class Config:
        env_file = ".env"
        env_file_encoding = "utf-8"
        extra = "ignore"  # Allow unknown keys in .env without raising error

# Load the settings object
settings = Settings()
