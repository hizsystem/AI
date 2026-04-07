/**
 * TSB 최종 정산 시트 — 수정견적 + 정산 + 지급일정
 *
 * 사용법:
 * 1. 견적서 구글시트 열기
 * 2. 확장 프로그램 > Apps Script
 * 3. 이 코드 전체 붙여넣기
 * 4. 함수 선택: buildSettlement → 실행
 * 5. 권한 승인
 *
 * 시트 구조 전제:
 * - A~F열: 기존 견적서 (구분/항목/단가/기준/수량/합계)
 * - 1행: 헤더
 * - 28행: 합계 행
 */

function buildSettlement() {
  var ss = SpreadsheetApp.getActiveSpreadsheet();

  // ── 1. 수정 견적 탭 생성 ──
  buildRevised_(ss);

  // ── 2. 정산 탭 생성 ──
  buildSummary_(ss);

  SpreadsheetApp.getUi().alert('완료! "수정견적" 탭과 "정산" 탭을 확인하세요.');
}


// ═══════════════════════════════════════
// 수정 견적 탭
// ═══════════════════════════════════════
function buildRevised_(ss) {
  var src = ss.getSheets()[0]; // 첫 번째 시트 = 원 견적
  var sheet = ss.getSheetByName('수정견적');
  if (sheet) ss.deleteSheet(sheet);
  sheet = src.copyTo(ss).setName('수정견적');

  // G~I 헤더
  sheet.getRange('G1').setValue('수정 수량');
  sheet.getRange('H1').setValue('수정 합계');
  sheet.getRange('I1').setValue('변경 사유');

  // 헤더 서식
  var headerRange = sheet.getRange('G1:I1');
  headerRange.setFontWeight('bold')
    .setBackground('#1a1a2e')
    .setFontColor('#ffffff')
    .setHorizontalAlignment('center');

  // ── 1) 상암점 디자인 — 기본촬영 수량만 조정 ──

  // 행5: 메뉴 촬영 (기본) 35→25
  sheet.getRange('G5').setValue(25);
  sheet.getRange('H5').setValue(6250000).setNumberFormat('#,##0');
  sheet.getRange('I5').setValue('실촬영 25개 (35→25)');

  // 행7: 스타일링 — 변경 없음 (유지)

  // 행9: 1) 소계 수정 (17,250,000 - 2,500,000 = 14,750,000)
  sheet.getRange('H9').setValue(14750000).setNumberFormat('#,##0');
  sheet.getRange('I9').setValue('기본촬영 25/35 반영 (-2,500,000)');

  // ── 2) 브랜드 IMC — 변경 없음 ──
  sheet.getRange('H17').setValue(50000000).setNumberFormat('#,##0');
  sheet.getRange('I17').setValue('변경 없음');

  // ── 3) 리테이너 — 바이럴/인플루언서만 0원 처리 ──

  // 행23: 바이럴/인플루언서 → 미진행
  sheet.getRange('G23').setValue(0);
  sheet.getRange('H23').setValue(0).setNumberFormat('#,##0');
  sheet.getRange('I23').setValue('미진행');

  // 행27: 3) 소계 수정 (108,000,000 - 12,000,000 = 96,000,000)
  sheet.getRange('H27').setValue(96000000).setNumberFormat('#,##0');
  sheet.getRange('I27').setValue('인플루언서 제외 (-12,000,000)');

  // ── 합계 ──
  // 행28: 수정 합계 (14,750,000 + 50,000,000 + 96,000,000 = 160,750,000)
  sheet.getRange('H28').setValue(160750000).setNumberFormat('#,##0');
  sheet.getRange('I28').setValue('원 175,250,000 대비 -14,500,000');

  // ── 수정 합계 열 서식 ──
  var modifiedCol = sheet.getRange('H1:H28');
  modifiedCol.setBackground('#fffde7'); // 연한 노란색
  sheet.getRange('H1').setBackground('#1a1a2e'); // 헤더는 유지

  // 변경 사유 열 서식
  var reasonCol = sheet.getRange('I2:I28');
  reasonCol.setFontSize(9).setFontColor('#666666');

  // 소계/합계 행 강조
  [9, 17, 27, 28].forEach(function(row) {
    sheet.getRange('H' + row).setFontWeight('bold');
    if (row === 28) {
      sheet.getRange('G' + row + ':I' + row)
        .setBackground('#e8eaf6')
        .setFontWeight('bold')
        .setFontSize(11);
    }
  });

  // 변경된 행 왼쪽 표시 (H열에 연노랑 이미 적용, 추가로 변경행 테두리)
  [5, 23].forEach(function(row) {
    sheet.getRange('G' + row + ':I' + row)
      .setBorder(null, true, null, null, null, null, '#ff9800', SpreadsheetApp.BorderStyle.SOLID_MEDIUM);
  });

  // 열 너비 조정
  sheet.setColumnWidth(7, 80);   // G: 수정 수량
  sheet.setColumnWidth(8, 120);  // H: 수정 합계
  sheet.setColumnWidth(9, 220);  // I: 변경 사유
}


// ═══════════════════════════════════════
// 정산 + 지급일정 탭
// ═══════════════════════════════════════
function buildSummary_(ss) {
  var sheet = ss.getSheetByName('정산');
  if (sheet) ss.deleteSheet(sheet);
  sheet = ss.insertSheet('정산');

  // 열 너비
  sheet.setColumnWidth(1, 40);   // A: 번호
  sheet.setColumnWidth(2, 200);  // B: 항목
  sheet.setColumnWidth(3, 250);  // C: 상세
  sheet.setColumnWidth(4, 130);  // D: 금액
  sheet.setColumnWidth(5, 180);  // E: 비고

  var data = [];
  var formats = [];
  var bolds = [];
  var bgs = [];
  var aligns = [];

  function row(a, b, c, d, e, opts) {
    opts = opts || {};
    data.push([a || '', b || '', c || '', d || '', e || '']);
    bolds.push([
      opts.bold || false, opts.bold || false, opts.bold || false,
      opts.bold || false, opts.bold || false
    ]);
    bgs.push([
      opts.bg || null, opts.bg || null, opts.bg || null,
      opts.bg || null, opts.bg || null
    ]);
    aligns.push([
      'center', 'left', 'left', 'right', 'left'
    ]);
  }

  // ═══ 섹션 1: 수행 내역 ═══
  row('', 'TSB 최종 정산서', '', '', '2026-04-06 기준', {bold: true, bg: '#1a1a2e'});
  row('', '', '', '', '');
  row('', '■ 수행 내역 (수정견적 기준)', '', '금액', '', {bold: true, bg: '#e8eaf6'});
  row('1', '상암점 디자인 개발', '메뉴판+그래픽+촬영25개+스타일링', 14750000, '기본촬영 35→25 (-2,500,000)');
  row('2', '브랜드 IMC 전략 기획', '리서치+전략+캠페인+BI+컬러톤', 50000000, '변경 없음');
  row('3', '마케팅 운영 리테이너', '인플루언서 제외', 96000000, '원 108,000,000 (-12,000,000)');
  row('', '', '수정 견적 합계', 160750000, '', {bold: true, bg: '#f5f5f5'});
  row('', '', '', '', '');

  // ═══ 섹션 2: 수금 현황 ═══
  row('', '■ 수금 현황', '', '금액', '', {bold: true, bg: '#e8eaf6'});
  row('', '기수금', '입금 완료', 15000000, '');
  row('', '미수금', '수정견적 - 기수금', 145750000, '← 탭샵바에서 받아야 할 돈', {bold: true});
  row('', '', '', '', '');

  // ═══ 섹션 3: 외주비 ═══
  row('', '■ 외주비 (HIZ 실비)', '', '금액', '', {bold: true, bg: '#e8eaf6'});
  row('', '프론트킷', 'BI 보완 + 가이드라인', 8200641, '');
  row('', '프론트킷', '(상암점) VMD 디자인', 5689592, '');
  row('', '', '프론트킷 소계 (VAT별도)', 13900000, '', {bold: true});
  row('', '', '프론트킷 VAT (10%)', 1390000, '');
  row('', '', '프론트킷 합계 (VAT포함)', 15290000, '', {bold: true});
  row('', '', '', '', '');
  row('', '김희종 실장', '프로젝트 매니징', 2000000, '월 2,000,000 x 2개월');
  row('', '', '김희종 소계 (VAT별도)', 4000000, '', {bold: true});
  row('', '', '김희종 VAT (10%)', 400000, '');
  row('', '', '김희종 합계 (VAT포함)', 4400000, '', {bold: true});
  row('', '', '', '', '');
  row('', '', '외주비 총합계 (VAT포함)', 19690000, '프론트킷 15,290,000 + 김희종 4,400,000', {bold: true, bg: '#fff3e0'});
  row('', '', '', '', '');

  // ═══ 섹션 4: 최종 정산 ═══
  row('', '■ 최종 정산', '', '금액', '', {bold: true, bg: '#e8eaf6'});
  row('A', '수정 견적 합계', '', 160750000, '');
  row('B', '(-) 기수금', '', -15000000, '');
  row('C', '(-) 외주비 (VAT포함)', '프론트킷 + 김희종', -19690000, '');
  row('', '', 'HIZ 순수익 (A+B+C)', 126060000, '', {bold: true, bg: '#e8f5e9'});
  row('', '', '', '', '');

  // ═══ 섹션 5: 지급 일정 ═══
  row('', '■ 지급 일정', '', '', '', {bold: true, bg: '#e3f2fd'});
  row('', '', '', '', '');
  row('', '시기', '방향', '금액', '비고', {bold: true, bg: '#e3f2fd'});
  row('1', '즉시', 'HIZ → 프론트킷', 15290000, 'BI+VMD, VAT포함');
  row('2', '즉시', 'HIZ → 김희종', 4400000, '2개월분, VAT포함');
  row('3', '~4/11', '탭샵바 → HIZ', 37250000, '원 2월말 예정분 (계약 근거)');
  row('4', '~4/25 이후', '탭샵바 → HIZ', 108500000, '잔금 (협의)');
  row('', '', '청구 합계 (탭샵바→HIZ)', 145750000, '', {bold: true, bg: '#e3f2fd'});
  row('', '', '', '', '');

  // ═══ 섹션 6: 변경 비교 ═══
  row('', '■ 원 계약 vs 수정견적', '', '', '', {bold: true, bg: '#e8eaf6'});
  row('', '원 계약', '12개월 풀 스콥', 175250000, '');
  row('', '수정 견적', '촬영 수량 조정 + 인플루언서 제외', 160750000, '');
  row('', '차액', '', -14500000, '', {bold: true});
  row('', '', '  기본촬영 35→25개', -2500000, '250,000 x 10개');
  row('', '', '  인플루언서 12개월분 제외', -12000000, '1,000,000 x 12개월');

  // ── 데이터 입력 ──
  var numRows = data.length;
  var range = sheet.getRange(1, 1, numRows, 5);
  range.setValues(data);

  // ── 서식 적용 ──
  for (var i = 0; i < numRows; i++) {
    var rowRange = sheet.getRange(i + 1, 1, 1, 5);

    // 볼드
    if (bolds[i][0]) rowRange.setFontWeight('bold');

    // 배경색
    if (bgs[i][0]) rowRange.setBackground(bgs[i][0]);

    // 정렬
    sheet.getRange(i + 1, 1).setHorizontalAlignment('center');
    sheet.getRange(i + 1, 4).setHorizontalAlignment('right');
  }

  // 1행 (타이틀) 특별 서식
  sheet.getRange(1, 1, 1, 5)
    .setFontColor('#ffffff')
    .setFontSize(13);

  // D열 숫자 포맷
  sheet.getRange('D1:D' + numRows).setNumberFormat('#,##0');

  // 음수 빨간색
  for (var j = 0; j < numRows; j++) {
    if (typeof data[j][3] === 'number' && data[j][3] < 0) {
      sheet.getRange(j + 1, 4).setFontColor('#d32f2f');
    }
  }

  // 전체 폰트
  range.setFontFamily('Pretendard');

  // 테두리 - 섹션 구분선
  var sectionStarts = [3, 9, 13, 20, 27, 36]; // ■ 행들
  sectionStarts.forEach(function(r) {
    if (r <= numRows) {
      sheet.getRange(r, 1, 1, 5)
        .setBorder(true, null, true, null, null, null, '#bdbdbd', SpreadsheetApp.BorderStyle.SOLID);
    }
  });

  // 시트 고정
  sheet.setFrozenRows(1);
}


// ═══════════════════════════════════════
// 개별 실행용 (테스트)
// ═══════════════════════════════════════
function buildRevisedOnly() {
  buildRevised_(SpreadsheetApp.getActiveSpreadsheet());
}

function buildSummaryOnly() {
  buildSummary_(SpreadsheetApp.getActiveSpreadsheet());
}
