import React, { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { ArrowLeft, Clock, User, Calendar, Eye } from "lucide-react";
import { noteApi } from "../api/notes";
import type { Note } from "../types";
import { toast } from "react-hot-toast";
import "../styles/modern.css";

const SharedNotePage: React.FC = () => {
  const { shareToken } = useParams<{ shareToken: string }>();
  const [note, setNote] = useState<Note | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchSharedNote = async () => {
      if (!shareToken) {
        setError("Invalid share link");
        setLoading(false);
        return;
      }

      try {
        const response = await noteApi.getSharedNote(shareToken);
        if (response.success && response.data) {
          setNote(response.data);
        } else {
          setError("Failed to load shared note");
        }
      } catch (err: any) {
        console.error("Error fetching shared note:", err);
        if (
          err.message?.includes("not found") ||
          err.message?.includes("expired")
        ) {
          setError("This shared note is no longer available or has expired.");
        } else {
          setError("Failed to load shared note");
        }
        toast.error("Failed to load shared note");
      } finally {
        setLoading(false);
      }
    };

    fetchSharedNote();
  }, [shareToken]);

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  if (loading) {
    return (
      <div className="app-page">
        <div className="shared-note-container">
          <div className="shared-note-loading">
            <div className="loading-spinner"></div>
            <p>Loading shared note...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error || !note) {
    return (
      <div className="app-page">
        <div className="shared-note-container">
          <div className="shared-note-error">
            <div className="error-icon">
              <Eye className="h-12 w-12" />
            </div>
            <h2>Note Not Available</h2>
            <p>{error || "This shared note could not be found."}</p>
            <Link to="/" className="btn btn-primary">
              <ArrowLeft className="w-4 h-4" />
              Go to NoteGuard
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="app-page">
      {/* Header */}
      <header className="shared-note-header">
        <div className="shared-note-nav">
          <Link to="/" className="brand-link">
            <img src="/logo.svg" alt="NoteGuard" className="brand-logo" />
            <span className="brand-text">NoteGuard</span>
          </Link>
          <div className="shared-badge">
            <Eye className="w-4 h-4" />
            <span>Shared Note</span>
          </div>
        </div>
      </header>

      <div className="shared-note-container">
        <div className="shared-note-content">
          {/* Note Meta Information */}
          <div className="shared-note-meta">
            <div className="meta-item">
              <User className="meta-icon" />
              <span>Shared Note</span>
            </div>
            <div className="meta-item">
              <Calendar className="meta-icon" />
              <span>Created {formatDate(note.createdAt)}</span>
            </div>
            {note.updatedAt && note.updatedAt !== note.createdAt && (
              <div className="meta-item">
                <Clock className="meta-icon" />
                <span>Updated {formatDate(note.updatedAt)}</span>
              </div>
            )}
          </div>

          {/* Note Content */}
          <div className="shared-note-card">
            <div className="note-header">
              <h1 className="note-title">{note.title}</h1>
            </div>
            <div className="note-content">
              <div className="note-text" style={{ whiteSpace: "pre-wrap" }}>
                {note.content}
              </div>
            </div>
          </div>

          {/* Call to Action */}
          <div className="shared-note-cta">
            <h3>Create Your Own Secure Notes</h3>
            <p>
              Join NoteGuard to create, encrypt, and share your own notes
              securely.
            </p>
            <div className="cta-buttons">
              <Link to="/register" className="btn btn-primary">
                Get Started Free
              </Link>
              <Link to="/login" className="btn btn-secondary">
                Sign In
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SharedNotePage;
