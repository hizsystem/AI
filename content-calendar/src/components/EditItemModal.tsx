"use client";

import { useState, useEffect, useRef } from "react";
import { upload } from "@vercel/blob/client";
import type { ContentItem, Category, ContentStatus } from "@/data/types";

interface EditItemModalProps {
  item: ContentItem | null; // null = new item
  categories: Category[];
  defaultDate?: string;
  onSave: (item: ContentItem) => void;
  onDelete?: (id: string) => void;
  onClose: () => void;
  clientId?: string;
}

const STATUS_OPTIONS: { value: ContentStatus; label: string }[] = [
  { value: "planning", label: "기획" },
  { value: "needs-confirm", label: "컨펌 필요" },
  { value: "uploaded", label: "업로드 완료" },
];

export default function EditItemModal({
  item,
  categories,
  defaultDate,
  onSave,
  onDelete,
  onClose,
  clientId = "default",
}: EditItemModalProps) {
  const overlayRef = useRef<HTMLDivElement>(null);
  const formRef = useRef<HTMLFormElement>(null);
  const isNew = !item;

  const [title, setTitle] = useState(item?.title ?? "");
  const [date, setDate] = useState(item?.date ?? defaultDate ?? "");
  const [category, setCategory] = useState(item?.category ?? categories[0]?.id ?? "");
  const [status, setStatus] = useState<ContentStatus>(item?.status ?? "planning");
  const [format, setFormat] = useState(item?.overview?.format ?? "");
  const [caption, setCaption] = useState(item?.overview?.caption ?? "");
  const [hashtags, setHashtags] = useState(item?.overview?.hashtags?.join(" ") ?? "");
  const [mentions, setMentions] = useState(item?.overview?.mentions?.join(" ") ?? "");
  const [videoUrl, setVideoUrl] = useState(item?.overview?.videoUrl ?? "");
  const [notes, setNotes] = useState(item?.overview?.notes ?? "");
  const [images, setImages] = useState<string[]>(item?.overview?.images ?? []);
  const [localVideo, setLocalVideo] = useState(item?.overview?.localVideo ?? "");
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const imageInputRef = useRef<HTMLInputElement>(null);
  const videoInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      if (e.key === "Escape") onClose();
    }
    document.addEventListener("keydown", handleKeyDown);
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", handleKeyDown);
      document.body.style.overflow = "";
    };
  }, [onClose]);

  async function uploadFile(file: File): Promise<string> {
    const formData = new FormData();
    formData.append("file", file);
    formData.append("client", clientId);
    const res = await fetch("/api/upload", { method: "POST", body: formData });
    if (!res.ok) throw new Error("Upload failed");
    const { url } = await res.json();
    return url;
  }

  async function handleImageUpload(files: FileList | null) {
    if (!files || files.length === 0) return;
    setUploading(true);
    try {
      const urls: string[] = [];
      for (const file of Array.from(files)) {
        const url = await uploadFile(file);
        urls.push(url);
      }
      setImages((prev) => [...prev, ...urls]);
    } catch (e) {
      console.error("Image upload error:", e);
    } finally {
      setUploading(false);
    }
  }

  async function handleVideoUpload(files: FileList | null) {
    if (!files || files.length === 0) return;
    const file = files[0];
    setUploading(true);
    setUploadProgress(0);
    try {
      // Client-side direct upload — bypasses 4.5MB serverless limit
      const timestamp = Date.now();
      const safeName = file.name
        .replace(/[^a-zA-Z0-9가-힣._-]/g, "_")
        .replace(/_{2,}/g, "_");
      const blob = await upload(
        `uploads/${clientId}/${timestamp}-${safeName}`,
        file,
        {
          access: "public",
          handleUploadUrl: "/api/upload/client-token",
          onUploadProgress: ({ percentage }) => {
            setUploadProgress(Math.round(percentage));
          },
        }
      );
      setLocalVideo(blob.url);
    } catch (e) {
      console.error("Video upload error:", e);
      const msg = e instanceof Error ? e.message : "영상 업로드 실패";
      alert(`영상 업로드 실패: ${msg}`);
    } finally {
      setUploading(false);
      setUploadProgress(0);
    }
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!title.trim() || !date) return;

    const result: ContentItem = {
      id: item?.id ?? `content-${Date.now()}`,
      date,
      title: title.trim(),
      category,
      status,
      overview: {
        format: format || undefined,
        caption: caption || undefined,
        hashtags: hashtags.trim()
          ? hashtags.split(/\s+/).filter(Boolean)
          : undefined,
        mentions: mentions.trim()
          ? mentions.split(/\s+/).filter(Boolean)
          : undefined,
        videoUrl: videoUrl || undefined,
        notes: notes || undefined,
        images: images.length > 0 ? images : undefined,
        localVideo: localVideo || undefined,
        captionAlts: item?.overview?.captionAlts,
      },
    };
    onSave(result);
  }

  const selectedCat = categories.find((c) => c.id === category);

  return (
    <div
      ref={overlayRef}
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4"
      onClick={(e) => {
        if (e.target === overlayRef.current) onClose();
      }}
    >
      <div className="bg-white rounded-xl shadow-2xl max-w-[560px] w-full max-h-[85vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between">
          <h2 className="text-lg font-bold text-gray-900">
            {isNew ? "콘텐츠 추가" : "콘텐츠 수정"}
          </h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
              <path d="M6 6L18 18M18 6L6 18" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
            </svg>
          </button>
        </div>

        {/* Form */}
        <form ref={formRef} onSubmit={handleSubmit} className="flex-1 overflow-y-auto px-6 py-4 space-y-4">
          {/* Title */}
          <div>
            <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1">
              제목 *
            </label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="콘텐츠 제목"
              className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-transparent"
              required
              autoFocus
            />
          </div>

          {/* Date + Category + Status row */}
          <div className="grid grid-cols-3 gap-3">
            <div>
              <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1">
                날짜 *
              </label>
              <input
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-400"
                required
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1">
                시리즈
              </label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-400"
                style={{
                  borderLeftColor: selectedCat?.color,
                  borderLeftWidth: "3px",
                }}
              >
                {categories.map((cat) => (
                  <option key={cat.id} value={cat.id}>
                    {cat.name}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1">
                상태
              </label>
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value as ContentStatus)}
                className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-400"
              >
                {STATUS_OPTIONS.map((opt) => (
                  <option key={opt.value} value={opt.value}>
                    {opt.label}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Format */}
          <div>
            <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1">
              포맷
            </label>
            <div className="flex flex-wrap gap-2">
              {[
                { value: "영상(릴스)", label: "영상(릴스)" },
                { value: "피드(캐러셀)", label: "피드(캐러셀)" },
                { value: "피드(단일이미지)", label: "피드(단일이미지)" },
                { value: "스토리(단일)", label: "스토리(단일)" },
              ].map((opt) => (
                <button
                  key={opt.value}
                  type="button"
                  onClick={() => setFormat(format === opt.value ? "" : opt.value)}
                  className={`px-3 py-1.5 rounded-lg text-sm font-medium border transition-colors ${
                    format === opt.value
                      ? "bg-gray-900 text-white border-gray-900"
                      : "bg-white text-gray-600 border-gray-200 hover:border-gray-400"
                  }`}
                >
                  {opt.label}
                </button>
              ))}
            </div>
          </div>

          {/* Media Upload */}
          <div>
            <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">
              미디어
            </label>

            {/* Existing images */}
            {images.length > 0 && (
              <div className="flex flex-wrap gap-2 mb-3">
                {images.map((img, i) => (
                  <div key={i} className="relative group w-20 h-20 rounded-lg overflow-hidden border border-gray-200">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={img} alt={`이미지 ${i + 1}`} className="w-full h-full object-cover" />
                    <button
                      type="button"
                      onClick={() => setImages((prev) => prev.filter((_, idx) => idx !== i))}
                      className="absolute top-0.5 right-0.5 w-5 h-5 bg-black/60 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      <svg width="10" height="10" viewBox="0 0 10 10" fill="none">
                        <path d="M2 2l6 6M8 2l-6 6" stroke="white" strokeWidth="1.5" strokeLinecap="round"/>
                      </svg>
                    </button>
                  </div>
                ))}
              </div>
            )}

            {/* Existing video */}
            {localVideo && (
              <div className="mb-3 flex items-center gap-2 px-3 py-2 bg-gray-50 rounded-lg border border-gray-200">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" className="text-gray-400 flex-shrink-0">
                  <rect x="2" y="4" width="20" height="16" rx="2" stroke="currentColor" strokeWidth="1.5"/>
                  <path d="M10 9l5 3-5 3V9z" fill="currentColor"/>
                </svg>
                <span className="text-xs text-gray-500 truncate flex-1">{localVideo}</span>
                <button
                  type="button"
                  onClick={() => setLocalVideo("")}
                  className="text-gray-300 hover:text-red-400 flex-shrink-0"
                >
                  <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                    <path d="M3 3l8 8M11 3l-8 8" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
                  </svg>
                </button>
              </div>
            )}

            {/* Upload buttons */}
            <div className="flex gap-2">
              <input
                ref={imageInputRef}
                type="file"
                accept="image/*"
                multiple
                className="hidden"
                onChange={(e) => handleImageUpload(e.target.files)}
              />
              <button
                type="button"
                onClick={() => imageInputRef.current?.click()}
                disabled={uploading}
                className="flex items-center gap-1.5 px-3 py-2 border border-dashed border-gray-300 rounded-lg text-xs text-gray-500 hover:border-blue-400 hover:text-blue-500 hover:bg-blue-50/50 transition-colors disabled:opacity-50"
              >
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
                  <rect x="3" y="3" width="18" height="18" rx="2" stroke="currentColor" strokeWidth="1.5"/>
                  <circle cx="8.5" cy="8.5" r="1.5" fill="currentColor"/>
                  <path d="M21 15l-5-5L5 21" stroke="currentColor" strokeWidth="1.5"/>
                </svg>
                이미지 추가
              </button>
              <input
                ref={videoInputRef}
                type="file"
                accept="video/*"
                className="hidden"
                onChange={(e) => handleVideoUpload(e.target.files)}
              />
              <button
                type="button"
                onClick={() => videoInputRef.current?.click()}
                disabled={uploading || !!localVideo}
                className="flex items-center gap-1.5 px-3 py-2 border border-dashed border-gray-300 rounded-lg text-xs text-gray-500 hover:border-blue-400 hover:text-blue-500 hover:bg-blue-50/50 transition-colors disabled:opacity-50"
              >
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
                  <rect x="2" y="4" width="20" height="16" rx="2" stroke="currentColor" strokeWidth="1.5"/>
                  <path d="M10 9l5 3-5 3V9z" fill="currentColor"/>
                </svg>
                영상 추가
              </button>
            </div>
            {uploading && (
              <div className="mt-2 space-y-1">
                <div className="flex items-center gap-2 text-xs text-blue-500">
                  <svg className="animate-spin h-3 w-3" viewBox="0 0 24 24" fill="none">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/>
                  </svg>
                  업로드 중...{uploadProgress > 0 && ` ${uploadProgress}%`}
                </div>
                {uploadProgress > 0 && (
                  <div className="w-full h-1.5 bg-gray-100 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-blue-500 rounded-full transition-all duration-300"
                      style={{ width: `${uploadProgress}%` }}
                    />
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Caption */}
          <div>
            <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1">
              캡션
            </label>
            <textarea
              value={caption}
              onChange={(e) => setCaption(e.target.value)}
              placeholder="인스타그램 캡션 시안..."
              rows={5}
              className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-400 resize-y"
            />
          </div>

          {/* Hashtags */}
          <div>
            <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1">
              해시태그 <span className="text-gray-400 font-normal normal-case">(공백으로 구분)</span>
            </label>
            <input
              type="text"
              value={hashtags}
              onChange={(e) => setHashtags(e.target.value)}
              placeholder="#탭샵바 #와인바 #셀프탭"
              className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-400"
            />
          </div>

          {/* Mentions */}
          <div>
            <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1">
              멘션 <span className="text-gray-400 font-normal normal-case">(공백으로 구분)</span>
            </label>
            <input
              type="text"
              value={mentions}
              onChange={(e) => setMentions(e.target.value)}
              placeholder="@계정명"
              className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-400"
            />
          </div>

          {/* Video URL */}
          <div>
            <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1">
              영상 URL
            </label>
            <input
              type="url"
              value={videoUrl}
              onChange={(e) => setVideoUrl(e.target.value)}
              placeholder="https://youtube.com/... 또는 https://instagram.com/reel/..."
              className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-400"
            />
          </div>

          {/* Notes */}
          <div>
            <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1">
              메모
            </label>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="내부 참고 사항..."
              rows={2}
              className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-400 resize-y"
            />
          </div>
        </form>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-gray-100 flex items-center justify-between">
          <div>
            {!isNew && onDelete && (
              <>
                {showDeleteConfirm ? (
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-red-500">정말 삭제?</span>
                    <button
                      type="button"
                      onClick={() => onDelete(item!.id)}
                      className="px-3 py-1.5 text-xs font-medium text-white bg-red-500 rounded-lg hover:bg-red-600"
                    >
                      삭제
                    </button>
                    <button
                      type="button"
                      onClick={() => setShowDeleteConfirm(false)}
                      className="px-3 py-1.5 text-xs font-medium text-gray-500 hover:text-gray-700"
                    >
                      취소
                    </button>
                  </div>
                ) : (
                  <button
                    type="button"
                    onClick={() => setShowDeleteConfirm(true)}
                    className="px-3 py-1.5 text-xs font-medium text-red-400 hover:text-red-600 transition-colors"
                  >
                    삭제
                  </button>
                )}
              </>
            )}
          </div>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-sm text-gray-500 hover:text-gray-700"
            >
              취소
            </button>
            <button
              type="button"
              onClick={() => formRef.current?.requestSubmit()}
              className="px-5 py-2 text-sm font-medium text-white bg-blue-500 rounded-lg hover:bg-blue-600 transition-colors"
            >
              {isNew ? "추가" : "저장"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
