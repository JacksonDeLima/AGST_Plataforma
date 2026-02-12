import React from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter } from "react-router-dom";

import AppRoutes from "./routes/AppRoutes.jsx";

import { AuthProvider } from "./context/AuthContext.jsx";
import { AmbienteProvider } from "./context/AmbienteContext.jsx";
import { ThemeProvider } from "./context/ThemeContext.jsx";
import { LanguageProvider } from "./context/LanguageContext.jsx";
import { ToastProvider } from "./context/ToastContext.jsx";

import "./index.css";
import "./StylesGlobal/global.css";

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <ThemeProvider>
      <LanguageProvider>
        <ToastProvider>
          <AuthProvider>
            <AmbienteProvider>
              <BrowserRouter>
                <AppRoutes />
              </BrowserRouter>
            </AmbienteProvider>
          </AuthProvider>
        </ToastProvider>
      </LanguageProvider>
    </ThemeProvider>
  </React.StrictMode>
);
