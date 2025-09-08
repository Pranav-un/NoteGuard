import React, { useState } from "react";
import { noteApi } from "../api/notes";
import { X, FileText, Calendar, Save } from "lucide-react";
import { toast } from "react-hot-toast";
import type { CreateNoteRequest } from "../types";

interface CreateNoteModalProps {
  isOpen: boolean;
  onClose: () => void;
  onNoteCreated: () => void;
}

export const CreateNoteModal: React.FC<CreateNoteModalProps> = ({
  isOpen,
  onClose,
  onNoteCreated,
}) => {
  const [formData, setFormData] = useState<CreateNoteRequest>({
    title: "",
    content: "",
    expirationTime: "",
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.title.trim() || !formData.content.trim()) {
      toast.error("Please fill in both title and content");
      return;
    }

    setIsSubmitting(true);
    try {
      const noteData: CreateNoteRequest = {
        title: formData.title.trim(),
        content: formData.content.trim(),
        ...(formData.expirationTime && {
          expirationTime: formData.expirationTime,
        }),
      };

      await noteApi.createNote(noteData);
      toast.success("Note created successfully!");
      setFormData({ title: "", content: "", expirationTime: "" });
      onNoteCreated();
      onClose();
    } catch (error) {
      toast.error("Failed to create note");
      console.error("Error creating note:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleBackdropClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  if (!isOpen) return null;

  return (
    <div className="modal-overlay" onClick={handleBackdropClick}>
      <div className="modal-container">
        <div className="modal-header">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-indigo-100">
              <FileText className="h-5 w-5 text-indigo-600" />
            </div>
            <h2 className="modal-title">Create New Note</h2>
          </div>
          <button
            onClick={onClose}
            className="rounded-md p-1 text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors duration-200"
            disabled={isSubmitting}
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="modal-body space-y-6">
            {/* Title Input */}
            <div className="form-group">
              <label htmlFor="title" className="form-label">
                Title
              </label>
              <input
                id="title"
                name="title"
                type="text"
                value={formData.title}
                onChange={handleInputChange}
                className="form-input"
                placeholder="Enter note title"
                required
                disabled={isSubmitting}
              />
            </div>

            {/* Content Input */}
            <div className="form-group">
              <label htmlFor="content" className="form-label">
                Content
              </label>
              <textarea
                id="content"
                name="content"
                value={formData.content}
                onChange={handleInputChange}
                className="form-textarea"
                rows={6}
                placeholder="Write your note content here..."
                required
                disabled={isSubmitting}
              />
            </div>

            {/* Expiration Time Input */}
            <div className="form-group">
              <label htmlFor="expirationTime" className="form-label">
                <div className="flex items-center gap-2">
                  <Calendar className="h-4 w-4" />
                  Expiration Time (Optional)
                </div>
              </label>
              <input
                id="expirationTime"
                name="expirationTime"
                type="datetime-local"
                value={formData.expirationTime}
                onChange={handleInputChange}
                className="form-input"
                disabled={isSubmitting}
              />
              <p className="mt-1 text-xs text-slate-500">
                Leave empty for notes that don't expire
              </p>
            </div>
          </div>

          <div className="modal-footer">
            <button
              type="button"
              onClick={onClose}
              className="btn btn-secondary"
              disabled={isSubmitting}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="btn btn-primary"
              disabled={isSubmitting}
            >
              {isSubmitting ? (
                <div className="loading-spinner mr-2" />
              ) : (
                <Save className="h-4 w-4" />
              )}
              {isSubmitting ? "Creating..." : "Create Note"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
