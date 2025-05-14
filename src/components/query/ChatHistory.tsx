import React, { useState, useEffect } from 'react';
import {
  Box,
  List,
  ListItem,
  ListItemText,
  Typography,
  Paper,
  styled,
  Divider,
  IconButton,
} from '@mui/material';
import {
  Chat as ChatIcon,
  Delete as DeleteIcon,
  ExpandLess as ExpandLessIcon,
  ExpandMore as ExpandMoreIcon,
} from '@mui/icons-material';
import axios from 'axios';

const HistoryContainer = styled(Paper)(({ theme }) => ({
  height: '100%',
  display: 'flex',
  flexDirection: 'column',
  backgroundColor: theme.palette.background.default,
}));

const Header = styled(Box)(({ theme }) => ({
  padding: theme.spacing(2),
  borderBottom: `1px solid ${theme.palette.divider}`,
  display: 'flex',
  alignItems: 'center',
  gap: theme.spacing(1),
}));

const ChatList = styled(List)({
  flex: 1,
  overflow: 'auto',
  padding: 0,
});

const ChatItem = styled(ListItem)(({ theme }) => ({
  padding: theme.spacing(2),
  '&:hover': {
    backgroundColor: theme.palette.action.hover,
  },
}));

interface ChatMessage {
  query: string;
  response: {
    legal_analysis: string;
    additional_context: string;
    punishments_and_fines: string;
  } | null;
}

interface ChatHistoryProps {
  chatHistory: ChatMessage[];
}

const ChatHistory: React.FC<ChatHistoryProps> = ({ chatHistory }) => {
  const [expandedItems, setExpandedItems] = useState<number[]>([]);

  const toggleResponse = (index: number) => {
    setExpandedItems(prev => 
      prev.includes(index) 
        ? prev.filter(i => i !== index)
        : [...prev, index]
    );
  };

  const formatResponse = (response: any) => {
    if (!response) return 'Waiting for response...';
    
    if (typeof response === 'string') {
      return response;
    }
    
    const sections = [];
    
    if (response.legal_analysis) {
      sections.push(`Legal Analysis:\n${response.legal_analysis}`);
    }
    
    if (response.additional_context) {
      sections.push(`Additional Context:\n${response.additional_context}`);
    }
    
    if (response.punishments_and_fines) {
      sections.push(`Punishments and Fines:\n${response.punishments_and_fines}`);
    }
    
    return sections.length > 0 ? sections.join('\n\n') : 'No detailed response available';
  };

  return (
    <HistoryContainer elevation={0}>
      <Header>
        <ChatIcon color="primary" />
        <Typography variant="h6" component="h2">
          Chat History
        </Typography>
      </Header>
      <ChatList>
        {chatHistory.length > 0 ? (
          chatHistory.map((chat, index) => (
            <React.Fragment key={index}>
              <ChatItem>
                <ListItemText
                  primary={
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <Typography variant="subtitle2" color="primary">
                        Q: {chat.query}
                      </Typography>
                      {chat.response && (
                        <IconButton 
                          size="small" 
                          onClick={() => toggleResponse(index)}
                          sx={{ ml: 'auto' }}
                        >
                          {expandedItems.includes(index) ? <ExpandLessIcon /> : <ExpandMoreIcon />}
                        </IconButton>
                      )}
                    </Box>
                  }
                  secondary={
                    chat.response && expandedItems.includes(index) && (
                      <Typography 
                        variant="body2" 
                        color="text.secondary"
                        sx={{ 
                          whiteSpace: 'pre-line',
                          mt: 1,
                          '& > div': {
                            mb: 1
                          }
                        }}
                      >
                        {formatResponse(chat.response)}
                      </Typography>
                    )
                  }
                />
              </ChatItem>
              {index < chatHistory.length - 1 && <Divider />}
            </React.Fragment>
          ))
        ) : (
          <ListItem>
            <ListItemText
              primary={
                <Typography variant="body2" color="text.secondary" align="center">
                  No chat history available
                </Typography>
              }
            />
          </ListItem>
        )}
      </ChatList>
    </HistoryContainer>
  );
};

export default ChatHistory; 