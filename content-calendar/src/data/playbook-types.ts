export interface PlaybookTask {
  id: string;
  title: string;
  owner: "agency" | "client";
  completed: boolean;
  notes?: string;
}

export interface PlaybookPhase {
  id: string;
  title: string;
  description?: string;
  tasks: PlaybookTask[];
}

export interface Playbook {
  clientSlug: string;
  blockType: string; // "naver-place" | "instagram" | etc
  templateId: string;
  startDate: string;
  phases: PlaybookPhase[];
}

// ─── Standard Templates ───

export const NP_PLAYBOOK_TEMPLATE: PlaybookPhase[] = [
  {
    id: "w1",
    title: "Week 1 — 세팅",
    description: "기본 정보 완성 + S등급 항목 즉시 개선",
    tasks: [
      { id: "w1-1", title: "NP 100점 진단 실행", owner: "agency", completed: false },
      { id: "w1-2", title: "대표 키워드 3개 선정", owner: "agency", completed: false },
      { id: "w1-3", title: "영업시간/메뉴 사진 업데이트", owner: "client", completed: false },
      { id: "w1-4", title: "예약/쿠폰/톡톡 활성화", owner: "client", completed: false },
      { id: "w1-5", title: "AI브리핑 확인 및 매장명 최적화", owner: "agency", completed: false },
    ],
  },
  {
    id: "w2",
    title: "Week 2 — 콘텐츠",
    description: "소개문 + 소식 + 영상으로 체류시간 확보",
    tasks: [
      { id: "w2-1", title: "소개문 재작성 (1,500자+, 키워드 포함)", owner: "agency", completed: false },
      { id: "w2-2", title: "소식 & 이벤트 첫 발행", owner: "agency", completed: false },
      { id: "w2-3", title: "매장 영상 1개 촬영 (5~10초)", owner: "client", completed: false },
      { id: "w2-4", title: "리뷰 가이드(엽서/카드) 비치", owner: "client", completed: false },
      { id: "w2-5", title: "편의시설 정보 점검", owner: "agency", completed: false },
    ],
  },
  {
    id: "w3",
    title: "Week 3 — 확장",
    description: "외부 채널 연결 + 광고 시작",
    tasks: [
      { id: "w3-1", title: "블로그 체험단 1차 세팅", owner: "agency", completed: false },
      { id: "w3-2", title: "플레이스 광고 시작 (일 5천원~)", owner: "agency", completed: false },
      { id: "w3-3", title: "리뷰 답글 작성 (가이드 제공)", owner: "client", completed: false },
      { id: "w3-4", title: "외부채널(인스타/블로그) 연결", owner: "agency", completed: false },
    ],
  },
  {
    id: "w4",
    title: "Week 4 — 루틴화",
    description: "2차 진단 + 루틴 정착 + 리포트",
    tasks: [
      { id: "w4-1", title: "2차 진단 실행 (점수 비교)", owner: "agency", completed: false },
      { id: "w4-2", title: "월간 성과 리포트 작성", owner: "agency", completed: false },
      { id: "w4-3", title: "주 1회 소식 발행 루틴 안내", owner: "agency", completed: false },
      { id: "w4-4", title: "다음 달 목표/액션 설정", owner: "agency", completed: false },
    ],
  },
];

export const IG_PLAYBOOK_TEMPLATE: PlaybookPhase[] = [
  {
    id: "setup",
    title: "셋업 (첫 월 1회)",
    description: "브랜드 분석 + 시리즈 설계 + 톤앤매너 확정",
    tasks: [
      { id: "s-1", title: "브랜드 분석 & 경쟁사 조사", owner: "agency", completed: false },
      { id: "s-2", title: "시리즈 구조 설계 (3~5개)", owner: "agency", completed: false },
      { id: "s-3", title: "비주얼 무드보드 제작", owner: "agency", completed: false },
      { id: "s-4", title: "톤앤매너 확정 (클라이언트 컨펌)", owner: "client", completed: false },
      { id: "s-5", title: "계정 접근 권한 세팅", owner: "client", completed: false },
    ],
  },
  {
    id: "d14",
    title: "D-14 기획",
    description: "월간 캘린더 초안 + 피드백",
    tasks: [
      { id: "d14-1", title: "월간 캘린더 초안 작성 (8~12개)", owner: "agency", completed: false },
      { id: "d14-2", title: "피드 프리뷰 시뮬레이션", owner: "agency", completed: false },
      { id: "d14-3", title: "캘린더 피드백 & 수정", owner: "client", completed: false },
    ],
  },
  {
    id: "d7",
    title: "D-7 제작",
    description: "소재 제작 + 캡션 + 컨펌",
    tasks: [
      { id: "d7-1", title: "콘텐츠 디자인/촬영", owner: "agency", completed: false },
      { id: "d7-2", title: "캡션 & 해시태그 작성", owner: "agency", completed: false },
      { id: "d7-3", title: "소재 컨펌", owner: "client", completed: false },
    ],
  },
  {
    id: "pub",
    title: "발행",
    description: "업로드 + 해시태그/멘션",
    tasks: [
      { id: "pub-1", title: "콘텐츠 업로드", owner: "agency", completed: false },
      { id: "pub-2", title: "해시태그/멘션/태그 세팅", owner: "agency", completed: false },
      { id: "pub-3", title: "스토리 연동 확인", owner: "agency", completed: false },
    ],
  },
  {
    id: "review",
    title: "D+7 리뷰",
    description: "KPI 체크 + 다음 주 조정",
    tasks: [
      { id: "rev-1", title: "주간 KPI 체크 (도달/참여/팔로워)", owner: "agency", completed: false },
      { id: "rev-2", title: "탑 콘텐츠 분석", owner: "agency", completed: false },
      { id: "rev-3", title: "다음 주 캘린더 조정", owner: "agency", completed: false },
    ],
  },
];

export const PLAYBOOK_TEMPLATES: Record<string, { name: string; phases: PlaybookPhase[] }> = {
  "naver-place": { name: "NP 4주 코칭", phases: NP_PLAYBOOK_TEMPLATE },
  instagram: { name: "IG 월간 사이클", phases: IG_PLAYBOOK_TEMPLATE },
};
