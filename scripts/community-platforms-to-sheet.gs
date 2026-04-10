/**
 * 스타트업 커뮤니티 플랫폼 광고 리서치 → 구글시트 자동 입력
 *
 * 사용법:
 * 1. 고벤처 구글시트 열기
 * 2. 확장 프로그램 > Apps Script
 * 3. 이 코드 전체 복사 → 붙여넣기
 * 4. ▶ 실행 (createPlatformSheet 함수)
 * 5. 권한 승인
 */

// ============================================================
// 설정
// ============================================================
const SHEET_NAME = "커뮤니티 플랫폼 광고";  // 생성될 시트 탭 이름

// ============================================================
// 플랫폼 데이터
// ============================================================
function getPlatformData() {
  return [
    // [카테고리, 플랫폼명, URL, 주요 사용자층, 규모(추정), 광고 상품, 예상 단가, 적합도, 추천 광고 형태, 비고]

    // 이벤트/네트워킹
    ["이벤트/네트워킹", "온오프믹스", "onoffmix.com", "IT/스타트업 실무자, 개발자", "월 50~80만 방문", "메인 배너, 이벤트 상단 노출", "월 200~500만원 (추정)", "중", "배너", "실무자/주니어 비중 높음, 트래픽 일부 페스타로 이동"],
    ["이벤트/네트워킹", "이벤터스", "eventus.io", "B2B 컨퍼런스/세미나 참가자", "월 20~40만 방문", "배너, 뉴스레터, 스폰서드 이벤트", "문의 필요", "중하", "뉴스레터", "B2B/기업 교육 색이 강함"],
    ["이벤트/네트워킹", "페스타", "festa.io", "개발자, PM, 스타트업 실무자", "월 30~60만 방문", "메인 배너, 뉴스레터 스폰서십", "문의 필요", "중", "자체 이벤트 등록 (무료)", "진단 워크숍을 이벤트로 등록하면 무료 노출 가능"],

    // 스타트업 미디어
    ["스타트업 미디어", "플래텀", "platum.kr", "스타트업 대표, VC, 업계 관계자", "월 80~120만 방문, 뉴스레터 5만+", "배너, 스폰서드 기사, 뉴스레터", "배너 월 100~300만, 기사 200~500만", "상", "스폰서드 기사 + 배너", "스타트업 미디어 중 가장 오래된 매체, 시리즈A 이상 대표 열독"],
    ["스타트업 미디어", "벤처스퀘어", "venturesquare.net", "스타트업 대표, 투자자, 정부지원사업", "월 40~70만 방문", "배너, 기사형 광고", "문의 필요", "중상", "배너 + 기사형", "정부지원사업/데모데이 콘텐츠 비중 높음, 초기 스타트업 유입 많음"],
    ["스타트업 미디어", "아웃스탠딩", "outstanding.kr", "스타트업 대표, 시니어 실무자, 투자자", "유료 구독 1~2만, 뉴스레터 10만+", "뉴스레터(상단/하단), 스폰서드 콘텐츠", "뉴스레터 1회 100~300만, 콘텐츠 300~500만", "상", "뉴스레터 광고", "유료 구독 → 독자 퀄리티 높음, 의사결정권자 비율 높음"],
    ["스타트업 미디어", "더브이씨", "thevc.kr", "VC 심사역, 스타트업 대표", "월 30~50만 방문, 등록 4만+", "배너, 프로필 하이라이트, 뉴스레터", "문의 필요", "중", "배너", "투자/데이터 플랫폼, 시리즈A 전후 대표 방문 많음"],
    ["스타트업 미디어", "EO", "eo.finance", "스타트업 대표, 예비 창업자, MZ 비즈니스", "유튜브 130만+, 뉴스레터 20만+", "유튜브 PPL, 뉴스레터, 브랜디드 콘텐츠", "브랜디드 1건 1,000만+, 뉴스레터 200~500만", "상", "뉴스레터 광고", "도달 범위 최대, 브랜디드는 고비용이나 뉴스레터 효율적"],

    // 창업자 커뮤니티
    ["창업자 커뮤니티", "디스콰이엇", "disquiet.io", "인디해커, 초기 스타트업 메이커, PM", "월 15~30만 방문, 회원 5만+", "스폰서드 프로덕트, 뉴스레터, 배너", "문의 필요 (유연한 협상)", "상", "프로덕트 런칭 + 스폰서드", "타겟 정밀도 최고, 프로덕트 등록 자체가 바이럴"],
    ["창업자 커뮤니티", "비긴메이트", "beginmate.com", "예비 창업자, 초기 대표 (팀빌딩)", "월 5~15만 방문", "배너, 뉴스레터", "문의 필요", "중상", "배너 + 뉴스레터", "공동창업자 찾는 단계, '무료'와 궁합 좋음"],
    ["창업자 커뮤니티", "넥스트유니콘", "nextunicorn.kr", "스타트업 대표 (투자 유치), VC", "등록 2만+, 월 10~20만 방문", "배너, 프로필 부스트, 뉴스레터", "문의 필요", "중상", "배너", "시드~시리즈A 대표 타겟 정확도 높음"],
    ["창업자 커뮤니티", "리멤버", "rememberapp.co.kr", "비즈니스 네트워킹, CEO/임원", "회원 350만+", "네이티브 광고, 뉴스레터, 커뮤니티", "문의 필요", "중", "CEO 타겟팅 광고", "직함별 타겟팅 가능, CEO/대표 정밀 타겟 가능"],

    // 마케팅 특화
    ["마케팅 특화", "그로우앤베터", "growandbetter.com", "스타트업 마케터, 그로스 해커, PM", "회원 1~2만, 뉴스레터 수만", "뉴스레터, 파트너 노출, 교육 협찬", "문의 필요", "상", "웨비나/교육 협업", "마케팅 진단과 맥락 정확히 맞음, 배너보다 콘텐츠 협업 추천"],
    ["마케팅 특화", "마케터 모여라 (FB)", "facebook.com/groups", "마케팅 실무자 (주니어~미드)", "멤버 5~8만", "관리자 승인 콘텐츠 공유", "무료", "중", "콘텐츠 + CTA", "인하우스 마케터 도달 유효, 대표 비율은 낮음"],

    // 정부/공공
    ["정부/공공", "K-Startup", "k-startup.go.kr", "예비 창업자, 초기 스타트업", "월 100만+ (시즌 급증)", "멘토/전문기관 등록", "직접 광고 불가", "중", "멘토/파트너 등록", "직접 광고 불가, 보육 프로그램 연계 방식"],
    ["정부/공공", "TIPS 운영사", "tips.or.kr", "시드~Pre-A 기술 스타트업", "연간 선정 200개사+", "프로그램 참여", "직접 광고 불가", "중상", "파트너십", "포트폴리오사 대상 진단 제공, 타겟 정확도 매우 높음"],
  ];
}

// ============================================================
// 메인 함수: 시트 생성 + 데이터 입력
// ============================================================
function createPlatformSheet() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();

  // 기존 시트 있으면 삭제 후 재생성
  let sheet = ss.getSheetByName(SHEET_NAME);
  if (sheet) {
    ss.deleteSheet(sheet);
  }
  sheet = ss.insertSheet(SHEET_NAME);

  // 헤더
  const headers = [
    "카테고리", "플랫폼명", "URL", "주요 사용자층", "규모 (추정)",
    "광고 상품", "예상 단가", "적합도", "추천 광고 형태", "비고",
    "담당자", "문의 상태", "미디어킷", "메모"
  ];

  const headerRange = sheet.getRange(1, 1, 1, headers.length);
  headerRange.setValues([headers]);
  headerRange.setFontWeight("bold");
  headerRange.setBackground("#1a1b18");
  headerRange.setFontColor("#a2c7e2");
  headerRange.setFontSize(10);
  headerRange.setHorizontalAlignment("center");
  headerRange.setVerticalAlignment("middle");
  sheet.setRowHeight(1, 36);

  // 데이터 입력
  const data = getPlatformData();
  if (data.length > 0) {
    const dataRange = sheet.getRange(2, 1, data.length, data[0].length);
    dataRange.setValues(data);
    dataRange.setFontSize(10);
    dataRange.setVerticalAlignment("middle");
    dataRange.setWrap(true);
  }

  // 담당자/문의상태/미디어킷/메모 열은 비워둠 (남중님이 채울 영역)
  const emptyRange = sheet.getRange(2, 11, data.length, 4);
  emptyRange.setBackground("#fffde7");  // 연한 노랑 = 입력 필요 표시

  // 문의 상태 드롭다운
  const statusRule = SpreadsheetApp.newDataValidation()
    .requireValueInList(["미문의", "문의 완료", "미디어킷 수령", "단가 확인", "진행 확정", "보류"])
    .setAllowInvalid(false)
    .build();
  sheet.getRange(2, 12, data.length, 1).setDataValidation(statusRule);

  // 적합도 컬러링
  colorByFitness(sheet, data);

  // 카테고리별 색 구분
  colorByCategory(sheet, data);

  // 열 너비 조정
  sheet.setColumnWidth(1, 120);  // 카테고리
  sheet.setColumnWidth(2, 120);  // 플랫폼명
  sheet.setColumnWidth(3, 160);  // URL
  sheet.setColumnWidth(4, 200);  // 사용자층
  sheet.setColumnWidth(5, 160);  // 규모
  sheet.setColumnWidth(6, 200);  // 광고 상품
  sheet.setColumnWidth(7, 180);  // 단가
  sheet.setColumnWidth(8, 60);   // 적합도
  sheet.setColumnWidth(9, 160);  // 추천 형태
  sheet.setColumnWidth(10, 250); // 비고
  sheet.setColumnWidth(11, 80);  // 담당자
  sheet.setColumnWidth(12, 100); // 문의 상태
  sheet.setColumnWidth(13, 100); // 미디어킷
  sheet.setColumnWidth(14, 200); // 메모

  // 필터 적용
  sheet.getRange(1, 1, data.length + 1, headers.length).createFilter();

  // 틀 고정
  sheet.setFrozenRows(1);
  sheet.setFrozenColumns(2);

  // 테두리
  const allRange = sheet.getRange(1, 1, data.length + 1, headers.length);
  allRange.setBorder(true, true, true, true, true, true, "#e8edf1", SpreadsheetApp.BorderStyle.SOLID);

  SpreadsheetApp.getActiveSpreadsheet().toast(
    `${SHEET_NAME} 탭이 생성되었습니다. ${data.length}개 플랫폼 입력 완료.`,
    "완료",
    5
  );
}

// ============================================================
// 적합도별 색상
// ============================================================
function colorByFitness(sheet, data) {
  const fitnessColors = {
    "상": "#f0fdf4",    // 연한 초록
    "중상": "#f0f7ff",  // 연한 파랑
    "중": "#fff8e1",    // 연한 노랑
    "중하": "#fef2f2",  // 연한 빨강
    "하": "#fef2f2",
  };

  const fitnessFontColors = {
    "상": "#2ea043",
    "중상": "#4a6fa5",
    "중": "#d4a017",
    "중하": "#cf222e",
    "하": "#cf222e",
  };

  for (let i = 0; i < data.length; i++) {
    const fitness = data[i][7]; // 적합도 열 (0-indexed: 7)
    const cell = sheet.getRange(i + 2, 8);
    cell.setHorizontalAlignment("center");
    cell.setFontWeight("bold");
    if (fitnessColors[fitness]) {
      cell.setBackground(fitnessColors[fitness]);
      cell.setFontColor(fitnessFontColors[fitness]);
    }
  }
}

// ============================================================
// 카테고리별 행 색상
// ============================================================
function colorByCategory(sheet, data) {
  const categoryColors = {
    "이벤트/네트워킹": "#f8fafb",
    "스타트업 미디어": "#ffffff",
    "창업자 커뮤니티": "#f8fafb",
    "마케팅 특화": "#ffffff",
    "정부/공공": "#f8fafb",
  };

  for (let i = 0; i < data.length; i++) {
    const category = data[i][0];
    // 적합도 셀과 입력 필요 셀은 별도 색상이므로 제외
    const rowRange = sheet.getRange(i + 2, 1, 1, 7);
    if (categoryColors[category]) {
      rowRange.setBackground(categoryColors[category]);
    }
    // 추천 형태, 비고 열도
    const rowRange2 = sheet.getRange(i + 2, 9, 1, 2);
    if (categoryColors[category]) {
      rowRange2.setBackground(categoryColors[category]);
    }
  }
}

// ============================================================
// 요약 행 추가 (선택)
// ============================================================
function addSummary() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const sheet = ss.getSheetByName(SHEET_NAME);
  if (!sheet) {
    SpreadsheetApp.getActiveSpreadsheet().toast("시트가 없습니다. createPlatformSheet를 먼저 실행하세요.", "오류", 3);
    return;
  }

  const lastRow = sheet.getLastRow();
  const summaryRow = lastRow + 2;

  sheet.getRange(summaryRow, 1).setValue("📊 요약");
  sheet.getRange(summaryRow, 1).setFontWeight("bold");
  sheet.getRange(summaryRow, 1).setFontSize(11);

  sheet.getRange(summaryRow + 1, 1).setValue("적합도 '상'");
  sheet.getRange(summaryRow + 1, 2).setValue("디스콰이엇, 아웃스탠딩, 그로우앤베터, EO, 플래텀");
  sheet.getRange(summaryRow + 1, 2).setFontWeight("bold");

  sheet.getRange(summaryRow + 2, 1).setValue("즉시 실행 (0원)");
  sheet.getRange(summaryRow + 2, 2).setValue("디스콰이엇 프로덕트 등록, 페스타 이벤트 등록");

  sheet.getRange(summaryRow + 3, 1).setValue("테스트 (300~500만)");
  sheet.getRange(summaryRow + 3, 2).setValue("아웃스탠딩 뉴스레터 + 그로우앤베터 협업 + 플래텀 기사");

  sheet.getRange(summaryRow + 4, 1).setValue("스케일업 (500만+)");
  sheet.getRange(summaryRow + 4, 2).setValue("EO 뉴스레터, 리멤버 CEO 타겟팅");

  SpreadsheetApp.getActiveSpreadsheet().toast("요약이 추가되었습니다.", "완료", 3);
}
