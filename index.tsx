
import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';

const rootElement = document.getElementById('root');
<<<<<<< HEAD
if (!rootElement) throw new Error("Could not find root element");
=======
if (!rootElement) {
  throw new Error("Could not find root element to mount to");
}
>>>>>>> ac92b0f (Initial commit - Sahrdaya Attendance App)

const root = ReactDOM.createRoot(rootElement);
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
