#!/usr/bin/env node
/**
 * 기존 태스크에 카테고리를 일괄 배정하는 스크립트
 *
 * 사용법:
 *   node scripts/assign-categories.mjs
 *
 * 태스크 제목에 매칭되는 키워드로 자동 카테고리를 배정합니다.
 * DRY_RUN=true 로 실행하면 실제 반영 없이 결과만 확인합니다.
 */

const BASE_URL = process.env.BASE_URL || "https://hiz-brand-dashboard.vercel.app";
const COOKIE = "cc-admin-auth=authenticated";
const DRY_RUN = process.env.DRY_RUN === "true";

// 카테고리 매핑 규칙 (프로젝트별로 키워드 → 카테고리)
const CATEGORY_RULES = {
  "mirye-gukbap": [
    { keywords: ["대표키워드", "소개문", "예약", "쿠폰", "톡톡", "키워드 가이드", "소식 발행", "네이버", "플레이스", "센텀", "전포"], category: "네이버플레이스" },
    { keywords: ["인플루언서", "리스트업", "콘텐츠 가이드", "스케줄 조정"], category: "인플루언서" },
    { keywords: ["체험단"], category: "체험단" },
    { keywords: ["부산출장", "KTV", "출장"], category: "부산출장" },
    { keywords: ["마스터시트", "스케줄링 탭", "공유용"], category: "운영" },
  ],
  // 다른 프로젝트도 필요하면 여기에 추가
};

function matchCategory(task) {
  const rules = CATEGORY_RULES[task.projectSlug];
  if (!rules) return null;

  for (const rule of rules) {
    if (rule.keywords.some((kw) => task.title.includes(kw))) {
      return rule.category;
    }
  }
  return null;
}

async function main() {
  console.log(`🎯 카테고리 배정 스크립트 (${DRY_RUN ? "DRY RUN" : "LIVE"})`);
  console.log(`📡 ${BASE_URL}\n`);

  // 1. 현재 태스크 조회
  const res = await fetch(`${BASE_URL}/api/tasks`, {
    headers: { Cookie: COOKIE },
  });
  if (!res.ok) {
    console.error("❌ 태스크 조회 실패:", res.status);
    return;
  }
  const board = await res.json();
  console.log(`📋 총 ${board.tasks.length}개 태스크\n`);

  // 2. 카테고리 매핑
  const updates = [];
  for (const task of board.tasks) {
    if (task.category) {
      console.log(`  ⏭️  [${task.projectSlug}] ${task.title} → 이미 "${task.category}" 설정됨`);
      continue;
    }
    const category = matchCategory(task);
    if (category) {
      console.log(`  ✅ [${task.projectSlug}] ${task.title} → "${category}"`);
      updates.push({ id: task.id, category });
    } else {
      console.log(`  ❓ [${task.projectSlug}] ${task.title} → 매칭 없음`);
    }
  }

  console.log(`\n📊 ${updates.length}개 태스크에 카테고리 배정 예정\n`);

  if (DRY_RUN) {
    console.log("🔍 DRY RUN 모드 — 실제 반영하지 않음");
    return;
  }

  if (updates.length === 0) {
    console.log("✨ 배정할 태스크 없음");
    return;
  }

  // 3. 일괄 업데이트
  const patchRes = await fetch(`${BASE_URL}/api/tasks`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json", Cookie: COOKIE },
    body: JSON.stringify({ batch: updates }),
  });

  if (patchRes.ok) {
    const result = await patchRes.json();
    console.log(`✅ ${result.updated}개 태스크 카테고리 배정 완료!`);
  } else {
    console.error("❌ 배정 실패:", patchRes.status);
  }
}

main().catch(console.error);
