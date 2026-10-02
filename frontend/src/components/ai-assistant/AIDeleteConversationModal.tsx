"use client";

import React from "react";
import { Trash2, AlertTriangle } from "lucide-react";
import { Modal } from "@/components/ui/Modal";
import { Button } from "@/components/ui/Button";

interface AIDeleteConversationModalProps {
  isOpen: boolean;
  conversationTitle?: string;
  isDeleting: boolean;
  onClose: () => void;
  onConfirm: () => void;
}

export function AIDeleteConversationModal({
  isOpen,
  conversationTitle,
  isDeleting,
  onClose,
  onConfirm,
}: AIDeleteConversationModalProps) {
  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Delete Conversation"
      description="This will permanently delete this conversation and its message history."
      maxWidth="sm"
    >
      <div className="space-y-4 pt-2">
        <div className="p-3.5 rounded-xl bg-rose-50/80 border border-rose-100 flex items-start gap-3">
          <div className="p-1.5 rounded-lg bg-rose-100 text-rose-600 shrink-0">
            <AlertTriangle className="w-4 h-4" />
          </div>
          <div className="text-xs text-rose-800 space-y-1">
            <p className="font-semibold text-rose-900">Are you sure you want to proceed?</p>
            <p>
              Thread &ldquo;<strong>{conversationTitle || "Untitled Discussion"}</strong>&rdquo; will be permanently erased.
              This action cannot be undone.
            </p>
          </div>
        </div>

        <div className="flex items-center justify-end gap-2.5 pt-2">
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={onClose}
            disabled={isDeleting}
            className="h-9 px-4 text-xs font-medium"
          >
            Cancel
          </Button>
          <Button
            type="button"
            variant="danger"
            size="sm"
            onClick={onConfirm}
            isLoading={isDeleting}
            leftIcon={<Trash2 className="w-3.5 h-3.5" />}
            className="h-9 px-4 text-xs font-medium bg-rose-600 hover:bg-rose-700 text-white"
          >
            {isDeleting ? "Deleting..." : "Delete Conversation"}
          </Button>
        </div>
      </div>
    </Modal>
  );
}
