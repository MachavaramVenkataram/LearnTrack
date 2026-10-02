"use client";

import React, { useState, useEffect } from "react";
import { Modal } from "@/components/ui/Modal";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Textarea } from "@/components/ui/Textarea";
import { FlashcardDeck } from "@/types/learning";
import { createDeck, updateDeck } from "@/lib/flashcards/service";
import { useToast } from "@/components/ui/Toast";

interface CreateDeckModalProps {
  isOpen: boolean;
  onClose: () => void;
  userId: string;
  deckToEdit?: FlashcardDeck | null;
  onDeckSaved: (deck: FlashcardDeck) => void;
}

const COLOR_OPTIONS = [
  { label: "Blue", value: "#2563eb" },
  { label: "Indigo", value: "#4f46e5" },
  { label: "Purple", value: "#7c3aed" },
  { label: "Emerald", value: "#059669" },
  { label: "Rose", value: "#e11d48" },
  { label: "Amber", value: "#d97706" },
];

export function CreateDeckModal({
  isOpen,
  onClose,
  userId,
  deckToEdit,
  onDeckSaved,
}: CreateDeckModalProps) {
  const { showToast } = useToast();

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [subject, setSubject] = useState("Machine Learning");
  const [color, setColor] = useState("#2563eb");
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    if (deckToEdit) {
      setTitle(deckToEdit.title);
      setDescription(deckToEdit.description || "");
      setSubject(deckToEdit.subject || "General");
      setColor(deckToEdit.color || "#2563eb");
    } else {
      setTitle("");
      setDescription("");
      setSubject("Machine Learning");
      setColor("#2563eb");
    }
  }, [deckToEdit, isOpen]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;

    setIsSaving(true);
    try {
      if (deckToEdit) {
        const updated = await updateDeck(deckToEdit.id, {
          title: title.trim(),
          description: description.trim() || undefined,
          subject: subject.trim(),
          color,
        });
        onDeckSaved(updated as FlashcardDeck);
        showToast("Deck Updated", `Updated "${title}"`, "success");
      } else {
        const created = await createDeck(userId, {
          title: title.trim(),
          description: description.trim(),
          subject: subject.trim(),
          color,
        });
        onDeckSaved(created);
        showToast("Deck Created", `Created "${title}" deck.`, "success");
      }
      onClose();
    } catch {
      showToast("Error", "Could not save deck.", "error");
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={() => !isSaving && onClose()}
      title={deckToEdit ? "Edit Flashcard Deck" : "Create New Deck"}
      description="Organize your active-recall cards by subject or course module."
    >
      <form onSubmit={handleSubmit} className="space-y-4 pt-2">
        <div className="space-y-1">
          <label className="text-xs font-semibold text-slate-700">Deck Title</label>
          <Input
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="e.g. Machine Learning Optimization"
            required
          />
        </div>

        <div className="space-y-1">
          <label className="text-xs font-semibold text-slate-700">Subject / Course</label>
          <Input
            value={subject}
            onChange={(e) => setSubject(e.target.value)}
            placeholder="e.g. Machine Learning, Computer Systems"
            required
          />
        </div>

        <div className="space-y-1">
          <label className="text-xs font-semibold text-slate-700">Description (Optional)</label>
          <Textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Key concepts, syllabus topics, or exam notes covered in this deck..."
            rows={3}
          />
        </div>

        <div className="space-y-1.5">
          <label className="text-xs font-semibold text-slate-700">Deck Color Theme</label>
          <div className="flex items-center gap-3">
            {COLOR_OPTIONS.map((c) => (
              <button
                key={c.value}
                type="button"
                onClick={() => setColor(c.value)}
                className={`w-7 h-7 rounded-full transition-transform cursor-pointer ${
                  color === c.value ? "ring-2 ring-offset-2 ring-slate-800 scale-110" : "hover:scale-105"
                }`}
                style={{ backgroundColor: c.value }}
                title={c.label}
              />
            ))}
          </div>
        </div>

        <div className="flex justify-end gap-2 pt-3 border-t border-slate-100">
          <Button type="button" variant="outline" size="sm" onClick={onClose}>
            Cancel
          </Button>
          <Button type="submit" variant="primary" size="sm" isLoading={isSaving}>
            {deckToEdit ? "Save Changes" : "Create Deck"}
          </Button>
        </div>
      </form>
    </Modal>
  );
}
