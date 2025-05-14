import React, { useEffect, useState } from 'react';
import {
  Box,
  Paper,
  Typography,
  Divider,
  Button,
  styled,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  CircularProgress,
  Link,
  Dialog,
  DialogContent,
  IconButton,
} from '@mui/material';
import {
  Description as DescriptionIcon,
  Gavel as GavelIcon,
  Article as ArticleIcon,
  Download as DownloadIcon,
  Visibility as VisibilityIcon,
  Close as CloseIcon,
} from '@mui/icons-material';
import axios from 'axios';

const ResponseContainer = styled(Paper)(({ theme }) => ({
  padding: theme.spacing(3),
  marginTop: theme.spacing(3),
  backgroundColor: theme.palette.background.paper,
  borderRadius: theme.spacing(1),
  boxShadow: theme.shadows[1],
}));

const Section = styled(Box)(({ theme }) => ({
  marginBottom: theme.spacing(3),
}));

const SourceList = styled(List)(({ theme }) => ({
  backgroundColor: theme.palette.background.default,
  borderRadius: theme.spacing(1),
  padding: theme.spacing(1),
}));

const PDFViewer = styled('iframe')({
  width: '100%',
  height: '80vh',
  border: 'none',
});

const DialogTitle = styled(Box)(({ theme }) => ({
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'center',
  padding: theme.spacing(2),
  borderBottom: `1px solid ${theme.palette.divider}`,
}));

interface ResponseDisplayProps {
  response?: {
    legal_analysis: string;
    additional_context: string;
    punishments_and_fines: string;
    sources: Array<{ name: string; url: string }>;
    pdf_path?: string;
  } | null;
  loading?: boolean;
}

const ResponseDisplay: React.FC<ResponseDisplayProps> = ({ response, loading }) => {
  const [pdfUrl, setPdfUrl] = useState<string | null>(null);
  const [showPdf, setShowPdf] = useState(false);

  useEffect(() => {
    console.log('ResponseDisplay mounted/updated:', { 
      response,
      loading,
      hasLegalAnalysis: Boolean(response?.legal_analysis),
      hasAdditionalContext: Boolean(response?.additional_context),
      hasPunishmentsAndFines: Boolean(response?.punishments_and_fines),
      hasSources: Boolean(response?.sources?.length)
    });
  }, [response, loading]);

  const handleViewPDF = async () => {
    if (!response?.pdf_path) {
      console.warn('No PDF path available');
      return;
    }
    
    try {
      const filename = response.pdf_path.split('/').pop() || '';
      const pdfResponse = await axios.get(`http://localhost:8000/download-pdf/${filename}`, {
        responseType: 'blob',
        headers: {
          'Accept': 'application/pdf'
        }
      });
      
      const file = new Blob([pdfResponse.data], { type: 'application/pdf' });
      const fileURL = window.URL.createObjectURL(file);
      setPdfUrl(fileURL);
      setShowPdf(true);
    } catch (error: any) {
      console.error('Error loading PDF:', error);
      alert('Failed to load PDF. Please try again.');
    }
  };

  const handleDownloadPDF = async () => {
    if (!response?.pdf_path) {
      console.warn('No PDF path available');
      return;
    }
    
    try {
      const pdfFilename = response.pdf_path.split('/').pop();
      const pdfResponse = await axios.get(`http://localhost:8000/download-pdf/${pdfFilename}`, {
        responseType: 'blob',
        headers: {
          'Accept': 'application/pdf'
        }
      });
      
      if (!pdfResponse.data || pdfResponse.data.size === 0) {
        throw new Error('Empty PDF response received');
      }
      
      const file = new Blob([pdfResponse.data], { type: 'application/pdf' });
      const fileURL = window.URL.createObjectURL(file);
      const link = document.createElement('a');
      link.href = fileURL;
      link.download = 'legal_response.pdf';
      document.body.appendChild(link);
      link.click();
      link.parentNode?.removeChild(link);
      window.URL.revokeObjectURL(fileURL);
    } catch (error: any) {
      console.error('Error downloading PDF:', error);
      alert('Failed to download PDF. Please try again.');
    }
  };

  const handleClosePDF = () => {
    setShowPdf(false);
    if (pdfUrl) {
      window.URL.revokeObjectURL(pdfUrl);
      setPdfUrl(null);
    }
  };

  if (loading) {
    return (
      <ResponseContainer>
        <Box display="flex" justifyContent="center" alignItems="center" minHeight={200}>
          <CircularProgress />
        </Box>
      </ResponseContainer>
    );
  }

  if (!response) {
    return (
      <ResponseContainer>
        <Typography variant="body1" color="text.secondary" align="center">
          Your response will appear here
        </Typography>
      </ResponseContainer>
    );
  }

  // Log the response structure
  console.log('Response structure:', {
    legal_analysis: typeof response.legal_analysis,
    additional_context: typeof response.additional_context,
    punishments_and_fines: typeof response.punishments_and_fines,
    sources: Array.isArray(response.sources) ? response.sources.length : 'not an array'
  });

  // Validate response structure
  const hasValidResponse = 
    typeof response.legal_analysis === 'string' ||
    typeof response.additional_context === 'string' ||
    typeof response.punishments_and_fines === 'string';
  
  if (!hasValidResponse) {
    console.warn('Invalid response format:', response);
    return (
      <ResponseContainer>
        <Typography variant="body1" color="error" align="center">
          Invalid response format received. Please try again.
        </Typography>
        <Typography variant="body2" color="text.secondary" align="center" sx={{ mt: 1 }}>
          Response structure: {JSON.stringify(response, null, 2)}
        </Typography>
      </ResponseContainer>
    );
  }

  return (
    <>
      <ResponseContainer>
        {response.legal_analysis && (
          <Section>
            <Typography variant="h6" gutterBottom color="primary" sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <GavelIcon /> Legal Analysis
            </Typography>
            <Typography variant="body1" paragraph sx={{ whiteSpace: 'pre-line' }}>
              {response.legal_analysis}
            </Typography>
          </Section>
        )}

        {response.additional_context && (
          <>
            <Divider sx={{ my: 2 }} />
            <Section>
              <Typography variant="h6" gutterBottom color="primary" sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <DescriptionIcon /> Additional Context
              </Typography>
              <Typography variant="body1" paragraph sx={{ whiteSpace: 'pre-line' }}>
                {response.additional_context}
              </Typography>
            </Section>
          </>
        )}

        {response.punishments_and_fines && (
          <>
            <Divider sx={{ my: 2 }} />
            <Section>
              <Typography variant="h6" gutterBottom color="primary" sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <GavelIcon /> Punishments and Fines
              </Typography>
              <Typography variant="body1" paragraph sx={{ whiteSpace: 'pre-line' }}>
                {response.punishments_and_fines}
              </Typography>
            </Section>
          </>
        )}

        {response.pdf_path && (
          <Box sx={{ mt: 3, display: 'flex', justifyContent: 'flex-end', gap: 2 }}>
            <Button
              variant="outlined"
              color="primary"
              startIcon={<VisibilityIcon />}
              onClick={handleViewPDF}
            >
              View PDF
            </Button>
            <Button
              variant="outlined"
              color="primary"
              startIcon={<DownloadIcon />}
              onClick={handleDownloadPDF}
            >
              Download PDF
            </Button>
          </Box>
        )}
      </ResponseContainer>

      <Dialog
        open={showPdf}
        onClose={handleClosePDF}
        maxWidth="lg"
        fullWidth
      >
        <DialogTitle>
          <Typography variant="h6">Legal Response PDF</Typography>
          <IconButton onClick={handleClosePDF} size="large">
            <CloseIcon />
          </IconButton>
        </DialogTitle>
        <DialogContent>
          {pdfUrl && (
            <PDFViewer
              src={pdfUrl}
              title="Legal Response PDF"
            />
          )}
        </DialogContent>
      </Dialog>
    </>
  );
};

export default ResponseDisplay; 