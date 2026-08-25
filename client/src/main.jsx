import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import './index.css';

// Telegram WebApp'ni kengaytirish
if (window.Telegram?.WebApp) {
  window.Telegram.WebApp.expand();
  window.Telegram.WebApp.ready();
}

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
