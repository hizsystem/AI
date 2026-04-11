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

function platformIcon(p: RefItem["platform"]): string {
  const map: Record<RefItem["platform"], string> = {
    instagram: "📷",
    tiktok: "🎵",
    youtube: "📺",
    web: "🔗",
    other: "📌",
  };
  return map[p];
}

export default function RefTab({ brand }: RefTabProps) {
  const { data, loading, error, addItem, deleteItem } = useRefData(brand);
  const [openFolder, setOpenFolder] = useState<string | null>(null);
  const [showAddForm, setShowAddForm] = useState(false);

  // Add form state
  const [newUrl, setNewUrl] = useState("");
  const [newComment, setNewComment] = useState("");
  const [newCollection, setNewCollection] = useState("");
  const [newThumbnail, setNewThumbnail] = useState("");
  const [uploading, setUploading] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  const collections = data?.collections ?? [];
  const items = data?.items ?? [];

  const collectionMap = useMemo(() => {
    return Object.fromEntries(collections.map((c) => [c.id, c]));
  }, [collections]);

  // Group items by collection
  const itemsByCollection = useMemo(() => {
    const grouped: Record<string, RefItem[]> = {};
    for (const item of items) {
      if (!grouped[item.collectionId]) grouped[item.collectionId] = [];
      grouped[item.collectionId].push(item);
    }
    return grouped;
  }, [items]);

  // Collections that have items (for folder view)
  const activeCollections = useMemo(() => {
    return collections.filter((c) => (itemsByCollection[c.id]?.length ?? 0) > 0);
  }, [collections, itemsByCollection]);

  // Empty collections (shown as smaller cards)
  const emptyCollections = useMemo(() => {
    return collections.filter((c) => (itemsByCollection[c.id]?.length ?? 0) === 0);
  }, [collections, itemsByCollection]);

  const openFolderItems = openFolder ? (itemsByCollection[openFolder] ?? []) : [];
  const openFolderCollection = openFolder ? collectionMap[openFolder] : null;

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
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        {openFolder ? (
          <div className="flex items-center gap-3">
            <button
              onClick={() => setOpenFolder(null)}
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M15 18l-6-6 6-6" />
              </svg>
              전체 시리즈
            </button>
            <div className="flex items-center gap-2">
              <span
                className="w-3 h-3 rounded-full"
                style={{ backgroundColor: openFolderCollection?.color }}
              />
              <span className="text-sm font-bold text-gray-900">
                {openFolderCollection?.name}
              </span>
              <span className="text-xs text-gray-400">
                {openFolderItems.length}개
              </span>
            </div>
          </div>
        ) : (
          <div className="flex items-center gap-2">
            <span className="text-sm font-bold text-gray-900">시리즈</span>
            <span className="text-xs text-gray-400">{items.length}개 레퍼런스</span>
          </div>
        )}

        <button
          onClick={() => {
            setShowAddForm(!showAddForm);
            if (!newCollection && collections.length > 0) {
              setNewCollection(openFolder || collections[0].id);
            }
          }}
          className="px-4 py-1.5 text-xs font-semibold rounded-full bg-gray-900 text-white hover:bg-gray-700 transition-colors"
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
                시리즈
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

      {/* === Folder View (default) === */}
      {!openFolder && (
        <>
          {activeCollections.length === 0 && emptyCollections.length === 0 ? (
            <div className="text-center py-20 text-gray-400 text-sm">
              아직 저장한 레퍼런스가 없습니다
            </div>
          ) : (
            <div className="space-y-6">
              {/* Folders with items */}
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
                {activeCollections.map((c) => (
                  <FolderCard
                    key={c.id}
                    collection={c}
                    items={itemsByCollection[c.id] ?? []}
                    onClick={() => setOpenFolder(c.id)}
                  />
                ))}
              </div>

              {/* Empty folders */}
              {emptyCollections.length > 0 && (
                <div>
                  <div className="text-[10px] font-semibold text-gray-400 uppercase tracking-wider mb-3">
                    빈 시리즈
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {emptyCollections.map((c) => (
                      <button
                        key={c.id}
                        onClick={() => setOpenFolder(c.id)}
                        className="flex items-center gap-2 px-3 py-2 text-xs text-gray-400 border border-dashed border-gray-200 rounded-lg hover:border-gray-300 hover:text-gray-500 transition-colors"
                      >
                        <span
                          className="w-2.5 h-2.5 rounded-full opacity-50"
                          style={{ backgroundColor: c.color }}
                        />
                        {c.name}
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </>
      )}

      {/* === Folder Detail View === */}
      {openFolder && (
        <>
          {openFolderItems.length === 0 ? (
            <div className="text-center py-20 text-gray-400 text-sm">
              {openFolderCollection?.name ?? ""}에 저장한 레퍼런스가 없습니다
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {openFolderItems.map((item) => (
                <RefCard
                  key={item.id}
                  item={item}
                  onDelete={() => {
                    if (confirm("이 레퍼런스를 삭제할까요?")) deleteItem(item.id);
                  }}
                />
              ))}
            </div>
          )}
        </>
      )}
    </div>
  );
}

// --- FolderCard: 2x2 thumbnail grid preview ---

function FolderCard({
  collection,
  items,
  onClick,
}: {
  collection: RefCollection;
  items: RefItem[];
  onClick: () => void;
}) {
  // Pick up to 4 items for the 2x2 preview grid
  const previewItems = items.slice(0, 4);

  return (
    <button
      onClick={onClick}
      className="group text-left border border-gray-200 rounded-xl overflow-hidden bg-white hover:border-gray-300 hover:shadow-md transition-all"
    >
      {/* 2x2 Thumbnail Grid */}
      <div className="aspect-square grid grid-cols-2 grid-rows-2 gap-[1px] bg-gray-100">
        {previewItems.map((item) => (
          <div key={item.id} className="relative bg-gray-50 overflow-hidden">
            {item.thumbnailUrl ? (
              <img
                src={item.thumbnailUrl}
                alt=""
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center bg-gray-50 text-gray-300">
                <span className="text-lg">{platformIcon(item.platform)}</span>
              </div>
            )}
          </div>
        ))}
        {/* Fill empty slots */}
        {Array.from({ length: 4 - previewItems.length }).map((_, i) => (
          <div key={`empty-${i}`} className="bg-gray-50" />
        ))}
      </div>

      {/* Folder Info */}
      <div className="px-3 py-3">
        <div className="flex items-center gap-2 mb-0.5">
          <span
            className="w-2.5 h-2.5 rounded-full flex-shrink-0"
            style={{ backgroundColor: collection.color }}
          />
          <span className="text-sm font-bold text-gray-900 truncate">
            {collection.name}
          </span>
        </div>
        <div className="text-xs text-gray-400 pl-[18px]">
          {items.length}개
        </div>
      </div>
    </button>
  );
}

// --- RefCard (simplified for folder detail view) ---

function RefCard({
  item,
  onDelete,
}: {
  item: RefItem;
  onDelete: () => void;
}) {
  return (
    <div className="border border-gray-200 rounded-xl overflow-hidden bg-white hover:border-gray-300 transition-colors">
      {/* Preview */}
      {item.thumbnailUrl ? (
        <a href={item.url || undefined} target="_blank" rel="noopener noreferrer" className="block">
          <div className="w-full h-48 bg-gray-100">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={item.thumbnailUrl}
              alt=""
              className="w-full h-full object-cover"
            />
          </div>
        </a>
      ) : (
        <a
          href={item.url || undefined}
          target="_blank"
          rel="noopener noreferrer"
          className="block w-full h-32 bg-gray-50 flex items-center justify-center"
        >
          <div className="flex flex-col items-center justify-center h-full">
            <span className="text-2xl mb-1">{platformIcon(item.platform)}</span>
            <span className="text-[10px] text-gray-400">{platformLabel(item.platform)}</span>
          </div>
        </a>
      )}

      {/* Info */}
      <div className="p-4">
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
