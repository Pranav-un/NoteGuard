import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { adminApi } from "../api/admin";
import { useLoading } from "../context/LoadingContext";
import {
  Shield,
  Users,
  FileText,
  BarChart3,
  Search,
  Trash2,
  Activity,
  AlertCircle,
  CheckCircle,
  LogOut,
  Home,
  UserCheck,
  Clock,
  Share2,
} from "lucide-react";
import { toast } from "react-hot-toast";
import type { User, Note, AdminStats } from "../types";

const AdminPage: React.FC = () => {
  const { user, logout } = useAuth();
  const { isLoadingKey } = useLoading();
  const [users, setUsers] = useState<User[]>([]);
  const [notes, setNotes] = useState<Note[]>([]);
  const [stats, setStats] = useState<AdminStats | null>(null);
  const [activeTab, setActiveTab] = useState<"stats" | "users" | "notes">(
    "stats"
  );
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState("");

  const isLoading = isLoadingKey("admin-data");

  const formatDate = (dateString: string): string => {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const [usersResponse, notesResponse] = await Promise.all([
        adminApi.getAllUsers(),
        adminApi.getAllNotes(),
      ]);

      if (usersResponse.data) {
        setUsers(usersResponse.data);
      }

      if (notesResponse.data) {
        setNotes(notesResponse.data);
      }

      // Calculate stats
      const totalUsers = usersResponse.data?.length || 0;
      const adminUsers =
        usersResponse.data?.filter((u) => u.role === "ADMIN").length || 0;
      const regularUsers = totalUsers - adminUsers;

      const totalNotes = notesResponse.data?.length || 0;
      const sharedNotes =
        notesResponse.data?.filter((n) => !!n.shareToken).length || 0;
      const expiredNotes =
        notesResponse.data?.filter(
          (n) => n.expirationTime && new Date(n.expirationTime) <= new Date()
        ).length || 0;

      setStats({
        userStats: {
          totalUsers,
          adminUsers,
          regularUsers,
        },
        noteStats: {
          totalNotes,
          sharedNotes,
          expiredNotes,
        },
      });

      setError(null);
    } catch (err: any) {
      setError(err.message || "Failed to load admin data");
      toast.error("Failed to load admin data");
    }
  };

  const handleDeleteUser = async (userId: number) => {
    if (!window.confirm("Are you sure you want to delete this user?")) {
      return;
    }

    try {
      await adminApi.deleteUser(userId);
      toast.success("User deleted successfully");
      loadData(); // Reload data
    } catch (err: any) {
      toast.error(err.message || "Failed to delete user");
    }
  };

  const handleDeleteNote = async (noteId: number) => {
    if (!window.confirm("Are you sure you want to delete this note?")) {
      return;
    }

    try {
      await adminApi.deleteNote(noteId);
      toast.success("Note deleted successfully");
      loadData(); // Reload data
    } catch (err: any) {
      toast.error(err.message || "Failed to delete note");
    }
  };

  const filteredUsers = users.filter(
    (u) =>
      u.username?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      u.email?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const filteredNotes = notes.filter(
    (n) =>
      n.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      n.content.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleLogout = () => {
    logout();
  };

  if (isLoading && !stats) {
    return (
      <div className="min-h-screen app-page flex items-center justify-center">
        <div className="text-center">
          <div className="loading-spinner mx-auto mb-4"></div>
          <p className="text-gray-300">Loading admin dashboard...</p>
        </div>
      </div>
    );
  }

  if (error && !stats) {
    return (
      <div className="min-h-screen app-page flex items-center justify-center">
        <div className="text-center">
          <AlertCircle className="mx-auto h-12 w-12 text-red-400 mb-4" />
          <h3 className="text-lg font-medium text-gray-100 mb-2">
            Error Loading Dashboard
          </h3>
          <p className="text-slate-600 max-w-sm mx-auto mb-6">{error}</p>
          <button onClick={loadData} className="btn btn-primary">
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen app-page">
      {/* Header */}
      <header className="dashboard-header">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <Shield className="h-6 w-6 text-indigo-600" />
              <h1 className="text-xl font-semibold text-slate-900">
                Admin Dashboard
              </h1>
            </div>
          </div>

          <div className="dashboard-actions">
            <Link to="/dashboard" className="btn btn-secondary">
              <Home className="h-4 w-4" />
              Dashboard
            </Link>
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
          {/* Admin Welcome */}
          <div className="mb-8">
            <h2 className="text-2xl font-bold text-slate-900 mb-2">
              Welcome back, {user?.username}
            </h2>
            <p className="text-slate-600">
              Manage users, notes, and monitor system statistics.
            </p>
          </div>

          {/* Tabs */}
          <div className="mb-8">
            <div className="border-b border-slate-200">
              <nav className="-mb-px flex space-x-8">
                {[
                  { id: "stats", label: "Statistics", icon: BarChart3 },
                  { id: "users", label: "Users", icon: Users },
                  { id: "notes", label: "Notes", icon: FileText },
                ].map((tab) => (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id as any)}
                    className={`flex items-center gap-2 py-2 px-1 border-b-2 font-medium text-sm whitespace-nowrap transition-colors duration-200 ${
                      activeTab === tab.id
                        ? "border-indigo-500 text-indigo-600"
                        : "border-transparent text-slate-500 hover:text-slate-700 hover:border-slate-300"
                    }`}
                  >
                    <tab.icon className="h-4 w-4" />
                    {tab.label}
                  </button>
                ))}
              </nav>
            </div>
          </div>

          {/* Tab Content */}
          {activeTab === "stats" && stats && (
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {/* Total Users Card */}
                <div className="card">
                  <div className="card-header">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-blue-100">
                          <Users className="h-5 w-5 text-blue-600" />
                        </div>
                        <div>
                          <p className="text-sm font-medium text-slate-600">
                            Total Users
                          </p>
                          <p className="text-2xl font-bold text-slate-900">
                            {stats.userStats.totalUsers}
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className="mt-4 flex items-center gap-4 text-sm text-slate-600">
                    <div className="flex items-center gap-1">
                      <UserCheck className="h-4 w-4 text-purple-500" />
                      <span>{stats.userStats.adminUsers} Admins</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Users className="h-4 w-4 text-green-500" />
                      <span>{stats.userStats.regularUsers} Users</span>
                    </div>
                  </div>
                </div>

                {/* Total Notes Card */}
                <div className="card">
                  <div className="card-header">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-emerald-100">
                          <FileText className="h-5 w-5 text-emerald-600" />
                        </div>
                        <div>
                          <p className="text-sm font-medium text-slate-600">
                            Total Notes
                          </p>
                          <p className="text-2xl font-bold text-slate-900">
                            {stats.noteStats.totalNotes}
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className="mt-4 flex items-center gap-4 text-sm text-slate-600">
                    <div className="flex items-center gap-1">
                      <Share2 className="h-4 w-4 text-indigo-500" />
                      <span>{stats.noteStats.sharedNotes} Shared</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Clock className="h-4 w-4 text-red-500" />
                      <span>{stats.noteStats.expiredNotes} Expired</span>
                    </div>
                  </div>
                </div>

                {/* System Activity Card */}
                <div className="card">
                  <div className="card-header">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-yellow-100">
                          <Activity className="h-5 w-5 text-yellow-600" />
                        </div>
                        <div>
                          <p className="text-sm font-medium text-slate-600">
                            System Health
                          </p>
                          <p className="text-2xl font-bold text-slate-900">
                            <CheckCircle className="h-6 w-6 text-green-500 inline" />
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className="mt-4 text-sm text-slate-600">
                    <p>All systems operational</p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === "users" && (
            <div className="space-y-6">
              {/* Search Bar */}
              <div className="flex items-center gap-4">
                <div className="flex-1 max-w-md">
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <Search className="h-5 w-5 text-slate-400" />
                    </div>
                    <input
                      type="text"
                      placeholder="Search users..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="form-input pl-10"
                    />
                  </div>
                </div>
              </div>

              {/* Users Table */}
              <div className="card">
                <div className="card-header">
                  <h3 className="text-lg font-medium text-slate-900">Users</h3>
                </div>
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-600">
                    <thead className="bg-gray-800">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                          User
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                          Role
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                          Created At
                        </th>
                        <th className="px-6 py-3 text-right text-xs font-medium text-slate-500 uppercase tracking-wider">
                          Actions
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-gray-900 divide-y divide-gray-600">
                      {filteredUsers.map((userItem) => (
                        <tr
                          key={userItem.id}
                          className="hover:bg-gray-800 transition-colors duration-200"
                        >
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div>
                              <div className="text-sm font-medium text-slate-900">
                                {userItem.username}
                              </div>
                              <div className="text-sm text-slate-500">
                                {userItem.email}
                              </div>
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span
                              className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                                userItem.role === "ADMIN"
                                  ? "bg-purple-100 text-purple-800"
                                  : "bg-green-100 text-green-800"
                              }`}
                            >
                              {userItem.role}
                            </span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-500">
                            {userItem.createdAt &&
                              formatDate(userItem.createdAt)}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                            {userItem.id !== user?.id && (
                              <button
                                onClick={() => handleDeleteUser(userItem.id)}
                                className="text-red-600 hover:text-red-900 transition-colors duration-200"
                              >
                                <Trash2 className="h-4 w-4" />
                              </button>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {activeTab === "notes" && (
            <div className="space-y-6">
              {/* Search Bar */}
              <div className="flex items-center gap-4">
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
              </div>

              {/* Notes Table */}
              <div className="card">
                <div className="card-header">
                  <h3 className="text-lg font-medium text-slate-900">Notes</h3>
                </div>
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-600">
                    <thead className="bg-gray-800">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                          Title
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                          Author
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                          Status
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                          Created
                        </th>
                        <th className="px-6 py-3 text-right text-xs font-medium text-slate-500 uppercase tracking-wider">
                          Actions
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-gray-900 divide-y divide-gray-600">
                      {filteredNotes.map((note) => (
                        <tr
                          key={note.id}
                          className="hover:bg-gray-800 transition-colors duration-200"
                        >
                          <td className="px-6 py-4">
                            <div>
                              <div className="text-sm font-medium text-slate-900 truncate max-w-xs">
                                {note.title}
                              </div>
                              <div className="text-sm text-slate-500 truncate max-w-xs">
                                {note.content.substring(0, 50)}...
                              </div>
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-500">
                            User #{note.userId}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="flex flex-col gap-1">
                              {note.shareToken && (
                                <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-indigo-100 text-indigo-800">
                                  <Share2 className="h-3 w-3 mr-1" />
                                  Shared
                                </span>
                              )}
                              {note.expirationTime &&
                                new Date(note.expirationTime) <= new Date() && (
                                  <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-red-100 text-red-800">
                                    <Clock className="h-3 w-3 mr-1" />
                                    Expired
                                  </span>
                                )}
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-500">
                            {formatDate(note.createdAt)}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                            <div className="flex items-center justify-end gap-2">
                              <Link
                                to={`/notes/${note.id}`}
                                className="text-indigo-600 hover:text-indigo-900 transition-colors duration-200"
                              >
                                View
                              </Link>
                              <button
                                onClick={() => handleDeleteNote(note.id)}
                                className="text-red-600 hover:text-red-900 transition-colors duration-200"
                              >
                                <Trash2 className="h-4 w-4" />
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  );
};

export default AdminPage;
