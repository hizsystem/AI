/**
 * KPI 트래킹 탭 재구성 — 채널별 그룹 + 주차 기준
 * 실행: updateKPITab()
 */

function updateKPITab() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();

  let sheet = ss.getSheetByName('KPI 트래킹');
  if (sheet) { ss.deleteSheet(sheet); }
  sheet = ss.insertSheet('KPI 트래킹');

  // ── 1행: 채널 그룹 헤더 ──
  const groupHeaders = [
    '', '',
    'NP 센텀점', '', '', '',
    'NP 전포점', '', '', '',
    '인스타그램', '', '',
    '메타광고', '', '',
    ''
  ];
  sheet.getRange(1, 1, 1, groupHeaders.length).setValues([groupHeaders]);

  // 그룹 병합
  sheet.getRange(1, 3, 1, 4).merge();   // NP 센텀점
  sheet.getRange(1, 7, 1, 4).merge();   // NP 전포점
  sheet.getRange(1, 11, 1, 3).merge();  // 인스타그램
  sheet.getRange(1, 14, 1, 3).merge();  // 메타광고

  // 그룹 헤더 서식
  sheet.getRange(1, 1, 1, 17).setFontWeight('bold').setHorizontalAlignment('center').setFontSize(10);
  sheet.getRange(1, 3, 1, 4).setBackground('#E8F5E9');   // NP 센텀 초록
  sheet.getRange(1, 7, 1, 4).setBackground('#E3F2FD');   // NP 전포 파랑
  sheet.getRange(1, 11, 1, 3).setBackground('#FFF3E0');  // 인스타 주황
  sheet.getRange(1, 14, 1, 3).setBackground('#F3E5F5');  // 메타 보라

  // ── 2행: 세부 컬럼 헤더 ──
  const headers = [
    '주차', '검색량',
    '조회수', '전화', '길찾기', '리뷰수',
    '조회수', '전화', '길찾기', '리뷰수',
    '팔로워', '주간도달', '주간저장',
    '주간지출', '도달', '클릭',
    '비고'
  ];
  sheet.getRange(2, 1, 1, headers.length).setValues([headers]);
  sheet.getRange(2, 1, 1, headers.length)
    .setBackground('#0D0D0D')
    .setFontColor('#FFFFFF')
    .setFontWeight('bold')
    .setFontSize(9)
    .setHorizontalAlignment('center');

  // ── 데이터 행: 주차별 ──
  const weeks = [
    ['W1', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '베이스라인 (4/7)'],
    ['W2', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', ''],
    ['W3', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', ''],
    ['W4', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '4월 마감'],
  ];
  sheet.getRange(3, 1, weeks.length, weeks[0].length).setValues(weeks);

  // ── 4월 합계/평균 행 ──
  sheet.getRange(8, 1).setValue('4월 평균').setFontWeight('bold');
  sheet.getRange(8, 1, 1, 17).setBackground('#F5F5F5');

  for (let col = 2; col <= 16; col++) {
    const c = String.fromCharCode(64 + col);
    sheet.getRange(8, col).setFormula('=IF(COUNTA(' + c + '3:' + c + '6)=0,"",AVERAGE(' + c + '3:' + c + '6))');
  }

  // ── 서식 ──
  sheet.getRange(3, 2, 10, 15).setNumberFormat('#,##0');
  sheet.getRange(3, 14, 10, 1).setNumberFormat('#,##0');  // 메타 지출

  // ── 열 너비 ──
  sheet.setColumnWidth(1, 60);   // 주차
  sheet.setColumnWidth(2, 80);   // 검색량
  for (let i = 3; i <= 16; i++) { sheet.setColumnWidth(i, 75); }
  sheet.setColumnWidth(17, 180); // 비고

  // ── 고정 ──
  sheet.setFrozenRows(2);
  sheet.setFrozenColumns(1);

  Browser.msgBox('KPI 트래킹 탭 재구성 완료!');
}
