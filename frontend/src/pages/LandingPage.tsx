import React from "react";
import { Link } from "react-router-dom";
import { ArrowRight } from "lucide-react";

const LandingPage: React.FC = () => {
  return (
    <div className="landing-page">
      {/* Navigation */}
      <div className="header-wrapper">
        <nav className="landing-nav">
          <div className="nav-card">
            <div className="nav-content">
              <div className="nav-logo">
                <img
                  src="/logo.svg"
                  alt="NoteGuard Logo"
                  className="nav-logo-img"
                />
                <span className="nav-logo-text">NoteGuard</span>
              </div>
              <div className="nav-center">
                <Link to="/features">Features</Link>
                <Link to="/security">Security</Link>
                <Link to="/pricing">Pricing</Link>
              </div>
              <div className="nav-links">
                <Link to="/login" className="nav-link">
                  Login
                </Link>
                <Link to="/register" className="nav-link-primary">
                  <span>Get Started</span>
                  <span className="star-count">Free</span>
                </Link>
              </div>
            </div>
          </div>
        </nav>
      </div>

      {/* Hero Section */}
      <header className="hero-section">
        <div className="hero-content">
          <div className="new-tag">
            <span className="tag-dot"></span>
            Launching Soon
            <Link to="/register" className="tag-link">
              Try Beta →
            </Link>
          </div>
          <h1 className="hero-title">
            Your Personal
            <span className="gradient-text"> Digital Vault</span>
            <br />
            For Secure Notes
          </h1>
          <p className="hero-subtitle">
            Experience next-generation note security. Create, store, and share
            your thoughts with military-grade encryption.
          </p>
          <div className="hero-cta">
            <Link to="/register" className="cta-button">
              Start Taking Notes
              <ArrowRight className="w-5 h-5" />
            </Link>
            <Link to="/demo" className="cta-button-secondary">
              See How It Works
            </Link>
          </div>
          <div className="hero-stats">
            <div className="stat-item">
              <span className="stat-value">100%</span>
              <span className="stat-label">Encrypted</span>
            </div>
            <div className="stat-item">
              <span className="stat-value">24/7</span>
              <span className="stat-label">Available</span>
            </div>
            <div className="stat-item">
              <span className="stat-value">Free</span>
              <span className="stat-label">To Start</span>
            </div>
          </div>
        </div>
      </header>

      {/* Features Grid Section */}
      <section className="features-grid-section">
        <div className="features-grid">
          <div className="feature-card insights">
            <div className="feature-header">
              <h3>Insights</h3>
            </div>
            <div className="feature-content">
              <div className="feature-item">
                <h4>Analytics</h4>
                <p>Track your note usage and security metrics</p>
              </div>
            </div>
          </div>

          <div className="feature-card overview">
            <div className="feature-header">
              <h3>Overview</h3>
            </div>
            <div className="feature-content">
              <div className="feature-item">
                <h4>Dashboard</h4>
                <p>Centralized view of all your notes</p>
              </div>
            </div>
          </div>

          <div className="feature-card teamwork">
            <div className="feature-header">
              <h3>Security</h3>
            </div>
            <div className="feature-content">
              <div className="feature-item">
                <h4>Collaboration</h4>
                <p>Share notes securely with team members</p>
              </div>
            </div>
          </div>

          <div className="feature-card efficiency">
            <div className="feature-header">
              <h3>Efficiency</h3>
            </div>
            <div className="feature-content">
              <div className="feature-item">
                <h4>Automation</h4>
                <p>Streamline your note-taking workflow</p>
              </div>
            </div>
          </div>

          <div className="feature-card connectivity">
            <div className="feature-header">
              <h3>Connectivity</h3>
            </div>
            <div className="feature-content">
              <div className="feature-item">
                <h4>Integration</h4>
                <p>Connect with your favorite tools</p>
              </div>
            </div>
          </div>

          <div className="feature-card protection">
            <div className="feature-header">
              <h3>Protection</h3>
            </div>
            <div className="feature-content">
              <div className="feature-item">
                <h4>Security</h4>
                <p>Enterprise-grade protection</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section className="how-it-works-section">
        <h2 className="section-title">How It Works</h2>
        <div className="steps-container">
          <div className="step-card">
            <div className="step-number">1</div>
            <h3 className="step-title">Create an Account</h3>
            <p className="step-description">
              Sign up with your email and create a secure password for your
              account.
            </p>
          </div>
          <div className="step-card">
            <div className="step-number">2</div>
            <h3 className="step-title">Write Secure Notes</h3>
            <p className="step-description">
              Create and edit notes with our intuitive editor. All notes are
              automatically encrypted.
            </p>
          </div>
          <div className="step-card">
            <div className="step-number">3</div>
            <h3 className="step-title">Share Safely</h3>
            <p className="step-description">
              Share notes with others using secure links and set custom
              expiration times.
            </p>
          </div>
        </div>
      </section>

      {/* Trust Section */}
      <section className="trust-section">
        <div className="trust-content">
          <h2 className="section-title">Enterprise-Grade Security</h2>
          <div className="trust-grid">
            <div className="trust-card">
              <div className="trust-icon">🛡️</div>
              <h3>Military-grade Encryption</h3>
              <p>Your data is protected with AES-256 encryption</p>
            </div>
            <div className="trust-card">
              <div className="trust-icon">🔒</div>
              <h3>Zero-Knowledge Privacy</h3>
              <p>We can't access your encrypted notes</p>
            </div>
            <div className="trust-card">
              <div className="trust-icon">🔄</div>
              <h3>Regular Audits</h3>
              <p>Continuous security monitoring and updates</p>
            </div>
            <div className="trust-card">
              <div className="trust-icon">👥</div>
              <h3>Secure Sharing</h3>
              <p>Share notes with end-to-end encryption</p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="cta-section">
        <div className="cta-content">
          <h2 className="cta-title">Ready to Secure Your Notes?</h2>
          <p className="cta-description">
            Join thousands of users who trust NoteGuard with their private
            thoughts and ideas.
          </p>
          <Link to="/register" className="cta-button-large">
            Get Started Now
            <ArrowRight className="w-6 h-6" />
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="landing-footer">
        <div className="footer-content">
          <div className="footer-logo">
            <img
              src="/logo.svg"
              alt="NoteGuard Logo"
              className="footer-logo-img"
            />
            <span className="footer-logo-text">NoteGuard</span>
          </div>
          <div className="footer-links">
            <div className="footer-column">
              <h4>Product</h4>
              <Link to="/features">Features</Link>
              <Link to="/security">Security</Link>
              <Link to="/pricing">Pricing</Link>
            </div>
            <div className="footer-column">
              <h4>Company</h4>
              <Link to="/about">About</Link>
              <Link to="/blog">Blog</Link>
              <Link to="/careers">Careers</Link>
            </div>
            <div className="footer-column">
              <h4>Legal</h4>
              <Link to="/privacy">Privacy Policy</Link>
              <Link to="/terms">Terms of Service</Link>
              <Link to="/cookies">Cookie Policy</Link>
            </div>
          </div>
        </div>
        <div className="footer-bottom">
          <p>
            &copy; {new Date().getFullYear()} NoteGuard. All rights reserved.
          </p>
        </div>
      </footer>
    </div>
  );
};

export default LandingPage;
