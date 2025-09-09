import React, { useState, useEffect } from "react";
import { useParams, useNavigate, Link, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { noteApi } from "../api/notes";
import {
  ArrowLeft,
  Edit,
  Trash2,
  Share,
  Copy,
  Clock,
  Calendar,
  AlertCircle,
  CheckCircle,
  X,
  Save,
} from "lucide-react";
import { toast } from "react-hot-toast";
import type { Note, ShareNoteRequest, UpdateNoteRequest } from "../types";

const NotePage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const location = useLocation();
  const { user } = useAuth();

  // Check if we're in edit mode
  const isEditMode = location.pathname.includes("/edit");

  const [note, setNote] = useState<Note | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string>("");

  // Edit mode state
  const [editFormData, setEditFormData] = useState({
    title: "",
    content: "",
    expirationTime: "",
  });
  const [isUpdating, setIsUpdating] = useState(false);

  // Share functionality state
  const [isShareModalOpen, setIsShareModalOpen] = useState(false);
  const [shareHours, setShareHours] = useState<number>(24);
  const [shareUrl, setShareUrl] = useState<string>("");
  const [isSharing, setIsSharing] = useState(false);

  // Delete confirmation modal state
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => {
    if (id) {
      fetchNote();
    }
  }, [id]);

  const fetchNote = async () => {
    if (!id) return;

    try {
      setLoading(true);
      const response = await noteApi.getNoteById(id);
      if (response.data) {
        setNote(response.data);

        // If note is already shared, create the share URL
        if (response.data.shareToken) {
          const fullShareUrl = `${window.location.origin}/shared/${response.data.shareToken}`;
          setShareUrl(fullShareUrl);
        } else {
          setShareUrl("");
        }

        // Populate edit form if in edit mode
        if (isEditMode) {
          setEditFormData({
            title: response.data.title,
            content: response.data.content,
            expirationTime: response.data.expirationTime || "",
          });
        }
      }
    } catch (err: any) {
      setError(err.message || "Failed to load note");
      toast.error("Failed to load note");
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteNote = async () => {
    setIsDeleteModalOpen(true);
  };

  const confirmDeleteNote = async () => {
    if (!note) return;

    setIsDeleting(true);
    try {
      await noteApi.deleteNote(note.id.toString());
      toast.success("Note deleted successfully");
      navigate("/dashboard");
    } catch (error) {
      toast.error("Failed to delete note");
    } finally {
      setIsDeleting(false);
      setIsDeleteModalOpen(false);
    }
  };

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setEditFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleUpdateNote = async () => {
    if (!note || !id) return;

    if (!editFormData.title.trim() || !editFormData.content.trim()) {
      toast.error("Title and content are required");
      return;
    }

    setIsUpdating(true);
    try {
      const updateData: UpdateNoteRequest = {
        title: editFormData.title.trim(),
        content: editFormData.content.trim(),
        ...(editFormData.expirationTime && {
          expirationTime: editFormData.expirationTime,
        }),
      };

      await noteApi.updateNote(id, updateData);
      toast.success("Note updated successfully!");
      navigate(`/note/${id}`); // Navigate back to view mode
    } catch (error) {
      toast.error("Failed to update note");
    } finally {
      setIsUpdating(false);
    }
  };

  const handleShareNote = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!note) return;

    setIsSharing(true);
    try {
      const shareData: ShareNoteRequest = { expirationHours: shareHours };
      const response = await noteApi.shareNote(note.id.toString(), shareData);
      if (response.data?.shareUrl) {
        // Create full URL for sharing
        const fullShareUrl = `${window.location.origin}/shared/${response.data.shareToken}`;
        setShareUrl(fullShareUrl);
        toast.success("Note shared successfully!");

        // Refresh note data to show the new share status
        fetchNote();
      }
    } catch (error) {
      toast.error("Failed to share note");
    } finally {
      setIsSharing(false);
    }
  };

  const handleRevokeShare = async () => {
    if (!note) return;

    try {
      await noteApi.revokeShareToken(note.id.toString());
      setShareUrl("");
      toast.success("Share link revoked successfully!");

      // Refresh note data to update share status
      fetchNote();
    } catch (error) {
      toast.error("Failed to revoke share link");
    }
  };

  const copyToClipboard = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      toast.success("Copied to clipboard!");
    } catch (error) {
      toast.error("Failed to copy to clipboard");
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const isExpired =
    note?.expirationTime && new Date(note.expirationTime) <= new Date();
  const isShared = !!note?.shareToken;

  if (loading) {
    return (
      <div className="app-page flex items-center justify-center">
        <div className="text-center">
          <div className="loading-spinner mx-auto mb-4"></div>
          <p className="text-slate-300">Loading note...</p>
        </div>
      </div>
    );
  }

  if (error || !note) {
    return (
      <div className="app-page flex items-center justify-center">
        <div className="text-center">
          <AlertCircle className="mx-auto h-12 w-12 text-red-300 mb-4" />
          <h3 className="text-lg font-medium text-slate-100 mb-2">
            Note Not Found
          </h3>
          <p className="text-slate-300 max-w-sm mx-auto mb-6">
            {error ||
              "The note you're looking for doesn't exist or has been deleted."}
          </p>
          <Link to="/dashboard" className="btn btn-primary">
            Back to Dashboard
          </Link>
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
            <Link to="/dashboard" className="header-back-btn">
              <ArrowLeft className="h-4 w-4" />
              <span>Back to Dashboard</span>
            </Link>
            <div className="header-divider"></div>
            <div className="header-brand">
              <img src="/logo.svg" alt="Logo" className="h-4 w-auto" />
            </div>
          </div>

          <div className="note-actions">
            {user?.id === note?.ownerId && !isEditMode && (
              <div className="action-buttons">
                <div
                  id="mega-ultra-share-override-999888777"
                  onClick={() => setIsShareModalOpen(true)}
                  role="button"
                  tabIndex={0}
                  title="Share Note"
                  style={{
                    display: "inline-flex",
                    visibility: "visible",
                    opacity: 1,
                    background:
                      "linear-gradient(135deg, #0ea5e9 0%, #0284c7 100%)",
                    color: "white",
                    padding: "10px 16px",
                    borderRadius: "8px",
                    border: "1px solid rgba(14, 165, 233, 0.3)",
                    fontSize: "14px",
                    fontWeight: 500,
                    cursor: "pointer",
                    alignItems: "center",
                    gap: "8px",
                    position: "relative",
                    zIndex: 99999,
                    minHeight: "36px",
                    textDecoration: "none",
                    transition: "all 0.2s ease",
                    boxShadow: "0 2px 4px rgba(14, 165, 233, 0.2)",
                    lineHeight: 1,
                  }}
                  onMouseOver={(e) => {
                    e.currentTarget.style.background =
                      "linear-gradient(135deg, #0284c7 0%, #0369a1 100%)";
                    e.currentTarget.style.transform = "translateY(-1px)";
                  }}
                  onMouseOut={(e) => {
                    e.currentTarget.style.background =
                      "linear-gradient(135deg, #0ea5e9 0%, #0284c7 100%)";
                    e.currentTarget.style.transform = "translateY(0)";
                  }}
                >
                  <Share className="h-4 w-4" />
                  <span>Share</span>
                </div>
                <div
                  id="mega-ultra-edit-override-666555444"
                  onClick={() => navigate(`/note/${note.id}/edit`)}
                  role="button"
                  tabIndex={0}
                  title="Edit Note"
                  style={{
                    display: "inline-flex",
                    visibility: "visible",
                    opacity: 1,
                    background:
                      "linear-gradient(135deg, #7c3aed 0%, #6d28d9 100%)",
                    color: "white",
                    padding: "10px 16px",
                    borderRadius: "8px",
                    border: "1px solid rgba(124, 58, 237, 0.3)",
                    fontSize: "14px",
                    fontWeight: 500,
                    cursor: "pointer",
                    alignItems: "center",
                    gap: "8px",
                    position: "relative",
                    zIndex: 99999,
                    minHeight: "36px",
                    textDecoration: "none",
                    transition: "all 0.2s ease",
                    boxShadow: "0 2px 4px rgba(124, 58, 237, 0.2)",
                    lineHeight: 1,
                  }}
                  onMouseOver={(e) => {
                    e.currentTarget.style.background =
                      "linear-gradient(135deg, #6d28d9 0%, #5b21b6 100%)";
                    e.currentTarget.style.transform = "translateY(-1px)";
                  }}
                  onMouseOut={(e) => {
                    e.currentTarget.style.background =
                      "linear-gradient(135deg, #7c3aed 0%, #6d28d9 100%)";
                    e.currentTarget.style.transform = "translateY(0)";
                  }}
                >
                  <Edit className="h-4 w-4" />
                  <span>Edit</span>
                </div>
                <div
                  id="mega-ultra-delete-override-333222111"
                  onClick={handleDeleteNote}
                  role="button"
                  tabIndex={0}
                  title="Delete Note"
                  style={{
                    display: "inline-flex",
                    visibility: "visible",
                    opacity: 1,
                    background:
                      "linear-gradient(135deg, #dc2626 0%, #b91c1c 100%)",
                    color: "white",
                    padding: "10px 16px",
                    borderRadius: "8px",
                    border: "1px solid rgba(220, 38, 38, 0.3)",
                    fontSize: "14px",
                    fontWeight: 500,
                    cursor: "pointer",
                    alignItems: "center",
                    gap: "8px",
                    position: "relative",
                    zIndex: 99999,
                    minHeight: "36px",
                    textDecoration: "none",
                    transition: "all 0.2s ease",
                    boxShadow: "0 2px 4px rgba(220, 38, 38, 0.2)",
                    lineHeight: 1,
                  }}
                  onMouseOver={(e) => {
                    e.currentTarget.style.background =
                      "linear-gradient(135deg, #b91c1c 0%, #991b1b 100%)";
                    e.currentTarget.style.transform = "translateY(-1px)";
                  }}
                  onMouseOut={(e) => {
                    e.currentTarget.style.background =
                      "linear-gradient(135deg, #dc2626 0%, #b91c1c 100%)";
                    e.currentTarget.style.transform = "translateY(0)";
                  }}
                >
                  <Trash2 className="h-4 w-4" />
                </div>
              </div>
            )}
            {user?.id === note?.ownerId && isEditMode && (
              <div className="action-buttons">
                <button
                  onClick={handleUpdateNote}
                  disabled={isUpdating}
                  className="action-btn save-btn"
                  title="Save Changes"
                >
                  <Save className="h-4 w-4" />
                  <span>{isUpdating ? "Saving..." : "Save Changes"}</span>
                </button>
                <Link
                  to={`/note/${note.id}`}
                  className="action-btn cancel-btn"
                  title="Cancel Editing"
                >
                  <X className="h-4 w-4" />
                  <span>Cancel</span>
                </Link>
              </div>
            )}
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="note-main">
        <div className="note-container">
          {/* Status Indicators */}
          <div className="note-status">
            {isExpired && (
              <div className="status-alert expired">
                <div className="alert-header">
                  <AlertCircle className="alert-icon" />
                  <span className="alert-title">This note has expired</span>
                </div>
                <p className="alert-detail">
                  Expired on {formatDate(note.expirationTime!)}
                </p>
              </div>
            )}

            {isShared && (
              <div className="status-alert shared">
                <div className="alert-header">
                  <CheckCircle className="alert-icon" />
                  <span className="alert-title">This note is shared</span>
                </div>
                <p className="alert-detail">
                  Share expires on{" "}
                  {note.shareExpirationTime &&
                    formatDate(note.shareExpirationTime)}
                </p>
              </div>
            )}
          </div>

          {/* Note Content */}
          {isEditMode ? (
            <div className="note-editor">
              <div className="editor-content">
                <div className="form-group">
                  <label htmlFor="title" className="form-label">
                    Title
                  </label>
                  <input
                    id="title"
                    name="title"
                    type="text"
                    value={editFormData.title}
                    onChange={handleInputChange}
                    className="editor-title-input"
                    placeholder="Enter note title..."
                    required
                    disabled={isUpdating}
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="content" className="form-label">
                    Content
                  </label>
                  <textarea
                    id="content"
                    name="content"
                    value={editFormData.content}
                    onChange={handleInputChange}
                    className="editor-content-input"
                    rows={12}
                    placeholder="Write your note content here..."
                    required
                    disabled={isUpdating}
                  />
                </div>

                <div className="form-group">
                  <label
                    htmlFor="expirationTime"
                    className="form-label-with-icon"
                  >
                    <Calendar className="label-icon" />
                    <span>Expiration Time (Optional)</span>
                  </label>
                  <input
                    id="expirationTime"
                    name="expirationTime"
                    type="datetime-local"
                    value={editFormData.expirationTime}
                    onChange={handleInputChange}
                    className="editor-date-input"
                    disabled={isUpdating}
                  />
                  <p className="input-help-text">
                    Leave empty for notes that don't expire
                  </p>
                </div>

                <div className="form-buttons">
                  <Link
                    to={`/note/${note.id}`}
                    className="action-btn cancel-btn"
                  >
                    <X className="h-4 w-4" />
                    <span>Cancel</span>
                  </Link>
                  <button
                    onClick={handleUpdateNote}
                    disabled={isUpdating}
                    className="action-btn save-btn"
                  >
                    {isUpdating ? (
                      <>
                        <div className="loading-spinner" />
                        <span>Saving...</span>
                      </>
                    ) : (
                      <>
                        <Save className="h-4 w-4" />
                        <span>Save Changes</span>
                      </>
                    )}
                  </button>
                </div>
              </div>
            </div>
          ) : (
            <div className="note-viewer">
              <div className="note-header">
                <h1 className="note-title">{note.title}</h1>
                <div className="note-meta">
                  <div className="meta-item">
                    <Calendar className="meta-icon" />
                    <span>Created {formatDate(note.createdAt)}</span>
                  </div>

                  {note.updatedAt !== note.createdAt && (
                    <div className="meta-item">
                      <Edit className="meta-icon" />
                      <span>Updated {formatDate(note.updatedAt)}</span>
                    </div>
                  )}

                  {note.expirationTime && !isExpired && (
                    <div className="meta-item">
                      <Clock className="meta-icon" />
                      <span>Expires {formatDate(note.expirationTime)}</span>
                    </div>
                  )}
                </div>
              </div>

              <div className="note-body">
                {note.content.split("\n").map((paragraph, index) => (
                  <p key={index} className="content-paragraph">
                    {paragraph}
                  </p>
                ))}
              </div>
            </div>
          )}
        </div>
      </main>

      {/* Share Modal */}
      {isShareModalOpen && (
        <div
          className="modal-overlay"
          onClick={() => setIsShareModalOpen(false)}
        >
          <div className="modal-container" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2 className="modal-title">Share Note</h2>
              <button
                onClick={() => setIsShareModalOpen(false)}
                className="modal-close"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            {shareUrl ? (
              <div className="modal-body">
                <div className="share-url-group">
                  <label className="form-label">Share URL</label>
                  <div className="share-url-input">
                    <input
                      type="text"
                      value={shareUrl}
                      readOnly
                      className="form-input"
                    />
                    <button
                      onClick={() => copyToClipboard(shareUrl)}
                      className="action-btn"
                      title="Copy to Clipboard"
                    >
                      <Copy className="h-4 w-4" />
                    </button>
                  </div>
                  <p className="input-help-text">
                    Anyone with this link can view your note until it expires.
                  </p>
                </div>

                <div className="modal-footer">
                  <button
                    type="button"
                    onClick={() => setIsShareModalOpen(false)}
                    className="action-btn cancel-btn"
                  >
                    Close
                  </button>
                  <button
                    onClick={handleRevokeShare}
                    className="action-btn danger-btn"
                  >
                    <X className="h-4 w-4" />
                    Revoke Share Link
                  </button>
                </div>
              </div>
            ) : (
              <form onSubmit={handleShareNote}>
                <div className="modal-body">
                  <div className="form-group">
                    <label htmlFor="shareHours" className="form-label">
                      Share Duration (hours)
                    </label>
                    <select
                      id="shareHours"
                      value={shareHours}
                      onChange={(e) => setShareHours(Number(e.target.value))}
                      className="form-input"
                      required
                    >
                      <option value={1}>1 hour</option>
                      <option value={6}>6 hours</option>
                      <option value={24}>24 hours</option>
                      <option value={72}>3 days</option>
                      <option value={168}>1 week</option>
                    </select>
                    <p className="input-help-text">
                      The share link will expire after the selected duration.
                    </p>
                  </div>
                </div>

                <div className="modal-footer">
                  <button
                    type="button"
                    onClick={() => setIsShareModalOpen(false)}
                    className="action-btn cancel-btn"
                    disabled={isSharing}
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="action-btn save-btn"
                    disabled={isSharing}
                  >
                    {isSharing ? (
                      <>
                        <div className="loading-spinner" />
                        <span>Creating...</span>
                      </>
                    ) : (
                      <>
                        <Share className="h-4 w-4" />
                        <span>Create Share Link</span>
                      </>
                    )}
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {isDeleteModalOpen && (
        <div
          className="modal-overlay"
          onClick={() => setIsDeleteModalOpen(false)}
        >
          <div className="modal-container" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2 className="modal-title">Delete Note</h2>
              <button
                onClick={() => setIsDeleteModalOpen(false)}
                className="modal-close"
                disabled={isDeleting}
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <div className="modal-body">
              <div className="delete-warning">
                <AlertCircle className="warning-icon" />
                <div className="warning-content">
                  <p className="warning-title">
                    Are you sure you want to delete this note?
                  </p>
                  <p className="warning-message">
                    "{note?.title}" will be permanently deleted. This action
                    cannot be undone.
                  </p>
                </div>
              </div>
            </div>

            <div className="modal-footer">
              <button
                type="button"
                onClick={() => setIsDeleteModalOpen(false)}
                className="action-btn cancel-btn"
                disabled={isDeleting}
              >
                Cancel
              </button>
              <button
                onClick={confirmDeleteNote}
                className="action-btn delete-btn"
                disabled={isDeleting}
              >
                {isDeleting ? (
                  <>
                    <div className="loading-spinner" />
                    <span>Deleting...</span>
                  </>
                ) : (
                  <>
                    <Trash2 className="h-4 w-4" />
                    <span>Delete Note</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default NotePage;
