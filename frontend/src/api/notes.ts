import { api } from "../lib/api";
import type {
  Note,
  CreateNoteRequest,
  UpdateNoteRequest,
  ShareNoteRequest,
  ShareNoteResponse,
} from "../types";

export const noteApi = {
  async getUserNotes() {
    const response = await api.get<Note[]>("/notes/user");
    return response;
  },

  async getNoteById(id: string) {
    const response = await api.get<Note>(`/notes/${id}`);
    return response;
  },

  async createNote(noteData: CreateNoteRequest) {
    const response = await api.post<Note>("/notes", noteData);
    return response;
  },

  async updateNote(id: string, noteData: UpdateNoteRequest) {
    const response = await api.put<Note>(`/notes/${id}`, noteData);
    return response;
  },

  async deleteNote(id: string) {
    const response = await api.delete<void>(`/notes/${id}`);
    return response;
  },

  async shareNote(id: string, shareData: ShareNoteRequest) {
    const response = await api.post<ShareNoteResponse>(
      `/notes/${id}/share`,
      shareData
    );
    return response;
  },

  async getSharedNote(shareToken: string) {
    const response = await api.get<Note>(`/notes/shared/${shareToken}`);
    return response;
  },
};
