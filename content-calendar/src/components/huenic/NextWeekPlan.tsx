"use client";

import { useState } from "react";

interface NextWeekPlanProps {
  plans: string[];
  onSave: (plans: string[]) => void;
}

export default function NextWeekPlan({ plans, onSave }: NextWeekPlanProps) {
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState<string[]>(plans);

  const handleEdit = () => {
    setDraft(plans.length > 0 ? [...plans] : [""]);
    setEditing(true);
  };

  const handleSave = () => {
    const cleaned = draft.map((p) => p.trim()).filter(Boolean);
    onSave(cleaned);
    setEditing(false);
  };

  const handleCancel = () => {
    setDraft([...plans]);
    setEditing(false);
  };

  const updateItem = (index: number, value: string) => {
    const next = [...draft];
    next[index] = value;
    setDraft(next);
  };

  const addItem = () => setDraft([...draft, ""]);

  const removeItem = (index: number) => {
    setDraft(draft.filter((_, i) => i !== index));
  };

  if (editing) {
    return (
      <div className="bg-white border border-gray-200 rounded-xl p-5 space-y-3">
        {draft.map((item, i) => (
          <div key={i} className="flex items-center gap-2">
            <input
              type="text"
              value={item}
              onChange={(e) => updateItem(i, e.target.value)}
              placeholder="계획을 입력하세요"
              className="flex-1 border border-gray-200 rounded-lg px-3 py-2 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-gray-300"
            />
            <button
              onClick={() => removeItem(i)}
              className="text-gray-400 hover:text-red-500 text-lg leading-none px-1"
              aria-label="삭제"
            >
              &times;
            </button>
          </div>
        ))}
        <button
          onClick={addItem}
          className="text-xs text-gray-500 hover:text-gray-700 underline"
        >
          + 항목 추가
        </button>
        <div className="flex justify-end gap-2 pt-2">
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

  if (!plans || plans.length === 0) {
    return (
      <div className="bg-white border border-gray-200 rounded-xl p-6 flex flex-col items-center justify-center text-center">
        <p className="text-sm text-gray-400 mb-3">다음 주 계획이 없습니다</p>
        <button
          onClick={handleEdit}
          className="px-4 py-2 text-sm text-white bg-gray-900 rounded-lg hover:bg-gray-800"
        >
          작성하기
        </button>
      </div>
    );
  }

  return (
    <div className="bg-white border border-gray-200 rounded-xl p-5">
      <ul className="space-y-2">
        {plans.map((plan, i) => (
          <li key={i} className="flex items-start gap-2 text-sm text-gray-900">
            <span className="text-gray-400 mt-0.5">&#8226;</span>
            <span>{plan}</span>
          </li>
        ))}
      </ul>
      <div className="flex justify-end pt-3">
        <button
          onClick={handleEdit}
          className="text-xs text-gray-500 hover:text-gray-700 underline"
        >
          수정
        </button>
      </div>
    </div>
  );
}
