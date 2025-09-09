import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { noteApi } from "../api/notes";
import { CreateNoteModal } from "../components/CreateNoteModal";
import {
  Plus,
  FileText,
  Eye,
  Edit,
  Trash2,
  Share,
  Clock,
  LogOut,
  Search,
  Filter,
  Calendar,
  Settings,
} from "lucide-react";
import { toast } from "react-hot-toast";
import type { Note } from "../types";

const DashboardPage: React.FC = () => {
  const [notes, setNotes] = useState<Note[]>([]);
  const [loading, setLoading] = useState(true);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [showAnimation, setShowAnimation] = useState(true);
  const [sortBy, setSortBy] = useState<"createdAt" | "updatedAt" | "title">(
    "updatedAt"
  );

  // Remove animation after 5 seconds
  useEffect(() => {
    const timer = setTimeout(() => {
      setShowAnimation(false);
    }, 5000);

    return () => clearTimeout(timer);
  }, []);

  const { user, logout } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    fetchNotes();
  }, []);

  const fetchNotes = async () => {
    try {
      setLoading(true);
      const response = await noteApi.getUserNotes();
      setNotes(response.data || []);
    } catch (error) {
      toast.error("Failed to load notes");
      console.error("Error fetching notes:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteNote = async (noteId: number) => {
    if (!window.confirm("Are you sure you want to delete this note?")) {
      return;
    }

    try {
      await noteApi.deleteNote(noteId.toString());
      setNotes(notes.filter((note) => note.id !== noteId));
      toast.success("Note deleted successfully");
    } catch (error) {
      toast.error("Failed to delete note");
    }
  };

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  // Filter and sort notes
  const filteredNotes = notes.filter(
    (note) =>
      note.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      note.content.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const sortedNotes = [...filteredNotes].sort((a, b) => {
    if (sortBy === "title") {
      return a.title.localeCompare(b.title);
    }
    return new Date(b[sortBy]).getTime() - new Date(a[sortBy]).getTime();
  });

  if (loading) {
    return (
      <div className="app-page flex items-center justify-center">
        <div className="text-center">
          <div className="loading-spinner mx-auto mb-3"></div>
          <p className="text-gray-300 text-sm">Loading your notes...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="app-page">
      {/* Modern Header */}
      <header className="modern-header">
        <div className="header-content">
          <div className="header-left">
            <img src="/logo.svg" alt="Logo" className="h-5 w-auto" />
          </div>

          <div className="header-actions">
            {user?.role === "ADMIN" && (
              <Link to="/admin" className="header-btn">
                <Settings className="h-4 w-4" />
                <span>Admin</span>
              </Link>
            )}
            <button onClick={handleLogout} className="header-btn">
              <LogOut className="h-4 w-4" />
              <span>Logout</span>
            </button>
          </div>
        </div>
      </header>

      {/* Main Content with Modern Design */}
      <main className="dashboard-main">
        <div className="dashboard-container">
          {/* Quick Stats at Top */}
          <div className="stats-overview top-stats">
            <div className="metric-card accent glass-effect">
              <div className="metric-icon">
                <FileText className="h-6 w-6" />
              </div>
              <div className="metric-content">
                <p className="metric-value">{notes.length}</p>
                <p className="metric-label">Total Notes</p>
              </div>
            </div>

            <div className="metric-card success glass-effect">
              <div className="metric-icon">
                <Share className="h-6 w-6" />
              </div>
              <div className="metric-content">
                <p className="metric-value">
                  {notes.filter((n) => n.shareToken).length}
                </p>
                <p className="metric-label">Shared Notes</p>
              </div>
            </div>

            <div className="metric-card warning glass-effect">
              <div className="metric-icon">
                <Clock className="h-6 w-6" />
              </div>
              <div className="metric-content">
                <p className="metric-value">
                  {
                    notes.filter(
                      (n) =>
                        n.expirationTime &&
                        new Date(n.expirationTime) > new Date()
                    ).length
                  }
                </p>
                <p className="metric-label">Active Expiring</p>
              </div>
            </div>
          </div>

          {/* Enhanced Welcome Banner */}
          <div className="welcome-banner glass-effect">
            <div>
              <h2 className="welcome-title gradient-text">
                Welcome back, {user?.username}! 👋
              </h2>
              <p className="welcome-subtitle">
                Your digital sanctuary awaits. Keep your thoughts safe and
                organized.
              </p>
            </div>
            <button
              onClick={() => setIsCreateModalOpen(true)}
              className={`new-note-btn ${showAnimation ? "pulse-effect" : ""}`}
            >
              <Plus className="h-5 w-5" />
              New Note
            </button>
          </div>

          {/* Modern Search and Filter Bar */}
          <div className="search-filter-bar">
            <div className="search-wrapper">
              <Search className="search-icon" />
              <input
                type="text"
                placeholder="Search your notes..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="search-input"
              />
            </div>

            <div className="filter-wrapper">
              <Filter className="filter-icon" />
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as any)}
                className="filter-select"
              >
                <option value="updatedAt">Recently Updated</option>
                <option value="createdAt">Recently Created</option>
                <option value="title">Alphabetical</option>
              </select>
            </div>
          </div>

          {/* Modern Notes Section */}
          {sortedNotes.length === 0 ? (
            <div className="empty-state">
              <FileText className="empty-state-icon" />
              <h3 className="empty-state-title">
                {searchTerm ? "No notes match your search" : "No notes yet"}
              </h3>
              <p className="empty-state-description">
                {searchTerm
                  ? "Try adjusting your search terms to find what you're looking for."
                  : "Get started by creating your first secure note. Your thoughts deserve protection."}
              </p>
              {!searchTerm && (
                <button
                  onClick={() => setIsCreateModalOpen(true)}
                  className="empty-state-button"
                >
                  <Plus className="h-5 w-5" />
                  Create Your First Note
                </button>
              )}
            </div>
          ) : (
            <div className="notes-grid">
              {sortedNotes.map((note) => {
                const isExpired =
                  note.expirationTime &&
                  new Date(note.expirationTime) <= new Date();
                const isShared = !!note.shareToken;

                return (
                  <div
                    key={note.id}
                    className="note-card"
                    onClick={() => navigate(`/note/${note.id}`)}
                  >
                    <div className="note-content">
                      <div className="note-header">
                        <h3 className="note-title">{note.title}</h3>
                        <div className="note-badges">
                          {isShared && (
                            <div className="note-badge note-badge-shared">
                              <Share className="badge-icon" />
                              <span className="badge-text">Shared</span>
                            </div>
                          )}
                          {isExpired && (
                            <div className="note-badge note-badge-expired">
                              <Clock className="badge-icon" />
                              <span className="badge-text">Expired</span>
                            </div>
                          )}
                        </div>
                      </div>

                      <p className="note-preview">
                        {note.content.length > 120
                          ? `${note.content.substring(0, 120)}...`
                          : note.content}
                      </p>

                      <div className="note-footer">
                        <div className="note-date">
                          <Calendar className="date-icon" />
                          <span className="date-text">
                            {formatDate(note.updatedAt)}
                          </span>
                        </div>

                        <div className="note-actions">
                          <div
                            id="mega-ultra-dashboard-view-override-111222333"
                            role="button"
                            tabIndex={0}
                            onClick={(e) => {
                              e.stopPropagation();
                              navigate(`/note/${note.id}`);
                            }}
                            title="View Note"
                            style={{
                              display: "inline-flex",
                              visibility: "visible",
                              opacity: 1,
                              background:
                                "linear-gradient(135deg, #10b981 0%, #059669 100%)",
                              color: "white",
                              padding: "8px 12px",
                              borderRadius: "6px",
                              border: "1px solid rgba(16, 185, 129, 0.3)",
                              fontSize: "13px",
                              fontWeight: 500,
                              cursor: "pointer",
                              alignItems: "center",
                              justifyContent: "center",
                              position: "relative",
                              zIndex: 99999,
                              minHeight: "32px",
                              minWidth: "32px",
                              textDecoration: "none",
                              transition: "all 0.2s ease",
                              boxShadow: "0 1px 3px rgba(16, 185, 129, 0.2)",
                              lineHeight: 1,
                            }}
                            onMouseOver={(e) => {
                              e.currentTarget.style.background =
                                "linear-gradient(135deg, #059669 0%, #047857 100%)";
                              e.currentTarget.style.transform = "scale(1.05)";
                            }}
                            onMouseOut={(e) => {
                              e.currentTarget.style.background =
                                "linear-gradient(135deg, #10b981 0%, #059669 100%)";
                              e.currentTarget.style.transform = "scale(1)";
                            }}
                          >
                            <Eye className="action-icon" />
                          </div>
                          <div
                            id="mega-ultra-dashboard-edit-override-444555666"
                            role="button"
                            tabIndex={0}
                            onClick={(e) => {
                              e.stopPropagation();
                              navigate(`/note/${note.id}/edit`);
                            }}
                            title="Edit Note"
                            style={{
                              display: "inline-flex",
                              visibility: "visible",
                              opacity: 1,
                              background:
                                "linear-gradient(135deg, #7c3aed 0%, #6d28d9 100%)",
                              color: "white",
                              padding: "8px 12px",
                              borderRadius: "6px",
                              border: "1px solid rgba(124, 58, 237, 0.3)",
                              fontSize: "13px",
                              fontWeight: 500,
                              cursor: "pointer",
                              alignItems: "center",
                              justifyContent: "center",
                              position: "relative",
                              zIndex: 99999,
                              minHeight: "32px",
                              minWidth: "32px",
                              textDecoration: "none",
                              transition: "all 0.2s ease",
                              boxShadow: "0 1px 3px rgba(124, 58, 237, 0.2)",
                              lineHeight: 1,
                            }}
                            onMouseOver={(e) => {
                              e.currentTarget.style.background =
                                "linear-gradient(135deg, #6d28d9 0%, #5b21b6 100%)";
                              e.currentTarget.style.transform = "scale(1.05)";
                            }}
                            onMouseOut={(e) => {
                              e.currentTarget.style.background =
                                "linear-gradient(135deg, #7c3aed 0%, #6d28d9 100%)";
                              e.currentTarget.style.transform = "scale(1)";
                            }}
                          >
                            <Edit className="action-icon" />
                          </div>
                          <div
                            id="mega-ultra-dashboard-share-override-555666777"
                            role="button"
                            tabIndex={0}
                            onClick={(e) => {
                              e.stopPropagation();
                              // Share functionality - could open modal or copy link
                              console.log("Share note:", note.id);
                            }}
                            title="Share Note"
                            style={{
                              display: "inline-flex",
                              visibility: "visible",
                              opacity: 1,
                              background:
                                "linear-gradient(135deg, #0ea5e9 0%, #0284c7 100%)",
                              color: "white",
                              padding: "8px 12px",
                              borderRadius: "6px",
                              border: "1px solid rgba(14, 165, 233, 0.3)",
                              fontSize: "13px",
                              fontWeight: 500,
                              cursor: "pointer",
                              alignItems: "center",
                              justifyContent: "center",
                              position: "relative",
                              zIndex: 99999,
                              minHeight: "32px",
                              minWidth: "32px",
                              textDecoration: "none",
                              transition: "all 0.2s ease",
                              boxShadow: "0 1px 3px rgba(14, 165, 233, 0.2)",
                              lineHeight: 1,
                            }}
                            onMouseOver={(e) => {
                              e.currentTarget.style.background =
                                "linear-gradient(135deg, #0284c7 0%, #0369a1 100%)";
                              e.currentTarget.style.transform = "scale(1.05)";
                            }}
                            onMouseOut={(e) => {
                              e.currentTarget.style.background =
                                "linear-gradient(135deg, #0ea5e9 0%, #0284c7 100%)";
                              e.currentTarget.style.transform = "scale(1)";
                            }}
                          >
                            <Share className="action-icon" />
                          </div>
                          <div
                            id="mega-ultra-dashboard-delete-override-777888999"
                            role="button"
                            tabIndex={0}
                            onClick={(e) => {
                              e.stopPropagation();
                              handleDeleteNote(note.id);
                            }}
                            title="Delete Note"
                            style={{
                              display: "inline-flex",
                              visibility: "visible",
                              opacity: 1,
                              background:
                                "linear-gradient(135deg, #dc2626 0%, #b91c1c 100%)",
                              color: "white",
                              padding: "8px 12px",
                              borderRadius: "6px",
                              border: "1px solid rgba(220, 38, 38, 0.3)",
                              fontSize: "13px",
                              fontWeight: 500,
                              cursor: "pointer",
                              alignItems: "center",
                              justifyContent: "center",
                              position: "relative",
                              zIndex: 99999,
                              minHeight: "32px",
                              minWidth: "32px",
                              textDecoration: "none",
                              transition: "all 0.2s ease",
                              boxShadow: "0 1px 3px rgba(220, 38, 38, 0.2)",
                              lineHeight: 1,
                            }}
                            onMouseOver={(e) => {
                              e.currentTarget.style.background =
                                "linear-gradient(135deg, #b91c1c 0%, #991b1b 100%)";
                              e.currentTarget.style.transform = "scale(1.05)";
                            }}
                            onMouseOut={(e) => {
                              e.currentTarget.style.background =
                                "linear-gradient(135deg, #dc2626 0%, #b91c1c 100%)";
                              e.currentTarget.style.transform = "scale(1)";
                            }}
                          >
                            <Trash2 className="action-icon" />
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {/* Stats are now at the top */}
        </div>
      </main>

      {/* Create Note Modal */}
      {isCreateModalOpen && (
        <CreateNoteModal
          isOpen={isCreateModalOpen}
          onClose={() => setIsCreateModalOpen(false)}
          onNoteCreated={() => {
            fetchNotes();
            setIsCreateModalOpen(false);
            toast.success("Note created successfully!");
          }}
        />
      )}
    </div>
  );
};

export default DashboardPage;
