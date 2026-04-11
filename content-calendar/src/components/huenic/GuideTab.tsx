"use client";

import { useState, useEffect } from "react";
import type { HuenicBrand } from "@/data/huenic-types";

interface GuideTabProps {
  brand: HuenicBrand;
}

interface SeriesGuide {
  id: string;
  name: string;
  color: string;
  hook: string;
  concern: string;
  oneLiner: string;
  role: string;
  reference: string;
  referenceDetail: string;
  visual: string[];
  examples: string[];
  frequency: string;
  format: string;
  spinoff?: { name: string; items: string[] };
  doNot?: string[];
}

const VEGGIET_KEY_MESSAGE = "매일 먹어도 속 편한, 식물성 프로틴의 기준";

const VEGGIET_SERIES: SeriesGuide[] = [
  {
    id: "vegieter",
    name: "이달의 베지어터",
    color: "#10b981",
    hook: "\"나랑 비슷한 사람이 먹네\" — 진입 장벽을 없애는 가장 강력한 한 마디",
    concern: "식물성 프로틴? 운동하는 사람만 먹는 거 아냐?",
    oneLiner: "나와 비슷한 사람이 베지어트를 먹는 이유",
    role: "발견 + 설득",
    reference: "29CM_HOME",
    referenceDetail: "일상 공간, 자연광, 진짜 사람. 인플루언서 릴스에 브랜드 인트로를 붙여 재가공하는 포맷.",
    visual: [
      "인플루언서 콘텐츠를 섬네일과 인트로를 붙여서 재가공",
      "일상 공간에서 제품을 자연스럽게 사용하는 실사",
      "인트로에 화면 캡처 + 브랜드 텍스트 붙여 업로드",
    ],
    examples: [
      "러너 지은 씨의 아침 루틴 — 5km 전 한 스쿱",
      "필라테스 강사 수진 씨가 식물성 프로틴을 고르는 기준",
      "두 아이를 키우는 지혜 씨가 베지어트를 냉장고 1번 칸에 두는 이유",
    ],
    frequency: "월 1회",
    format: "릴스 (인플루언서 콘텐츠 재가공)",
  },
  {
    id: "lab",
    name: "VEGGIET LAB",
    color: "#3b82f6",
    hook: "베지어트를 만들기 위한 스토리에 감동!",
    concern: "프로틴 성분표 보면 다 비슷한데, 뭐가 다른 거야?",
    oneLiner: "이 한 스쿱이 만들어지기까지",
    role: "신뢰 (유지)",
    reference: "Sweetgreen",
    referenceDetail: "\"식재료가 히어로\". 단색 배경에 원재료 누끼를 크게 올리고, 타이포그래피로 스토리를 전달.",
    visual: [
      "단색 배경에 원재료 누끼를 크게 올리고 타이포그래피로 스토리 전달",
      "성분 나열이 아니라 \"재료 자체가 말하는\" 방식",
      "식재료 히어로 샷 — 서리태, 동결건조 딸기 클로즈업",
    ],
    examples: [
      "서리태는 어디서 오는가 — 원료 산지 기록",
      "딸기 프로틴이 탄생하기까지 — 개발 237일 비하인드",
      "동결건조 딸기 23%, 원가 감당 안 된다고 모두가 말렸지만",
    ],
    frequency: "월 1회",
    format: "캐러셀 (섬네일 + 내용 + 브랜드 메시지)",
    doNot: [
      "성분표 나열 X → 장면으로 보여준다",
      "\"우리 깨끗해요\" 직접 말하기 X",
    ],
  },
  {
    id: "attack",
    name: "베지어택!",
    color: "#f59e0b",
    hook: "베지어트를 처음 먹어본 사람들의 찐반응 콘텐츠",
    concern: "식물성이라 비리거나 맛없으면 어쩌지...",
    oneLiner: "베지어트를 처음 먹는 사람들을 찾아 떠나는 서프라이즈 방문기",
    role: "발견 + 설득",
    reference: "수업 후기 릴스 + 반응 편집",
    referenceDetail: "시딩 현장(요가원, 필라테스)에서 자연스럽게 포착. 섭의 부담 없이 현장에서 \"처음 먹어봤어요\" 반응.",
    visual: [
      "시딩 현장(요가원·필라테스 원데이 클래스)에서 포착",
      "수업 후기 릴스 + \"처음 먹어봤어요\" 반응 편집 포맷",
      "섭의 부담 없이 현장에서 자연스럽게 포착",
    ],
    examples: [
      "프사오에 등장한 베지어트",
      "한강 러닝크루에 찾아간 베지어트",
      "요가센터에서 처음 마셔본 베지어트",
    ],
    frequency: "월 1회",
    format: "릴스",
  },
  {
    id: "my",
    name: "MY VEGGIET",
    color: "#f97316",
    hook: "나만의 베지어트 레시피 공유하는 콘텐츠",
    concern: "물에 타면 밋밋한데, 맛있게 먹는 방법 없나?",
    oneLiner: "\"이렇게 먹으면 맛있어요\"가 아니라 \"이렇게 먹고 있어요\"",
    role: "발견",
    reference: "탑뷰 레시피 릴스",
    referenceDetail: "식욕 자극 소리(얼음, 세이커, 따르는 소리) + 속도감 있는 편집. 빠른 호흡의 탑뷰/사이드뷰.",
    visual: [
      "탑뷰 레시피 릴스. 재료 준비 → 계량 → 혼합 → 완성 시퀀스",
      "얼음 소리·세이커 소리·따르는 소리가 살아있는 편집",
      "빠른 호흡의 탑뷰/사이드뷰 레시피 영상",
    ],
    examples: [
      "얼죽아 미숫가루 라떼 — 예랑님 실제 루틴 (바이럴 가능)",
      "아침 5분 프로틴 볼 — 오트밀+서리태+과일 (저장 유도)",
      "딸기 프로틴 스무디 — 신제품 연계 레시피",
    ],
    frequency: "월 1회",
    format: "릴스 (30~60초, 탑뷰/사이드뷰)",
  },
  {
    id: "moment",
    name: "VEGGIET MOMENT",
    color: "#8b5cf6",
    hook: "베지어트와 함께 보내는 일상을 포착!",
    concern: "매일 먹긴 하는데, 이걸 계속 먹어야 하나...",
    oneLiner: "베지어트가 있는 일상의 한 장면",
    role: "설득 (쇼룸)",
    reference: "인스타 스토리 컨셉",
    referenceDetail: "자연스러운 사진 + 스토리 텍스트 박스, 꾸밈요소. 재봉틀 디테일로 피드 그리드의 톤을 지키는 앵커.",
    visual: [
      "자연스러운 사진 + 인스타 스토리 텍스트 박스, 꾸밈요소",
      "사진 상단에 인스타 스토리처럼 재봉틀 디테일",
      "피드 그리드의 톤을 지키는 앵커 역할",
    ],
    examples: [
      "미팅 많은 월요일의 VEGGIET MOMENT",
      "운동으로 시작하는 하루, 오늘의 베지어트 모먼트는?",
      "온전히 나를 위한 주말 속 베지어트",
    ],
    frequency: "월 1회",
    format: "피드 캐러셀 (인스타 스토리 컨셉)",
    doNot: [
      "\"단백질 20g\" 숫자 소구 X → 장면이 설득한다",
    ],
  },
  {
    id: "interview",
    name: "베지터뷰",
    color: "#ec4899",
    hook: "베지어트를 만든 많은 사람들(대표님, 직원, 고객)의 인터뷰",
    concern: "요즘 프로틴 브랜드 너무 많은데, 여긴 뭐가 다른 거야?",
    oneLiner: "베지어트를 만든 사람들, 베지어트와 만난 사람들",
    role: "유지 (팬덤)",
    reference: "네이버 오프 더 레코드",
    referenceDetail: "동일 질문을 여러 사람에게 빠르게 편집. 예상 밖 답변이 보는 재미. 글로벌 버전 응용 가능.",
    visual: [
      "동일 질문을 여러 사람에게 던져 다양한 반응을 빠르게 편집",
      "예상 밖 답변이 보는 재미를 만든다",
      "대표님 → 직원 → 고객으로 확장",
    ],
    examples: [
      "최애맛 인터뷰",
      "신상품 출시하면서 에피소드",
      "길터뷰 — 베지어트를 고른 고객님 (\"왜 고르셨나요?\")",
    ],
    frequency: "격월 1회",
    format: "릴스 (인터뷰 릴스)",
    spinoff: {
      name: "길터뷰",
      items: [
        "올리브베러 강남점 오픈 기념 바이럴 콘텐츠",
        "외국인 타겟으로 섭외하여 타겟 확장",
        "고객님 인터뷰 (\"왜 고르셨나요?\")",
        "인터뷰 응해주면 1박스 증정!",
      ],
    },
  },
  {
    id: "lets",
    name: "Let's Veggiet",
    color: "#ef4444",
    hook: "브랜드의 다양한 활동을 보여주는 스케치 콘텐츠",
    concern: "이 브랜드 진짜 제대로 하는 곳이야?",
    oneLiner: "브랜드의 다양한 활동을 보여주는 스케치 콘텐츠",
    role: "발견 + 확산",
    reference: "현장감 스케치 영상",
    referenceDetail: "편집 과하지 않게. 실제 현장 에너지를 담는 방식. 대표님이 직접 뛰는 브랜드라는 신뢰감.",
    visual: [
      "브랜드 외부 활동 현장감 스케치",
      "지나치게 편집된 느낌 없이 실제 현장 에너지를 담는 방식",
    ],
    examples: [
      "고벤처포럼",
      "해외 팝업",
      "공장 및 재료 산지 방문",
    ],
    frequency: "행사 시",
    format: "릴스",
  },
  {
    id: "event",
    name: "SNS 이벤트",
    color: "#14b8a6",
    hook: "트렌디한 아이디어를 이벤트에 접목시켜 채널 확장",
    concern: "팔로우만 하고 있는데, 참여할 만한 게 없네",
    oneLiner: "트렌디한 아이디어를 이벤트에 접목시켜 채널 확장",
    role: "확장",
    reference: "트렌디한 SNS 콘텐츠",
    referenceDetail: "브랜드 무드를 해치지 않는 선에서의 트렌디함. 이벤트를 통한 채널 확장은 필수!",
    visual: [
      "트렌디한 SNS 콘텐츠를 가져와서 접목",
      "이벤트를 통한 채널 확장은 필수!",
    ],
    examples: [
      "신제품 출시 기념 딸기 이모지 댓글 이벤트",
      "이번 여름 시원하게 먹으면 맛있는 베지어트 맛은 무엇?",
    ],
    frequency: "월 1회",
    format: "피드 or 릴스 (이벤트 성격에 따라)",
  },
];

const VINKER_KEY_MESSAGE = "Chick'n for all.";

const VINKER_SERIES: SeriesGuide[] = [
  {
    id: "retail",
    name: "Retail & Demo",
    color: "#10b981",
    hook: "Where to find VINKER in Canada",
    concern: "Where can I buy this?",
    oneLiner: "입점 매장 소식과 데모 현장",
    role: "전환",
    reference: "200% 북미 감성",
    referenceDetail: "매장 현장 사진, 데모 시연 영상, 인플루언서 방문 콘텐츠",
    visual: ["매장 현장 사진", "데모 시연 영상", "인플루언서 방문 콘텐츠"],
    examples: ["Community Natural Foods 입점 소식", "밴쿠버 데모 현장"],
    frequency: "수시",
    format: "피드/릴스",
  },
  {
    id: "collab",
    name: "Collab & Giveaway",
    color: "#3b82f6",
    hook: "Community-driven brand collaborations",
    concern: "Is this brand legit?",
    oneLiner: "월 1회 브랜드 콜라보 + 트래픽 광고",
    role: "발견 + 확산",
    reference: "캐주얼, 커뮤니티 중심",
    referenceDetail: "콜라보 브랜드와의 합동 비주얼, Giveaway 안내 그래픽",
    visual: ["콜라보 브랜드와의 합동 비주얼", "Giveaway 안내 그래픽"],
    examples: ["로컬 브랜드 콜라보 giveaway"],
    frequency: "월 1회",
    format: "피드/릴스",
  },
  {
    id: "content",
    name: "Content",
    color: "#f97316",
    hook: "Taste it, see it, try it",
    concern: "What does this taste like?",
    oneLiner: "직접 릴스 소스 확보, 북미 감성 콘텐츠",
    role: "발견",
    reference: "북미 푸드 콘텐츠",
    referenceDetail: "밝고 에너지 있는 톤. 밝은 조명, 캐주얼 세팅, 실제 조리/시식 장면",
    visual: ["밝은 조명", "캐주얼 세팅", "실제 조리/시식 장면"],
    examples: ["빙커 치킨으로 만든 간단 레시피", "시식 리액션"],
    frequency: "월 2~3회",
    format: "릴스 중심",
  },
];

type GuideField = "hook" | "concern" | "oneLiner" | "reference" | "referenceDetail" | "format" | "frequency";

function EditableText({
  value,
  editing,
  onChange,
  className,
  multiline,
}: {
  value: string;
  editing: boolean;
  onChange: (v: string) => void;
  className?: string;
  multiline?: boolean;
}) {
  if (!editing) return <span className={className}>{value}</span>;
  if (multiline) {
    return (
      <textarea
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className={`${className} w-full bg-white border border-blue-300 rounded px-1.5 py-1 focus:outline-none focus:ring-1 focus:ring-blue-400 resize-none`}
        rows={2}
      />
    );
  }
  return (
    <input
      value={value}
      onChange={(e) => onChange(e.target.value)}
      className={`${className} w-full bg-white border border-blue-300 rounded px-1.5 py-0.5 focus:outline-none focus:ring-1 focus:ring-blue-400`}
    />
  );
}

export default function GuideTab({ brand }: GuideTabProps) {
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [editMode, setEditMode] = useState(false);
  const [saving, setSaving] = useState(false);
  const [seriesData, setSeriesData] = useState<SeriesGuide[]>(
    brand === "veggiet" ? VEGGIET_SERIES : VINKER_SERIES
  );
  const [km, setKm] = useState(
    brand === "veggiet" ? VEGGIET_KEY_MESSAGE : VINKER_KEY_MESSAGE
  );
  const [loaded, setLoaded] = useState(false);

  // Load from API on mount
  useEffect(() => {
    fetch(`/api/huenic/${brand}/guide`)
      .then((r) => r.json())
      .then((data) => {
        if (data && data.series && data.series.length > 0) {
          setSeriesData(data.series);
          if (data.keyMessage) setKm(data.keyMessage);
        }
        setLoaded(true);
      })
      .catch(() => setLoaded(true));
  }, [brand]);

  const updateField = (id: string, field: GuideField, value: string) => {
    setSeriesData((prev) =>
      prev.map((s) => (s.id === id ? { ...s, [field]: value } : s))
    );
  };

  const updateVisual = (id: string, idx: number, value: string) => {
    setSeriesData((prev) =>
      prev.map((s) =>
        s.id === id
          ? { ...s, visual: s.visual.map((v, i) => (i === idx ? value : v)) }
          : s
      )
    );
  };

  const updateExample = (id: string, idx: number, value: string) => {
    setSeriesData((prev) =>
      prev.map((s) =>
        s.id === id
          ? { ...s, examples: s.examples.map((e, i) => (i === idx ? value : e)) }
          : s
      )
    );
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      await fetch(`/api/huenic/${brand}/guide`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ brand, keyMessage: km, series: seriesData }),
      });
      setEditMode(false);
    } catch {
      alert("저장에 실패했습니다");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="mt-6">
      {/* Edit toggle */}
      <div className="flex justify-end mb-4">
        {editMode ? (
          <div className="flex gap-2">
            <button
              onClick={() => setEditMode(false)}
              className="px-3 py-1.5 text-xs text-gray-500 border border-gray-200 rounded-lg hover:bg-gray-50"
            >
              취소
            </button>
            <button
              onClick={handleSave}
              disabled={saving}
              className="px-3 py-1.5 text-xs text-white bg-blue-500 rounded-lg hover:bg-blue-600 disabled:opacity-50"
            >
              {saving ? "저장 중..." : "저장"}
            </button>
          </div>
        ) : (
          <button
            onClick={() => setEditMode(true)}
            className="px-3 py-1.5 text-xs text-gray-500 border border-gray-200 rounded-lg hover:bg-gray-50"
          >
            수정
          </button>
        )}
      </div>

      {/* Key Message */}
      <div className="mb-8 p-4 sm:p-6 rounded-2xl bg-gray-50 border border-gray-100">
        <p className="text-[10px] font-bold tracking-widest text-gray-400 uppercase mb-2">
          Key Message
        </p>
        {editMode ? (
          <input
            value={km}
            onChange={(e) => setKm(e.target.value)}
            className="text-xl sm:text-2xl font-bold text-gray-900 leading-snug w-full bg-white border border-blue-300 rounded px-2 py-1 focus:outline-none focus:ring-1 focus:ring-blue-400"
          />
        ) : (
          <p className="text-xl sm:text-2xl font-bold text-gray-900 leading-snug">
            {km}
          </p>
        )}
        {/* sub-messages removed */}
      </div>

      {/* Series Grid */}
      <div className="space-y-3">
        {seriesData.map((s) => {
          const isOpen = expandedId === s.id;
          return (
            <div
              key={s.id}
              className={`border rounded-xl overflow-hidden bg-white transition-shadow hover:shadow-sm ${editMode ? "border-blue-200" : "border-gray-200"}`}
            >
              {/* Header (always visible) */}
              <button
                onClick={() => setExpandedId(isOpen ? null : s.id)}
                className="w-full flex items-start gap-3 p-3 sm:p-4 text-left"
              >
                <div
                  className="w-1.5 sm:w-2 h-10 rounded-full flex-shrink-0 mt-0.5"
                  style={{ backgroundColor: s.color }}
                />
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-1.5 sm:gap-2 flex-wrap mb-0.5">
                    <span className="text-sm font-bold text-gray-900">
                      {s.name}
                    </span>
                    <span className="text-[10px] text-gray-400">
                      {s.frequency}
                    </span>
                    <span className="text-[10px] px-1.5 py-0.5 rounded bg-gray-100 text-gray-500">
                      {s.format.split("(")[0].trim()}
                    </span>
                  </div>
                  <p className="text-xs text-gray-500 line-clamp-2 sm:truncate">
                    {s.oneLiner}
                  </p>
                </div>
                <div className="flex-shrink-0 text-gray-300 mt-1">
                  <svg
                    width="16"
                    height="16"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    className={`transition-transform ${isOpen ? "rotate-180" : ""}`}
                  >
                    <path d="M6 9l6 6 6-6" />
                  </svg>
                </div>
              </button>

              {/* Expanded Content */}
              {isOpen && (
                <div className="px-3 sm:px-4 pb-5 pt-0">
                  <div className="ml-0 sm:ml-6 border-t border-gray-100 pt-4">
                    {/* Hook */}
                    <div
                      className="mb-4 p-3 rounded-lg"
                      style={{ backgroundColor: s.color + "0D" }}
                    >
                      <EditableText
                        value={s.hook}
                        editing={editMode}
                        onChange={(v) => updateField(s.id, "hook", v)}
                        className="text-sm font-semibold"
                      />
                    </div>

                    {/* Format + Reference */}
                    <div className="mb-4 flex flex-col sm:flex-row gap-3">
                      <div className="sm:flex-1 p-2.5 rounded-lg border border-gray-100">
                        <p className="text-[10px] font-bold text-gray-400 mb-0.5">포맷</p>
                        <EditableText
                          value={s.format}
                          editing={editMode}
                          onChange={(v) => updateField(s.id, "format", v)}
                          className="text-xs text-gray-700"
                        />
                      </div>
                      <div className="sm:flex-1 p-2.5 rounded-lg border border-gray-100">
                        <p className="text-[10px] font-bold text-gray-400 mb-0.5">레퍼런스</p>
                        <div className="mb-1">
                          <EditableText
                            value={s.reference}
                            editing={editMode}
                            onChange={(v) => updateField(s.id, "reference", v)}
                            className="text-xs font-semibold text-gray-800"
                          />
                        </div>
                        <div>
                          <EditableText
                            value={s.referenceDetail}
                            editing={editMode}
                            onChange={(v) => updateField(s.id, "referenceDetail", v)}
                            className="text-[11px] text-gray-500 leading-relaxed"
                            multiline
                          />
                        </div>
                      </div>
                    </div>

                    {/* Visual Direction */}
                    <div className="mb-4">
                      <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wide mb-2">
                        비주얼 방향
                      </p>
                      <ul className="space-y-1.5">
                        {s.visual.map((v, i) => (
                          <li
                            key={i}
                            className="text-xs text-gray-600 leading-relaxed flex gap-2"
                          >
                            <span
                              className="w-1 h-1 rounded-full mt-1.5 flex-shrink-0"
                              style={{ backgroundColor: s.color }}
                            />
                            <EditableText
                              value={v}
                              editing={editMode}
                              onChange={(val) => updateVisual(s.id, i, val)}
                              className="text-xs text-gray-600"
                            />
                          </li>
                        ))}
                      </ul>
                    </div>

                    {/* Spinoff */}
                    {s.spinoff && (
                      <div
                        className="mb-4 p-3 rounded-lg border-l-4"
                        style={{ borderLeftColor: s.color, backgroundColor: s.color + "08" }}
                      >
                        <p className="text-xs font-bold text-gray-800 mb-2">
                          + 스핀오프: {s.spinoff.name}
                        </p>
                        <ul className="space-y-1">
                          {s.spinoff.items.map((item, i) => (
                            <li key={i} className="text-xs text-gray-600 flex gap-1.5">
                              <span className="text-gray-400 flex-shrink-0">-</span>
                              {item}
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}

                    {/* Examples */}
                    <div className="mb-3">
                      <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wide mb-2">
                        예시 주제
                      </p>
                      <div className="space-y-1.5">
                        {s.examples.map((ex, i) => (
                          <div
                            key={i}
                            className="flex items-center gap-2.5 px-3 py-2 rounded-lg border"
                            style={{ borderColor: s.color + "30", backgroundColor: s.color + "06" }}
                          >
                            <span
                              className="text-[10px] font-bold w-5 h-5 rounded-full flex items-center justify-center text-white flex-shrink-0"
                              style={{ backgroundColor: s.color + "80" }}
                            >
                              {i + 1}
                            </span>
                            <EditableText
                              value={ex}
                              editing={editMode}
                              onChange={(val) => updateExample(s.id, i, val)}
                              className="text-xs text-gray-700"
                            />
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
