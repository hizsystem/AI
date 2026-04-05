#!/usr/bin/env node
/**
 * 데모 프로젝트에 샘플 데이터를 생성한다.
 * Usage: BLOB_READ_WRITE_TOKEN=xxx node scripts/seed-demo.mjs
 */

import { put } from "@vercel/blob";

const now = new Date();
const month = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}`;

// Sample calendar data
const calendarData = {
  client: "demo-cafe",
  clientSlug: "demo-cafe",
  month,
  title: `${now.getMonth() + 1}월 콘텐츠 캘린더`,
  description: "데모 카페 브랜드의 월간 콘텐츠 캘린더",
  categories: [
    { id: "menu", name: "메뉴/음료", color: "#92400e" },
    { id: "mood", name: "공간/무드", color: "#6366f1" },
    { id: "event", name: "이벤트", color: "#ef4444" },
    { id: "daily", name: "일상", color: "#10b981" },
  ],
  items: [
    {
      id: "demo-1",
      date: `${month}-03`,
      title: "신메뉴 — 딸기 크림 라떼",
      category: "menu",
      status: "uploaded",
      overview: { format: "피드(캐러셀)", caption: "봄이 왔다 🍓\n새로운 딸기 크림 라떼를 소개합니다." },
    },
    {
      id: "demo-2",
      date: `${month}-07`,
      title: "매장 인테리어 소개",
      category: "mood",
      status: "uploaded",
      overview: { format: "영상(릴스)", caption: "이 공간에서 커피 한 잔 어떠세요?" },
    },
    {
      id: "demo-3",
      date: `${month}-10`,
      title: "오픈 1주년 기념 이벤트",
      category: "event",
      status: "needs-confirm",
      overview: { format: "피드(단일이미지)", caption: "1주년을 맞이하여 특별 이벤트!" },
    },
    {
      id: "demo-4",
      date: `${month}-14`,
      title: "바리스타의 하루",
      category: "daily",
      status: "planning",
      overview: { format: "영상(릴스)" },
    },
    {
      id: "demo-5",
      date: `${month}-17`,
      title: "시즌 한정 디저트",
      category: "menu",
      status: "planning",
      overview: { format: "피드(캐러셀)" },
    },
    {
      id: "demo-6",
      date: `${month}-21`,
      title: "고객 후기 리그램",
      category: "daily",
      status: "planning",
      overview: { format: "피드(단일이미지)" },
    },
    {
      id: "demo-7",
      date: `${month}-24`,
      title: "원두 소개 — 에티오피아 예가체프",
      category: "menu",
      status: "planning",
      overview: { format: "피드(캐러셀)" },
    },
    {
      id: "demo-8",
      date: `${month}-28`,
      title: "주말 브런치 프로모션",
      category: "event",
      status: "planning",
      overview: { format: "스토리(단일)" },
    },
  ],
};

// Sample NP audit
const auditData = {
  storeId: "demo-cafe",
  storeName: "데모카페 강남점",
  auditDate: now.toISOString().slice(0, 10),
  totalScore: 62,
  grade: "B",
  items: [
    { id: "S1", category: "S", name: "리뷰", maxScore: 20, score: 14, status: "needs-improve" },
    { id: "S2", category: "S", name: "플레이스 광고", maxScore: 15, score: 0, status: "urgent" },
    { id: "S3", category: "S", name: "솔루션(예약/쿠폰/톡톡)", maxScore: 15, score: 8, status: "needs-improve" },
    { id: "A1", category: "A", name: "사진 & 영상", maxScore: 8, score: 6, status: "good" },
    { id: "A2", category: "A", name: "대표 키워드", maxScore: 8, score: 5, status: "needs-improve" },
    { id: "A3", category: "A", name: "소식 & 이벤트", maxScore: 7, score: 3, status: "needs-improve" },
    { id: "A4", category: "A", name: "블로그 체험단", maxScore: 7, score: 4, status: "needs-improve" },
    { id: "B1", category: "B", name: "기본정보", maxScore: 6, score: 6, status: "good" },
    { id: "B2", category: "B", name: "소개문", maxScore: 5, score: 4, status: "good" },
    { id: "B3", category: "B", name: "AI브리핑 & 매장명", maxScore: 4, score: 4, status: "good" },
    { id: "X1", category: "X", name: "외부채널", maxScore: 3, score: 3, status: "good" },
    { id: "X2", category: "X", name: "커넥트", maxScore: 2, score: 2, status: "good" },
  ],
};

// Sample schedule
const scheduleData = {
  clientSlug: "demo-cafe",
  items: [
    { id: "s1", date: `${month}-05`, title: "월간 브랜딩 미팅", type: "meeting", completed: true },
    { id: "s2", date: `${month}-10`, title: "블로그 체험단 1차", type: "campaign", completed: false },
    { id: "s3", date: `${month}-15`, title: "인스타 광고 소재 마감", type: "deadline", completed: false },
    { id: "s4", date: `${month}-20`, title: "NP 진단 2차", type: "milestone", completed: false },
    { id: "s5", date: `${month}-25`, title: "세금계산서 발행", type: "deadline", completed: false },
  ],
};

async function seed() {
  console.log("Seeding demo data...");

  await put(`calendar/demo-cafe/${month}.json`, JSON.stringify(calendarData), {
    access: "public", contentType: "application/json", addRandomSuffix: false, allowOverwrite: true,
  });
  console.log("  Calendar:", month);

  await put("np/demo-cafe/audit.json", JSON.stringify(auditData), {
    access: "public", contentType: "application/json", addRandomSuffix: false, allowOverwrite: true,
  });
  console.log("  NP Audit: 62/100 B");

  await put("schedule/demo-cafe.json", JSON.stringify(scheduleData), {
    access: "public", contentType: "application/json", addRandomSuffix: false, allowOverwrite: true,
  });
  console.log("  Schedule: 5 items");

  console.log("Done!");
}

seed().catch(console.error);
