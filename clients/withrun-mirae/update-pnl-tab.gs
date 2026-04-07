/**
 * 월간 P&L 탭 → 견적-실비-마진 추적 탭으로 교체
 * 기존 "월간 P&L" 탭을 삭제하고 새로 생성
 * 실행: replacePnLTab()
 */

function replacePnLTab() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();

  // 기존 탭 삭제
  let old = ss.getSheetByName('월간 P&L');
  if (old) { ss.deleteSheet(old); }

  const sheet = ss.insertSheet('비용 마진 추적');

  // ── 상단 안내 ──
  sheet.getRange('A1').setValue('*내부 인건비 제외 — 외부 실비만 기록');
  sheet.getRange('A1').setFontColor('#999999').setFontSize(9).setFontStyle('italic');

  // ── 헤더 (3행) ──
  const headers = ['월', '구분', '항목', '내용', '견적(VAT별도)', '예상 실비', '실 지출', '마진', '수익률', '비고'];
  sheet.getRange(3, 1, 1, headers.length).setValues([headers]);
  sheet.getRange(3, 1, 1, headers.length)
    .setBackground('#0D0D0D')
    .setFontColor('#FFFFFF')
    .setFontWeight('bold')
    .setFontSize(9)
    .setHorizontalAlignment('center');

  // ── 4월 데이터 ──
  const data = [
    // Part 1. 채널 전략 & 검색 기반
    ['4월', 'Part 1', '채널 운영 전략 수립', '인스타 컨셉/무드보드/가이드라인/KPI', 1000000, 0, '', '', '', '내부 작업 (실비 없음)'],
    ['4월', 'Part 1', 'NP 키워드 최적화', '소개문/태그/광고세팅/소식/리뷰가이드', 1000000, 170000, '', '', '', '에드로그 2만+NP광고 15만'],
    ['4월', 'Part 1', '블로그 → 체험단 교체', '체험단 15건 (기존 블로그 5편 대체)', 700000, 400000, '', '', '', '블로그 70만→체험단 40만 (30만 절감)'],
    ['4월', '', '', 'Part 1 소계', '', '', '', '', '', ''],

    // Part 2. 인플루언서 씨딩 & 광고
    ['4월', 'Part 2', '인플루언서 씨딩 5~7명', '무가 씨딩+코디+QC', 800000, 800000, '', '', '', '전액 외부 지급'],
    ['4월', 'Part 2', '메타 광고 세팅·운영', '세팅비 30만 + 광고비 50만', 800000, 500000, '', '', '', '광고비 실비 50만, 세팅은 내부'],
    ['4월', 'Part 2', '리뷰 시스템 구조화', '템플릿10종/이벤트/운영가이드', 700000, 0, '', '', '', '내부 작업 (실비 없음)'],
    ['4월', '', '', 'Part 2 소계', '', '', '', '', '', ''],

    // 별도 비용
    ['4월', '별도', '부산 출장 교통비', '당일치기', '', '', '', '', '', '미정'],
    ['4월', '별도', '부산 출장 식비', '', '', '', '', '', '', '미정'],
    ['4월', '별도', '짐벌 대여', '필요 시', '', '', '', '', '', '미정'],
    ['4월', '', '', '별도 소계', '', '', '', '', '', ''],

    // 월 합계
    ['', '', '', '', '', '', '', '', '', ''],
    ['4월', '', '', '4월 합계', '', '', '', '', '', '']
  ];

  sheet.getRange(4, 1, data.length, data[0].length).setValues(data);

  // ── 수식 ──
  const startRow = 4;

  // 각 행의 마진 = 견적 - 실지출 (실지출이 비어있으면 예상실비 사용)
  for (let i = 0; i < data.length; i++) {
    const row = startRow + i;
    if (data[i][4] !== '' && typeof data[i][4] === 'number') {
      // 마진 = 견적 - IF(실지출 비어있으면 예상실비, 아니면 실지출)
      sheet.getRange(row, 8).setFormula('=E' + row + '-IF(G' + row + '="",F' + row + ',G' + row + ')');
      // 수익률 = 마진 / 견적
      sheet.getRange(row, 9).setFormula('=IF(E' + row + '=0,"",H' + row + '/E' + row + ')');
    }
  }

  // Part 1 소계 (row 7)
  const p1SumRow = 7;
  sheet.getRange(p1SumRow, 5).setFormula('=SUM(E4:E6)');   // 견적
  sheet.getRange(p1SumRow, 6).setFormula('=SUM(F4:F6)');   // 예상 실비
  sheet.getRange(p1SumRow, 7).setFormula('=SUM(G4:G6)');   // 실 지출
  sheet.getRange(p1SumRow, 8).setFormula('=E7-IF(G7=0,F7,G7)');
  sheet.getRange(p1SumRow, 9).setFormula('=IF(E7=0,"",H7/E7)');

  // Part 2 소계 (row 11)
  const p2SumRow = 11;
  sheet.getRange(p2SumRow, 5).setFormula('=SUM(E8:E10)');
  sheet.getRange(p2SumRow, 6).setFormula('=SUM(F8:F10)');
  sheet.getRange(p2SumRow, 7).setFormula('=SUM(G8:G10)');
  sheet.getRange(p2SumRow, 8).setFormula('=E11-IF(G11=0,F11,G11)');
  sheet.getRange(p2SumRow, 9).setFormula('=IF(E11=0,"",H11/E11)');

  // 별도 소계 (row 15)
  const etcSumRow = 15;
  sheet.getRange(etcSumRow, 5).setFormula('=SUM(E12:E14)');
  sheet.getRange(etcSumRow, 6).setFormula('=SUM(F12:F14)');
  sheet.getRange(etcSumRow, 7).setFormula('=SUM(G12:G14)');
  sheet.getRange(etcSumRow, 8).setFormula('=E15-IF(G15=0,F15,G15)');
  sheet.getRange(etcSumRow, 9).setFormula('=IF(E15=0,"",H15/E15)');

  // 4월 합계 (row 17)
  const totalRow = 17;
  sheet.getRange(totalRow, 5).setFormula('=E7+E11+E15');
  sheet.getRange(totalRow, 6).setFormula('=F7+F11+F15');
  sheet.getRange(totalRow, 7).setFormula('=G7+G11+G15');
  sheet.getRange(totalRow, 8).setFormula('=E17-IF(G17=0,F17,G17)');
  sheet.getRange(totalRow, 9).setFormula('=IF(E17=0,"",H17/E17)');

  // ── 서식 ──

  // 금액 서식
  sheet.getRange(4, 5, 20, 4).setNumberFormat('#,##0');
  sheet.getRange(4, 9, 20, 1).setNumberFormat('0.0%');

  // 소계 행 강조
  for (let r of [p1SumRow, p2SumRow, etcSumRow]) {
    sheet.getRange(r, 1, 1, 10).setBackground('#F3F4F6').setFontWeight('bold');
  }

  // 합계 행 강조
  sheet.getRange(totalRow, 1, 1, 10).setBackground('#0D0D0D').setFontColor('#FFFFFF').setFontWeight('bold');

  // 마진 빨강/초록 (조건부 서식은 수동으로 — 여기선 기본만)
  // 수익률 100% = 내부작업, 0% = 전액 외부

  // ── 열 너비 ──
  sheet.setColumnWidth(1, 50);   // 월
  sheet.setColumnWidth(2, 70);   // 구분
  sheet.setColumnWidth(3, 200);  // 항목
  sheet.setColumnWidth(4, 280);  // 내용
  sheet.setColumnWidth(5, 120);  // 견적
  sheet.setColumnWidth(6, 100);  // 예상 실비
  sheet.setColumnWidth(7, 100);  // 실 지출
  sheet.setColumnWidth(8, 100);  // 마진
  sheet.setColumnWidth(9, 70);   // 수익률
  sheet.setColumnWidth(10, 200); // 비고

  sheet.setFrozenRows(3);

  // ── 구분 드롭다운 ──
  const partRule = SpreadsheetApp.newDataValidation()
    .requireValueInList(['Part 1', 'Part 2', '별도'], true)
    .build();
  sheet.getRange(4, 2, 100, 1).setDataValidation(partRule);

  Browser.msgBox('비용 마진 추적 탭 생성 완료!\n\n사용법:\n- "실 지출" 컬럼은 실제 결제 후 기록\n- 비어있으면 "예상 실비"로 마진 계산\n- 5월부터는 4월 아래에 행 추가하면 됨');
}
