"use client";

import { useState } from "react";
import { SERVICE_PACKAGES, type ServicePackage } from "@/data/packages";
import type { ProjectConfig } from "@/data/client-config";

interface OnboardingModalProps {
  onComplete: (config: ProjectConfig) => Promise<void>;
  onClose: () => void;
}

export default function OnboardingModal({ onComplete, onClose }: OnboardingModalProps) {
  const [step, setStep] = useState<"package" | "info">("package");
  const [selectedPkg, setSelectedPkg] = useState<ServicePackage | null>(null);
  const [name, setName] = useState("");
  const [emoji, setEmoji] = useState("");
  const [color, setColor] = useState("#6366f1");
  const [saving, setSaving] = useState(false);

  async function handleCreate() {
    if (!name.trim() || !selectedPkg) return;
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
        channels: selectedPkg.channels,
      };

      await onComplete(config);
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40" onClick={onClose}>
      <div
        className="bg-white rounded-2xl shadow-2xl w-full max-w-lg overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="px-6 py-5 border-b border-gray-100 flex items-center justify-between">
          <h2 className="text-base font-semibold text-gray-900">
            {step === "package" ? "패키지 선택" : "프로젝트 정보"}
          </h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
              <path d="M6 6L18 18M18 6L6 18" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
            </svg>
          </button>
        </div>

        {/* Step 1: Package selection */}
        {step === "package" && (
          <div className="px-6 py-5 space-y-3">
            <p className="text-xs text-gray-400 mb-4">클라이언트에게 제공할 서비스 범위를 선택하세요.</p>

            {SERVICE_PACKAGES.map((pkg) => (
              <button
                key={pkg.id}
                onClick={() => {
                  setSelectedPkg(pkg);
                  setStep("info");
                }}
                className="w-full text-left p-5 rounded-xl border border-gray-200 hover:border-gray-900 hover:shadow-sm transition-all group"
              >
                <div className="flex items-start gap-4">
                  <span className="text-2xl">{pkg.emoji}</span>
                  <div className="flex-1">
                    <div className="flex items-center justify-between">
                      <h3 className="text-sm font-bold text-gray-900 group-hover:text-gray-900">
                        {pkg.name}
                      </h3>
                      <span className="text-xs text-gray-400">{pkg.priceRange}</span>
                    </div>
                    <p className="text-xs text-gray-500 mt-1">{pkg.description}</p>
                    <div className="flex flex-wrap gap-1.5 mt-3">
                      {pkg.features.map((f, i) => (
                        <span key={i} className="text-[10px] px-2 py-0.5 rounded-full bg-gray-100 text-gray-500">
                          {f}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              </button>
            ))}
          </div>
        )}

        {/* Step 2: Project info */}
        {step === "info" && selectedPkg && (
          <div className="px-6 py-5 space-y-5">
            {/* Selected package indicator */}
            <div className="flex items-center gap-2 px-3 py-2 bg-gray-50 rounded-lg">
              <span className="text-base">{selectedPkg.emoji}</span>
              <span className="text-sm font-medium text-gray-700">{selectedPkg.name}</span>
              <span className="text-xs text-gray-400">({selectedPkg.priceRange})</span>
              <button
                onClick={() => setStep("package")}
                className="ml-auto text-xs text-gray-400 hover:text-gray-600"
              >
                변경
              </button>
            </div>

            {/* Name + emoji */}
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
              <div className="w-20">
                <label className="block text-xs text-gray-500 mb-1.5">이모지</label>
                <input
                  type="text"
                  value={emoji}
                  onChange={(e) => setEmoji(e.target.value)}
                  placeholder="🏪"
                  className="w-full px-3 py-2.5 border border-gray-200 rounded-lg text-sm text-center focus:outline-none focus:ring-1 focus:ring-gray-300"
                />
              </div>
            </div>

            {/* Color */}
            <div>
              <label className="block text-xs text-gray-500 mb-1.5">브랜드 컬러</label>
              <div className="flex items-center gap-2">
                <input
                  type="color"
                  value={color}
                  onChange={(e) => setColor(e.target.value)}
                  className="w-8 h-8 rounded border border-gray-200 cursor-pointer"
                />
                <input
                  type="text"
                  value={color}
                  onChange={(e) => setColor(e.target.value)}
                  className="w-32 px-3 py-2 border border-gray-200 rounded-lg text-sm font-mono focus:outline-none focus:ring-1 focus:ring-gray-300"
                />
              </div>
            </div>

            {/* Active blocks preview */}
            <div>
              <label className="block text-xs text-gray-500 mb-2">활성화될 채널</label>
              <div className="flex flex-wrap gap-2">
                {selectedPkg.channels.filter((c) => c.enabled).map((ch) => (
                  <span key={ch.type} className="text-xs px-3 py-1 rounded-full bg-gray-900 text-white">
                    {ch.type === "instagram" ? "📸 Instagram" : ch.type === "naver-place" ? "📍 Naver Place" : "📝 Blog"}
                  </span>
                ))}
                <span className="text-xs px-3 py-1 rounded-full bg-gray-100 text-gray-500">📅 일정</span>
                <span className="text-xs px-3 py-1 rounded-full bg-gray-100 text-gray-500">💰 Finance</span>
              </div>
            </div>
          </div>
        )}

        {/* Footer */}
        {step === "info" && (
          <div className="px-6 py-4 border-t border-gray-100 flex items-center justify-end gap-2">
            <button onClick={() => setStep("package")} className="px-4 py-2 text-sm text-gray-500 hover:text-gray-700">
              이전
            </button>
            <button
              onClick={handleCreate}
              disabled={saving || !name.trim()}
              className="px-5 py-2 text-sm font-medium text-white bg-gray-900 rounded-lg hover:bg-gray-800 disabled:opacity-50 transition-colors"
            >
              {saving ? "생성 중..." : "프로젝트 생성"}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
