/**
 * 미례국밥 공유용 대시보드 v2 — KPI 트래킹
 * 새 시트에 생성 후, 기존 대시보드 탭에 복사하세요.
 * 실행: createDashboardV2()
 */
function createDashboardV2() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  let sheet = ss.getSheetByName('대시보드v2');
  if (sheet) { ss.deleteSheet(sheet); }
  sheet = ss.insertSheet('대시보드v2');

  // ── 타이틀 ──
  sheet.getRange('A1').setValue('미례국밥 x 브랜드라이즈 | KPI 대시보드').setFontSize(14).setFontWeight('bold');
  sheet.getRange('A1:H1').merge().setBackground('#1a1a1a').setFontColor('#FFFFFF');

  // ── 컬럼 헤더 (3행) ──
  const headers = ['지표', '4월 초', 'W1', 'W2', 'W3', 'W4', '4월 말', '목표'];
  sheet.getRange(3, 1, 1, 8).setValues([headers]).setFontWeight('bold').setBackground('#F5F5F5');

  // ── 검색량 ──
  const r1 = 4;
  sheet.getRange(r1, 1).setValue('검색량').setFontWeight('bold');
  sheet.getRange(r1, 1, 1, 8).setBackground('#E8F5E9');
  sheet.getRange(r1 + 1, 1, 1, 8).setValues([
    ['미례국밥 월간 검색량', '2,690', '', '3,330', '', '', '', '유지~상승']
  ]);

  // ── NP 센텀점 ──
  const r2 = 7;
  sheet.getRange(r2, 1).setValue('NP 센텀점').setFontWeight('bold');
  sheet.getRange(r2, 1, 1, 8).setBackground('#E3F2FD');
  sheet.getRange(r2 + 1, 1, 3, 8).setValues([
    ['조회수', '', '', '', '', '', '', ''],
    ['전화 클릭', '', '', '', '', '', '', ''],
    ['길찾기 클릭', '', '', '', '', '', '', ''],
  ]);

  // ── NP 전포점 ──
  const r3 = 12;
  sheet.getRange(r3, 1).setValue('NP 전포점').setFontWeight('bold');
  sheet.getRange(r3, 1, 1, 8).setBackground('#E3F2FD');
  sheet.getRange(r3 + 1, 1, 3, 8).setValues([
    ['조회수', '', '', '', '', '', '', ''],
    ['전화 클릭', '', '', '', '', '', '', ''],
    ['길찾기 클릭', '', '', '', '', '', '', ''],
  ]);

  // ── 콘텐츠 실행 ──
  const r4 = 17;
  sheet.getRange(r4, 1).setValue('콘텐츠 실행').setFontWeight('bold');
  sheet.getRange(r4, 1, 1, 8).setBackground('#FFF3E0');
  sheet.getRange(r4 + 1, 1, 3, 8).setValues([
    ['블로그 발행 (누적)', 0, '', '', '', '', '', '5편'],
    ['릴스/씨딩 (누적)', 0, '', '', '', '', '', '5~7개'],
    ['체험단 발행 (누적)', 0, '', '', '', '', '', ''],
  ]);

  // ── 서식 ──
  // 열 너비
  sheet.setColumnWidth(1, 180);
  for (let c = 2; c <= 8; c++) { sheet.setColumnWidth(c, 90); }

  // 데이터 영역 가운데 정렬
  sheet.getRange(3, 2, 18, 7).setHorizontalAlignment('center');

  // 목표 열 주황 볼드
  sheet.getRange(3, 8, 18, 1).setFontColor('#EA580C').setFontWeight('bold');

  // 지표명 열 왼쪽 정렬
  sheet.getRange(3, 1, 18, 1).setHorizontalAlignment('left');

  // 프리즈
  sheet.setFrozenRows(3);
  sheet.setFrozenColumns(1);

  // 불필요한 열/행 정리
  if (sheet.getMaxColumns() > 9) {
    sheet.deleteColumns(10, sheet.getMaxColumns() - 9);
  }

  SpreadsheetApp.flush();
  Browser.msgBox('대시보드 v2 생성 완료! → 기존 대시보드 탭에 복사하세요.');
}
