import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { RouterProvider } from "react-router-dom";
import { Toaster } from "react-hot-toast";
import { router } from "./routes";
import { AuthProvider } from "./context/AuthContext";
import { LoadingProvider } from "./context/LoadingContext";
import "./styles/modern.css";

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <LoadingProvider>
      <AuthProvider>
        <RouterProvider router={router} />
        <Toaster
          position="top-right"
          toastOptions={{
            duration: 4000,
            style: {
              background: "#fff",
              color: "#1e293b",
              border: "1px solid #e2e8f0",
              borderRadius: "0.75rem",
              boxShadow: "0 10px 15px -3px rgba(0, 0, 0, 0.1)",
            },
          }}
        />
      </AuthProvider>
    </LoadingProvider>
  </StrictMode>
);
