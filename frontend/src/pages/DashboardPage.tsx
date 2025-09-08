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
  Shield,
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
  const [sortBy, setSortBy] = useState<"createdAt" | "updatedAt" | "title">(
    "updatedAt"
  );

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
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="text-center">
          <div className="loading-spinner mx-auto mb-4"></div>
          <p className="text-slate-600">Loading your notes...</p>
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
            <div className="flex items-center gap-2">
              <Shield className="h-6 w-6 text-indigo-600" />
              <h1 className="text-xl font-semibold text-slate-900">
                NoteGuard
              </h1>
            </div>
          </div>

          <div className="dashboard-actions">
            {user?.role === "ADMIN" && (
              <Link to="/admin" className="btn btn-secondary">
                <Settings className="h-4 w-4" />
                Admin
              </Link>
            )}
            <button onClick={handleLogout} className="btn btn-danger">
              <LogOut className="h-4 w-4" />
              Logout
            </button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container py-8">
        <div className="max-w-7xl mx-auto">
          {/* Welcome Section */}
          <div className="mb-8">
            <h2 className="text-3xl font-bold text-slate-900 mb-2">
              Welcome back, {user?.username}!
            </h2>
            <p className="text-slate-600">
              Manage your secure notes and keep your thoughts protected.
            </p>
          </div>

          {/* Actions Bar */}
          <div className="flex flex-col sm:flex-row gap-4 mb-8">
            {/* Search */}
            <div className="flex-1 max-w-md">
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Search className="h-5 w-5 text-slate-400" />
                </div>
                <input
                  type="text"
                  placeholder="Search notes..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="form-input pl-10"
                />
              </div>
            </div>

            {/* Sort */}
            <div className="flex items-center gap-2">
              <Filter className="h-4 w-4 text-slate-400" />
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as any)}
                className="form-input w-auto"
              >
                <option value="updatedAt">Recently Updated</option>
                <option value="createdAt">Recently Created</option>
                <option value="title">Alphabetical</option>
              </select>
            </div>

            {/* Create Note Button */}
            <button
              onClick={() => setIsCreateModalOpen(true)}
              className="btn btn-primary"
            >
              <Plus className="h-4 w-4" />
              New Note
            </button>
          </div>

          {/* Notes Grid */}
          {sortedNotes.length === 0 ? (
            <div className="text-center py-16">
              <FileText className="mx-auto h-16 w-16 text-slate-300 mb-4" />
              <h3 className="text-lg font-medium text-slate-900 mb-2">
                {searchTerm ? "No notes match your search" : "No notes yet"}
              </h3>
              <p className="text-slate-500 mb-6 max-w-sm mx-auto">
                {searchTerm
                  ? "Try adjusting your search terms to find what you're looking for."
                  : "Get started by creating your first secure note. Your thoughts deserve protection."}
              </p>
              {!searchTerm && (
                <button
                  onClick={() => setIsCreateModalOpen(true)}
                  className="btn btn-primary btn-lg"
                >
                  <Plus className="h-5 w-5" />
                  Create Your First Note
                </button>
              )}
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {sortedNotes.map((note) => {
                const isExpired =
                  note.expirationTime &&
                  new Date(note.expirationTime) <= new Date();
                const isShared = !!note.shareToken;

                return (
                  <div
                    key={note.id}
                    className="card group hover:shadow-lg transition-all duration-200"
                  >
                    <div className="card-header">
                      <div className="flex items-start justify-between">
                        <h3 className="text-lg font-semibold text-slate-900 truncate flex-1 mr-2">
                          {note.title}
                        </h3>
                        <div className="flex items-center gap-1">
                          {isShared && (
                            <div className="p-1 rounded bg-indigo-100 text-indigo-600">
                              <Share className="h-3 w-3" />
                            </div>
                          )}
                          {isExpired && (
                            <div className="p-1 rounded bg-red-100 text-red-600">
                              <Clock className="h-3 w-3" />
                            </div>
                          )}
                        </div>
                      </div>

                      <p className="text-slate-600 text-sm mt-2 line-clamp-3">
                        {note.content.length > 120
                          ? `${note.content.substring(0, 120)}...`
                          : note.content}
                      </p>
                    </div>

                    <div className="flex items-center justify-between mt-4 pt-4 border-t border-slate-100">
                      <div className="flex items-center gap-2 text-xs text-slate-500">
                        <Calendar className="h-3 w-3" />
                        <span>{formatDate(note.updatedAt)}</span>
                      </div>

                      <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                        <Link
                          to={`/notes/${note.id}`}
                          className="p-1.5 rounded-md text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 transition-colors duration-200"
                          title="View Note"
                        >
                          <Eye className="h-4 w-4" />
                        </Link>
                        <Link
                          to={`/notes/${note.id}/edit`}
                          className="p-1.5 rounded-md text-slate-400 hover:text-emerald-600 hover:bg-emerald-50 transition-colors duration-200"
                          title="Edit Note"
                        >
                          <Edit className="h-4 w-4" />
                        </Link>
                        <button
                          onClick={() => handleDeleteNote(note.id)}
                          className="p-1.5 rounded-md text-slate-400 hover:text-red-600 hover:bg-red-50 transition-colors duration-200"
                          title="Delete Note"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {/* Quick Stats */}
          {notes.length > 0 && (
            <div className="mt-12 grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="bg-white rounded-lg p-4 shadow-sm border border-slate-200">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-indigo-100 rounded-lg">
                    <FileText className="h-5 w-5 text-indigo-600" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold text-slate-900">
                      {notes.length}
                    </p>
                    <p className="text-sm text-slate-600">Total Notes</p>
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-lg p-4 shadow-sm border border-slate-200">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-emerald-100 rounded-lg">
                    <Share className="h-5 w-5 text-emerald-600" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold text-slate-900">
                      {notes.filter((n) => n.shareToken).length}
                    </p>
                    <p className="text-sm text-slate-600">Shared Notes</p>
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-lg p-4 shadow-sm border border-slate-200">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-yellow-100 rounded-lg">
                    <Clock className="h-5 w-5 text-yellow-600" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold text-slate-900">
                      {
                        notes.filter(
                          (n) =>
                            n.expirationTime &&
                            new Date(n.expirationTime) > new Date()
                        ).length
                      }
                    </p>
                    <p className="text-sm text-slate-600">Active Expiring</p>
                  </div>
                </div>
              </div>
            </div>
          )}
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
