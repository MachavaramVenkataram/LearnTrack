/* eslint-disable react-hooks/set-state-in-effect */
"use client";

import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Check, Sparkles, Palette } from "lucide-react";
import {
  AVATAR_COLOR_PALETTES,
  PRESET_AVATARS,
  generateInitialsSvgUri,
  generatePresetSvgUri,
  getInitialsFromName,
} from "./avatar-presets";
import { Button } from "@/components/ui/Button";

interface AvatarPickerModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentAvatarUrl?: string;
  studentName: string;
  onApplyAvatar: (avatarDataUri: string) => Promise<void>;
}

export function AvatarPickerModal({
  isOpen,
  onClose,
  currentAvatarUrl,
  studentName,
  onApplyAvatar,
}: AvatarPickerModalProps) {
  const [activeCategory, setActiveCategory] = useState<
    "INITIALS" | "ILLUSTRATED" | "MINIMAL" | "GRADIENT" | "ACADEMIC"
  >("INITIALS");

  const [selectedColor, setSelectedColor] = useState(AVATAR_COLOR_PALETTES[0]);
  const [selectedPresetId, setSelectedPresetId] = useState<string>("initials-current");
  const [previewUri, setPreviewUri] = useState<string>("");
  const [isApplying, setIsApplying] = useState(false);

  // Initialize preview
  useEffect(() => {
    if (isOpen) {
      if (currentAvatarUrl) {
        setPreviewUri(currentAvatarUrl);
      } else {
        setPreviewUri(generateInitialsSvgUri(studentName, selectedColor.from, selectedColor.to));
      }
    }
  }, [isOpen, currentAvatarUrl, studentName, selectedColor]);

  // Handle ESC key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    if (isOpen) {
      window.addEventListener("keydown", handleKeyDown);
      document.body.style.overflow = "hidden";
    }
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
      document.body.style.overflow = "unset";
    };
  }, [isOpen, onClose]);

  // Category switch
  const handleSelectInitials = (palette: typeof AVATAR_COLOR_PALETTES[0]) => {
    setSelectedColor(palette);
    setSelectedPresetId(`initials-${palette.id}`);
    const uri = generateInitialsSvgUri(studentName, palette.from, palette.to);
    setPreviewUri(uri);
  };

  const handleSelectPreset = (preset: typeof PRESET_AVATARS[0]) => {
    setSelectedPresetId(preset.id);
    const uri = generatePresetSvgUri(preset);
    setPreviewUri(uri);
  };

  const handleApply = async () => {
    if (!previewUri) return;
    setIsApplying(true);
    try {
      await onApplyAvatar(previewUri);
      onClose();
    } finally {
      setIsApplying(false);
    }
  };

  if (!isOpen) return null;

  const initials = getInitialsFromName(studentName);
  const filteredPresets = PRESET_AVATARS.filter((p) => p.category === activeCategory);

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        {/* Backdrop */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.18 }}
          onClick={onClose}
          className="fixed inset-0 bg-slate-900/40 backdrop-blur-[2px] transition-opacity"
          aria-hidden="true"
        />

        {/* Modal Container */}
        <motion.div
          initial={{ scale: 0.96, opacity: 0, y: 12 }}
          animate={{ scale: 1, opacity: 1, y: 0 }}
          exit={{ scale: 0.96, opacity: 0, y: 12 }}
          transition={{ duration: 0.2, ease: "easeOut" }}
          className="relative w-full max-w-xl bg-white rounded-2xl border border-slate-200 shadow-2xl overflow-hidden z-10 flex flex-col max-h-[90vh]"
          role="dialog"
          aria-modal="true"
          aria-labelledby="avatar-picker-title"
        >
          {/* Header */}
          <div className="p-5 border-b border-slate-200/80 bg-slate-50/50 flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg bg-blue-100 text-blue-700 flex items-center justify-center shrink-0">
                <Sparkles className="w-4 h-4" />
              </div>
              <div>
                <span className="text-[10px] font-mono uppercase tracking-wider font-semibold text-slate-400 block">
                  Identity Customization
                </span>
                <h2 id="avatar-picker-title" className="text-base font-bold text-slate-900">
                  Customize Your Academic Avatar
                </h2>
              </div>
            </div>

            <button
              onClick={onClose}
              className="w-8 h-8 rounded-lg border border-slate-200 text-slate-500 hover:text-slate-900 hover:bg-slate-100 transition-colors flex items-center justify-center cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500"
              aria-label="Close avatar picker"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Modal Body */}
          <div className="flex-1 overflow-y-auto p-6 space-y-6">
            {/* Live Preview Hero */}
            <div className="flex flex-col sm:flex-row items-center gap-5 p-4 rounded-xl bg-slate-50/80 border border-slate-200/80">
              <div className="w-20 h-20 rounded-2xl overflow-hidden shadow-md shrink-0 border-2 border-white bg-slate-200 flex items-center justify-center">
                {previewUri ? (
                  /* eslint-disable-next-line @next/next/no-img-element */
                  <img src={previewUri} alt={studentName} className="w-full h-full object-cover" />
                ) : (
                  <span className="font-bold text-xl text-slate-700">{initials}</span>
                )}
              </div>

              <div className="text-center sm:text-left space-y-1">
                <span className="text-[10px] font-mono uppercase text-slate-400 font-semibold block">
                  Active Preview
                </span>
                <h3 className="text-sm font-bold text-slate-900">{studentName}</h3>
                <p className="text-xs text-slate-500">
                  This avatar will appear consistently across your navigation, profile, and reports.
                </p>
              </div>
            </div>

            {/* Category Navigation Tabs (Section 5) */}
            <div className="space-y-2">
              <span className="text-[11px] font-mono uppercase tracking-wider font-semibold text-slate-400 block">
                Avatar Styles
              </span>
              <div className="flex flex-wrap gap-1.5 p-1 bg-slate-100/80 rounded-xl border border-slate-200/60">
                {(["INITIALS", "ILLUSTRATED", "MINIMAL", "GRADIENT", "ACADEMIC"] as const).map(
                  (cat) => (
                    <button
                      key={cat}
                      type="button"
                      onClick={() => setActiveCategory(cat)}
                      className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                        activeCategory === cat
                          ? "bg-white text-slate-900 shadow-2xs font-bold"
                          : "text-slate-600 hover:text-slate-900"
                      }`}
                    >
                      {cat}
                    </button>
                  )
                )}
              </div>
            </div>

            {/* Category Content */}
            {activeCategory === "INITIALS" && (
              <div className="space-y-3">
                <div className="flex items-center gap-1.5 text-xs text-slate-500">
                  <Palette className="w-3.5 h-3.5 text-blue-600" />
                  <span>Choose color scheme for student initials ({initials}):</span>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                  {AVATAR_COLOR_PALETTES.map((pal) => {
                    const isSelected = selectedColor.id === pal.id;
                    const sampleUri = generateInitialsSvgUri(studentName, pal.from, pal.to);

                    return (
                      <div
                        key={pal.id}
                        onClick={() => handleSelectInitials(pal)}
                        className={`p-3 rounded-xl border text-center cursor-pointer transition-all flex flex-col items-center gap-2 ${
                          isSelected
                            ? "border-blue-500 bg-blue-50/50 shadow-2xs ring-1 ring-blue-500"
                            : "border-slate-200 bg-white hover:border-slate-300 hover:bg-slate-50/50"
                        }`}
                      >
                        <div className="w-12 h-12 rounded-xl overflow-hidden shadow-2xs border border-white">
                          {/* eslint-disable-next-line @next/next/no-img-element */}
                          <img src={sampleUri} alt={pal.name} className="w-full h-full object-cover" />
                        </div>
                        <span className="text-[11px] font-semibold text-slate-700 truncate w-full">
                          {pal.name}
                        </span>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {activeCategory !== "INITIALS" && (
              <div className="space-y-3">
                <span className="text-xs text-slate-500 block">
                  Select clean vector academic symbol:
                </span>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                  {filteredPresets.map((preset) => {
                    const isSelected = selectedPresetId === preset.id;
                    const sampleUri = generatePresetSvgUri(preset);

                    return (
                      <div
                        key={preset.id}
                        onClick={() => handleSelectPreset(preset)}
                        className={`p-3 rounded-xl border text-center cursor-pointer transition-all flex flex-col items-center gap-2 ${
                          isSelected
                            ? "border-blue-500 bg-blue-50/50 shadow-2xs ring-1 ring-blue-500"
                            : "border-slate-200 bg-white hover:border-slate-300 hover:bg-slate-50/50"
                        }`}
                      >
                        <div className="w-12 h-12 rounded-xl overflow-hidden shadow-2xs border border-white">
                          {/* eslint-disable-next-line @next/next/no-img-element */}
                          <img src={sampleUri} alt={preset.label} className="w-full h-full object-cover" />
                        </div>
                        <span className="text-[11.5px] font-semibold text-slate-800">
                          {preset.label}
                        </span>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </div>

          {/* Footer Actions */}
          <div className="p-4 border-t border-slate-200 bg-slate-50/50 flex items-center justify-between">
            <span className="text-xs text-slate-500 font-mono">
              Vector resolution &bull; SVG Standard
            </span>

            <div className="flex items-center gap-2">
              <Button variant="outline" size="sm" onClick={onClose} disabled={isApplying}>
                Cancel
              </Button>
              <Button
                variant="primary"
                size="sm"
                onClick={handleApply}
                isLoading={isApplying}
                leftIcon={<Check className="w-3.5 h-3.5" />}
              >
                Apply Avatar
              </Button>
            </div>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
