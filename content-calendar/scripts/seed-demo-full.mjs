#!/usr/bin/env node
/**
 * [DEMO] 카페 브랜드 — 전체 탭 데모 데이터 시드
 * 무드보드, KPI, 주간 리포트, 레퍼런스, 가이드
 */

const BASE = process.env.BASE_URL || "https://hiz-brand-dashboard.vercel.app";
const COOKIE = "cc-admin-auth=authenticated";
const BRAND = "demo-cafe";

async function api(path, method = "GET", body) {
  const opts = {
    method,
    headers: { Cookie: COOKIE, "Content-Type": "application/json" },
  };
  if (body) opts.body = JSON.stringify(body);
  const res = await fetch(`${BASE}${path}`, opts);
  return res;
}

// ─── 1. KPI 데이터 ───
async function seedKpi() {
  console.log("📊 KPI 시딩...");
  const data = {
    brand: BRAND,
    year: 2026,
    month: 4,
    summary: {
      followers: { value: 2847, change: 312, changePercent: 12.3 },
      monthlyPosts: { value: 9, change: 2, changePercent: 28.6 },
      avgER: { value: 4.2, change: 0.8 },
      monthlyReach: { value: 18500, change: 3200, changePercent: 20.9 },
    },
    followerTrend: {
      labels: ["1주", "2주", "3주", "4주"],
      total: [2535, 2620, 2740, 2847],
      organic: [2400, 2460, 2550, 2630],
      paid: [135, 160, 190, 217],
    },
    erTrend: {
      labels: ["1주", "2주", "3주", "4주"],
      total: [3.4, 3.8, 4.5, 4.2],
      feed: [2.8, 3.1, 3.6, 3.4],
      reels: [5.2, 6.1, 7.2, 6.8],
      story: [1.8, 2.0, 2.3, 2.1],
    },
  };
  const res = await api(`/api/huenic/${BRAND}/kpi/2026-04`, "PUT", data);
  console.log(`  ${res.ok ? "✅" : "❌"} KPI (${res.status})`);
}

// ─── 2. 주간 리포트 ───
async function seedWeeklyReport() {
  console.log("📋 주간 리포트 시딩...");
  const data = {
    brand: BRAND,
    year: 2026,
    week: 2,
    period: "4.6 - 4.12",
    metrics: {
      followers: 2740,
      followersChange: 120,
      postsCount: 3,
      engagementRate: 4.5,
      erChange: 0.7,
      topLikes: 186,
      reach: 5200,
      reachChange: 800,
    },
    topContent: [
      {
        id: "top-1",
        title: "시즌 한정 딸기 라떼 출시",
        type: "reels",
        likes: 186,
        comments: 24,
      },
      {
        id: "top-2",
        title: "바리스타의 하루 브이로그",
        type: "reels",
        likes: 142,
        comments: 18,
      },
      {
        id: "top-3",
        title: "카페 인테리어 비포/애프터",
        type: "feed",
        likes: 98,
        comments: 12,
      },
    ],
    coachComment: {
      author: "우성민",
      wellDone: "릴스 콘텐츠 참여율이 7.2%로 전주 대비 크게 상승했습니다. 특히 '딸기 라떼 출시' 릴스가 도달 1,200으로 최고 성과를 기록했어요.",
      improvement: "피드 콘텐츠의 캡션이 다소 길어 스크롤 이탈이 발생하고 있습니다. 핵심 메시지를 첫 2줄에 담아보세요.",
      tryNext: "주말 한정 메뉴를 스토리 투표로 미리 예고하고, 결과를 릴스로 만들면 참여→도달 선순환이 가능합니다.",
      createdAt: "2026-04-12T10:00:00Z",
    },
    nextWeekPlan: [
      "신메뉴 '말차 크루아상' 티저 스토리 2건",
      "단골 고객 인터뷰 릴스 1건",
      "주말 브런치 세트 프로모션 피드 1건",
    ],
  };
  const res = await api(`/api/huenic/${BRAND}/reports/2026-4월-2w`, "PUT", data);
  console.log(`  ${res.ok ? "✅" : "❌"} 주간 리포트 (${res.status})`);
}

// ─── 3. 레퍼런스 ───
async function seedRefs() {
  console.log("📌 레퍼런스 시딩...");
  const data = {
    brand: BRAND,
    collections: [
      { id: "mood", name: "무드 레퍼런스", color: "#92400e" },
      { id: "food", name: "푸드 포토", color: "#ef4444" },
      { id: "interior", name: "인테리어/공간", color: "#6366f1" },
      { id: "reels", name: "릴스 참고", color: "#10b981" },
    ],
    items: [
      { id: "ref-1", collectionId: "mood", url: "https://instagram.com/p/example1", platform: "instagram", comment: "따뜻한 톤 무드 참고", addedBy: "우성민", createdAt: "2026-04-01T00:00:00Z" },
      { id: "ref-2", collectionId: "mood", url: "https://instagram.com/p/example2", platform: "instagram", comment: "자연광 촬영 레퍼런스", addedBy: "우성민", createdAt: "2026-04-02T00:00:00Z" },
      { id: "ref-3", collectionId: "food", url: "https://instagram.com/p/example3", platform: "instagram", comment: "음료 클로즈업 앵글", addedBy: "김남중", createdAt: "2026-04-03T00:00:00Z" },
      { id: "ref-4", collectionId: "food", url: "https://instagram.com/p/example4", platform: "instagram", comment: "디저트 플레이팅 참고", addedBy: "김남중", createdAt: "2026-04-04T00:00:00Z" },
      { id: "ref-5", collectionId: "interior", url: "https://instagram.com/p/example5", platform: "instagram", comment: "테이블 세팅 레이아웃", addedBy: "이수민", createdAt: "2026-04-05T00:00:00Z" },
      { id: "ref-6", collectionId: "reels", url: "https://instagram.com/reel/example6", platform: "instagram", comment: "바리스타 라떼아트 릴스 — 조회수 50K", addedBy: "우성민", createdAt: "2026-04-06T00:00:00Z" },
      { id: "ref-7", collectionId: "reels", url: "https://www.tiktok.com/@example/video/123", platform: "tiktok", comment: "카페 일상 브이로그 포맷 참고", addedBy: "우성민", createdAt: "2026-04-07T00:00:00Z" },
    ],
  };
  const res = await api(`/api/huenic/${BRAND}/refs`, "PUT", data);
  console.log(`  ${res.ok ? "✅" : "❌"} 레퍼런스 (${res.status})`);
}

// ─── 4. 가이드 ───
async function seedGuide() {
  console.log("📖 가이드 시딩...");
  const data = {
    brand: BRAND,
    keyMessage: "동네 카페의 진심이 담긴 한 잔. 매일 오고 싶은 나만의 아지트.",
    series: [
      {
        id: "menu",
        name: "메뉴/음료",
        color: "#92400e",
        hook: "새로운 맛의 발견",
        concern: "메뉴가 많아 선택이 어려운 고객",
        oneLiner: "오늘의 추천 한 잔, 당신의 취향을 찾아드립니다",
        role: "시즌 메뉴와 시그니처 메뉴 소개로 방문 유도",
        reference: "Blue Bottle Korea",
        referenceDetail: "심플한 배경에 음료만 부각하는 미니멀 촬영",
        visual: ["따뜻한 우드톤 배경", "자연광 사이드 라이팅", "클로즈업 + 탑뷰 교차"],
        examples: ["시즌 한정 딸기 라떼 출시 안내", "시그니처 콜드브루 3종 비교", "바리스타 추천 페어링 조합"],
        frequency: "월 3~4회",
        format: "피드(캐러셀)",
        doNot: ["가격 강조 금지", "타 브랜드 비교 금지"],
      },
      {
        id: "mood",
        name: "공간/무드",
        color: "#6366f1",
        hook: "여기서 보내는 시간",
        concern: "분위기 좋은 카페를 찾는 고객",
        oneLiner: "당신만의 시간이 흐르는 공간",
        role: "공간의 매력을 전달해 첫 방문 유도",
        reference: "어니언 성수",
        referenceDetail: "공간 자체가 콘텐츠 — 사람 없이 공간만 담는 포맷",
        visual: ["골든아워 자연광", "빈 테이블 + 커피 한 잔", "창가 실루엣"],
        examples: ["비 오는 날의 카페 풍경", "아침 오픈 전 고요한 순간", "계절 변화가 느껴지는 창밖 뷰"],
        frequency: "월 2회",
        format: "영상(릴스)",
      },
      {
        id: "event",
        name: "이벤트",
        color: "#ef4444",
        hook: "놓치면 후회할 혜택",
        concern: "가격 대비 가치를 중시하는 고객",
        oneLiner: "오늘만 특별한 이유가 있습니다",
        role: "한정 프로모션으로 긴급 방문 유도",
        reference: "스타벅스 코리아",
        referenceDetail: "프리퀀시 + 시즌 한정의 FOMO 전략",
        visual: ["비비드 컬러 포인트", "기한 표시 강조", "제품 + 이벤트 배너 조합"],
        examples: ["오픈 1주년 기념 1+1", "스탬프 10개 적립 시 무료 음료", "인스타 팔로우 시 사이즈업"],
        frequency: "월 1~2회",
        format: "스토리(단일)",
      },
      {
        id: "daily",
        name: "일상",
        color: "#10b981",
        hook: "카페 뒷이야기",
        concern: "브랜드와 친밀감을 느끼고 싶은 고객",
        oneLiner: "매일 아침 정성을 담아 준비합니다",
        role: "사장님/바리스타의 진정성으로 팬 유대 강화",
        reference: "Fritz Coffee",
        referenceDetail: "사람 중심 스토리텔링 — 바리스타 소개, 원두 이야기",
        visual: ["핸드드립 과정 클로즈업", "원두 로스팅 장면", "스태프 캔디드 샷"],
        examples: ["오늘의 원두 소개 — 에티오피아 예가체프", "바리스타 하루 브이로그", "손님이 남긴 감동 리뷰"],
        frequency: "월 2~3회",
        format: "영상(릴스)",
      },
    ],
  };
  const res = await api(`/api/huenic/${BRAND}/guide`, "PUT", data);
  console.log(`  ${res.ok ? "✅" : "❌"} 가이드 (${res.status})`);
}

// ─── 5. 캘린더에 무드보드 추가 ───
async function seedMoodboard() {
  console.log("🎨 무드보드 시딩...");
  // Fetch current calendar to update moodboard field
  const getRes = await api(`/api/calendar/demo-cafe/2026-04`);
  if (!getRes.ok) {
    console.log("  ⚠️ 캘린더 없음, 스킵");
    return;
  }
  const calendar = await getRes.json();

  calendar.moodboard = {
    description: "4월 컨셉: '봄 한 잔' — 벚꽃 시즌에 맞춘 따뜻하고 로맨틱한 무드. 핑크/코럴 톤 포인트, 자연광 중심 촬영.",
    items: [
      { image: "https://images.unsplash.com/photo-1509042239860-f550ce710b93?w=400", label: "시그니처 라떼" },
      { image: "https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?w=400", label: "카페 인테리어" },
      { image: "https://images.unsplash.com/photo-1514432324607-a09d9b4aefda?w=400", label: "디저트 플레이팅" },
      { image: "https://images.unsplash.com/photo-1501339847302-ac426a4a7cbb?w=400", label: "핸드드립" },
      { image: "https://images.unsplash.com/photo-1445116572660-236099ec97a0?w=400", label: "창가 무드" },
      { image: "https://images.unsplash.com/photo-1559496417-e7f25cb247f3?w=400", label: "봄 시즌 데코" },
    ],
  };

  const putRes = await api(`/api/calendar/demo-cafe/2026-04`, "PUT", {
    coreMessage: calendar.coreMessage,
    moodboard: calendar.moodboard,
  });
  console.log(`  ${putRes.ok ? "✅" : "❌"} 무드보드 (${putRes.status})`);
}

// ─── Run ───
async function main() {
  console.log(`🎯 [DEMO] 카페 브랜드 전체 데이터 시딩`);
  console.log(`📡 ${BASE}\n`);

  await seedKpi();
  await seedWeeklyReport();
  await seedRefs();
  await seedGuide();
  await seedMoodboard();

  console.log("\n✅ 완료!");
}

main().catch(console.error);
