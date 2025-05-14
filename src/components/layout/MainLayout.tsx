import React from 'react';
import { Box, AppBar, Toolbar, Typography, styled } from '@mui/material';
import { Gavel as GavelIcon } from '@mui/icons-material';

const StyledAppBar = styled(AppBar)(({ theme }) => ({
  backgroundColor: theme.palette.primary.main,
  boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
  height: '64px',
}));

const LogoContainer = styled(Box)(({ theme }) => ({
  display: 'flex',
  alignItems: 'center',
  gap: theme.spacing(2),
  padding: theme.spacing(1, 0),
}));

const LogoText = styled(Typography)(({ theme }) => ({
  color: theme.palette.common.white,
  fontWeight: 700,
  letterSpacing: '0.5px',
}));

const MainContent = styled(Box)(({ theme }) => ({
  display: 'grid',
  gridTemplateColumns: '300px 1fr 300px',
  height: 'calc(100vh - 64px)',
  backgroundColor: theme.palette.background.default,
}));

interface MainLayoutProps {
  leftPanel: React.ReactNode;
  centerPanel: React.ReactNode;
  rightPanel: React.ReactNode;
}

const MainLayout: React.FC<MainLayoutProps> = ({
  leftPanel,
  centerPanel,
  rightPanel,
}) => {
  return (
    <Box sx={{ height: '100vh', display: 'flex', flexDirection: 'column' }}>
      <StyledAppBar position="static">
        <Toolbar sx={{ minHeight: '64px !important' }}>
          <LogoContainer>
            <GavelIcon sx={{ fontSize: 32, color: 'white' }} />
            <LogoText variant="h5">
              LAW AGENT
            </LogoText>
          </LogoContainer>
        </Toolbar>
      </StyledAppBar>
      <MainContent>
        <Box sx={{ borderRight: 1, borderColor: 'divider' }}>{leftPanel}</Box>
        <Box sx={{ overflow: 'auto' }}>{centerPanel}</Box>
        <Box sx={{ borderLeft: 1, borderColor: 'divider' }}>{rightPanel}</Box>
      </MainContent>
    </Box>
  );
};

export default MainLayout; 