"use client";

import { useState, useRef, useCallback, useEffect } from "react";

interface MoodboardImage {
  url: string;
  label?: string;
}

interface BrandMoodboardProps {
  images: MoodboardImage[];
  editMode?: boolean;
  clientSlug?: string;
  onSave?: (images: MoodboardImage[]) => void;
}

export default function BrandMoodboard({
  images,
  editMode = false,
  clientSlug = "huenic",
  onSave,
}: BrandMoodboardProps) {
  const [draft, setDraft] = useState<MoodboardImage[]>(images);
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Sync draft when images prop changes (e.g. after save)
  const prevImagesRef = useRef(images);
  if (images !== prevImagesRef.current) {
    prevImagesRef.current = images;
    setDraft(images);
  }

  const handleFileUpload = useCallback(
    async (files: FileList) => {
      setUploading(true);
      const newImages: MoodboardImage[] = [];

      for (const file of Array.from(files)) {
        if (!file.type.startsWith("image/")) continue;
        const formData = new FormData();
        formData.append("file", file);
        formData.append("client", clientSlug);

        try {
          const res = await fetch("/api/upload", { method: "POST", body: formData });
          if (res.ok) {
            const { url } = await res.json();
            newImages.push({ url, label: file.name.replace(/\.[^.]+$/, "") });
          }
        } catch {
          // skip failed uploads
        }
      }

      if (newImages.length > 0) {
        const updated = [...draft, ...newImages];
        setDraft(updated);
        onSave?.(updated);
      }
      setUploading(false);
    },
    [draft, onSave, clientSlug]
  );

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      if (e.dataTransfer.files.length > 0) {
        handleFileUpload(e.dataTransfer.files);
      }
    },
    [handleFileUpload]
  );

  const handlePaste = useCallback(
    async (e: ClipboardEvent) => {
      if (!editMode) return;
      const items = e.clipboardData?.items;
      if (!items) return;
      const imageFiles: File[] = [];
      for (const item of Array.from(items)) {
        if (item.type.startsWith("image/")) {
          const file = item.getAsFile();
          if (file) imageFiles.push(file);
        }
      }
      if (imageFiles.length === 0) return;
      e.preventDefault();
      const dt = new DataTransfer();
      imageFiles.forEach((f) => dt.items.add(f));
      handleFileUpload(dt.files);
    },
    [editMode, handleFileUpload]
  );

  useEffect(() => {
    if (!editMode) return;
    document.addEventListener("paste", handlePaste);
    return () => document.removeEventListener("paste", handlePaste);
  }, [editMode, handlePaste]);

  const handleRemove = useCallback(
    (idx: number) => {
      const updated = draft.filter((_, i) => i !== idx);
      setDraft(updated);
      onSave?.(updated);
    },
    [draft, onSave]
  );

  // View mode — no images
  if (images.length === 0 && !editMode) {
    return (
      <div className="border border-dashed border-gray-200 rounded-xl p-8 flex flex-col items-center justify-center text-center">
        <p className="text-sm text-gray-400 mb-1">비주얼 무드보드가 아직 없습니다</p>
        <p className="text-xs text-gray-300">편집 모드에서 레퍼런스 이미지를 추가하세요</p>
      </div>
    );
  }

  // Edit mode — drop zone + image grid
  if (editMode) {
    return (
      <div className="space-y-3">
        {/* Image grid with remove buttons */}
        {draft.length > 0 && (
          <div className="grid grid-cols-4 sm:grid-cols-6 gap-2">
            {draft.map((img, idx) => (
              <div
                key={idx}
                className="relative group aspect-square rounded-lg overflow-hidden border border-gray-200"
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={img.url}
                  alt={img.label || ""}
                  className="w-full h-full object-cover"
                />
                <button
                  onClick={() => handleRemove(idx)}
                  className="absolute top-1 right-1 w-5 h-5 bg-red-500 text-white rounded-full text-xs opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center"
                >
                  x
                </button>
                {img.label && (
                  <div className="absolute bottom-0 inset-x-0 bg-black/50 px-1 py-0.5">
                    <p className="text-[9px] text-white truncate">{img.label}</p>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}

        {/* Drop zone / upload area */}
        <div
          onDragOver={(e) => e.preventDefault()}
          onDrop={handleDrop}
          onClick={() => fileInputRef.current?.click()}
          className="border-2 border-dashed border-gray-200 rounded-xl p-6 flex flex-col items-center justify-center text-center cursor-pointer hover:border-gray-400 hover:bg-gray-50 transition-colors"
        >
          {uploading ? (
            <div className="flex items-center gap-2 text-gray-400">
              <svg
                className="animate-spin h-4 w-4"
                viewBox="0 0 24 24"
                fill="none"
              >
                <circle
                  className="opacity-25"
                  cx="12"
                  cy="12"
                  r="10"
                  stroke="currentColor"
                  strokeWidth="4"
                />
                <path
                  className="opacity-75"
                  fill="currentColor"
                  d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
                />
              </svg>
              <span className="text-sm">업로드 중...</span>
            </div>
          ) : (
            <>
              <svg
                className="w-8 h-8 text-gray-300 mb-2"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={1.5}
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M12 16v-8m0 0l-3 3m3-3l3 3M6.75 19.5a4.5 4.5 0 01-1.41-8.775 5.25 5.25 0 0110.338-2.32 3 3 0 013.438 3.42A3.75 3.75 0 0118 19.5H6.75z"
                />
              </svg>
              <p className="text-sm text-gray-400">
                이미지를 드래그하거나 클릭하여 업로드
              </p>
              <p className="text-xs text-gray-300 mt-1">
                여러 파일 동시 업로드 가능 · Ctrl+V 붙여넣기
              </p>
            </>
          )}
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            multiple
            className="hidden"
            onChange={(e) => {
              if (e.target.files && e.target.files.length > 0) {
                handleFileUpload(e.target.files);
                e.target.value = "";
              }
            }}
          />
        </div>
      </div>
    );
  }

  // View mode — with images (click to enlarge)
  return (
    <MoodboardViewGrid images={images} />
  );
}

function MoodboardViewGrid({ images }: { images: MoodboardImage[] }) {
  const [lightboxIdx, setLightboxIdx] = useState<number | null>(null);

  return (
    <>
      <p className="text-xs text-gray-400 mb-3">
        이미지를 클릭하면 크게 볼 수 있습니다
      </p>
      <div className="columns-2 sm:columns-3 gap-2 space-y-2">
        {images.map((img, idx) => (
          <div
            key={idx}
            className="relative rounded-lg overflow-hidden group break-inside-avoid cursor-pointer"
            onClick={() => setLightboxIdx(idx)}
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={img.url}
              alt={img.label || ""}
              className="w-full h-auto object-cover transition-transform group-hover:scale-[1.02]"
            />
            <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors" />
            {img.label && (
              <div className="absolute bottom-0 inset-x-0 bg-black/50 px-1.5 py-0.5 opacity-0 group-hover:opacity-100 transition-opacity">
                <p className="text-[10px] text-white truncate">{img.label}</p>
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Lightbox */}
      {lightboxIdx !== null && (
        <MoodboardLightbox
          images={images}
          startIdx={lightboxIdx}
          onClose={() => setLightboxIdx(null)}
        />
      )}
    </>
  );
}

function MoodboardLightbox({
  images,
  startIdx,
  onClose,
}: {
  images: MoodboardImage[];
  startIdx: number;
  onClose: () => void;
}) {
  const [idx, setIdx] = useState(startIdx);
  const overlayRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleKey(e: KeyboardEvent) {
      if (e.key === "Escape") onClose();
      if (e.key === "ArrowLeft" && idx > 0) setIdx(idx - 1);
      if (e.key === "ArrowRight" && idx < images.length - 1) setIdx(idx + 1);
    }
    document.addEventListener("keydown", handleKey);
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", handleKey);
      document.body.style.overflow = "";
    };
  }, [onClose, idx, images.length]);

  return (
    <div
      ref={overlayRef}
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4"
      onClick={(e) => { if (e.target === overlayRef.current) onClose(); }}
    >
      {/* Close */}
      <button
        onClick={onClose}
        className="absolute top-4 right-4 text-white/70 hover:text-white z-50"
      >
        <svg width="28" height="28" viewBox="0 0 24 24" fill="none">
          <path d="M6 6L18 18M18 6L6 18" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
        </svg>
      </button>

      {/* Counter */}
      <div className="absolute top-4 left-4 text-white/60 text-sm">
        {idx + 1} / {images.length}
      </div>

      {/* Image */}
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={images[idx].url}
        alt={images[idx].label || ""}
        className="max-w-full max-h-[85vh] object-contain rounded"
      />

      {/* Left arrow */}
      {idx > 0 && (
        <button
          onClick={(e) => { e.stopPropagation(); setIdx(idx - 1); }}
          className="absolute left-4 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center transition-colors"
        >
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none"><path d="M15 19l-7-7 7-7" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>
        </button>
      )}

      {/* Right arrow */}
      {idx < images.length - 1 && (
        <button
          onClick={(e) => { e.stopPropagation(); setIdx(idx + 1); }}
          className="absolute right-4 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center transition-colors"
        >
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none"><path d="M9 5l7 7-7 7" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>
        </button>
      )}

      {/* Label */}
      {images[idx].label && (
        <div className="absolute bottom-6 left-1/2 -translate-x-1/2 bg-black/60 text-white text-sm px-4 py-1.5 rounded-full">
          {images[idx].label}
        </div>
      )}
    </div>
  );
}
