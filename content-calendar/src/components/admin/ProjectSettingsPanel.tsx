"use client";

import { useState, useEffect } from "react";
import type { ProjectConfig, ChannelType, ChannelConfig } from "@/data/client-config";

interface ProjectSettingsPanelProps {
  slug: string;
  onSave: (config: ProjectConfig) => Promise<void>;
  onClose: () => void;
}

const AVAILABLE_CHANNELS: { type: ChannelType; label: string; emoji: string }[] = [
  { type: "instagram", label: "Instagram", emoji: "📸" },
  { type: "naver-place", label: "Naver Place", emoji: "📍" },
  { type: "blog", label: "Blog", emoji: "📝" },
];

const DEFAULT_CHANNEL_BLOCKS: Record<ChannelType, string[]> = {
  instagram: ["ig-calendar", "ig-moodboard", "ig-reference"],
  "naver-place": ["np-audit", "np-missions"],
  blog: ["blog-calendar"],
};

export default function ProjectSettingsPanel({
  slug,
  onSave,
  onClose,
}: ProjectSettingsPanelProps) {
  const [config, setConfig] = useState<ProjectConfig | null>(null);
  const [loading, setLoading] = useState(true);
  const [name, setName] = useState("");
  const [emoji, setEmoji] = useState("");
  const [brandColor, setBrandColor] = useState("#6366f1");
  const [status, setStatus] = useState<ProjectConfig["status"]>("active");
  const [channels, setChannels] = useState<ChannelConfig[]>([]);
  const [budget, setBudget] = useState(0);
  const [invoiceDay, setInvoiceDay] = useState(10);
  const [defaultHashtags, setDefaultHashtags] = useState("");
  const [defaultMentions, setDefaultMentions] = useState("");
  const [saving, setSaving] = useState(false);
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);

  const EMOJI_OPTIONS = [
    "☕", "🍜", "🍲", "🍷", "🍺", "🥐", "🍰", "🍕",
    "🏪", "🏬", "🏥", "🏫", "💇", "🏋️", "🧘", "🐾",
    "🌱", "🚀", "✦", "💎", "🎯", "📱", "🎨", "🎵",
    "⛽", "🚗", "✈️", "🏠", "👕", "👟", "💄", "🧴",
  ];

  // Fetch real config from API
  useEffect(() => {
    fetch("/api/admin/project")
      .then((r) => r.json())
      .then((configs: ProjectConfig[]) => {
        const found = configs.find((c) => c.slug === slug);
        if (found) {
          setConfig(found);
          setName(found.name);
          setEmoji(found.emoji || "");
          setBrandColor(found.brandColor);
          setStatus(found.status);
          setChannels(found.channels || []);
          setBudget(found.finance?.monthlyBudget || found.finance?.monthlyFee || 0);
          setInvoiceDay(found.finance?.invoiceDay || 10);
          const igCh = found.channels?.find((c) => c.type === "instagram");
          if (igCh?.defaultHashtags) setDefaultHashtags(igCh.defaultHashtags.join(" "));
          if (igCh?.defaultMentions) setDefaultMentions(igCh.defaultMentions.join(" "));
        }
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [slug]);

  function toggleChannel(type: ChannelType) {
    setChannels((prev) => {
      const existing = prev.find((c) => c.type === type);
      if (existing) {
        return prev.map((c) =>
          c.type === type ? { ...c, enabled: !c.enabled } : c
        );
      }
      return [
        ...prev,
        {
          type,
          enabled: true,
          blocks: DEFAULT_CHANNEL_BLOCKS[type] as any[],
        },
      ];
    });
  }

  function isChannelEnabled(type: ChannelType): boolean {
    return channels.some((c) => c.type === type && c.enabled);
  }

  function getIgBlocks(): string[] {
    return channels.find((c) => c.type === "instagram")?.blocks || ["ig-calendar"];
  }

  function toggleIgBlock(blockId: string) {
    setChannels((prev) => prev.map((ch) => {
      if (ch.type !== "instagram") return ch;
      const blocks = ch.blocks || [];
      return {
        ...ch,
        blocks: blocks.includes(blockId as any)
          ? blocks.filter((b) => b !== blockId)
          : [...blocks, blockId as any],
      };
    }));
  }

  async function handleSave() {
    if (!config) return;
    setSaving(true);
    try {
      // Apply hashtag/mention defaults to instagram channel
      const updatedChannels = channels.map((ch) => {
        if (ch.type === "instagram") {
          return {
            ...ch,
            defaultHashtags: defaultHashtags.trim() ? defaultHashtags.split(/\s+/).filter(Boolean) : undefined,
            defaultMentions: defaultMentions.trim() ? defaultMentions.split(/\s+/).filter(Boolean) : undefined,
          };
        }
        return ch;
      });

      const updated: ProjectConfig = {
        ...config,
        name,
        emoji: emoji || undefined,
        brandColor,
        status,
        channels: updatedChannels,
        finance: budget > 0
          ? { ...config.finance, model: config.finance?.model || "monthly", monthlyBudget: budget, monthlyFee: budget, invoiceDay, currency: "KRW" as const }
          : config.finance,
      };
      await onSave(updated);
      onClose();
    } finally {
      setSaving(false);
    }
  }

  if (loading) {
    return (
      <div className="fixed inset-0 z-50 flex justify-end bg-black/30" onClick={onClose}>
        <div className="bg-white shadow-2xl w-full max-w-[440px] h-full flex items-center justify-center animate-slide-in-right">
          <span className="text-sm text-gray-400">로딩 중...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 z-50 flex justify-end bg-black/30" onClick={onClose}>
      <div
        className="bg-white shadow-2xl w-full max-w-[440px] h-full overflow-hidden flex flex-col animate-slide-in-right"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="px-6 py-5 border-b border-gray-100 flex items-center justify-between">
          <h2 className="text-base font-semibold text-gray-900">프로젝트 설정</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
              <path d="M6 6L18 18M18 6L6 18" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
            </svg>
          </button>
        </div>

        {/* Form */}
        <div className="flex-1 overflow-y-auto px-6 py-5 space-y-6">
          {/* Basic info */}
          <div className="space-y-4">
            <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-wider">기본 정보</h3>
            <div className="flex gap-3">
              <div className="flex-1">
                <label className="block text-xs text-gray-500 mb-1.5">브랜드명</label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-1 focus:ring-gray-300"
                />
              </div>
              <div className="w-20 relative">
                <label className="block text-xs text-gray-500 mb-1.5">이모지</label>
                <button
                  type="button"
                  onClick={() => setShowEmojiPicker(!showEmojiPicker)}
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg text-lg text-center hover:border-gray-300 transition-colors"
                >
                  {emoji || "😀"}
                </button>
                {showEmojiPicker && (
                  <div className="absolute mt-1 right-0 bg-white rounded-xl shadow-lg border border-gray-200 p-2 z-10 w-52">
                    <div className="grid grid-cols-8 gap-0.5">
                      {EMOJI_OPTIONS.map((e) => (
                        <button key={e} type="button" onClick={() => { setEmoji(e); setShowEmojiPicker(false); }}
                          className="w-7 h-7 flex items-center justify-center text-lg hover:bg-gray-100 rounded transition-colors">{e}</button>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
            <div className="flex gap-3">
              <div className="flex-1">
                <label className="block text-xs text-gray-500 mb-1.5">브랜드 컬러</label>
                <div className="flex items-center gap-2">
                  <input
                    type="color"
                    value={brandColor}
                    onChange={(e) => setBrandColor(e.target.value)}
                    className="w-8 h-8 rounded border border-gray-200 cursor-pointer"
                  />
                  <input
                    type="text"
                    value={brandColor}
                    onChange={(e) => setBrandColor(e.target.value)}
                    className="flex-1 px-3 py-2 border border-gray-200 rounded-lg text-sm font-mono focus:outline-none focus:ring-1 focus:ring-gray-300"
                  />
                </div>
              </div>
              <div className="w-28">
                <label className="block text-xs text-gray-500 mb-1.5">상태</label>
                <select
                  value={status}
                  onChange={(e) => setStatus(e.target.value as ProjectConfig["status"])}
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm bg-white focus:outline-none focus:ring-1 focus:ring-gray-300"
                >
                  <option value="active">Active</option>
                  <option value="paused">Paused</option>
                  <option value="completed">완료</option>
                  <option value="demo">Demo</option>
                </select>
              </div>
            </div>
          </div>

          {/* Channels */}
          <div className="space-y-3">
            <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-wider">채널</h3>
            {AVAILABLE_CHANNELS.map((ch) => (
              <button
                key={ch.type}
                onClick={() => toggleChannel(ch.type)}
                className={`w-full px-4 py-3 rounded-lg border text-left flex items-center gap-3 transition-colors ${
                  isChannelEnabled(ch.type)
                    ? "border-gray-900 bg-gray-50"
                    : "border-gray-200 hover:border-gray-300"
                }`}
              >
                <span className="text-base">{ch.emoji}</span>
                <span className="text-sm font-medium text-gray-700 flex-1">{ch.label}</span>
                <div
                  className={`w-8 h-5 rounded-full transition-colors flex items-center ${
                    isChannelEnabled(ch.type) ? "bg-gray-900 justify-end" : "bg-gray-200 justify-start"
                  }`}
                >
                  <div className="w-4 h-4 bg-white rounded-full mx-0.5 shadow-sm" />
                </div>
              </button>
            ))}
          </div>

          {/* Instagram features (blocks) */}
          {isChannelEnabled("instagram") && (
            <div className="space-y-3">
              <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Instagram 기능</h3>
              {([
                { id: "ig-moodboard", label: "무드보드", desc: "비주얼 톤앤매너 보드" },
                { id: "ig-kpi", label: "KPI / DATA", desc: "팔로워, 도달, 참여율 추적" },
                { id: "ig-report", label: "주간 리포트", desc: "주간 성과 요약" },
                { id: "ig-reference", label: "레퍼런스", desc: "참고 콘텐츠 아카이브" },
                { id: "ig-guide", label: "플레이북", desc: "콘텐츠 가이드라인" },
              ] as const).map((block) => {
                const enabled = getIgBlocks().includes(block.id);
                return (
                  <button
                    key={block.id}
                    onClick={() => toggleIgBlock(block.id)}
                    className={`w-full px-4 py-2.5 rounded-lg border text-left flex items-center gap-3 transition-colors ${
                      enabled ? "border-gray-300 bg-gray-50" : "border-gray-100 hover:border-gray-200"
                    }`}
                  >
                    <div className="flex-1">
                      <span className={`text-sm font-medium ${enabled ? "text-gray-700" : "text-gray-400"}`}>{block.label}</span>
                      <p className="text-[11px] text-gray-400">{block.desc}</p>
                    </div>
                    <div className={`w-8 h-5 rounded-full transition-colors flex items-center ${
                      enabled ? "bg-gray-900 justify-end" : "bg-gray-200 justify-start"
                    }`}>
                      <div className="w-4 h-4 bg-white rounded-full mx-0.5 shadow-sm" />
                    </div>
                  </button>
                );
              })}
            </div>
          )}

          {/* Content Defaults */}
          {isChannelEnabled("instagram") && (
            <div className="space-y-4">
              <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-wider">콘텐츠 기본값</h3>
              <div>
                <label className="block text-xs text-gray-500 mb-1.5">기본 해시태그 <span className="text-gray-400">(공백 구분)</span></label>
                <input
                  type="text"
                  value={defaultHashtags}
                  onChange={(e) => setDefaultHashtags(e.target.value)}
                  placeholder="#브랜드명 #키워드"
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-1 focus:ring-gray-300"
                />
              </div>
              <div>
                <label className="block text-xs text-gray-500 mb-1.5">기본 멘션 <span className="text-gray-400">(공백 구분)</span></label>
                <input
                  type="text"
                  value={defaultMentions}
                  onChange={(e) => setDefaultMentions(e.target.value)}
                  placeholder="@계정명"
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-1 focus:ring-gray-300"
                />
              </div>
              <p className="text-[11px] text-gray-400">콘텐츠 추가 시 자동으로 채워집니다</p>
            </div>
          )}

          {/* Finance */}
          <div className="space-y-4">
            <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-wider">재무</h3>
            <div className="flex gap-3">
              <div className="flex-1">
                <label className="block text-xs text-gray-500 mb-1.5">월 예산 (원)</label>
                <input
                  type="number"
                  value={budget || ""}
                  onChange={(e) => setBudget(parseInt(e.target.value) || 0)}
                  placeholder="0"
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-1 focus:ring-gray-300"
                />
              </div>
              <div className="w-24">
                <label className="block text-xs text-gray-500 mb-1.5">발행일</label>
                <input
                  type="number"
                  min={1}
                  max={31}
                  value={invoiceDay}
                  onChange={(e) => setInvoiceDay(parseInt(e.target.value) || 10)}
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm text-center focus:outline-none focus:ring-1 focus:ring-gray-300"
                />
              </div>
            </div>
          </div>

          {/* Slug (read-only) */}
          <div>
            <label className="block text-xs text-gray-400 mb-1.5">Slug (변경 불가)</label>
            <p className="text-sm font-mono text-gray-300">{slug}</p>
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-gray-100 flex items-center justify-end gap-2">
          <button onClick={onClose} className="px-4 py-2 text-sm text-gray-500 hover:text-gray-700">
            취소
          </button>
          <button
            onClick={handleSave}
            disabled={saving || !name.trim()}
            className="px-5 py-2 text-sm font-medium text-white bg-gray-900 rounded-lg hover:bg-gray-800 disabled:opacity-50 transition-colors"
          >
            {saving ? "저장 중..." : "저장"}
          </button>
        </div>
      </div>
    </div>
  );
}
