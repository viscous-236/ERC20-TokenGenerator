import React from 'react';
import ReactDOM from 'react-dom/client';
import { createBrowserRouter, RouterProvider } from 'react-router-dom';
import ConnectWallet from './pages/ConnectWallet.jsx';
import TokenCreation from './pages/TokenCreation.jsx';
import './index.css';

const router = createBrowserRouter([
  {
    path: "/",
    element: <ConnectWallet />,
  },
  {
    path: "/token-creation",
    element: <TokenCreation />,
  }
]);

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <RouterProvider router={router} />
  </React.StrictMode>
);