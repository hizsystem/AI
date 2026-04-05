"use client";

import { useState } from "react";
import type { ProjectConfig } from "@/data/client-config";

interface OnboardingModalProps {
  onComplete: (config: ProjectConfig) => Promise<void>;
  onClose: () => void;
}

export default function OnboardingModal({ onComplete, onClose }: OnboardingModalProps) {
  const [name, setName] = useState("");
  const [emoji, setEmoji] = useState("");
  const [color, setColor] = useState("#6366f1");
  const [saving, setSaving] = useState(false);
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);

  const EMOJI_OPTIONS = [
    "☕", "🍜", "🍲", "🍷", "🍺", "🥐", "🍰", "🍕",
    "🏪", "🏬", "🏥", "🏫", "💇", "🏋️", "🧘", "🐾",
    "🌱", "🚀", "✦", "💎", "🎯", "📱", "🎨", "🎵",
    "⛽", "🚗", "✈️", "🏠", "👕", "👟", "💄", "🧴",
  ];

  async function handleCreate() {
    if (!name.trim()) return;
    setSaving(true);
    try {
      const slug = name
        .toLowerCase()
        .replace(/[^a-z0-9가-힣]/g, "-")
        .replace(/-+/g, "-")
        .replace(/^-|-$/g, "");

      const config: ProjectConfig = {
        slug,
        name: name.trim(),
        emoji: emoji || undefined,
        logo: null,
        brandColor: color,
        status: "active",
        channels: [
          { type: "instagram", enabled: true, blocks: ["ig-calendar", "ig-moodboard", "ig-reference"] },
        ],
      };

      await onComplete(config);
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40" onClick={onClose}>
      <div
        className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="px-6 py-5 border-b border-gray-100 flex items-center justify-between">
          <h2 className="text-base font-semibold text-gray-900">새 프로젝트</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
              <path d="M6 6L18 18M18 6L6 18" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
            </svg>
          </button>
        </div>

        <div className="px-6 py-5 space-y-5">
          <div className="flex gap-3">
            <div className="flex-1">
              <label className="block text-xs text-gray-500 mb-1.5">브랜드명 *</label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="브랜드 이름"
                className="w-full px-3 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-1 focus:ring-gray-300"
                autoFocus
              />
            </div>
            <div className="w-20 relative">
              <label className="block text-xs text-gray-500 mb-1.5">이모지</label>
              <button
                type="button"
                onClick={() => setShowEmojiPicker(!showEmojiPicker)}
                className="w-full px-3 py-2.5 border border-gray-200 rounded-lg text-lg text-center hover:border-gray-300 transition-colors"
              >
                {emoji || "😀"}
              </button>
              {showEmojiPicker && (
                <div className="absolute top-full mt-1 right-0 bg-white rounded-xl shadow-lg border border-gray-200 p-2 z-10 w-52">
                  <div className="grid grid-cols-8 gap-0.5">
                    {EMOJI_OPTIONS.map((e) => (
                      <button
                        key={e}
                        type="button"
                        onClick={() => { setEmoji(e); setShowEmojiPicker(false); }}
                        className="w-7 h-7 flex items-center justify-center text-lg hover:bg-gray-100 rounded transition-colors"
                      >
                        {e}
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>

          <div>
            <label className="block text-xs text-gray-500 mb-1.5">브랜드 컬러</label>
            <div className="flex items-center gap-2">
              <input type="color" value={color} onChange={(e) => setColor(e.target.value)} className="w-8 h-8 rounded border border-gray-200 cursor-pointer" />
              <input type="text" value={color} onChange={(e) => setColor(e.target.value)} className="w-32 px-3 py-2 border border-gray-200 rounded-lg text-sm font-mono focus:outline-none focus:ring-1 focus:ring-gray-300" />
            </div>
          </div>

          <p className="text-[11px] text-gray-400">생성 후 설정에서 채널(Instagram/NP/Blog)을 추가할 수 있습니다.</p>
        </div>

        <div className="px-6 py-4 border-t border-gray-100 flex items-center justify-end gap-2">
          <button onClick={onClose} className="px-4 py-2 text-sm text-gray-500 hover:text-gray-700">취소</button>
          <button
            onClick={handleCreate}
            disabled={saving || !name.trim()}
            className="px-5 py-2 text-sm font-medium text-white bg-gray-900 rounded-lg hover:bg-gray-800 disabled:opacity-50 transition-colors"
          >
            {saving ? "생성 중..." : "생성"}
          </button>
        </div>
      </div>
    </div>
  );
}
