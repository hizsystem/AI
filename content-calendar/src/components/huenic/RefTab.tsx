"use client";

import { useState, useCallback, useRef, useMemo } from "react";
import { useRefData } from "@/hooks/useRefData";
import type { HuenicBrand, RefItem, RefCollection } from "@/data/huenic-types";

interface RefTabProps {
  brand: HuenicBrand;
}

function detectPlatform(url: string): RefItem["platform"] {
  if (/instagram\.com/.test(url)) return "instagram";
  if (/tiktok\.com/.test(url)) return "tiktok";
  if (/youtube\.com|youtu\.be/.test(url)) return "youtube";
  if (/^https?:\/\//.test(url)) return "web";
  return "other";
}

function platformLabel(p: RefItem["platform"]): string {
  const map: Record<RefItem["platform"], string> = {
    instagram: "Instagram",
    tiktok: "TikTok",
    youtube: "YouTube",
    web: "Web",
    other: "기타",
  };
  return map[p];
}


export default function RefTab({ brand }: RefTabProps) {
  const { data, loading, error, addItem, deleteItem } = useRefData(brand);
  const [activeCollection, setActiveCollection] = useState<string>("all");
  const [showAddForm, setShowAddForm] = useState(false);
  const [expandedId, setExpandedId] = useState<string | null>(null);

  // Add form state
  const [newUrl, setNewUrl] = useState("");
  const [newComment, setNewComment] = useState("");
  const [newCollection, setNewCollection] = useState("");
  const [newThumbnail, setNewThumbnail] = useState("");
  const [uploading, setUploading] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  const collections = data?.collections ?? [];
  const items = data?.items ?? [];

  const filteredItems = useMemo(() => {
    if (activeCollection === "all") return items;
    return items.filter((i) => i.collectionId === activeCollection);
  }, [items, activeCollection]);

  const collectionMap = useMemo(() => {
    return Object.fromEntries(collections.map((c) => [c.id, c]));
  }, [collections]);

  const collectionCounts = useMemo(() => {
    const counts: Record<string, number> = { all: items.length };
    for (const item of items) {
      counts[item.collectionId] = (counts[item.collectionId] || 0) + 1;
    }
    return counts;
  }, [items]);

  const handleFileUpload = useCallback(
    async (file: File) => {
      if (!file.type.startsWith("image/")) return;
      setUploading(true);
      try {
        const formData = new FormData();
        formData.append("file", file);
        formData.append("client", `huenic-${brand}-refs`);
        const res = await fetch("/api/upload", { method: "POST", body: formData });
        if (res.ok) {
          const { url } = await res.json();
          setNewThumbnail(url);
        }
      } finally {
        setUploading(false);
      }
    },
    [brand]
  );

  const handleAdd = useCallback(async () => {
    if (!newUrl.trim() && !newThumbnail) return;
    const item: RefItem = {
      id: `ref-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
      collectionId: newCollection || collections[0]?.id || "general",
      url: newUrl.trim(),
      thumbnailUrl: newThumbnail || undefined,
      platform: detectPlatform(newUrl),
      comment: newComment.trim() || undefined,
      addedBy: "",
      createdAt: new Date().toISOString(),
    };
    await addItem(item);
    setNewUrl("");
    setNewComment("");
    setNewThumbnail("");
    setNewCollection("");
    setShowAddForm(false);
  }, [newUrl, newComment, newCollection, newThumbnail, collections, addItem]);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20 text-gray-400 text-sm">
        로딩 중...
      </div>
    );
  }
  if (error) {
    return (
      <div className="flex items-center justify-center py-20 text-red-400 text-sm">
        {error}
      </div>
    );
  }

  return (
    <div className="mt-6">
      {/* Collection Tabs */}
      <div className="flex items-center gap-2 flex-wrap mb-6">
        <button
          onClick={() => setActiveCollection("all")}
          className={`px-3 py-1.5 text-xs font-semibold rounded-full border transition-colors ${
            activeCollection === "all"
              ? "bg-gray-900 text-white border-gray-900"
              : "bg-white text-gray-500 border-gray-200 hover:border-gray-400"
          }`}
        >
          전체 {collectionCounts.all || 0}
        </button>
        {collections.map((c) => (
          <button
            key={c.id}
            onClick={() => setActiveCollection(c.id)}
            className={`px-3 py-1.5 text-xs font-semibold rounded-full border transition-colors ${
              activeCollection === c.id
                ? "text-white border-transparent"
                : "bg-white text-gray-500 border-gray-200 hover:border-gray-400"
            }`}
            style={
              activeCollection === c.id
                ? { backgroundColor: c.color, borderColor: c.color }
                : undefined
            }
          >
            {c.name} {collectionCounts[c.id] || 0}
          </button>
        ))}

        <button
          onClick={() => {
            setShowAddForm(!showAddForm);
            if (!newCollection && collections.length > 0) {
              setNewCollection(activeCollection === "all" ? collections[0].id : activeCollection);
            }
          }}
          className="ml-auto px-4 py-1.5 text-xs font-semibold rounded-full bg-gray-900 text-white hover:bg-gray-700 transition-colors"
        >
          + 레퍼런스 추가
        </button>
      </div>

      {/* Add Form */}
      {showAddForm && (
        <div className="mb-6 p-5 bg-gray-50 border border-gray-200 rounded-xl">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
            <div>
              <label className="block text-xs font-semibold text-gray-500 mb-1.5">
                URL (인스타그램, 웹 등)
              </label>
              <input
                type="url"
                value={newUrl}
                onChange={(e) => setNewUrl(e.target.value)}
                placeholder="https://www.instagram.com/reel/..."
                className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-300"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-500 mb-1.5">
                컬렉션
              </label>
              <select
                value={newCollection}
                onChange={(e) => setNewCollection(e.target.value)}
                className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-300 bg-white"
              >
                {collections.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="mb-4">
            <label className="block text-xs font-semibold text-gray-500 mb-1.5">
              메모 (왜 이 레퍼런스를 저장했는지)
            </label>
            <textarea
              value={newComment}
              onChange={(e) => setNewComment(e.target.value)}
              placeholder="톤, 구도, 카피 등 참고할 포인트..."
              rows={2}
              className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-300 resize-none"
            />
          </div>

          <div className="flex items-center gap-4 mb-4">
            <div>
              <label className="block text-xs font-semibold text-gray-500 mb-1.5">
                썸네일 (선택)
              </label>
              <div className="flex items-center gap-2">
                <input
                  ref={fileRef}
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={(e) => {
                    if (e.target.files?.[0]) handleFileUpload(e.target.files[0]);
                  }}
                />
                <button
                  onClick={() => fileRef.current?.click()}
                  disabled={uploading}
                  className="px-3 py-1.5 text-xs border border-gray-200 rounded-lg hover:bg-gray-100 transition-colors disabled:opacity-50"
                >
                  {uploading ? "업로드 중..." : "이미지 업로드"}
                </button>
                {newThumbnail && (
                  <img
                    src={newThumbnail}
                    alt="thumb"
                    className="w-10 h-10 rounded object-cover border"
                  />
                )}
              </div>
            </div>
          </div>

          <div className="flex justify-end gap-2">
            <button
              onClick={() => setShowAddForm(false)}
              className="px-4 py-2 text-xs font-medium text-gray-500 hover:text-gray-700"
            >
              취소
            </button>
            <button
              onClick={handleAdd}
              disabled={!newUrl.trim() && !newThumbnail}
              className="px-4 py-2 text-xs font-semibold bg-gray-900 text-white rounded-lg hover:bg-gray-700 disabled:opacity-30 transition-colors"
            >
              저장
            </button>
          </div>
        </div>
      )}

      {/* Items Grid */}
      {filteredItems.length === 0 ? (
        <div className="text-center py-20 text-gray-400 text-sm">
          {activeCollection === "all"
            ? "아직 저장한 레퍼런스가 없습니다"
            : `${collectionMap[activeCollection]?.name ?? ""}에 저장한 레퍼런스가 없습니다`}
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredItems.map((item) => (
            <RefCard
              key={item.id}
              item={item}
              collection={collectionMap[item.collectionId]}
              expanded={expandedId === item.id}
              onToggle={() =>
                setExpandedId(expandedId === item.id ? null : item.id)
              }
              onDelete={() => {
                if (confirm("이 레퍼런스를 삭제할까요?")) deleteItem(item.id);
              }}
            />
          ))}
        </div>
      )}
    </div>
  );
}

// --- RefCard ---

function RefCard({
  item,
  collection,
  onToggle,
  onDelete,
}: {
  item: RefItem;
  collection?: RefCollection;
  expanded: boolean;
  onToggle: () => void;
  onDelete: () => void;
}) {
  const platformIcon: Record<string, React.ReactNode> = {
    instagram: (
      <svg width="32" height="32" viewBox="0 0 24 24" fill="none" className="text-pink-400">
        <rect x="2" y="2" width="20" height="20" rx="5" stroke="currentColor" strokeWidth="1.5"/>
        <circle cx="12" cy="12" r="5" stroke="currentColor" strokeWidth="1.5"/>
        <circle cx="17.5" cy="6.5" r="1.5" fill="currentColor"/>
      </svg>
    ),
    youtube: (
      <svg width="32" height="32" viewBox="0 0 24 24" fill="none" className="text-red-500">
        <rect x="2" y="4" width="20" height="16" rx="4" stroke="currentColor" strokeWidth="1.5"/>
        <path d="M10 9l5 3-5 3V9z" fill="currentColor"/>
      </svg>
    ),
  };

  return (
    <div className="border border-gray-200 rounded-xl overflow-hidden bg-white hover:border-gray-300 transition-colors">
      {/* Preview */}
      {item.thumbnailUrl ? (
        <a
          href={item.url || undefined}
          target="_blank"
          rel="noopener noreferrer"
          className="block w-full h-48 bg-gray-100"
        >
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={item.thumbnailUrl}
            alt=""
            className="w-full h-full object-cover"
          />
        </a>
      ) : (
        <a
          href={item.url || undefined}
          target="_blank"
          rel="noopener noreferrer"
          className="w-full h-36 bg-gradient-to-b from-gray-50 to-gray-100 flex flex-col items-center justify-center gap-2 hover:from-gray-100 hover:to-gray-150 transition-colors"
        >
          {platformIcon[item.platform] || (
            <svg width="28" height="28" viewBox="0 0 24 24" fill="none" className="text-gray-300">
              <path d="M10 13a5 5 0 007.54.54l3-3a5 5 0 00-7.07-7.07l-1.72 1.71" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
              <path d="M14 11a5 5 0 00-7.54-.54l-3 3a5 5 0 007.07 7.07l1.71-1.71" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
            </svg>
          )}
          <span className="text-[10px] text-gray-400 font-medium">
            {platformLabel(item.platform)}에서 보기 →
          </span>
        </a>
      )}

      {/* Info */}
      <div className="p-4">
        {/* Collection tag + platform */}
        <div className="flex items-center gap-2 mb-2">
          {collection && (
            <span
              className="text-[10px] font-bold px-2 py-0.5 rounded-full text-white"
              style={{ backgroundColor: collection.color }}
            >
              {collection.name}
            </span>
          )}
          <span className="text-[10px] font-medium text-gray-400">
            {platformLabel(item.platform)}
          </span>
        </div>

        {/* Comment */}
        {item.comment && (
          <p className="text-sm text-gray-700 leading-relaxed mb-3">
            {item.comment}
          </p>
        )}

        {/* URL + actions */}
        <div className="flex items-center justify-between">
          <a
            href={item.url}
            target="_blank"
            rel="noopener noreferrer"
            className="text-xs text-blue-500 hover:underline truncate max-w-[200px]"
          >
            {item.url ? (() => { try { return new URL(item.url).hostname + "/..."; } catch { return item.url; } })() : "링크 없음"}
          </a>
          <div className="flex items-center gap-2">
            {item.addedBy && (
              <span className="text-[10px] text-gray-400">{item.addedBy}</span>
            )}
            <button
              onClick={onDelete}
              className="text-gray-300 hover:text-red-400 transition-colors"
              title="삭제"
            >
              <svg
                width="14"
                height="14"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
              >
                <path d="M18 6L6 18M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
