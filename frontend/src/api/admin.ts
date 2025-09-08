import { api } from "../lib/api";
import type { User, Note, AdminStats } from "../types";

export const adminApi = {
  async getAllUsers() {
    const response = await api.get<User[]>("/admin/users");
    return response;
  },

  async getAllNotes() {
    const response = await api.get<Note[]>("/admin/notes");
    return response;
  },

  async deleteUser(id: number) {
    const response = await api.delete<void>(`/admin/users/${id}`);
    return response;
  },

  async deleteNote(id: number) {
    const response = await api.delete<void>(`/admin/notes/${id}`);
    return response;
  },

  async getUserStats() {
    const response = await api.get<AdminStats["userStats"]>(
      "/admin/stats/users"
    );
    return response;
  },

  async getNoteStats() {
    const response = await api.get<AdminStats["noteStats"]>(
      "/admin/stats/notes"
    );
    return response;
  },

  async getDashboard() {
    const response = await api.get<AdminStats>("/admin/dashboard");
    return response;
  },
};
