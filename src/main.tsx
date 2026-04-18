import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import { HelmetProvider } from 'react-helmet-async';
import { SnackbarProvider } from 'notistack';
import App from './App';
import './index.css';
import './lib/amplify';

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <HelmetProvider>
      <BrowserRouter>
        <SnackbarProvider
          maxSnack={3}
          autoHideDuration={4000}
          anchorOrigin={{ vertical: 'top', horizontal: 'right' }}
        >
          <App />
        </SnackbarProvider>
      </BrowserRouter>
    </HelmetProvider>
  </React.StrictMode>
);
