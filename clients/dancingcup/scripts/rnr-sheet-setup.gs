/**
 * 댄싱컵 R&R 시트 생성 스크립트
 * 사용법: 구글시트 > 확장 프로그램 > Apps Script > 이 코드 붙여넣기 > setupDancingcupRnR() 실행
 */

function setupDancingcupRnR() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();

  // 기존 시트가 있으면 삭제
  let existing = ss.getSheetByName("댄싱컵 R&R");
  if (existing) ss.deleteSheet(existing);

  const sheet = ss.insertSheet("댄싱컵 R&R");

  // 컬럼 너비 설정
  sheet.setColumnWidth(1, 120);  // 프로젝트 목표
  sheet.setColumnWidth(2, 320);  // 세부 TASK
  sheet.setColumnWidth(3, 100);  // 담당
  sheet.setColumnWidth(4, 300);  // 역할
  sheet.setColumnWidth(5, 300);  // To-do
  sheet.setColumnWidth(6, 80);   // 상태

  // 헤더
  const header = ["프로젝트 목표", "세부 TASK", "담당", "역할", "To-do", "상태"];
  sheet.getRange(1, 1, 1, 6).setValues([header])
    .setBackground("#1a1a1a")
    .setFontColor("#ffffff")
    .setFontWeight("bold")
    .setFontSize(11)
    .setVerticalAlignment("middle")
    .setHorizontalAlignment("center");
  sheet.setRowHeight(1, 36);

  // 데이터
  const data = [
    ["채널 운영", "인스타그램 운영\n(고감도 이미지 + AI 영상)", "남중", "기획·제작·업로드", "예산 재정리, scope 확정, 톤가이드 v1", ""],
    ["", "트위터(X) 운영", "지은", "실시간 포스팅·밈 대응", "계정 개설, 페르소나 확정, 초기 포스팅 시작", ""],
    ["", "틱톡 운영 (미러링)", "미정", "숏폼 업로드·해시태그 관리", "계정 개설, 미러링 워크플로우 세팅", ""],
    ["광고", "메타 광고 운영", "남중, 석환", "기획·세팅·최적화", "광고 계정 권한 수령, 경상권 타겟 세팅", ""],
    ["바이럴", "인플루언서 바이럴\n(월리테이너 + 신메뉴)", "지은", "섭외·관리·리포트", "부산/경남 인플루언서 롱리스트 20명", ""],
    ["", "릴스 크루 운영 (싸갈플레이)\n*제작업체", "BC3T", "홍보 (에타, 당근, 지역커뮤니티, 링커리어)\n대외활동겸알바겸", "크루 모집 채널 세팅", ""],
    ["", "블로그 체험단 운영", "미정", "모집·관리·검수", "월 8~10명, 검색 수비용", ""],
    ["가맹점", "가맹점 콘텐츠 키트", "미정", "피그마 템플릿·POP 제작", "적극 매장 리스트업 (댄싱컵 운영팀과 협의)", ""],
    ["전략/PM", "전략 총괄·월간 리포팅", "성민", "전략 디렉팅, 클라이언트 커뮤니케이션, 리포트", "미팅 노트 발송, 월간 리포트 프레임", ""],
    ["", "콘텐츠 소스 수급 관리", "미정", "변팀장 ↔ BR 소통 창구", "촬영 리스트 10개 전달, 수급 루틴 확립", ""],
    ["리서치", "소셜 리스닝·트렌드 모니터링", "미정", "주간 트렌드 체크, 소비자 반응 추적", "모니터링 체계 세팅", ""],
    ["", "딥라떼 메뉴명 대안 리서치", "성민", "검색 선점 가능한 네이밍 제안", "다음 회의 전까지", ""],
  ];

  const startRow = 2;
  sheet.getRange(startRow, 1, data.length, 6).setValues(data)
    .setVerticalAlignment("top")
    .setWrap(true)
    .setFontSize(10);

  // 행 높이
  for (let i = startRow; i < startRow + data.length; i++) {
    sheet.setRowHeight(i, 48);
  }

  // 프로젝트 목표 컬럼 스타일 (볼드 + 배경색)
  const goalColors = {
    "채널 운영": "#E8F0FE",
    "광고": "#FCE8E6",
    "바이럴": "#FEF7E0",
    "가맹점": "#E6F4EA",
    "전략/PM": "#F3E8FD",
    "리서치": "#E8EAED",
  };

  for (let i = 0; i < data.length; i++) {
    const row = startRow + i;
    const goal = data[i][0];
    if (goal) {
      sheet.getRange(row, 1).setFontWeight("bold").setFontSize(11);
      const color = goalColors[goal] || "#F8F9FA";
      sheet.getRange(row, 1, 1, 6).setBackground(color);
    }
  }

  // "미정" 셀 하이라이트
  for (let i = 0; i < data.length; i++) {
    if (data[i][2] === "미정") {
      sheet.getRange(startRow + i, 3)
        .setFontColor("#D93025")
        .setFontWeight("bold");
    }
  }

  // 상태 컬럼 드롭다운
  const statusRule = SpreadsheetApp.newDataValidation()
    .requireValueInList(["미착수", "진행중", "완료", "보류"])
    .build();
  sheet.getRange(startRow, 6, data.length, 1).setDataValidation(statusRule)
    .setHorizontalAlignment("center");

  // 테두리
  sheet.getRange(1, 1, data.length + 1, 6)
    .setBorder(true, true, true, true, true, true, "#D9D9D9", SpreadsheetApp.BorderStyle.SOLID);

  // ── 빠진 항목 섹션 ──
  const gapRow = startRow + data.length + 2;
  sheet.getRange(gapRow, 1).setValue("⚠ 담당 미정 항목 — 결정 필요")
    .setFontWeight("bold")
    .setFontSize(12)
    .setFontColor("#D93025");

  const gapHeader = ["#", "항목", "왜 필요한지", "제안"];
  sheet.getRange(gapRow + 1, 1, 1, 4).setValues([gapHeader])
    .setBackground("#D93025")
    .setFontColor("#ffffff")
    .setFontWeight("bold");

  const gaps = [
    ["1", "틱톡 담당자", "미러링이라도 업로드 주체 필요. 5/12 캠페인 맞추려면 즉시", "남중(인스타 겸임) or 지은(X 겸임)?"],
    ["2", "체험단 담당", "검색 수비 — 바이럴 → 검색 전환의 핵심", "지은이 인플루언서와 묶어서?"],
    ["3", "가맹점 키트 담당", "매달 키트 제작 + 배포", "디자이너 필요 (수민?)"],
    ["4", "콘텐츠 소스 수급 창구", "변팀장에게 촬영 리스트 보내고 받는 실무 담당", "PM 라인에서 처리?"],
    ["5", "소셜 리스닝/트렌드 모니터링", "X 실시간 운영 + 트렌드 캐치의 기반", "지은(X 운영 겸임)?"],
  ];

  sheet.getRange(gapRow + 2, 1, gaps.length, 4).setValues(gaps)
    .setVerticalAlignment("top")
    .setWrap(true)
    .setFontSize(10);

  sheet.getRange(gapRow + 2, 1, gaps.length, 4)
    .setBackground("#FFF0F0")
    .setBorder(true, true, true, true, true, true, "#D9D9D9", SpreadsheetApp.BorderStyle.SOLID);

  // 고정
  sheet.setFrozenRows(1);

  // 첫 시트로 이동
  ss.setActiveSheet(sheet);
  ss.moveActiveSheet(1);

  SpreadsheetApp.getUi().alert("댄싱컵 R&R 시트가 생성되었습니다.");
}
