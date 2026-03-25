"use client";

import { useState } from "react";
import type { WeeklyReport } from "@/data/huenic-types";

type CoachCommentData = NonNullable<WeeklyReport["coachComment"]>;

interface CoachCommentProps {
  comment: CoachCommentData | null;
  onSave: (comment: CoachCommentData) => void;
}

export default function CoachComment({ comment, onSave }: CoachCommentProps) {
  const [editing, setEditing] = useState(false);
  const [author, setAuthor] = useState(comment?.author ?? "");
  const [wellDone, setWellDone] = useState(comment?.wellDone ?? "");
  const [improvement, setImprovement] = useState(comment?.improvement ?? "");
  const [tryNext, setTryNext] = useState(comment?.tryNext ?? "");

  const handleSave = () => {
    onSave({
      author,
      wellDone,
      improvement,
      tryNext,
      createdAt: new Date().toISOString(),
    });
    setEditing(false);
  };

  const handleCancel = () => {
    setAuthor(comment?.author ?? "Green");
    setWellDone(comment?.wellDone ?? "");
    setImprovement(comment?.improvement ?? "");
    setTryNext(comment?.tryNext ?? "");
    setEditing(false);
  };

  if (editing) {
    return (
      <div className="bg-white border border-gray-200 rounded-xl p-5 space-y-4">
        <div>
          <label className="text-xs text-gray-500 block mb-1">작성자</label>
          <input
            type="text"
            value={author}
            onChange={(e) => setAuthor(e.target.value)}
            className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-gray-300"
          />
        </div>
        {[
          { icon: "\u2705", label: "\uc798\ud55c \uc810", value: wellDone, set: setWellDone },
          { icon: "\ud83d\udca1", label: "\uac1c\uc120\ud560 \uc810", value: improvement, set: setImprovement },
          { icon: "\ud83c\udfaf", label: "\uc2dc\ub3c4\ud574\ubcfc \uac83", value: tryNext, set: setTryNext },
        ].map((field) => (
          <div key={field.label}>
            <label className="text-xs text-gray-500 block mb-1">
              {field.icon} {field.label}
            </label>
            <textarea
              value={field.value}
              onChange={(e) => field.set(e.target.value)}
              rows={3}
              className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm text-gray-900 resize-none focus:outline-none focus:ring-2 focus:ring-gray-300"
            />
          </div>
        ))}
        <div className="flex justify-end gap-2">
          <button
            onClick={handleCancel}
            className="px-4 py-2 text-sm text-gray-500 border border-gray-200 rounded-lg hover:bg-gray-50"
          >
            취소
          </button>
          <button
            onClick={handleSave}
            className="px-4 py-2 text-sm text-white bg-gray-900 rounded-lg hover:bg-gray-800"
          >
            저장
          </button>
        </div>
      </div>
    );
  }

  if (!comment) {
    return (
      <div className="bg-white border border-gray-200 rounded-xl p-6 flex flex-col items-center justify-center text-center">
        <p className="text-sm text-gray-400 mb-3">아직 코멘트가 없습니다</p>
        <button
          onClick={() => setEditing(true)}
          className="px-4 py-2 text-sm text-white bg-gray-900 rounded-lg hover:bg-gray-800"
        >
          작성하기
        </button>
      </div>
    );
  }

  return (
    <div className="bg-white border border-gray-200 rounded-xl p-5 space-y-3">
      {[
        { icon: "\u2705", label: "\uc798\ud55c \uc810", text: comment.wellDone },
        { icon: "\ud83d\udca1", label: "\uac1c\uc120\ud560 \uc810", text: comment.improvement },
        { icon: "\ud83c\udfaf", label: "\uc2dc\ub3c4\ud574\ubcfc \uac83", text: comment.tryNext },
      ].map((section) => (
        <div key={section.label}>
          <p className="text-xs font-medium text-gray-500 mb-1">
            {section.icon} {section.label}
          </p>
          <p className="text-sm text-gray-900 whitespace-pre-wrap">{section.text}</p>
        </div>
      ))}
      <div className="flex items-center justify-between pt-2 border-t border-gray-100">
        <p className="text-xs text-gray-400">by {comment.author}</p>
        <button
          onClick={() => setEditing(true)}
          className="text-xs text-gray-500 hover:text-gray-700 underline"
        >
          수정
        </button>
      </div>
    </div>
  );
}
