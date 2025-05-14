import React from 'react';
import {
  Box,
  Paper,
  Typography,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  IconButton,
  Divider,
  styled,
  Link,
} from '@mui/material';
import {
  Description as DescriptionIcon,
  OpenInNew as OpenInNewIcon,
  Bookmark as BookmarkIcon,
  Gavel as GavelIcon,
  Article as ArticleIcon,
} from '@mui/icons-material';

const DocumentsContainer = styled(Paper)(({ theme }) => ({
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

const DocumentList = styled(List)({
  flex: 1,
  overflow: 'auto',
});

const DocumentItem = styled(ListItem)(({ theme }) => ({
  '&:hover': {
    backgroundColor: theme.palette.action.hover,
  },
}));

interface Source {
  name: string;
  url: string;
}

interface SourceDocumentsProps {
  sources?: Source[];
}

const SourceDocuments: React.FC<SourceDocumentsProps> = ({ sources = [] }) => {
  const getSourceIcon = (sourceName: string) => {
    if (sourceName.toLowerCase().includes('case')) {
      return <GavelIcon color="primary" />;
    } else if (sourceName.toLowerCase().includes('statute') || sourceName.toLowerCase().includes('section')) {
      return <ArticleIcon color="primary" />;
    }
    return <DescriptionIcon color="primary" />;
  };

  return (
    <DocumentsContainer elevation={0}>
      <Header>
        <DescriptionIcon color="primary" />
        <Typography variant="h6" component="h2">
          Source Documents
        </Typography>
      </Header>
      <DocumentList>
        {sources.length > 0 ? (
          sources.map((source, index) => (
            <React.Fragment key={index}>
              <DocumentItem
                secondaryAction={
                  <Box>
                    <IconButton 
                      edge="end" 
                      aria-label="open"
                      component={Link}
                      href={source.url}
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      <OpenInNewIcon />
                    </IconButton>
                  </Box>
                }
              >
                <ListItemIcon>
                  {getSourceIcon(source.name)}
                </ListItemIcon>
                <ListItemText
                  primary={
                    <Link
                      href={source.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      color="primary"
                      underline="hover"
                    >
                      {source.name}
                    </Link>
                  }
                />
              </DocumentItem>
              {index < sources.length - 1 && <Divider />}
            </React.Fragment>
          ))
        ) : (
          <ListItem>
            <ListItemText
              primary={
                <Typography variant="body2" color="text.secondary" align="center">
                  No source documents available
                </Typography>
              }
            />
          </ListItem>
        )}
      </DocumentList>
    </DocumentsContainer>
  );
};

export default SourceDocuments; 