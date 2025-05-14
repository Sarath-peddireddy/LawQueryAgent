import React, { useState } from 'react';
import {
  Box,
  TextField,
  Button,
  Paper,
  Typography,
  CircularProgress,
  styled,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  FormControlLabel,
  Switch,
} from '@mui/material';
import { Send as SendIcon } from '@mui/icons-material';
import axios from 'axios';

const InputContainer = styled(Paper)(({ theme }) => ({
  padding: theme.spacing(3),
  backgroundColor: theme.palette.background.paper,
  borderRadius: theme.spacing(1),
  boxShadow: theme.shadows[1],
}));

interface QueryInputProps {
  onQuery: (query: string, category: string, useWeb: boolean) => Promise<void>;
}

const QueryInput: React.FC<QueryInputProps> = ({ onQuery }) => {
  const [query, setQuery] = useState('');
  const [category, setCategory] = useState('IPC');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!query.trim()) return;

    setLoading(true);
    try {
      await onQuery(query, category, true); // Always use web search
      setQuery(''); // Clear input after successful submission
    } catch (error) {
      console.error('Error submitting query:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Paper 
      component="form" 
      onSubmit={handleSubmit}
      sx={{ 
        p: 2, 
        display: 'flex', 
        flexDirection: 'column',
        gap: 2,
        borderBottom: 1,
        borderColor: 'divider'
      }}
    >
      <TextField
        fullWidth
        multiline
        rows={3}
        variant="outlined"
        placeholder="Enter your legal query..."
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        disabled={loading}
      />
      
      <Box sx={{ display: 'flex', gap: 2, alignItems: 'center' }}>
        <FormControl sx={{ minWidth: 200 }}>
          <InputLabel>Category</InputLabel>
          <Select
            value={category}
            label="Category"
            onChange={(e) => setCategory(e.target.value)}
            disabled={loading}
          >
            <MenuItem value="IPC">IPC</MenuItem>
            <MenuItem value="CYBER">Cyber Laws</MenuItem>
            <MenuItem value="FUNDAMENTAL">Fundamental Rights</MenuItem>
            <MenuItem value="MOTOR">Motor Laws</MenuItem>
          </Select>
        </FormControl>

        <Button
          type="submit"
          variant="contained"
          color="primary"
          disabled={!query.trim() || loading}
          sx={{ ml: 'auto' }}
        >
          {loading ? <CircularProgress size={24} /> : 'Submit Query'}
        </Button>
      </Box>
    </Paper>
  );
};

export default QueryInput; 