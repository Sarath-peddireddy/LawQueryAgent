import React from 'react';
import { AppBar, Toolbar, Typography, Box, styled } from '@mui/material';
import { Gavel as GavelIcon } from '@mui/icons-material';

const StyledAppBar = styled(AppBar)(({ theme }) => ({
  backgroundColor: theme.palette.primary.main,
  boxShadow: 'none',
  borderBottom: `1px solid ${theme.palette.divider}`,
}));

const LogoContainer = styled(Box)(({ theme }) => ({
  display: 'flex',
  alignItems: 'center',
  gap: theme.spacing(1),
}));

const Header: React.FC = () => {
  return (
    <StyledAppBar position="static">
      <Toolbar>
        <LogoContainer>
          <GavelIcon sx={{ fontSize: 32 }} />
          <Typography variant="h5" component="h1" sx={{ fontWeight: 600 }}>
            Law Query Agent
          </Typography>
        </LogoContainer>
      </Toolbar>
    </StyledAppBar>
  );
};

export default Header; 