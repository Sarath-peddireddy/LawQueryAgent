# Law Query Agent

A sophisticated legal query system that provides detailed legal analysis, context, and relevant source documents for legal inquiries.

## 🎯 Purpose

The Law Query Agent is designed to bridge the gap between complex legal information and users seeking legal guidance. It provides:
- Detailed legal analysis of queries
- Additional context and explanations
- Information about punishments and fines
- Relevant source documents and references
- PDF generation of responses

## 🛠️ Tech Stack

### Frontend
- React.js with TypeScript
- Material-UI (MUI) for UI components
- Axios for API communication
- Custom theme with professional color scheme

### Backend
- FastAPI (Python)
- LangChain for RAG implementation
- OpenAI GPT-3.5 Turbo for LLM
- FAISS Vector store for document embeddings
- PDF processing capabilities

## 💡 Problem Solved

The Law Query Agent addresses several key challenges in legal information access:
1. **Complexity**: Simplifies complex legal language into understandable terms
2. **Accessibility**: Makes legal information more accessible to non-legal professionals
3. **Efficiency**: Reduces time spent searching through legal documents
4. **Accuracy**: Provides well-sourced and contextual legal information
5. **Documentation**: Generates downloadable PDF responses for record-keeping

## 🎯 Use Cases

1. **Legal Research**
   - Quick access to legal precedents
   - Understanding legal implications
   - Researching specific legal cases

2. **Legal Education**
   - Learning about legal concepts
   - Understanding legal procedures
   - Studying case law

3. **Business Compliance**
   - Understanding regulatory requirements
   - Checking legal obligations
   - Compliance verification

4. **Personal Legal Queries**
   - Understanding personal legal rights
   - Basic legal guidance
   - Legal document interpretation

## 🚀 How to Run

### Prerequisites
- Python 3.8+
- Node.js 14+
- OpenAI API key

### Backend Setup
1. Navigate to the backend directory:
   ```bash
   cd backend
   ```

2. Create a virtual environment:
   ```bash
   python -m venv venv
   source venv/bin/activate  # On Windows: venv\Scripts\activate
   ```

3. Install dependencies:
   ```bash
   pip install -r requirements.txt
   ```

4. Set up environment variables:
   ```bash
   # Create .env file
   OPENAI_API_KEY=your_api_key_here
   ```

5. Start the backend server:
   ```bash
   uvicorn main:app --reload
   ```

### Frontend Setup
1. Navigate to the frontend directory:
   ```bash
   cd frontend
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Start the development server:
   ```bash
   npm start
   ```

4. Access the application at `http://localhost:3000`

## 📚 Key Learnings

1. **RAG Implementation**
   - Effective document chunking and embedding
   - Vector store optimization
   - Context management in LLM responses

2. **UI/UX Design**
   - Professional color scheme for legal applications
   - Intuitive three-panel layout
   - Responsive design considerations

3. **System Architecture**
   - Separation of concerns between frontend and backend
   - Efficient state management
   - Error handling and user feedback

4. **Performance Optimization**
   - Efficient document processing
   - Optimized API calls
   - Caching strategies

## 🔄 Future Improvements

1. **Enhanced Features**
   - Multi-language support
   - Advanced document analysis
   - Real-time collaboration

2. **Technical Improvements**
   - Enhanced error handling
   - Performance optimization
   - Additional LLM models support

3. **User Experience**
   - More interactive visualizations
   - Advanced search capabilities
   - Customizable interface

## 📝 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 👥 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.
