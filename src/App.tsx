import React, { useState, useEffect } from 'react';
import { ThemeProvider, CssBaseline, Box, Alert, Typography } from '@mui/material';
import { theme } from './styles/theme';
import MainLayout from './components/layout/MainLayout';
import ChatHistory from './components/query/ChatHistory';
import QueryInput from './components/query/QueryInput';
import ResponseDisplay from './components/query/ResponseDisplay';
import SourceDocuments from './components/query/SourceDocuments';
import axios from 'axios';
import Header from './components/layout/Header';

interface QueryResponse {
  legal_analysis: string;
  additional_context: string;
  punishments_and_fines: string;
  sources: Array<{ name: string; url: string }>;
  pdf_path?: string;
}

const App: React.FC = () => {
  const [response, setResponse] = useState<QueryResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [chatHistory, setChatHistory] = useState<any[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [retryCount, setRetryCount] = useState(0);
  const MAX_RETRIES = 3;

  const handleQuery = async (query: string, category: string, useWeb: boolean): Promise<void> => {
    setLoading(true);
    setError(null);
    setResponse(null);
    setRetryCount(0);

    try {
      // Add query to chat history
      setChatHistory(prev => [{
        query,
        response: null
      }, ...prev]);

      await makeQueryRequest(query, category, useWeb);

    } catch (error: any) {
      console.error('Error:', error);
      setError(error.response?.data?.detail || error.message || 'Failed to get response');
    } finally {
      setLoading(false);
    }
  };

  const makeQueryRequest = async (query: string, category: string, useWeb: boolean): Promise<void> => {
    try {
      const response = await axios.post<QueryResponse>('http://localhost:8000/query', {
        query,
        category,
        use_web: useWeb
      });

      if (!response.data) {
        throw new Error('No data received from server');
      }

      // Validate response structure
      const { legal_analysis, additional_context, punishments_and_fines, sources } = response.data;
      const missingFields = [];
      
      if (!legal_analysis) missingFields.push('legal_analysis');
      if (!additional_context) missingFields.push('additional_context');
      if (!punishments_and_fines) missingFields.push('punishments_and_fines');
      if (!sources) missingFields.push('sources');
      
      if (missingFields.length > 0) {
        throw new Error(`Missing required fields: ${missingFields.join(', ')}`);
      }

      // Set response
      setResponse(response.data);

      // Update chat history
      setChatHistory(prev => {
        const updated = [...prev];
        if (updated.length > 0) {
          updated[0] = {
            ...updated[0],
            response: response.data
          };
        }
        return updated;
      });

    } catch (error: any) {
      if (retryCount < MAX_RETRIES) {
        setRetryCount(prev => prev + 1);
        // Wait for 1 second before retrying
        await new Promise(resolve => setTimeout(resolve, 1000));
        return makeQueryRequest(query, category, useWeb);
      }
      throw error;
    }
  };

  // Log whenever response changes
  useEffect(() => {
    if (response) {
      console.log('Response received successfully');
    }
  }, [response]);

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Box sx={{ display: 'flex', flexDirection: 'column', height: '100vh', bgcolor: 'background.default' }}>
        <Header />
        <Box sx={{ display: 'flex', flex: 1, overflow: 'hidden' }}>
          {/* Left Panel - Chat History */}
          <Box sx={{ width: '25%', borderRight: 1, borderColor: 'divider', overflow: 'auto' }}>
            <ChatHistory chatHistory={chatHistory} />
          </Box>

          {/* Middle Panel - Query Input and Response */}
          <Box sx={{ width: '50%', display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
            <QueryInput onQuery={handleQuery} />
            <Box sx={{ flex: 1, overflow: 'auto', p: 2 }}>
              {error && (
                <Alert severity="error" sx={{ mb: 2 }}>
                  {error}
                  {retryCount > 0 && (
                    <Typography variant="body2" sx={{ mt: 1 }}>
                      Retried {retryCount} times
                    </Typography>
                  )}
                </Alert>
              )}
              <ResponseDisplay 
                response={response} 
                loading={loading} 
              />
            </Box>
          </Box>

          {/* Right Panel - Source Documents */}
          <Box sx={{ width: '25%', borderLeft: 1, borderColor: 'divider', overflow: 'auto' }}>
            <SourceDocuments sources={response?.sources} />
          </Box>
        </Box>
      </Box>
    </ThemeProvider>
  );
};

export default App;
