"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { AlertTriangle, Trash2, Loader2 } from "lucide-react";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Modal } from "@/components/ui/Modal";
import { useToast } from "@/components/ui/Toast";

interface DangerZoneSectionProps {
  onDeleteAccount: () => Promise<{ error?: string }>;
}

export function DangerZoneSection({ onDeleteAccount }: DangerZoneSectionProps) {
  const router = useRouter();
  const { showToast } = useToast();

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [confirmationInput, setConfirmationInput] = useState("");
  const [isDeleting, setIsDeleting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const canConfirm = confirmationInput.trim().toUpperCase() === "DELETE";

  const handleConfirmDelete = async () => {
    if (!canConfirm) {
      setErrorMessage("Please type DELETE in capital letters to proceed.");
      return;
    }

    try {
      setIsDeleting(true);
      setErrorMessage(null);

      const res = await onDeleteAccount();
      if (res?.error) {
        setErrorMessage(res.error);
        showToast("Deletion Failed", res.error, "error");
        setIsDeleting(false);
        return;
      }

      showToast(
        "Account Purged",
        "Your LearnTrack account and associated academic records have been permanently removed.",
        "info"
      );
      setIsModalOpen(false);
      router.push("/login");
    } catch (err: unknown) {
      console.error("Account deletion error:", err);
      const msg = err instanceof Error ? err.message : "Failed to purge account";
      setErrorMessage(msg);
      showToast("Deletion Error", msg, "error");
      setIsDeleting(false);
    }
  };

  return (
    <div className="space-y-6">
      <Card className="border-rose-200/80 bg-rose-50/20 overflow-hidden shadow-xs">
        <CardHeader className="pb-4 border-b border-rose-100">
          <CardTitle className="text-base text-rose-900 flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 text-rose-600" />
            Danger Zone
          </CardTitle>
          <CardDescription className="text-rose-700/80">
            Irreversible actions affecting your student identity, records, and credentials
          </CardDescription>
        </CardHeader>
        <CardContent className="pt-6 space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 rounded-xl border border-rose-200/60 bg-white">
            <div className="space-y-1">
              <h5 className="text-xs font-bold text-slate-900">
                Permanently Delete Account
              </h5>
              <p className="text-[11px] text-slate-500 max-w-lg leading-relaxed">
                Permanently purge your LearnTrack account, enrolled subjects, coursework scores, examination grades, study activity sessions, AI tutor history, and generated study plans.
              </p>
            </div>

            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => {
                setConfirmationInput("");
                setErrorMessage(null);
                setIsModalOpen(true);
              }}
              leftIcon={<Trash2 className="w-3.5 h-3.5 text-rose-600" />}
              className="border-rose-300 text-rose-700 hover:bg-rose-50 hover:border-rose-400 rounded-xl h-10 px-4 text-xs font-semibold shrink-0 cursor-pointer"
            >
              Delete Account
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Account Deletion Confirmation Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => !isDeleting && setIsModalOpen(false)}
        title="Delete your LearnTrack account?"
        description="This action is permanent and cannot be reversed under any circumstance."
        maxWidth="md"
      >
        <div className="space-y-4 text-xs text-slate-700 py-1">
          <div className="p-3.5 rounded-xl bg-rose-50 border border-rose-200 text-rose-900 space-y-1.5">
            <div className="flex items-center gap-2 font-bold text-xs">
              <AlertTriangle className="w-4 h-4 text-rose-600 shrink-0" />
              <span>Warning: Permanent Data Purge</span>
            </div>
            <p className="text-[11px] text-rose-800/90 leading-relaxed">
              All your records including registered subjects, continuous assessment marks, attendance logs, machine learning predictions, AI conversations, and study schedules will be immediately purged from PostgreSQL.
            </p>
          </div>

          {errorMessage && (
            <div className="p-2.5 rounded-xl bg-rose-100/70 border border-rose-300 text-rose-800 text-[11px]">
              {errorMessage}
            </div>
          )}

          <div className="space-y-2 pt-1">
            <label className="block text-xs font-semibold text-slate-900">
              To proceed, please type <span className="font-mono text-rose-600 font-bold">DELETE</span> below:
            </label>
            <input
              type="text"
              value={confirmationInput}
              onChange={(e) => setConfirmationInput(e.target.value)}
              placeholder="Type DELETE"
              disabled={isDeleting}
              className="w-full h-10 px-3.5 bg-white border border-slate-200 rounded-xl text-xs font-mono text-slate-900 placeholder:text-slate-400 focus:outline-hidden focus:ring-2 focus:ring-rose-500/20 focus:border-rose-500 transition-all uppercase"
            />
          </div>

          <div className="pt-3 border-t border-slate-100 flex items-center justify-end gap-2">
            <Button
              type="button"
              variant="outline"
              size="sm"
              disabled={isDeleting}
              onClick={() => setIsModalOpen(false)}
              className="rounded-xl text-xs h-9 px-4 cursor-pointer"
            >
              Cancel
            </Button>
            <Button
              type="button"
              variant="primary"
              size="sm"
              disabled={!canConfirm || isDeleting}
              onClick={handleConfirmDelete}
              className="bg-rose-600 hover:bg-rose-700 text-white rounded-xl text-xs h-9 px-4 cursor-pointer disabled:opacity-50"
            >
              {isDeleting ? (
                <>
                  <Loader2 className="w-3.5 h-3.5 animate-spin mr-1.5" />
                  <span>Deleting account...</span>
                </>
              ) : (
                <span>Permanently Delete Account</span>
              )}
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
