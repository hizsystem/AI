/**
 * BC3팀 총괄 대시보드 — Apps Script
 *
 * 1T 마스터시트 구조 기반 + BC3팀 맞춤
 *
 * 사용법:
 *   1. BC3 총괄 시트에서 확장 프로그램 → Apps Script
 *   2. 이 코드 붙여넣기
 *   3. PROJECTS 배열에 프로젝트 정보 입력
 *   4. setupSummarySheet() 실행
 *
 * 탭 구성 (4탭):
 *   1. Dashboard          — KPI + 프로젝트별 현황 + 마스터시트 링크
 *   2. 월별 수익 요약       — 매출 vs 지출 vs 인건비 = 수익률 (1T 2탭 구조)
 *   3. 월별 캐시플로우      — 입금 예정/실입금/미수금 트래킹
 *   4. 팀 리소스           — 팀원별 프로젝트 배정 + 가동률
 */


// ═══════════════════════════════════════════════
// CONFIG
// ═══════════════════════════════════════════════

// BC3팀 기본정보
const TEAM = {
  name: 'BC3',
  kpiPerPerson: 300000000,  // 인당 3억
  members: [
    { name: '우성민', role: 'Lead PM', monthlyCost: 0 },
    { name: '김남중', role: 'PM', monthlyCost: 0 },
    { name: '이수민', role: 'Designer', monthlyCost: 0 },
    { name: '나석환', role: 'Intern', monthlyCost: 0 },
    { name: '안지은', role: 'Intern', monthlyCost: 0 },
  ],
};

// KPI 목표 = 인당 KPI × 인원수
const KPI_TARGET = TEAM.kpiPerPerson * TEAM.members.length; // 15억

// 프로젝트 목록 — 새 프로젝트 수주 시 여기에 추가
const PROJECTS = [
  {
    name: '현대차정몽구재단',
    client: '현대차정몽구재단',
    type: '소셜미디어/앰버서더',
    period: '26/01~26/12',
    months: 12,
    expectedRevenue: 416530000,
    leadPM: '김남중',
    sheetUrl: '',  // 프로젝트 마스터시트 URL
    status: '수주 완료',
  },
  {
    name: '탭삽바',
    client: '탭삽바',
    type: '컨설팅',
    period: '26/02~26/04',
    months: 2,
    expectedRevenue: 68250000,
    leadPM: '우성민',
    sheetUrl: '',
    status: '수주 완료',
  },
  {
    name: '휴닉',
    client: '(주)휴닉',
    type: 'IMC',
    period: '26/01~26/12',
    months: 12,
    expectedRevenue: 150000000,
    leadPM: '우성민',
    sheetUrl: '',
    status: '수주 완료',
  },
  {
    name: '미례국밥',
    client: '위드런',
    type: 'IMC',
    period: '26/04~26/12',
    months: 9,
    expectedRevenue: 50000000,
    leadPM: '우성민',
    sheetUrl: '',
    status: '수주 완료',
  },
  {
    name: '명동식당',
    client: '명동식당',
    type: '네이버플레이스',
    period: '26/04~26/04',
    months: 1,
    expectedRevenue: 550000,
    leadPM: '김남중',
    sheetUrl: '',
    status: '수주 완료',
  },
  {
    name: '벤더리움',
    client: 'MYSC',
    type: '인스타그램 콘텐츠',
    period: '26/03~26/12',
    months: 10,
    expectedRevenue: 2200000,
    leadPM: '이수민',
    sheetUrl: '',
    status: '수주 완료',
  },
  {
    name: '댄싱컵',
    client: '위드런',
    type: 'IMC',
    period: '26/04~26/12',
    months: 9,
    expectedRevenue: 80000000,
    leadPM: '우성민',
    sheetUrl: '',
    status: '수주 완료',
  },
];

const MONTHS = ['1월','2월','3월','4월','5월','6월','7월','8월','9월','10월','11월','12월'];


// ═══════════════════════════════════════════════
// 공통 스타일
// ═══════════════════════════════════════════════
function applyHeaderStyle(range) {
  range.setBackground('#1a1a1a').setFontColor('#FFFFFF').setFontWeight('bold');
}

function applyTotalStyle(range) {
  range.setBackground('#E8F5E9').setFontWeight('bold');
}

function getOrCreate(ss, name) {
  let sheet = ss.getSheetByName(name);
  if (!sheet) { sheet = ss.insertSheet(name); }
  else { sheet.clear(); }
  return sheet;
}


// ═══════════════════════════════════════════════
// 메인 실행
// ═══════════════════════════════════════════════
function setupSummarySheet() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();

  createDashboardTab(ss);
  createMonthlyProfitTab(ss);
  createCashflowTab(ss);
  createTeamResourceTab(ss);

  // 기본 시트 삭제
  const defaultSheet = ss.getSheetByName('Sheet1') || ss.getSheetByName('시트1');
  if (defaultSheet && ss.getSheets().length > 1) {
    ss.deleteSheet(defaultSheet);
  }

  SpreadsheetApp.flush();
  Browser.msgBox('✅ BC3 총괄 대시보드 생성 완료!');
}


// ═══════════════════════════════════════════════
// 1. Dashboard
// ═══════════════════════════════════════════════
function createDashboardTab(ss) {
  const sheet = getOrCreate(ss, 'Dashboard');

  // ── 타이틀 ──
  sheet.getRange('A1').setValue('[BC3팀 2026 프로젝트 총괄]').setFontSize(14).setFontWeight('bold');

  // ── KPI 섹션 ──
  sheet.getRange('A3').setValue('KPI (인당 ' + (TEAM.kpiPerPerson / 100000000).toFixed(0) + '억 × ' + TEAM.members.length + '명)')
       .setFontWeight('bold').setFontSize(11);

  const kpiHeaders = ['', '구분', '금액', 'KPI 달성률'];
  sheet.getRange(4, 1, 1, 4).setValues([kpiHeaders]);
  sheet.getRange(4, 1, 1, 4).setBackground('#E3F2FD').setFontWeight('bold');

  const kpiData = [
    ['', 'KPI 목표', KPI_TARGET, ''],
    ['', '예상매출 (연간)', '', ''],  // 프로젝트 합산 수식
    ['', '현재 실매출', '', ''],      // 수동 입력 or IMPORTRANGE
  ];
  sheet.getRange(5, 1, kpiData.length, 4).setValues(kpiData);

  // 예상매출 = 프로젝트별 예상매출 합계 (아래 프로젝트 현황에서 SUM)
  const projectStartRow = 11;
  const projectEndRow = projectStartRow + PROJECTS.length - 1;
  sheet.getRange(6, 3).setFormula('=SUM(C' + projectStartRow + ':C' + projectEndRow + ')');
  sheet.getRange(6, 4).setFormula('=IF(C5=0,0,C6/C5)');  // 달성률
  sheet.getRange(7, 3).setFormula('=SUM(D' + projectStartRow + ':D' + projectEndRow + ')');
  sheet.getRange(7, 4).setFormula('=IF(C5=0,0,C7/C5)');  // 달성률

  // 금액/비율 서식
  sheet.getRange(5, 3, 3, 1).setNumberFormat('#,##0');
  sheet.getRange(6, 4, 2, 1).setNumberFormat('0.00%');

  // ── 프로젝트별 현황 ──
  sheet.getRange('A9').setValue('[프로젝트별 현황]').setFontWeight('bold').setFontSize(11);

  const projHeaders = ['', '프로젝트', '총 예상매출', '현재 실매출', '총 예상 예산(지출)', '현재 실지출', '현재 수익률', '마스터시트'];
  sheet.getRange(10, 1, 1, projHeaders.length).setValues([projHeaders]);
  // 컬럼별 색상 (1T 스타일)
  sheet.getRange(10, 1, 1, 2).setBackground('#E3F2FD').setFontWeight('bold');  // 프로젝트
  sheet.getRange(10, 3, 1, 2).setBackground('#E3F2FD').setFontWeight('bold');  // 매출 (파랑)
  sheet.getRange(10, 5, 1, 2).setBackground('#FFCDD2').setFontWeight('bold');  // 지출 (빨강)
  sheet.getRange(10, 7, 1, 1).setBackground('#FFF9C4').setFontWeight('bold');  // 수익률 (노랑)
  sheet.getRange(10, 8, 1, 1).setBackground('#E8F5E9').setFontWeight('bold');  // 링크

  // 프로젝트 데이터
  PROJECTS.forEach((proj, i) => {
    const row = projectStartRow + i;
    sheet.getRange(row, 2).setValue(proj.name);
    sheet.getRange(row, 3).setValue(proj.expectedRevenue);
    // 실매출, 예상지출, 실지출은 수동 입력 or IMPORTRANGE
    // 수익률 수식
    sheet.getRange(row, 7).setFormula(
      '=IF(D' + row + '=0,"",IF(F' + row + '=0,1,(D' + row + '-F' + row + ')/D' + row + '))'
    );
    // 마스터시트 링크
    if (proj.sheetUrl) {
      sheet.getRange(row, 8).setFormula('=HYPERLINK("' + proj.sheetUrl + '","(' + proj.name + ' 마스터시트)")');
    } else {
      sheet.getRange(row, 8).setValue('(' + proj.name + ' 마스터시트)').setFontColor('#999999');
    }
  });

  // 팀 인건비 행
  const laborRow = projectEndRow + 1;
  sheet.getRange(laborRow, 2).setValue('팀 인건비(' + TEAM.members.length + '명)')
       .setFontWeight('bold').setBackground('#FFF3E0');
  sheet.getRange(laborRow, 3).setValue('').setBackground('#FFF3E0');
  sheet.getRange(laborRow, 1, 1, projHeaders.length).setBackground('#FFF3E0');

  // 합계행
  const totalRow = laborRow + 1;
  sheet.getRange(totalRow, 2).setValue('합계').setFontWeight('bold').setFontSize(12);
  sheet.getRange(totalRow, 3).setFormula('=SUM(C' + projectStartRow + ':C' + laborRow + ')');
  sheet.getRange(totalRow, 4).setFormula('=SUM(D' + projectStartRow + ':D' + laborRow + ')');
  sheet.getRange(totalRow, 5).setFormula('=SUM(E' + projectStartRow + ':E' + laborRow + ')');
  sheet.getRange(totalRow, 6).setFormula('=SUM(F' + projectStartRow + ':F' + laborRow + ')');
  sheet.getRange(totalRow, 7).setFormula('=IF(D' + totalRow + '=0,0,(D' + totalRow + '-F' + totalRow + ')/D' + totalRow + ')');
  applyTotalStyle(sheet.getRange(totalRow, 1, 1, projHeaders.length));

  // 금액 서식
  sheet.getRange(projectStartRow, 3, PROJECTS.length + 2, 4).setNumberFormat('#,##0');
  sheet.getRange(projectStartRow, 7, PROJECTS.length + 2, 1).setNumberFormat('0.0%');

  // 열 너비
  sheet.setColumnWidth(1, 30);
  sheet.setColumnWidth(2, 160);
  sheet.setColumnWidth(3, 130);
  sheet.setColumnWidth(4, 130);
  sheet.setColumnWidth(5, 150);
  sheet.setColumnWidth(6, 130);
  sheet.setColumnWidth(7, 110);
  sheet.setColumnWidth(8, 200);
}


// ═══════════════════════════════════════════════
// 2. 월별 수익 요약 (1T 2탭 구조 그대로)
// ═══════════════════════════════════════════════
function createMonthlyProfitTab(ss) {
  const sheet = getOrCreate(ss, '월별 수익 요약');

  sheet.getRange('A1').setValue('[월별 수익 요약]').setFontSize(14).setFontWeight('bold');

  // 헤더
  const headers = ['', '예상수주액', '실수주액'].concat(MONTHS);
  sheet.getRange(3, 1, 1, headers.length).setValues([headers]);
  sheet.getRange(3, 1, 1, headers.length).setBackground('#F5F5F5').setFontWeight('bold');

  // ── 총 매출 섹션 ──
  const revenueStartRow = 4;
  sheet.getRange(revenueStartRow, 1).setValue('총 매출').setFontWeight('bold').setFontSize(11);
  sheet.getRange(revenueStartRow, 1, 1, headers.length).setBackground('#E8F5E9').setFontWeight('bold');

  // 프로젝트별 매출 행
  PROJECTS.forEach((proj, i) => {
    const row = revenueStartRow + 1 + i;
    sheet.getRange(row, 1).setValue(proj.name);
    sheet.getRange(row, 2).setValue(proj.expectedRevenue);
    // 실수주액, 월별 매출은 수동 or IMPORTRANGE
  });

  // 총 매출 합계 수식
  const revenueDataStart = revenueStartRow + 1;
  const revenueDataEnd = revenueStartRow + PROJECTS.length;
  // 예상수주액 합계
  sheet.getRange(revenueStartRow, 2).setFormula('=SUM(B' + revenueDataStart + ':B' + revenueDataEnd + ')');
  sheet.getRange(revenueStartRow, 3).setFormula('=SUM(C' + revenueDataStart + ':C' + revenueDataEnd + ')');
  // 월별 합계
  for (let c = 4; c <= 15; c++) {
    const colLetter = String.fromCharCode(64 + c);
    sheet.getRange(revenueStartRow, c).setFormula('=SUM(' + colLetter + revenueDataStart + ':' + colLetter + revenueDataEnd + ')');
  }

  // ── 총 지출 섹션 ──
  const expenseStartRow = revenueDataEnd + 2;
  sheet.getRange(expenseStartRow, 1).setValue('총 지출').setFontWeight('bold').setFontSize(11);
  sheet.getRange(expenseStartRow, 1, 1, headers.length).setBackground('#FFEBEE').setFontWeight('bold');

  // 프로젝트별 지출 행
  PROJECTS.forEach((proj, i) => {
    const row = expenseStartRow + 1 + i;
    sheet.getRange(row, 1).setValue(proj.name);
    // 지출은 수동 or IMPORTRANGE
  });

  const expenseDataStart = expenseStartRow + 1;
  const expenseDataEnd = expenseStartRow + PROJECTS.length;

  // 총 지출 합계 수식
  sheet.getRange(expenseStartRow, 2).setFormula('=SUM(B' + expenseDataStart + ':B' + expenseDataEnd + ')');
  for (let c = 4; c <= 15; c++) {
    const colLetter = String.fromCharCode(64 + c);
    sheet.getRange(expenseStartRow, c).setFormula('=SUM(' + colLetter + expenseDataStart + ':' + colLetter + expenseDataEnd + ')');
  }

  // ── 팀 인건비 섹션 ──
  const laborStartRow = expenseDataEnd + 2;
  sheet.getRange(laborStartRow, 1).setValue('팀 인건비').setFontWeight('bold');
  sheet.getRange(laborStartRow, 1, 1, headers.length).setBackground('#FFF3E0').setFontWeight('bold');

  TEAM.members.forEach((member, i) => {
    const row = laborStartRow + 1 + i;
    sheet.getRange(row, 1).setValue(member.name);
    // 월급은 수동 입력
  });

  const laborDataStart = laborStartRow + 1;
  const laborDataEnd = laborStartRow + TEAM.members.length;

  // 인건비 합계
  sheet.getRange(laborStartRow, 2).setFormula('=SUM(B' + laborDataStart + ':B' + laborDataEnd + ')');
  for (let c = 4; c <= 15; c++) {
    const colLetter = String.fromCharCode(64 + c);
    sheet.getRange(laborStartRow, c).setFormula('=SUM(' + colLetter + laborDataStart + ':' + colLetter + laborDataEnd + ')');
  }

  // ── 수익률 행 ──
  const profitRow = laborDataEnd + 2;
  sheet.getRange(profitRow, 1).setValue('수익률').setFontWeight('bold').setFontSize(11);
  sheet.getRange(profitRow, 1, 1, headers.length).setBackground('#E3F2FD').setFontWeight('bold');

  // 수익률 = (매출 - 지출 - 인건비) / 매출
  sheet.getRange(profitRow, 2).setFormula(
    '=IF(B' + revenueStartRow + '=0,0,(B' + revenueStartRow + '-B' + expenseStartRow + '-B' + laborStartRow + ')/B' + revenueStartRow + ')'
  );
  for (let c = 4; c <= 15; c++) {
    const col = String.fromCharCode(64 + c);
    sheet.getRange(profitRow, c).setFormula(
      '=IF(' + col + revenueStartRow + '=0,0,(' + col + revenueStartRow + '-' + col + expenseStartRow + '-' + col + laborStartRow + ')/' + col + revenueStartRow + ')'
    );
  }

  // 금액 서식
  const totalDataRows = profitRow - 3;
  sheet.getRange(4, 2, totalDataRows, 14).setNumberFormat('#,##0');
  sheet.getRange(profitRow, 2, 1, 14).setNumberFormat('0.0%');

  // 열 너비
  sheet.setColumnWidth(1, 140);
  sheet.setColumnWidth(2, 120);
  sheet.setColumnWidth(3, 100);
  for (let c = 4; c <= 15; c++) { sheet.setColumnWidth(c, 100); }
}


// ═══════════════════════════════════════════════
// 3. 월별 캐시플로우
// ═══════════════════════════════════════════════
function createCashflowTab(ss) {
  const sheet = getOrCreate(ss, '월별 캐시플로우');

  sheet.getRange('A1').setValue('[월별 캐시플로우]').setFontSize(14).setFontWeight('bold');

  // 헤더
  const headers = ['구분', '프로젝트'].concat(MONTHS).concat(['합계']);
  sheet.getRange(3, 1, 1, headers.length).setValues([headers]);
  applyHeaderStyle(sheet.getRange(3, 1, 1, headers.length));

  let currentRow = 4;

  // ── 입금 예정 ──
  sheet.getRange(currentRow, 1).setValue('입금 예정').setFontWeight('bold');
  sheet.getRange(currentRow, 1, 1, headers.length).setBackground('#E8F5E9');
  currentRow++;

  PROJECTS.forEach(proj => {
    sheet.getRange(currentRow, 2).setValue(proj.name);
    // 합계 수식
    sheet.getRange(currentRow, 15).setFormula('=SUM(C' + currentRow + ':N' + currentRow + ')');
    currentRow++;
  });

  const expectedTotalRow = currentRow;
  sheet.getRange(currentRow, 1).setValue('').setFontWeight('bold');
  sheet.getRange(currentRow, 2).setValue('입금 예정 합계').setFontWeight('bold');
  for (let c = 3; c <= 15; c++) {
    const col = String.fromCharCode(64 + c);
    sheet.getRange(currentRow, c).setFormula('=SUM(' + col + '5:' + col + (currentRow - 1) + ')');
  }
  applyTotalStyle(sheet.getRange(currentRow, 1, 1, headers.length));
  currentRow += 2;

  // ── 실입금 ──
  sheet.getRange(currentRow, 1).setValue('실입금').setFontWeight('bold');
  sheet.getRange(currentRow, 1, 1, headers.length).setBackground('#C8E6C9');
  currentRow++;

  const actualStartRow = currentRow;
  PROJECTS.forEach(proj => {
    sheet.getRange(currentRow, 2).setValue(proj.name);
    sheet.getRange(currentRow, 15).setFormula('=SUM(C' + currentRow + ':N' + currentRow + ')');
    currentRow++;
  });

  const actualTotalRow = currentRow;
  sheet.getRange(currentRow, 2).setValue('실입금 합계').setFontWeight('bold');
  for (let c = 3; c <= 15; c++) {
    const col = String.fromCharCode(64 + c);
    sheet.getRange(currentRow, c).setFormula('=SUM(' + col + actualStartRow + ':' + col + (currentRow - 1) + ')');
  }
  applyTotalStyle(sheet.getRange(currentRow, 1, 1, headers.length));
  currentRow += 2;

  // ── 미수금 ──
  sheet.getRange(currentRow, 1).setValue('미수금').setFontWeight('bold');
  sheet.getRange(currentRow, 1, 1, headers.length).setBackground('#FFEBEE');
  currentRow++;

  const arRow = currentRow;
  sheet.getRange(currentRow, 2).setValue('미수금 (예정-실입금)').setFontWeight('bold');
  for (let c = 3; c <= 15; c++) {
    const col = String.fromCharCode(64 + c);
    sheet.getRange(currentRow, c).setFormula('=' + col + expectedTotalRow + '-' + col + actualTotalRow);
  }
  sheet.getRange(currentRow, 15).setFormula('=SUM(C' + currentRow + ':N' + currentRow + ')');
  sheet.getRange(currentRow, 1, 1, headers.length).setBackground('#FFCDD2').setFontWeight('bold');
  currentRow += 2;

  // ── 실지출 ──
  sheet.getRange(currentRow, 1).setValue('실지출').setFontWeight('bold');
  sheet.getRange(currentRow, 1, 1, headers.length).setBackground('#FFEBEE');
  currentRow++;

  const expStartRow = currentRow;
  PROJECTS.forEach(proj => {
    sheet.getRange(currentRow, 2).setValue(proj.name);
    sheet.getRange(currentRow, 15).setFormula('=SUM(C' + currentRow + ':N' + currentRow + ')');
    currentRow++;
  });

  const expTotalRow = currentRow;
  sheet.getRange(currentRow, 2).setValue('실지출 합계').setFontWeight('bold');
  for (let c = 3; c <= 15; c++) {
    const col = String.fromCharCode(64 + c);
    sheet.getRange(currentRow, c).setFormula('=SUM(' + col + expStartRow + ':' + col + (currentRow - 1) + ')');
  }
  sheet.getRange(currentRow, 1, 1, headers.length).setBackground('#FFCDD2').setFontWeight('bold');
  currentRow += 2;

  // ── 순 캐시플로우 ──
  sheet.getRange(currentRow, 1).setValue('순 캐시플로우').setFontWeight('bold').setFontSize(11);
  sheet.getRange(currentRow, 2).setValue('실입금 - 실지출').setFontWeight('bold');
  for (let c = 3; c <= 15; c++) {
    const col = String.fromCharCode(64 + c);
    sheet.getRange(currentRow, c).setFormula('=' + col + actualTotalRow + '-' + col + expTotalRow);
  }
  sheet.getRange(currentRow, 1, 1, headers.length).setBackground('#E3F2FD').setFontWeight('bold');

  // 금액 서식
  sheet.getRange(4, 3, currentRow - 3, 13).setNumberFormat('#,##0');

  // 열 너비
  sheet.setColumnWidth(1, 90);
  sheet.setColumnWidth(2, 160);
  for (let c = 3; c <= 14; c++) { sheet.setColumnWidth(c, 100); }
  sheet.setColumnWidth(15, 120);

  sheet.setFrozenRows(3);
  sheet.setFrozenColumns(2);
}


// ═══════════════════════════════════════════════
// 4. 팀 리소스
// ═══════════════════════════════════════════════
function createTeamResourceTab(ss) {
  const sheet = getOrCreate(ss, '팀 리소스');

  sheet.getRange('A1').setValue('[BC3팀 리소스 배정]').setFontSize(14).setFontWeight('bold');

  // ── 팀원별 프로젝트 배정 매트릭스 ──
  sheet.getRange('A3').setValue('[팀원 × 프로젝트 배정]').setFontWeight('bold').setFontSize(11);

  // 헤더: 팀원명 → 프로젝트들
  const matrixHeaders = ['팀원', '역할'];
  PROJECTS.forEach(p => matrixHeaders.push(p.name));
  matrixHeaders.push('총 프로젝트 수');

  sheet.getRange(4, 1, 1, matrixHeaders.length).setValues([matrixHeaders]);
  applyHeaderStyle(sheet.getRange(4, 1, 1, matrixHeaders.length));

  // 팀원 행
  TEAM.members.forEach((member, i) => {
    const row = 5 + i;
    sheet.getRange(row, 1).setValue(member.name);
    sheet.getRange(row, 2).setValue(member.role);

    // Lead PM 자동 표시
    PROJECTS.forEach((proj, j) => {
      if (proj.leadPM === member.name) {
        sheet.getRange(row, 3 + j).setValue('Lead');
        sheet.getRange(row, 3 + j).setBackground('#C8E6C9');
      }
    });

    // 총 프로젝트 수 (빈 셀이 아닌 셀 카운트)
    const startCol = String.fromCharCode(67); // C
    const endCol = String.fromCharCode(67 + PROJECTS.length - 1);
    sheet.getRange(row, matrixHeaders.length).setFormula(
      '=COUNTA(C' + row + ':' + endCol + row + ')'
    );
  });

  // 상태 드롭다운 (Lead/Support/빈칸)
  const statusRule = SpreadsheetApp.newDataValidation()
    .requireValueInList(['Lead', 'Support', '서포트', ''], true)
    .build();
  sheet.getRange(5, 3, TEAM.members.length, PROJECTS.length).setDataValidation(statusRule);

  // ── 프로젝트별 요약 ──
  const summaryRow = 5 + TEAM.members.length + 2;
  sheet.getRange(summaryRow, 1).setValue('[프로젝트별 인력 현황]').setFontWeight('bold').setFontSize(11);

  const summaryHeaders = ['프로젝트', 'Lead PM', '기간', '월수', '상태', '비고'];
  sheet.getRange(summaryRow + 1, 1, 1, summaryHeaders.length).setValues([summaryHeaders]);
  sheet.getRange(summaryRow + 1, 1, 1, summaryHeaders.length).setBackground('#E3F2FD').setFontWeight('bold');

  PROJECTS.forEach((proj, i) => {
    const row = summaryRow + 2 + i;
    sheet.getRange(row, 1).setValue(proj.name);
    sheet.getRange(row, 2).setValue(proj.leadPM);
    sheet.getRange(row, 3).setValue(proj.period);
    sheet.getRange(row, 4).setValue(proj.months);
    sheet.getRange(row, 5).setValue(proj.status);
  });

  // 열 너비
  sheet.setColumnWidth(1, 100);
  sheet.setColumnWidth(2, 80);
  for (let c = 3; c <= 2 + PROJECTS.length; c++) { sheet.setColumnWidth(c, 100); }
  sheet.setColumnWidth(matrixHeaders.length, 120);

  sheet.setFrozenRows(4);
}
