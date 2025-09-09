import React from "react";
import type { ReactNode } from "react";
import Navbar from "./Navbar";
import { useAuth } from "../context/AuthContext";

interface LayoutProps {
  children: ReactNode;
  showNavbar?: boolean;
}

const Layout: React.FC<LayoutProps> = ({ children, showNavbar = true }) => {
  const { user } = useAuth();
  const shouldShowNavbar = showNavbar && user;

  return (
    <div className="min-h-screen app-page">
      {shouldShowNavbar && <Navbar />}
      <main className={shouldShowNavbar ? "pt-0" : "pt-0"}>{children}</main>
    </div>
  );
};

export default Layout;
