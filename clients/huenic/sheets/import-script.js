/**
 * HUENIC 대시보드 데이터 임포트 스크립트
 *
 * 사용법:
 * 1. 구글시트에서 확장 프로그램 → Apps Script
 * 2. 이 코드를 붙여넣기
 * 3. ▶ 실행 버튼 클릭
 * 4. 권한 승인
 * 5. 완료 후 이 스크립트 삭제해도 OK
 */

function importAllData() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();

  // ─── 탭 1: 주간성과 ───
  createSheet(ss, "주간성과", [
    ["brand","week","period","followers","followers_change","posts_count","engagement_rate","er_change","top_likes","reach","reach_change"],
    ["veggiet","2026-W09","2026-02-23 ~ 2026-03-01",11450,280,3,3.5,0.2,198,38000,2800],
    ["veggiet","2026-W10","2026-03-02 ~ 2026-03-08",11890,440,3,3.7,0.2,256,41000,3000],
    ["veggiet","2026-W11","2026-03-09 ~ 2026-03-15",12340,450,3,4.2,0.5,342,45200,4200],
    ["veggiet","2026-W12","2026-03-16 ~ 2026-03-22",12580,240,4,4.5,0.3,415,51000,5800],
    ["vinker","2026-W09","2026-02-23 ~ 2026-03-01",2030,18,1,2.4,0.1,45,7800,320],
    ["vinker","2026-W10","2026-03-02 ~ 2026-03-08",2080,50,1,2.6,0.2,52,8200,400],
    ["vinker","2026-W11","2026-03-09 ~ 2026-03-15",2150,70,1,2.8,0.2,67,8900,700],
    ["vinker","2026-W12","2026-03-16 ~ 2026-03-22",2210,60,1,2.7,-0.1,58,8600,-300],
  ]);

  // ─── 탭 2: 베스트콘텐츠 ───
  createSheet(ss, "베스트콘텐츠", [
    ["brand","week","title","type","likes","comments"],
    ["veggiet","2026-W09","프로틴바 신제품 티저","feed",198,12],
    ["veggiet","2026-W10","프로틴바 언박싱 릴스","reels",256,15],
    ["veggiet","2026-W10","아침 루틴 with 베지어트","story",134,8],
    ["veggiet","2026-W11","아침 스무디 레시피","feed",342,28],
    ["veggiet","2026-W11","프로틴바 언박싱 릴스","reels",287,15],
    ["veggiet","2026-W11","프로틴바 신제품 티저","feed",198,12],
    ["veggiet","2026-W12","운동 후 프로틴 루틴 릴스","reels",415,32],
    ["veggiet","2026-W12","대표 인터뷰: 왜 식물성인가","feed",312,24],
    ["veggiet","2026-W12","@건강맛집 시딩 콜라보","reels",289,18],
    ["vinker","2026-W11","Plant-based sauce recipe","reels",67,5],
    ["vinker","2026-W12","Brand story: From Korea to Canada","feed",58,3],
  ]);

  // ─── 탭 3: 월간KPI ───
  createSheet(ss, "월간KPI", [
    ["brand","year","month","followers","followers_change","followers_change_pct","monthly_posts","posts_change","posts_change_pct","avg_er","er_change","monthly_reach","reach_change","reach_change_pct"],
    ["veggiet",2025,10,8200,380,4.9,8,0,0,2.8,0.1,98000,5200,5.6],
    ["veggiet",2025,11,8950,750,9.1,9,1,12.5,3.0,0.2,112000,14000,14.3],
    ["veggiet",2025,12,9600,650,7.3,10,1,11.1,3.2,0.2,128000,16000,14.3],
    ["veggiet",2026,1,10450,850,8.9,10,0,0,3.4,0.2,145000,17000,13.3],
    ["veggiet",2026,2,11450,1000,9.6,11,1,10.0,3.6,0.2,164100,19100,13.2],
    ["veggiet",2026,3,12340,890,7.8,12,1,9.1,4.2,0.6,187500,23400,14.3],
    ["vinker",2025,10,1650,60,3.8,4,0,0,2.0,0.1,22000,1200,5.8],
    ["vinker",2025,11,1720,70,4.2,4,0,0,2.2,0.2,24500,2500,11.4],
    ["vinker",2025,12,1800,80,4.7,4,0,0,2.3,0.1,26000,1500,6.1],
    ["vinker",2026,1,1890,90,5.0,4,0,0,2.4,0.1,28000,2000,7.7],
    ["vinker",2026,2,2030,140,7.4,4,0,0,2.6,0.2,30200,2200,7.9],
    ["vinker",2026,3,2150,120,5.9,4,0,0,2.8,0.2,32400,2200,7.3],
  ]);

  // ─── 탭 4: 팔로워추이 ───
  createSheet(ss, "팔로워추이", [
    ["brand","month_label","total","organic","paid"],
    ["veggiet","10월",8200,6800,1400],
    ["veggiet","11월",8950,7300,1650],
    ["veggiet","12월",9600,7800,1800],
    ["veggiet","1월",10450,8400,2050],
    ["veggiet","2월",11450,9100,2350],
    ["veggiet","3월",12340,9800,2540],
    ["vinker","10월",1650,1400,250],
    ["vinker","11월",1720,1450,270],
    ["vinker","12월",1800,1510,290],
    ["vinker","1월",1890,1580,310],
    ["vinker","2월",2030,1690,340],
    ["vinker","3월",2150,1790,360],
  ]);

  // ─── 탭 5: ER추이 ───
  createSheet(ss, "ER추이", [
    ["brand","week_label","total","feed","reels","story"],
    ["veggiet","W08",3.5,3.2,5.1,2.1],
    ["veggiet","W09",3.5,3.2,5.0,2.2],
    ["veggiet","W10",3.7,3.4,5.2,2.3],
    ["veggiet","W11",4.2,3.8,6.1,2.5],
    ["veggiet","W12",4.5,4.0,6.5,2.7],
    ["vinker","W08",2.4,2.1,3.8,1.2],
    ["vinker","W09",2.4,2.1,3.7,1.3],
    ["vinker","W10",2.6,2.3,4.0,1.4],
    ["vinker","W11",2.8,2.4,4.2,1.5],
    ["vinker","W12",2.7,2.3,4.1,1.4],
  ]);

  // 기본 Sheet1 삭제 (있으면)
  const defaultSheet = ss.getSheetByName("Sheet1") || ss.getSheetByName("시트1");
  if (defaultSheet && ss.getSheets().length > 1) {
    ss.deleteSheet(defaultSheet);
  }

  SpreadsheetApp.getUi().alert("완료! 5개 탭이 생성되었습니다.\n\n다음 단계:\n1. 파일 → 공유 → 웹에 게시\n2. 전체 문서 → CSV → 게시");
}

function createSheet(ss, name, data) {
  // 기존 탭이 있으면 삭제
  const existing = ss.getSheetByName(name);
  if (existing) ss.deleteSheet(existing);

  const sheet = ss.insertSheet(name);
  sheet.getRange(1, 1, data.length, data[0].length).setValues(data);

  // 헤더 스타일
  const headerRange = sheet.getRange(1, 1, 1, data[0].length);
  headerRange.setFontWeight("bold");
  headerRange.setBackground("#f3f4f6");

  // 열 너비 자동 조정
  for (let i = 1; i <= data[0].length; i++) {
    sheet.autoResizeColumn(i);
  }
}
