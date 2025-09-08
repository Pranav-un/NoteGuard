import React, { useState, useEffect } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
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
  Eye,
  EyeOff,
  AlertCircle,
  CheckCircle,
  Shield,
  X,
} from "lucide-react";
import { toast } from "react-hot-toast";
import type { Note, ShareNoteRequest } from "../types";

const NotePageNew: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();

  const [note, setNote] = useState<Note | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string>("");

  // Share functionality state
  const [isShareModalOpen, setIsShareModalOpen] = useState(false);
  const [shareHours, setShareHours] = useState<number>(24);
  const [shareUrl, setShareUrl] = useState<string>("");
  const [isSharing, setIsSharing] = useState(false);

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
      setNote(response.data);
    } catch (err: any) {
      setError(err.message || "Failed to load note");
      toast.error("Failed to load note");
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteNote = async () => {
    if (
      !note ||
      !window.confirm("Are you sure you want to delete this note?")
    ) {
      return;
    }

    try {
      await noteApi.deleteNote(note.id.toString());
      toast.success("Note deleted successfully");
      navigate("/dashboard");
    } catch (error) {
      toast.error("Failed to delete note");
    }
  };

  const handleShareNote = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!note) return;

    setIsSharing(true);
    try {
      const shareData: ShareNoteRequest = { expirationHours: shareHours };
      const response = await noteApi.shareNote(note.id.toString(), shareData);
      setShareUrl(response.data.shareUrl);
      toast.success("Note shared successfully!");

      // Refresh note data to show the new share status
      fetchNote();
    } catch (error) {
      toast.error("Failed to share note");
    } finally {
      setIsSharing(false);
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
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="text-center">
          <div className="loading-spinner mx-auto mb-4"></div>
          <p className="text-slate-600">Loading note...</p>
        </div>
      </div>
    );
  }

  if (error || !note) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="text-center">
          <AlertCircle className="mx-auto h-12 w-12 text-red-400 mb-4" />
          <h3 className="text-lg font-medium text-slate-900 mb-2">
            Note Not Found
          </h3>
          <p className="text-slate-600 max-w-sm mx-auto mb-6">
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
    <div className="min-h-screen bg-slate-50">
      {/* Header */}
      <header className="dashboard-header">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link to="/dashboard" className="btn btn-ghost">
              <ArrowLeft className="h-4 w-4" />
              Back
            </Link>
            <div className="flex items-center gap-2">
              <Shield className="h-6 w-6 text-indigo-600" />
              <span className="text-sm text-slate-600">NoteGuard</span>
            </div>
          </div>

          <div className="dashboard-actions">
            {user?.id === note.userId && (
              <>
                <button
                  onClick={() => setIsShareModalOpen(true)}
                  className="btn btn-secondary"
                >
                  <Share className="h-4 w-4" />
                  Share
                </button>
                <Link to={`/notes/${note.id}/edit`} className="btn btn-primary">
                  <Edit className="h-4 w-4" />
                  Edit
                </Link>
                <button onClick={handleDeleteNote} className="btn btn-danger">
                  <Trash2 className="h-4 w-4" />
                </button>
              </>
            )}
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container py-8">
        <div className="max-w-4xl mx-auto">
          {/* Note Status Alerts */}
          {isExpired && (
            <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
              <div className="flex items-center gap-2 text-red-700">
                <AlertCircle className="h-5 w-5" />
                <span className="font-medium">This note has expired</span>
              </div>
              <p className="mt-1 text-sm text-red-600">
                Expired on {formatDate(note.expirationTime!)}
              </p>
            </div>
          )}

          {isShared && (
            <div className="mb-6 p-4 bg-emerald-50 border border-emerald-200 rounded-lg">
              <div className="flex items-center gap-2 text-emerald-700">
                <CheckCircle className="h-5 w-5" />
                <span className="font-medium">This note is shared</span>
              </div>
              <p className="mt-1 text-sm text-emerald-600">
                Share expires on{" "}
                {note.shareExpirationTime &&
                  formatDate(note.shareExpirationTime)}
              </p>
            </div>
          )}

          {/* Note Card */}
          <div className="card">
            <div className="card-header">
              <h1 className="text-3xl font-bold text-slate-900 mb-4">
                {note.title}
              </h1>

              {/* Note Metadata */}
              <div className="flex flex-wrap items-center gap-6 text-sm text-slate-600">
                <div className="flex items-center gap-2">
                  <Calendar className="h-4 w-4" />
                  <span>Created {formatDate(note.createdAt)}</span>
                </div>

                {note.updatedAt !== note.createdAt && (
                  <div className="flex items-center gap-2">
                    <Edit className="h-4 w-4" />
                    <span>Updated {formatDate(note.updatedAt)}</span>
                  </div>
                )}

                {note.expirationTime && !isExpired && (
                  <div className="flex items-center gap-2">
                    <Clock className="h-4 w-4 text-yellow-600" />
                    <span className="text-yellow-700">
                      Expires {formatDate(note.expirationTime)}
                    </span>
                  </div>
                )}
              </div>
            </div>

            {/* Note Content */}
            <div className="prose prose-slate max-w-none">
              <div className="whitespace-pre-wrap text-slate-700 leading-relaxed">
                {note.content}
              </div>
            </div>
          </div>
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
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-indigo-100">
                  <Share className="h-5 w-5 text-indigo-600" />
                </div>
                <h2 className="modal-title">Share Note</h2>
              </div>
              <button
                onClick={() => setIsShareModalOpen(false)}
                className="rounded-md p-1 text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors duration-200"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {shareUrl ? (
              <div className="modal-body">
                <div className="space-y-4">
                  <div>
                    <label className="form-label">Share URL</label>
                    <div className="flex gap-2">
                      <input
                        type="text"
                        value={shareUrl}
                        readOnly
                        className="form-input flex-1"
                      />
                      <button
                        onClick={() => copyToClipboard(shareUrl)}
                        className="btn btn-secondary"
                      >
                        <Copy className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                  <p className="text-sm text-slate-600">
                    Anyone with this link can view your note until it expires.
                  </p>
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
                  </div>
                  <p className="text-sm text-slate-600">
                    The share link will expire after the selected duration.
                  </p>
                </div>

                <div className="modal-footer">
                  <button
                    type="button"
                    onClick={() => setIsShareModalOpen(false)}
                    className="btn btn-secondary"
                    disabled={isSharing}
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="btn btn-primary"
                    disabled={isSharing}
                  >
                    {isSharing ? (
                      <div className="loading-spinner mr-2" />
                    ) : (
                      <Share className="h-4 w-4" />
                    )}
                    {isSharing ? "Creating..." : "Create Share Link"}
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default NotePageNew;
