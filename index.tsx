
import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import './styles.css';

// PDF.js lazy loading is now handled in App.tsx when a PDF is uploaded
// No need to load it immediately on page load

const rootElement = document.getElementById('root');
if (!rootElement) {
  throw new Error("Could not find root element to mount to");
}

const root = ReactDOM.createRoot(rootElement);
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);