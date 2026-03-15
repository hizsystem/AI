/**
 * 휴닉 프로젝트 마스터시트 세팅
 *
 * 휴닉 마스터시트: https://docs.google.com/spreadsheets/d/1crkZXjTlFd01vUGoaXs3zpNqgZBLh-xZwpqPQEDHDUY
 * 이 시트의 Apps Script에서 실행하세요.
 *
 * 함수: setupHuenicMaster → ▶ 실행
 *
 * 생성되는 탭:
 * 1. 종합-요약 (기존 업데이트)
 * 2. 예상매출 (신규)
 * 3. 예상지출 (신규)
 *
 * 입금 현황:
 * - 25년 미집행 비용(VAT포함): 8,429,000원
 * - 26년 1월 8일 선지급: 30,000,000원
 *
 * BC3 마스터시트에서 IMPORTRANGE로 이 시트의 합계를 참조합니다.
 */

function setupHuenicMaster() {
  var ss = SpreadsheetApp.getActiveSpreadsheet();

  updateSummary(ss);
  createRevenue(ss);
  createExpense(ss);

  SpreadsheetApp.getUi().alert(
    "완료!\n\n" +
    "1. 종합-요약 업데이트 (입금 현황 포함)\n" +
    "2. '예상매출' 탭 생성 (견적서 기준)\n" +
    "3. '예상지출' 탭 생성\n\n" +
    "BC3 마스터시트에서 IMPORTRANGE로 연동하세요."
  );
}

// ━━━ 종합 요약 업데이트 ━━━
function updateSummary(ss) {
  var sheet = ss.getSheets()[0];
  sheet.setName("종합-요약");
  sheet.clear();

  var data = [
    ["[프로젝트 개요]", "", ""],
    ["프로젝트명", "휴닉 (HUENIC)", ""],
    ["클라이언트", "(주)휴닉 / 박진아 대표", ""],
    ["담당팀", "BC3팀 (Green, 남중, 수민, APD 2명)", ""],
    ["계약기간", "2026.03 ~ 2026.12 (10개월)", ""],
    ["계약금액", 107189370, "(VAT 별도)"],
    ["", "", ""],
    ["[핵심 수치 요약]", "", ""],
    ["총 예상매출", "='예상매출'!Q14", ""],
    ["총 예산(지출)", "='예상지출'!O9", ""],
    ["현재 실매출", 0, ""],
    ["현재 실지출", 0, ""],
    ["수익률", "", ""],
    ["", "", ""],
    ["[입금 현황]", "", ""],
    ["25년 미집행 비용 (VAT포함)", 8429000, "전년도 이월"],
    ["26년 1월 8일 선지급", 30000000, ""],
    ["입금 합계", "", ""],
    ["잔여 계약금", "", "(VAT포함 기준)"],
    ["", "", ""],
    ["[업무 스콥]", "금액", "비고"],
    ["0) 전략 파트너십 (월간 브랜딩+IMC 회의)", 24000000, "월 200만 x 12"],
    ["1) 브랜딩 & 패키지 디자인", 12500000, "브랜드덱+패키지"],
    ["2) 인스타그램 기획 - VEGGIET", 30000000, "리서치+월간 기획보드"],
    ["3) 서울웰니스 (캐나다)", 30000000, "선물하기에서 전환"],
    ["4) 해외 인스타 - VINKER", 8000000, "월 80만 x 10"],
    ["5) 올영 체험단", 10689370, "선급 차감"],
    ["합계", 107189370, "VAT 별도 약 1.07억"],
  ];

  sheet.getRange(1, 1, data.length, 3).setValues(data);

  // 수식
  sheet.getRange(13, 2).setFormula('=IF(B9>0, (B9-B10)/B9, 0)');
  sheet.getRange(13, 2).setNumberFormat('0.0%');
  sheet.getRange(18, 2).setFormula('=SUM(B16:B17)');
  sheet.getRange(19, 2).setFormula('=B6*1.1-B18');

  // 스타일
  sheet.getRange(1, 1).setFontWeight("bold").setFontSize(12);
  sheet.getRange(8, 1).setFontWeight("bold").setFontSize(12);
  sheet.getRange(15, 1).setFontWeight("bold").setFontSize(12);
  sheet.getRange(21, 1, 1, 3).setFontWeight("bold").setBackground("#f3f4f6");
  sheet.getRange(28, 1, 1, 3).setFontWeight("bold").setBackground("#e5e7eb");
  sheet.getRange(18, 1, 2, 3).setFontWeight("bold");

  // 금액 포맷
  sheet.getRange(6, 2).setNumberFormat("#,##0");
  sheet.getRange(9, 2, 4, 1).setNumberFormat("#,##0");
  sheet.getRange(16, 2, 4, 1).setNumberFormat("#,##0");
  sheet.getRange(22, 2, 7, 1).setNumberFormat("#,##0");

  for (var i = 1; i <= 3; i++) sheet.autoResizeColumn(i);
}

// ━━━ 예상매출 ━━━
function createRevenue(ss) {
  var existing = ss.getSheetByName("예상매출");
  if (existing) ss.deleteSheet(existing);
  // 기존 이름도 체크
  var existingOld = ss.getSheetByName("2026 예상 매출");
  if (existingOld) ss.deleteSheet(existingOld);

  var sheet = ss.insertSheet("예상매출");

  // 헤더: A:구분, B:항목, C:금액, D:1월 ~ O:12월, P:비고, Q:연간합계
  var headers = [
    "구분", "항목", "금액(공급가)",
    "1월", "2월", "3월", "4월", "5월", "6월",
    "7월", "8월", "9월", "10월", "11월", "12월",
    "비고", "연간합계"
  ];
  sheet.getRange(1, 1, 1, headers.length).setValues([headers]);
  sheet.getRange(1, 1, 1, headers.length).setFontWeight("bold").setBackground("#f3f4f6");

  var data = [
    // row 2-3: 전략 파트너십
    ["0) 전략 파트너십", "월간 브랜딩 회의 (대표급)", 14400000,
     1200000, 1200000, 1200000, 1200000, 1200000, 1200000,
     1200000, 1200000, 1200000, 1200000, 1200000, 1200000,
     "월 100만(공급가) x 12", ""],
    ["0) 전략 파트너십", "월간 IMC 회의 (실무급) + AI 대시보드", 9600000,
     0, 0, 960000, 960000, 960000, 960000,
     960000, 960000, 960000, 960000, 960000, 960000,
     "월 96만 x 10개월", ""],

    // row 4-7: 브랜딩 & 패키지
    ["1) 브랜딩&패키지", "영업용 브랜드덱 (국/영 4종)", 6000000,
     0, 0, 0, 6000000, 0, 0, 0, 0, 0, 0, 0, 0, "4월 납품", ""],
    ["1) 브랜딩&패키지", "스트로베리 패키지", 1000000,
     0, 1000000, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, "2월 완료", ""],
    ["1) 브랜딩&패키지", "프로틴바 3종 패키지", 3500000,
     0, 0, 0, 0, 3500000, 0, 0, 0, 0, 0, 0, 0, "5월 예정", ""],
    ["1) 브랜딩&패키지", "슈퍼 클렌즈 2종 패키지", 2000000,
     0, 0, 0, 0, 2000000, 0, 0, 0, 0, 0, 0, 0, "5월 예정", ""],

    // row 8-10: 인스타 VEGGIET
    ["2) 인스타 VEGGIET", "마켓 리서치 (상반기)", 5000000,
     0, 0, 0, 5000000, 0, 0, 0, 0, 0, 0, 0, 0, "", ""],
    ["2) 인스타 VEGGIET", "마켓 리서치 (하반기)", 5000000,
     0, 0, 0, 0, 0, 0, 0, 0, 5000000, 0, 0, 0, "", ""],
    ["2) 인스타 VEGGIET", "월간 기획보드 (월 200만 x 10)", 20000000,
     0, 0, 2000000, 2000000, 2000000, 2000000,
     2000000, 2000000, 2000000, 2000000, 2000000, 2000000, "", ""],

    // row 11: 서울웰니스
    ["3) 서울웰니스", "캐나다 전용 (6개월)", 30000000,
     0, 0, 0, 0, 5000000, 5000000,
     5000000, 5000000, 5000000, 5000000, 0, 0, "5~10월", ""],

    // row 12: VINKER
    ["4) VINKER", "빙커 최소유지 (월 80만 x 10)", 8000000,
     0, 0, 800000, 800000, 800000, 800000,
     800000, 800000, 800000, 800000, 800000, 800000, "3~12월", ""],

    // row 13: 올영
    ["5) 올영 체험단", "체험단 운영 (선급 차감)", 10689370,
     7587370, 3102000, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, "1~2월 정산", ""],
  ];

  sheet.getRange(2, 1, data.length, data[0].length).setValues(data);

  // Q열: 연간합계 수식
  for (var i = 2; i <= data.length + 1; i++) {
    sheet.getRange(i, 17).setFormula("=SUM(D" + i + ":O" + i + ")");
  }

  // 합계 행 (row 14)
  var totalRow = data.length + 2;
  sheet.getRange(totalRow, 1).setValue("합계");
  sheet.getRange(totalRow, 1).setFontWeight("bold");
  sheet.getRange(totalRow, 1, 1, headers.length).setBackground("#e5e7eb");

  sheet.getRange(totalRow, 3).setFormula("=SUM(C2:C" + (totalRow-1) + ")");
  for (var col = 4; col <= 15; col++) {
    var letter = String.fromCharCode(64 + col);
    sheet.getRange(totalRow, col).setFormula("=SUM(" + letter + "2:" + letter + (totalRow-1) + ")");
  }
  sheet.getRange(totalRow, 17).setFormula("=SUM(Q2:Q" + (totalRow-1) + ")");

  // 금액 포맷
  sheet.getRange(2, 3, data.length + 1, 1).setNumberFormat("#,##0");
  sheet.getRange(2, 4, data.length + 1, 12).setNumberFormat("#,##0");
  sheet.getRange(2, 17, data.length + 1, 1).setNumberFormat("#,##0");

  // 구분별 색상
  var colors = {
    "0)": "#f0fdf4", "1)": "#eff6ff", "2)": "#fef3c7",
    "3)": "#fce7f3", "4)": "#f5f3ff", "5)": "#ecfdf5"
  };
  for (var i = 0; i < data.length; i++) {
    var prefix = String(data[i][0]).substring(0, 2);
    if (colors[prefix]) {
      sheet.getRange(i + 2, 1, 1, headers.length).setBackground(colors[prefix]);
    }
  }

  for (var i = 1; i <= headers.length; i++) sheet.autoResizeColumn(i);
}

// ━━━ 예상지출 ━━━
function createExpense(ss) {
  var existing = ss.getSheetByName("예상지출");
  if (existing) ss.deleteSheet(existing);
  var existingOld = ss.getSheetByName("2026 예상 지출");
  if (existingOld) ss.deleteSheet(existingOld);

  var sheet = ss.insertSheet("예상지출");

  var headers = [
    "카테고리", "항목",
    "1월", "2월", "3월", "4월", "5월", "6월",
    "7월", "8월", "9월", "10월", "11월", "12월",
    "연간합계"
  ];
  sheet.getRange(1, 1, 1, headers.length).setValues([headers]);
  sheet.getRange(1, 1, 1, headers.length).setFontWeight("bold").setBackground("#f3f4f6");

  var data = [
    ["인건비", "팀 인건비 (프로젝트 비율 배분)", 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, ""],
    ["외주비", "스튜디오 촬영 (상반기)", 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, ""],
    ["외주비", "인플루언서/시딩 비용", 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, ""],
    ["광고비", "팔로워 광고비 (별도 선정)", 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, ""],
    ["툴비용", "피그마/캔바 등 (프로젝트 배분)", 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, ""],
    ["기타", "출장비/교통비 등", 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, ""],
    ["기타", "올영 체험단 제품비 (선급 차감)", 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, ""],
  ];

  sheet.getRange(2, 1, data.length, data[0].length).setValues(data);

  // O열: 연간합계 수식
  for (var i = 2; i <= data.length + 1; i++) {
    sheet.getRange(i, 15).setFormula("=SUM(C" + i + ":N" + i + ")");
  }

  // 합계 행 (row 9)
  var totalRow = data.length + 2;
  sheet.getRange(totalRow, 1).setValue("합계");
  sheet.getRange(totalRow, 1).setFontWeight("bold");
  sheet.getRange(totalRow, 1, 1, headers.length).setBackground("#e5e7eb");

  for (var col = 3; col <= 14; col++) {
    var letter = String.fromCharCode(64 + col);
    sheet.getRange(totalRow, col).setFormula("=SUM(" + letter + "2:" + letter + (totalRow-1) + ")");
  }
  sheet.getRange(totalRow, 15).setFormula("=SUM(O2:O" + (totalRow-1) + ")");

  // 금액 포맷
  sheet.getRange(2, 3, data.length + 1, 13).setNumberFormat("#,##0");

  sheet.getRange(2, 1).setNote("인건비는 팀 총괄에서 프로젝트 비율로 배분. 지출 발생 시 여기에 기입.");

  for (var i = 1; i <= headers.length; i++) sheet.autoResizeColumn(i);
}
