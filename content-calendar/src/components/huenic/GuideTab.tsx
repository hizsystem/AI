"use client";

import { useState } from "react";
import type { HuenicBrand } from "@/data/huenic-types";

interface GuideTabProps {
  brand: HuenicBrand;
}

interface SeriesGuide {
  id: string;
  name: string;
  color: string;
  concern: string;
  oneLiner: string;
  role: string;
  tone: string;
  visual: string[];
  examples: string[];
  frequency: string;
  format: string;
  doNot?: string[];
}

const VEGGIET_KEY_MESSAGE = "매일 먹어도 속 편한, 식물성 프로틴의 기준";

const VEGGIET_SERIES: SeriesGuide[] = [
  {
    id: "vegieter",
    name: "이달의 베지어터",
    color: "#10b981",
    concern: "이게 나한테 맞아?",
    oneLiner: "나와 비슷한 사람이 베지어트를 먹는 이유",
    role: "발견 + 설득",
    tone: "29CM 하우스. 일상 공간, 자연광, 진짜 사람",
    visual: [
      "자연광, 집/카페/운동 후 촬영",
      "누끼(제품 단독컷) X → 손에 들고 있는 장면",
      "인물 얼굴 O, 일상 속 자연스러운 모습",
    ],
    examples: [
      "요가하는 30대 직장인의 아침 루틴",
      "러닝 후 첫 한 잔",
      "자취생의 저녁 대용",
    ],
    frequency: "월 1회",
    format: "캐러셀 (5~7장) or 릴스 (60~90초)",
  },
  {
    id: "lab",
    name: "베지어트 랩",
    color: "#3b82f6",
    concern: "진짜 괜찮은 거야?",
    oneLiner: "이 한 스쿱이 만들어지기까지",
    role: "신뢰 (유지)",
    tone: "Sweetgreen \"식재료가 히어로\". 원재료를 가장 매력적으로",
    visual: [
      "식재료 히어로 샷 — 서리태, 동결건조 딸기 클로즈업",
      "자연광 사이드, 배경 심플 (흰색/원목)",
      "제조 공정 타임랩스 가능",
    ],
    examples: [
      "서리태는 어디서 오는가 — 농가 Whole bean → 로스팅",
      "딸기 프로틴이 탄생하기까지 — 동결건조 23%의 의미",
      "한 스쿱에 담긴 것들 — 원료 → 배합 → 품질검사",
    ],
    frequency: "월 1회",
    format: "캐러셀 (비하인드 3~5장) or 릴스 (제조 공정)",
    doNot: [
      "성분표 나열 X → 장면으로 보여준다",
      "\"우리 깨끗해요\" 직접 말하기 X",
    ],
  },
  {
    id: "attack",
    name: "베지어택",
    color: "#f59e0b",
    concern: "진짜 괜찮은 거야?",
    oneLiner: "실제 고객이 하는 말 = 가장 강력한 신뢰",
    role: "발견 + 확산",
    tone: "고객 말은 날것, 비주얼은 정돈. B급과 감도 사이",
    visual: [
      "텍스트 오버레이 + 무드 B-roll",
      "리뷰 스크린샷을 디자인 에셋처럼 활용",
      "사람 없이 제품+공간만으로 구성 가능",
    ],
    examples: [
      "\"한 통 다 비우고 재구매한 단백질은 처음\"",
      "\"비린맛 없이 진짜 미숫가루\"",
      "\"다른 단백질은 당이 0.1g인데 여기는 4g\" — 솔직한 답변",
    ],
    frequency: "월 1~2회",
    format: "릴스 (30~45초, 리뷰 빠른 전환) or 캐러셀",
  },
  {
    id: "my",
    name: "MY VEGGIET",
    color: "#f97316",
    concern: "맛있어? 어떻게 먹어?",
    oneLiner: "\"이렇게 먹으면 맛있어요\"가 아니라 \"이렇게 먹고 있어요\"",
    role: "발견",
    tone: "짧고 감각적. 식욕 자극 비주얼",
    visual: [
      "탑뷰 + 손 동작 중심 (얼굴 없이도 OK)",
      "따뜻한 톤 색감 (쿨톤 X)",
      "BGM: 경쾌, 짧은 루프",
    ],
    examples: [
      "얼죽아 미숫가루 라떼 — 얼음+서리태+쉐이킹",
      "아침 5분 프로틴 볼 — 오트밀+서리태+과일",
      "딸기 프로틴 스무디 — 신제품 레시피",
    ],
    frequency: "월 1~2회",
    format: "릴스 (30~60초) or 캐러셀",
  },
  {
    id: "moment",
    name: "베지어트 모먼트",
    color: "#8b5cf6",
    concern: "먹으면 뭐가 달라져?",
    oneLiner: "베지어트가 있는 일상의 한 장면",
    role: "설득 (쇼룸)",
    tone: "담백하고 건조하되 진심이 느껴지는 온도",
    visual: [
      "사진 1장 + 여백 많이",
      "제품이 주인공이 아니라 장면 속 소품",
      "자연광, 일상 공간 (사무실 책상, 창가, 운동 후)",
    ],
    examples: [
      "토요일 아침, 늦잠 자고 일어나서 첫 한 잔",
      "회의 끝나고 3시의 리셋",
      "월요일 오전, 사무실 도착하자마자 얼음부터",
    ],
    frequency: "월 2회",
    format: "피드 (무드 사진 1장 + 짧은 카피)",
    doNot: [
      "\"단백질 20g\" 숫자 소구 X → 장면이 설득한다",
    ],
  },
  {
    id: "interview",
    name: "베지터뷰",
    color: "#ec4899",
    concern: "이 브랜드는 뭐가 달라?",
    oneLiner: "대기업이 보여줄 수 없는 것 = 만드는 사람의 얼굴과 태도",
    role: "유지 (팬덤)",
    tone: "따뜻하되 정돈된. 파타고니아/마일스톤커피",
    visual: [
      "대표 등장: 손/뒷모습/사이드 앵글 + 자막",
      "실제 사무실, 작업장 (정돈은 하되 꾸미지 않음)",
      "자연광 or 따뜻한 조명, 컬러그레이딩 필수",
    ],
    examples: [
      "베지어트가 시작된 이유 — 남편 궤양성대장염 스토리",
      "서리태에 담긴 이야기 — 할머니 검은콩미숫가루",
      "딸기 프로틴 237일의 기록",
    ],
    frequency: "격월 1회",
    format: "피드 (사진+텍스트) or 릴스 (무음 자막)",
    doNot: [
      "정면 인터뷰, 긴 독백 X",
      "\"안녕하세요 저는~\" 인사 X → 행동 장면 중심",
      "빠른 컷 전환, 효과음 과다 X → 느린 호흡, 여백",
    ],
  },
];

const VINKER_KEY_MESSAGE = "Chick'n for all.";

const VINKER_SERIES: SeriesGuide[] = [
  {
    id: "retail",
    name: "Retail & Demo",
    color: "#10b981",
    concern: "Where can I buy this?",
    oneLiner: "입점 매장 소식과 데모 현장",
    role: "전환",
    tone: "200% 북미 감성",
    visual: ["매장 현장 사진", "데모 시연 영상", "인플루언서 방문 콘텐츠"],
    examples: ["Community Natural Foods 입점 소식", "밴쿠버 데모 현장"],
    frequency: "수시",
    format: "피드/릴스",
  },
  {
    id: "collab",
    name: "Collab & Giveaway",
    color: "#3b82f6",
    concern: "Is this brand legit?",
    oneLiner: "월 1회 브랜드 콜라보 + 트래픽 광고",
    role: "발견 + 확산",
    tone: "캐주얼, 커뮤니티 중심",
    visual: ["콜라보 브랜드와의 합동 비주얼", "Giveaway 안내 그래픽"],
    examples: ["로컬 브랜드 콜라보 giveaway"],
    frequency: "월 1회",
    format: "피드/릴스",
  },
  {
    id: "content",
    name: "Content",
    color: "#f97316",
    concern: "What does this taste like?",
    oneLiner: "직접 릴스 소스 확보, 북미 감성 콘텐츠",
    role: "발견",
    tone: "밝고 에너지 있는 북미 푸드 콘텐츠 톤",
    visual: ["밝은 조명", "캐주얼 세팅", "실제 조리/시식 장면"],
    examples: ["빙커 치킨으로 만든 간단 레시피", "시식 리액션"],
    frequency: "월 2~3회",
    format: "릴스 중심",
  },
];

export default function GuideTab({ brand }: GuideTabProps) {
  const [expandedId, setExpandedId] = useState<string | null>(null);

  const keyMessage = brand === "veggiet" ? VEGGIET_KEY_MESSAGE : VINKER_KEY_MESSAGE;
  const series = brand === "veggiet" ? VEGGIET_SERIES : VINKER_SERIES;

  return (
    <div className="mt-6">
      {/* Key Message */}
      <div className="mb-8 p-6 rounded-2xl bg-gray-50 border border-gray-100">
        <p className="text-[10px] font-bold tracking-widest text-gray-400 uppercase mb-2">
          Key Message
        </p>
        <p className="text-xl sm:text-2xl font-bold text-gray-900 leading-snug">
          {keyMessage}
        </p>
        {brand === "veggiet" && (
          <div className="mt-4 flex gap-4 text-xs text-gray-500">
            <div>
              <span className="font-semibold text-gray-700">올영 구매</span>
              <span className="mx-1">=</span>
              속 편하고, 맛있고, 한 끼 되는
            </div>
            <div className="text-gray-300">|</div>
            <div>
              <span className="font-semibold text-gray-700">인스타 팔로우</span>
              <span className="mx-1">=</span>
              이 브랜드를 먹는 나, 괜찮다
            </div>
          </div>
        )}
      </div>

      {/* Series Grid */}
      <div className="space-y-3">
        {series.map((s) => {
          const isOpen = expandedId === s.id;
          return (
            <div
              key={s.id}
              className="border border-gray-200 rounded-xl overflow-hidden bg-white transition-shadow hover:shadow-sm"
            >
              {/* Header (always visible) */}
              <button
                onClick={() => setExpandedId(isOpen ? null : s.id)}
                className="w-full flex items-center gap-4 p-4 text-left"
              >
                <div
                  className="w-2 h-10 rounded-full flex-shrink-0"
                  style={{ backgroundColor: s.color }}
                />
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-0.5">
                    <span className="text-sm font-bold text-gray-900">
                      {s.name}
                    </span>
                    <span
                      className="text-[10px] font-semibold px-2 py-0.5 rounded-full text-white"
                      style={{ backgroundColor: s.color }}
                    >
                      {s.role}
                    </span>
                    <span className="text-[10px] text-gray-400">
                      {s.frequency}
                    </span>
                  </div>
                  <p className="text-xs text-gray-500 truncate">
                    {s.oneLiner}
                  </p>
                </div>
                <div className="flex-shrink-0 text-gray-300">
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
                <div className="px-4 pb-5 pt-0">
                  <div className="ml-6 border-t border-gray-100 pt-4">
                    {/* Concern */}
                    <div className="mb-4">
                      <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wide mb-1">
                        고객의 고민
                      </p>
                      <p className="text-sm font-medium text-gray-700">
                        &ldquo;{s.concern}&rdquo;
                      </p>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
                      {/* Tone & Format */}
                      <div>
                        <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wide mb-1">
                          톤 & 포맷
                        </p>
                        <p className="text-xs text-gray-600 leading-relaxed mb-1">
                          {s.tone}
                        </p>
                        <p className="text-xs text-gray-400">
                          {s.format}
                        </p>
                      </div>

                      {/* Visual Direction */}
                      <div>
                        <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wide mb-1">
                          비주얼 방향
                        </p>
                        <ul className="space-y-1">
                          {s.visual.map((v, i) => (
                            <li
                              key={i}
                              className="text-xs text-gray-600 leading-relaxed flex gap-1.5"
                            >
                              <span className="text-gray-300 flex-shrink-0">
                                &bull;
                              </span>
                              {v}
                            </li>
                          ))}
                        </ul>
                      </div>
                    </div>

                    {/* Examples */}
                    <div className="mb-3">
                      <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wide mb-1">
                        예시 주제
                      </p>
                      <div className="flex flex-wrap gap-2">
                        {s.examples.map((ex, i) => (
                          <span
                            key={i}
                            className="text-xs px-2.5 py-1 rounded-md bg-gray-50 text-gray-600 border border-gray-100"
                          >
                            {ex}
                          </span>
                        ))}
                      </div>
                    </div>

                    {/* Do Not */}
                    {s.doNot && s.doNot.length > 0 && (
                      <div>
                        <p className="text-[10px] font-bold text-red-400 uppercase tracking-wide mb-1">
                          주의
                        </p>
                        <ul className="space-y-0.5">
                          {s.doNot.map((d, i) => (
                            <li
                              key={i}
                              className="text-xs text-red-400 flex gap-1.5"
                            >
                              <span className="flex-shrink-0">&#10005;</span>
                              {d}
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}
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
