/**
 * BC3팀 마스터시트에 휴닉 프로젝트 매출/지출 데이터 입력
 *
 * 마스터시트: https://docs.google.com/spreadsheets/d/19Vlz6i7swopqqXwfrzp1WIkYuys73te7Z0fCevQfaLc
 *
 * 이 스크립트를 마스터시트의 Apps Script에서 실행하세요.
 * 함수: updateHuenic → ▶ 실행
 *
 * 견적 기준: brief.md (2026-03-09 ver.)
 */

function updateHuenic() {
  var ss = SpreadsheetApp.getActiveSpreadsheet();

  // ─── 1. 종합 요약 (첫 번째 탭) 업데이트 ───
  updateSummary(ss);

  // ─── 2. 휴닉 예상 매출 탭 생성 ───
  createRevenueTab(ss);

  // ─── 3. 휴닉 예상 지출 탭 생성 ───
  createExpenseTab(ss);

  SpreadsheetApp.getUi().alert(
    "휴닉 데이터 입력 완료!\n\n" +
    "- 종합 요약: 휴닉 행 업데이트\n" +
    "- '휴닉-예상매출' 탭 생성\n" +
    "- '휴닉-예상지출' 탭 생성"
  );
}

function updateSummary(ss) {
  var sheet = ss.getSheets()[0]; // 첫 번째 탭 = 종합 요약
  var data = sheet.getDataRange().getValues();

  for (var i = 0; i < data.length; i++) {
    if (String(data[i][0]).indexOf("휴닉") !== -1) {
      var row = i + 1;
      sheet.getRange(row, 2).setValue(107189370);  // 총 예상매출
      sheet.getRange(row, 3).setValue(0);           // 총 예산(지출) — 대행이라 별도 지출 없음
      sheet.getRange(row, 4).setValue(0);           // 현재 실매출
      sheet.getRange(row, 5).setValue(0);           // 현재 실지출
      // 수익률은 수식으로 자동 계산될 것
      break;
    }
  }
}

function createRevenueTab(ss) {
  // 기존 탭 있으면 삭제
  var existing = ss.getSheetByName("휴닉-예상매출");
  if (existing) ss.deleteSheet(existing);

  var sheet = ss.insertSheet("휴닉-예상매출");

  // 헤더
  var headers = ["구분", "항목", "금액(공급가)", "VAT포함", "1월","2월","3월","4월","5월","6월","7월","8월","9월","10월","11월","12월","연간합계"];
  sheet.getRange(1, 1, 1, headers.length).setValues([headers]);
  sheet.getRange(1, 1, 1, headers.length).setFontWeight("bold").setBackground("#f3f4f6");

  // 매출 데이터 (견적서 기준)
  var data = [
    // 0) 브랜드 IMC 전략 파트너십
    ["0) 전략 파트너십", "월간 브랜딩 회의 + IMC 회의 + AI 대시보드", 24000000, 26400000,
     2000000, 2000000, 2000000, 2000000, 2000000, 2000000, 2000000, 2000000, 2000000, 2000000, 2000000, 2000000, 24000000],

    // 1) 브랜딩 & 패키지 디자인
    ["1) 브랜딩&패키지", "영업용 브랜드덱 (국/영 4종)", 6000000, 6600000,
     0, 0, 0, 6000000, 0, 0, 0, 0, 0, 0, 0, 0, 6000000],
    ["1) 브랜딩&패키지", "베지어트 프로틴바 3종 패키지", 3500000, 3850000,
     0, 0, 0, 0, 3500000, 0, 0, 0, 0, 0, 0, 0, 3500000],
    ["1) 브랜딩&패키지", "슈퍼 클렌즈 2종 패키지", 2000000, 2200000,
     0, 0, 0, 0, 2000000, 0, 0, 0, 0, 0, 0, 0, 2000000],
    ["1) 브랜딩&패키지", "스트로베리 패키지 (완료)", 1000000, 1100000,
     0, 1000000, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1000000],

    // 2) 인스타그램 VEGGIET
    ["2) 인스타 VEGGIET", "마켓 리서치 (상반기)", 5000000, 5500000,
     0, 0, 0, 5000000, 0, 0, 0, 0, 0, 0, 0, 0, 5000000],
    ["2) 인스타 VEGGIET", "마켓 리서치 (하반기)", 5000000, 5500000,
     0, 0, 0, 0, 0, 0, 0, 0, 5000000, 0, 0, 0, 5000000],
    ["2) 인스타 VEGGIET", "월간 기획보드 & 레퍼런스 (월 200만 x 10)", 20000000, 22000000,
     0, 0, 2000000, 2000000, 2000000, 2000000, 2000000, 2000000, 2000000, 2000000, 2000000, 2000000, 20000000],

    // 3) 서울웰니스(캐나다) — 선물하기에서 전환
    ["3) 서울웰니스", "캐나다 전용 (선물하기 전환)", 30000000, 33000000,
     0, 0, 0, 0, 5000000, 5000000, 5000000, 5000000, 5000000, 5000000, 0, 0, 30000000],

    // 4) VINKER
    ["4) VINKER", "빙커 최소유지 운영 (월 100만 x 10)", 8000000, 8800000,
     0, 0, 800000, 800000, 800000, 800000, 800000, 800000, 800000, 800000, 800000, 800000, 8000000],

    // 5) 올영 체험단
    ["5) 올영 체험단", "1월 체험단 (1차)", 7587370, 8346107,
     7587370, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 7587370],
    ["5) 올영 체험단", "2월 체험단 (4차)", 3102000, 3412200,
     0, 3102000, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 3102000],
  ];

  if (data.length > 0) {
    sheet.getRange(2, 1, data.length, data[0].length).setValues(data);
  }

  // 합계 행
  var totalRow = data.length + 2;
  sheet.getRange(totalRow, 1).setValue("합계");
  sheet.getRange(totalRow, 1).setFontWeight("bold");
  sheet.getRange(totalRow, 3).setFormula("=SUM(C2:C" + (totalRow-1) + ")");
  sheet.getRange(totalRow, 4).setFormula("=SUM(D2:D" + (totalRow-1) + ")");
  for (var col = 5; col <= 16; col++) {
    var colLetter = String.fromCharCode(64 + col);
    sheet.getRange(totalRow, col).setFormula("=SUM(" + colLetter + "2:" + colLetter + (totalRow-1) + ")");
  }
  sheet.getRange(totalRow, 17).setFormula("=SUM(Q2:Q" + (totalRow-1) + ")");

  // 금액 포맷
  sheet.getRange(2, 3, data.length + 1, 15).setNumberFormat("#,##0");

  // 열 너비
  for (var i = 1; i <= headers.length; i++) sheet.autoResizeColumn(i);
}

function createExpenseTab(ss) {
  var existing = ss.getSheetByName("휴닉-예상지출");
  if (existing) ss.deleteSheet(existing);

  var sheet = ss.insertSheet("휴닉-예상지출");

  var headers = ["카테고리", "항목", "1월","2월","3월","4월","5월","6월","7월","8월","9월","10월","11월","12월","연간합계"];
  sheet.getRange(1, 1, 1, headers.length).setValues([headers]);
  sheet.getRange(1, 1, 1, headers.length).setFontWeight("bold").setBackground("#f3f4f6");

  // 지출 데이터 (대행 프로젝트라 직접 지출은 적음)
  var data = [
    ["인건비", "Green (Lead PM) — 프로젝트 시간 배분", 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
    ["인건비", "남중 (PM)", 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
    ["인건비", "수민 (Designer)", 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
    ["인건비", "APD 2명", 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
    ["외주비", "스튜디오 촬영 (상반기)", 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
    ["툴비용", "피그마/캔바 등 (프로젝트 배분)", 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
    ["기타", "올영 체험단 제품비 (선급 차감)", 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
  ];

  sheet.getRange(2, 1, data.length, data[0].length).setValues(data);

  // 합계 행
  var totalRow = data.length + 2;
  sheet.getRange(totalRow, 1).setValue("합계");
  sheet.getRange(totalRow, 1).setFontWeight("bold");
  for (var col = 3; col <= 14; col++) {
    var colLetter = String.fromCharCode(64 + col);
    sheet.getRange(totalRow, col).setFormula("=SUM(" + colLetter + "2:" + colLetter + (totalRow-1) + ")");
  }
  sheet.getRange(totalRow, 15).setFormula("=SUM(O2:O" + (totalRow-1) + ")");

  // 금액 포맷
  sheet.getRange(2, 3, data.length + 1, 13).setNumberFormat("#,##0");

  // 노트
  sheet.getRange(2, 1).setNote("인건비는 팀 전체 마스터시트에서 프로젝트 비율로 배분. 여기서는 0으로 두고 팀 총괄에서 관리.");

  for (var i = 1; i <= headers.length; i++) sheet.autoResizeColumn(i);
}
