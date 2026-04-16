/**
 * 미례국밥 내부 마스터시트 — bc3-master-template 기반
 *
 * 사용법:
 *   1. 새 Google Sheets 생성 → "[2026] 미례국밥 내부 마스터시트"
 *   2. 확장 프로그램 → Apps Script → 이 코드 전체 붙여넣기
 *   3. setupMasterSheet() 실행
 *   4. 기존 시트 데이터를 새 시트에 복사/붙여넣기
 *   5. 검증 완료 후 기존 시트에 "(구)" 표시
 */


// ═══════════════════════════════════════════════
// CONFIG — 미례국밥 전용
// ═══════════════════════════════════════════════
const CONFIG = {
  projectName: '미례국밥 브랜드 마케팅 파트너십',
  clientName: '(주)위드런 / 미례국밥',
  industry: '한식 프랜차이즈 (부산)',
  contractPeriod: '2026.04 ~ 2026.12',
  contractAmount: '약 5,000,000원/월 (VAT 별도, 변동)',
  startMonth: 4,
  endMonth: 12,
  monthlyRetainer: 5000000,
  leadPM: '우성민',
  teamMembers: [
    { name: '김남중', role: 'PM' },
    { name: '이수민', role: 'Designer' },
    { name: '나석환', role: 'Intern' },
    { name: '안지은', role: 'Intern' },
  ],
  clientContacts: [
    { name: '조기원', role: '대표 (위드런)', contact: '' },
    { name: '변미혜', role: '팀장 (실무 접점)', contact: 'withrun_ad@naver.com' },
  ],
  // 월별 비용 마진 — Part 구성 (기존 시트 구조 그대로)
  parts: [
    { name: 'Part 1', desc: '전략/NP/체험단', items: 4 },
    { name: 'Part 2', desc: '인플루언서/메타/리뷰', items: 4 },
    { name: '별도', desc: '촬영/제작/출장', items: 4 },
  ],
};

// 월 배열 (고정)
const MONTHS = ['1월','2월','3월','4월','5월','6월','7월','8월','9월','10월','11월','12월'];
const ACTIVE_MONTHS = MONTHS.slice(CONFIG.startMonth - 1, CONFIG.endMonth);


// ═══════════════════════════════════════════════
// 메인 실행
// ═══════════════════════════════════════════════
function setupMasterSheet() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();

  createSummaryTab(ss);
  createCostDetailTab(ss);
  createCostMarginTab(ss);
  createInfluencerTab(ss);
  createRevenueForecastTab(ss);
  createExpenseForecastTab(ss);

  // 기본 Sheet1 삭제
  const defaultSheet = ss.getSheetByName('Sheet1') || ss.getSheetByName('시트1');
  if (defaultSheet && ss.getSheets().length > 1) {
    ss.deleteSheet(defaultSheet);
  }

  SpreadsheetApp.flush();
  Browser.msgBox('✅ 미례국밥 마스터시트 생성 완료!\n\n6개 탭이 생성되었습니다.');
}


// ═══════════════════════════════════════════════
// 공통 스타일
// ═══════════════════════════════════════════════
const STYLE = {
  headerBg: '#1a1a1a',
  headerFont: '#FFFFFF',
  sectionBg: '#F5F5F5',
  subtotalBg: '#E3F2FD',
  totalBg: '#E8F5E9',
  warningBg: '#FFEBEE',
  monthBg: '#FFF9C4',
  labelColor: '#666666',
  noteColor: '#999999',
};

function applyHeader(range) {
  range.setBackground(STYLE.headerBg).setFontColor(STYLE.headerFont).setFontWeight('bold');
}
function applySubtotal(range) {
  range.setBackground(STYLE.subtotalBg).setFontWeight('bold');
}
function applyTotal(range) {
  range.setBackground(STYLE.totalBg).setFontWeight('bold');
}
function applyMonthHeader(range) {
  range.setBackground(STYLE.monthBg).setFontWeight('bold').setFontSize(11);
}
function getOrCreateSheet(ss, name) {
  let sheet = ss.getSheetByName(name);
  if (!sheet) { sheet = ss.insertSheet(name); }
  else { sheet.clear(); }
  return sheet;
}


// ═══════════════════════════════════════════════
// 1. Summary
// ═══════════════════════════════════════════════
function createSummaryTab(ss) {
  const sheet = getOrCreateSheet(ss, 'Summary');

  // ── 프로젝트 개요 ──
  sheet.getRange('A1').setValue('[프로젝트 개요]').setFontWeight('bold').setFontSize(11);

  const overviewData = [
    ['프로젝트명', CONFIG.projectName],
    ['클라이언트', CONFIG.clientName],
    ['업종', CONFIG.industry],
    ['계약기간', CONFIG.contractPeriod],
    ['계약금액', CONFIG.contractAmount],
    ['담당 Lead PM', CONFIG.leadPM],
  ];
  sheet.getRange(2, 1, overviewData.length, 2).setValues(overviewData);
  sheet.getRange(2, 1, overviewData.length, 1).setFontWeight('bold').setFontColor(STYLE.labelColor);

  // ── 핵심 수치 요약 ──
  const kpiRow = 10;
  sheet.getRange(kpiRow, 1).setValue('[핵심 수치 요약]').setFontWeight('bold').setFontSize(11);

  const kpiLabels = [
    ['총 예상 매출 (연간)', ''],
    ['총 예상 지출 (연간)', ''],
    ['예상 수익률', ''],
    ['현재 실매출', ''],
    ['현재 실지출', ''],
    ['현재 수익률', ''],
  ];
  sheet.getRange(kpiRow + 1, 1, kpiLabels.length, 2).setValues(kpiLabels);
  sheet.getRange(kpiRow + 1, 1, kpiLabels.length, 1).setFontWeight('bold').setFontColor(STYLE.labelColor);

  // 수식 연결
  sheet.getRange(kpiRow + 1, 2).setFormula("='2026 예상 매출'!N3");
  sheet.getRange(kpiRow + 2, 2).setFormula("='2026 예상 지출'!N3");
  sheet.getRange(kpiRow + 3, 2).setFormula('=IF(B' + (kpiRow+1) + '=0,0,(B' + (kpiRow+1) + '-B' + (kpiRow+2) + ')/B' + (kpiRow+1) + ')');
  sheet.getRange(kpiRow + 6, 2).setFormula('=IF(B' + (kpiRow+4) + '=0,0,(B' + (kpiRow+4) + '-B' + (kpiRow+5) + ')/B' + (kpiRow+4) + ')');

  sheet.getRange(kpiRow + 1, 2, 2, 1).setNumberFormat('#,##0');
  sheet.getRange(kpiRow + 3, 2, 1, 1).setNumberFormat('0.0%');
  sheet.getRange(kpiRow + 4, 2, 2, 1).setNumberFormat('#,##0');
  sheet.getRange(kpiRow + 6, 2, 1, 1).setNumberFormat('0.0%');

  // ── 팀구성 ──
  const teamRow = 19;
  sheet.getRange(teamRow, 1).setValue('[팀구성]').setFontWeight('bold').setFontSize(11);

  const teamData = [
    ['BC3측', CONFIG.leadPM + ' — Lead PM, 메인 커뮤니케이션'],
    ['', '김남중 — PM'],
    ['', '이수민 — Designer'],
    ['', '나석환 — Intern'],
    ['', '안지은 — Intern'],
    ['위드런측', '조기원 — 대표 (의사결정)'],
    ['', '변미혜 — 팀장 (실무 접점, 데이터 반응형)'],
  ];
  sheet.getRange(teamRow + 1, 1, teamData.length, 2).setValues(teamData);
  sheet.getRange(teamRow + 1, 1, teamData.length, 1).setFontWeight('bold').setFontColor(STYLE.labelColor);

  // ── 계정 정보 ──
  const acctRow = 29;
  sheet.getRange(acctRow, 1).setValue('[계정 정보]').setFontWeight('bold').setFontSize(11);
  sheet.getRange(acctRow, 1).setNote('⚠️ 이 섹션은 내부 전용. 공유 시트에 절대 포함 금지.');

  const acctData = [
    ['1. 네이버 플레이스 관리자 계정', ''],
    ['  센텀점 아이디', ''],
    ['  센텀점 비번', ''],
    ['  전포점 아이디', ''],
    ['  전포점 비번', ''],
    ['', ''],
    ['2. 인스타그램 공식 계정', ''],
    ['  아이디', ''],
    ['  비번', ''],
    ['', ''],
    ['3. 메타 광고 권한', ''],
    ['  아이디', ''],
    ['  비번', ''],
    ['', ''],
    ['4. 체험단 관련', ''],
    ['  플랫폼 URL', ''],
    ['  로그인 정보', ''],
  ];
  sheet.getRange(acctRow + 1, 1, acctData.length, 2).setValues(acctData);
  sheet.getRange(acctRow + 1, 1, acctData.length, 1).setFontColor(STYLE.labelColor);

  // ── 주요 링크 & 정산 ──
  const linkRow = acctRow + acctData.length + 2;
  sheet.getRange(linkRow, 1).setValue('[주요 링크 & 정산]').setFontWeight('bold').setFontSize(11);

  const linkHeaders = ['월'].concat(ACTIVE_MONTHS);
  sheet.getRange(linkRow + 1, 1, 1, linkHeaders.length).setValues([linkHeaders]);
  sheet.getRange(linkRow + 1, 1, 1, linkHeaders.length).setFontWeight('bold').setBackground(STYLE.sectionBg);

  const linkLabels = ['운영 플랜', '견적서', '보고서', '입금', '세금계산서'];
  linkLabels.forEach((label, i) => {
    sheet.getRange(linkRow + 2 + i, 1).setValue(label).setFontWeight('bold');
  });

  // ── 기타 링크 ──
  const etcRow = linkRow + linkLabels.length + 4;
  sheet.getRange(etcRow, 1).setValue('[기타 링크]').setFontWeight('bold').setFontSize(11);

  // ── 시트 색인 ──
  const idxRow = etcRow + 4;
  sheet.getRange(idxRow, 1).setValue('[시트 색인]').setFontWeight('bold').setFontSize(11);
  const indexData = [
    ['Summary', '이 탭 — 프로젝트 개요, 핵심 수치, 계정정보'],
    ['비용 상세', '월별 경비 집행 내역 (법인카드/진행비)'],
    ['월별 비용 마진', '견적 vs 비용 vs 실지출 = 마진 ★핵심'],
    ['인플루언서 관리', '씨딩/체험단 비용 상세'],
    ['2026 예상 매출', '세금계산서 기준 월별 매출 예측'],
    ['2026 예상 지출', '카테고리별 월별 지출 예측'],
  ];
  sheet.getRange(idxRow + 1, 1, indexData.length, 2).setValues(indexData);

  // 열 너비
  sheet.setColumnWidth(1, 180);
  sheet.setColumnWidth(2, 300);
  for (let c = 3; c <= linkHeaders.length; c++) { sheet.setColumnWidth(c, 120); }
}


// ═══════════════════════════════════════════════
// 2. 비용 상세
// ═══════════════════════════════════════════════
function createCostDetailTab(ss) {
  const sheet = getOrCreateSheet(ss, '비용 상세');

  const headers = [
    '월', 'NO', '구분', '항목',
    '비용(VAT별도)', '비용(VAT포함)',
    '결제방식', '결제날짜', '세금계산서방식', '발급날짜',
    '결제자/입금요청자', '비고'
  ];
  sheet.getRange(1, 1, 1, headers.length).setValues([headers]);
  applyHeader(sheet.getRange(1, 1, 1, headers.length));

  // 드롭다운
  const catRule = SpreadsheetApp.newDataValidation()
    .requireValueInList(['진행비', '광고비', '인플루언서', '체험단', '촬영', '디자인/인쇄', '출장비', '툴비용', '기타'], true).build();
  sheet.getRange(2, 3, 500, 1).setDataValidation(catRule);

  const payRule = SpreadsheetApp.newDataValidation()
    .requireValueInList(['법인카드', '계좌이체', '개인카드(정산)', '현금'], true).build();
  sheet.getRange(2, 7, 500, 1).setDataValidation(payRule);

  const taxRule = SpreadsheetApp.newDataValidation()
    .requireValueInList(['발행완료', '발행예정', '해당없음'], true).build();
  sheet.getRange(2, 9, 500, 1).setDataValidation(taxRule);

  // 월별 섹션
  let currentRow = 2;
  for (let m = CONFIG.startMonth; m <= CONFIG.endMonth; m++) {
    sheet.getRange(currentRow, 1).setValue(m + '월');
    applyMonthHeader(sheet.getRange(currentRow, 1, 1, headers.length));
    currentRow++;

    for (let i = 1; i <= 10; i++) {
      sheet.getRange(currentRow, 2).setValue(i);
      currentRow++;
    }

    const dataStart = currentRow - 10;
    const dataEnd = currentRow - 1;
    sheet.getRange(currentRow, 1).setValue(m + '월 합계');
    sheet.getRange(currentRow, 5).setFormula('=SUM(E' + dataStart + ':E' + dataEnd + ')');
    sheet.getRange(currentRow, 6).setFormula('=SUM(F' + dataStart + ':F' + dataEnd + ')');
    applyTotal(sheet.getRange(currentRow, 1, 1, headers.length));
    currentRow += 2;
  }

  sheet.getRange(2, 5, 500, 2).setNumberFormat('#,##0');

  sheet.setColumnWidth(1, 60);
  sheet.setColumnWidth(2, 40);
  sheet.setColumnWidth(3, 90);
  sheet.setColumnWidth(4, 350);
  sheet.setColumnWidth(5, 110);
  sheet.setColumnWidth(6, 110);
  sheet.setColumnWidth(7, 90);
  sheet.setColumnWidth(8, 100);
  sheet.setColumnWidth(9, 110);
  sheet.setColumnWidth(10, 100);
  sheet.setColumnWidth(11, 130);
  sheet.setColumnWidth(12, 200);
  sheet.setFrozenRows(1);
}


// ═══════════════════════════════════════════════
// 3. 월별 비용 마진 ★핵심
// ═══════════════════════════════════════════════
function createCostMarginTab(ss) {
  const sheet = getOrCreateSheet(ss, '월별 비용 마진');

  sheet.getRange('A1').setValue('* 이 탭의 월 합계행은 총괄 시트 IMPORTRANGE 참조 대상. 행 삽입/삭제 주의.')
       .setFontSize(9).setFontColor(STYLE.noteColor);

  // 헤더
  const headers = ['월', '구분', '항목', '내용', '견적(VAT별도)', '예상 비용', '실 지출', '마진', '수익률', '비고'];
  sheet.getRange(2, 1, 1, headers.length).setValues([headers]);
  applyHeader(sheet.getRange(2, 1, 1, headers.length));

  let currentRow = 3;

  for (let m = CONFIG.startMonth; m <= CONFIG.endMonth; m++) {
    const monthStartRow = currentRow;

    // ── Part 1: 전략/NP/체험단 ──
    const p1Start = currentRow;
    const p1Items = [
      [m + '월', 'Part 1', '채널 운영 전략 수립', '인스타 컨셉/무드보드/가이드라인/KPI'],
      ['', 'Part 1', 'NP 키워드 최적화', '소개문/태그/광고세팅/소식/리뷰가이드'],
      ['', 'Part 1', '블로그 → 체험단 교체', ''],
      ['', 'Part 1', '', ''],
    ];
    p1Items.forEach(item => {
      sheet.getRange(currentRow, 1, 1, 4).setValues([item]);
      sheet.getRange(currentRow, 8).setFormula('=E' + currentRow + '-G' + currentRow);
      sheet.getRange(currentRow, 9).setFormula('=IF(E' + currentRow + '=0,"",H' + currentRow + '/E' + currentRow + ')');
      currentRow++;
    });
    // Part 1 소계
    sheet.getRange(currentRow, 1).setValue(m + '월');
    sheet.getRange(currentRow, 4).setValue('Part 1 소계');
    sheet.getRange(currentRow, 5).setFormula('=SUM(E' + p1Start + ':E' + (currentRow - 1) + ')');
    sheet.getRange(currentRow, 6).setFormula('=SUM(F' + p1Start + ':F' + (currentRow - 1) + ')');
    sheet.getRange(currentRow, 7).setFormula('=SUM(G' + p1Start + ':G' + (currentRow - 1) + ')');
    sheet.getRange(currentRow, 8).setFormula('=E' + currentRow + '-G' + currentRow);
    sheet.getRange(currentRow, 9).setFormula('=IF(E' + currentRow + '=0,"",H' + currentRow + '/E' + currentRow + ')');
    applySubtotal(sheet.getRange(currentRow, 1, 1, headers.length));
    currentRow++;

    // ── Part 2: 인플루언서/메타/리뷰 ──
    const p2Start = currentRow;
    const p2Items = [
      [m + '월', 'Part 2', '인플루언서 씨딩 5~7명', '유가 씨딩+코디+QC'],
      ['', 'Part 2', '메타 광고 세팅·운영', '세팅비 + 광고비'],
      ['', 'Part 2', '리뷰 시스템 구조화', '템플릿10종/이벤트/운영가이드'],
      ['', 'Part 2', '', ''],
    ];
    p2Items.forEach(item => {
      sheet.getRange(currentRow, 1, 1, 4).setValues([item]);
      sheet.getRange(currentRow, 8).setFormula('=E' + currentRow + '-G' + currentRow);
      sheet.getRange(currentRow, 9).setFormula('=IF(E' + currentRow + '=0,"",H' + currentRow + '/E' + currentRow + ')');
      currentRow++;
    });
    // Part 2 소계
    sheet.getRange(currentRow, 1).setValue(m + '월');
    sheet.getRange(currentRow, 4).setValue('Part 2 소계');
    sheet.getRange(currentRow, 5).setFormula('=SUM(E' + p2Start + ':E' + (currentRow - 1) + ')');
    sheet.getRange(currentRow, 6).setFormula('=SUM(F' + p2Start + ':F' + (currentRow - 1) + ')');
    sheet.getRange(currentRow, 7).setFormula('=SUM(G' + p2Start + ':G' + (currentRow - 1) + ')');
    sheet.getRange(currentRow, 8).setFormula('=E' + currentRow + '-G' + currentRow);
    sheet.getRange(currentRow, 9).setFormula('=IF(E' + currentRow + '=0,"",H' + currentRow + '/E' + currentRow + ')');
    applySubtotal(sheet.getRange(currentRow, 1, 1, headers.length));
    currentRow++;

    // ── 별도: 촬영/제작/출장 ──
    const exStart = currentRow;
    const exItems = [
      [m + '월', '별도', '콘텐츠 촬영', '촬영 디렉팅/촬영 진행'],
      ['', '별도', '콘텐츠 제작', '피드 N컷+릴스 N컷 편집'],
      ['', '별도', '출장 실비', 'KTX 왕복/식비/현지교통'],
      ['', '별도', '', ''],
    ];
    exItems.forEach(item => {
      sheet.getRange(currentRow, 1, 1, 4).setValues([item]);
      sheet.getRange(currentRow, 8).setFormula('=E' + currentRow + '-G' + currentRow);
      sheet.getRange(currentRow, 9).setFormula('=IF(E' + currentRow + '=0,"",H' + currentRow + '/E' + currentRow + ')');
      currentRow++;
    });
    // 별도 소계
    sheet.getRange(currentRow, 1).setValue(m + '월');
    sheet.getRange(currentRow, 4).setValue('별도 소계');
    sheet.getRange(currentRow, 5).setFormula('=SUM(E' + exStart + ':E' + (currentRow - 1) + ')');
    sheet.getRange(currentRow, 6).setFormula('=SUM(F' + exStart + ':F' + (currentRow - 1) + ')');
    sheet.getRange(currentRow, 7).setFormula('=SUM(G' + exStart + ':G' + (currentRow - 1) + ')');
    sheet.getRange(currentRow, 8).setFormula('=E' + currentRow + '-G' + currentRow);
    sheet.getRange(currentRow, 9).setFormula('=IF(E' + currentRow + '=0,"",H' + currentRow + '/E' + currentRow + ')');
    applySubtotal(sheet.getRange(currentRow, 1, 1, headers.length));
    currentRow++;

    // ★ 월 합계행
    const p1SubtotalRow = monthStartRow + 4;   // Part1 소계 위치
    const p2SubtotalRow = p1SubtotalRow + 5;    // Part2 소계 위치
    const exSubtotalRow = p2SubtotalRow + 5;    // 별도 소계 위치

    sheet.getRange(currentRow, 1).setValue(m + '월');
    sheet.getRange(currentRow, 4).setValue(m + '월 합계');
    sheet.getRange(currentRow, 5).setFormula('=E' + p1SubtotalRow + '+E' + p2SubtotalRow + '+E' + exSubtotalRow);
    sheet.getRange(currentRow, 6).setFormula('=F' + p1SubtotalRow + '+F' + p2SubtotalRow + '+F' + exSubtotalRow);
    sheet.getRange(currentRow, 7).setFormula('=G' + p1SubtotalRow + '+G' + p2SubtotalRow + '+G' + exSubtotalRow);
    sheet.getRange(currentRow, 8).setFormula('=E' + currentRow + '-G' + currentRow);
    sheet.getRange(currentRow, 9).setFormula('=IF(E' + currentRow + '=0,"",H' + currentRow + '/E' + currentRow + ')');
    applyTotal(sheet.getRange(currentRow, 1, 1, headers.length));
    sheet.getRange(currentRow, 1, 1, headers.length).setFontSize(11);

    // Named Range
    try {
      ss.setNamedRange('margin_' + m + '_견적', sheet.getRange('E' + currentRow));
      ss.setNamedRange('margin_' + m + '_실지출', sheet.getRange('G' + currentRow));
      ss.setNamedRange('margin_' + m + '_마진', sheet.getRange('H' + currentRow));
      ss.setNamedRange('margin_' + m + '_수익률', sheet.getRange('I' + currentRow));
    } catch(e) {}

    currentRow += 2; // 빈 행
  }

  // 서식
  sheet.getRange(3, 5, 500, 4).setNumberFormat('#,##0');
  sheet.getRange(3, 9, 500, 1).setNumberFormat('0.0%');

  sheet.setColumnWidth(1, 50);
  sheet.setColumnWidth(2, 70);
  sheet.setColumnWidth(3, 180);
  sheet.setColumnWidth(4, 250);
  sheet.setColumnWidth(5, 120);
  sheet.setColumnWidth(6, 100);
  sheet.setColumnWidth(7, 100);
  sheet.setColumnWidth(8, 110);
  sheet.setColumnWidth(9, 80);
  sheet.setColumnWidth(10, 250);
  sheet.setFrozenRows(2);
}


// ═══════════════════════════════════════════════
// 4. 인플루언서 관리
// ═══════════════════════════════════════════════
function createInfluencerTab(ss) {
  const sheet = getOrCreateSheet(ss, '인플루언서 관리');

  const headers = [
    'NO', '월', '유형', '이름/계정',
    '팔로워수', '플랫폼', '카테고리',
    '협찬 내용', '비용', '결제방식',
    '컨택일', '방문/수령일', '업로드일', '업로드 URL',
    '조회수', '좋아요', '댓글', 'CPV',
    '상태', '비고'
  ];
  sheet.getRange(1, 1, 1, headers.length).setValues([headers]);
  applyHeader(sheet.getRange(1, 1, 1, headers.length));

  // 드롭다운
  sheet.getRange(2, 3, 200, 1).setDataValidation(
    SpreadsheetApp.newDataValidation()
      .requireValueInList(['인플루언서', '마이크로', '나노', '블로그체험단', '카페체험단', '유튜브', '기타'], true).build()
  );
  sheet.getRange(2, 6, 200, 1).setDataValidation(
    SpreadsheetApp.newDataValidation()
      .requireValueInList(['인스타그램', '블로그', '유튜브', '틱톡', '카페', '기타'], true).build()
  );
  sheet.getRange(2, 19, 200, 1).setDataValidation(
    SpreadsheetApp.newDataValidation()
      .requireValueInList(['후보', '컨택중', '확정', '제품발송', '방문완료', '업로드완료', '정산완료', '취소'], true).build()
  );
  sheet.getRange(2, 10, 200, 1).setDataValidation(
    SpreadsheetApp.newDataValidation()
      .requireValueInList(['무상 협찬', '유상(계좌이체)', '유상(법인카드)', '제품제공', '기타'], true).build()
  );

  // CPV 수식
  for (let r = 2; r <= 201; r++) {
    sheet.getRange(r, 18).setFormula('=IF(AND(I' + r + '>0,O' + r + '>0),I' + r + '/O' + r + ',"")');
  }

  sheet.getRange(2, 9, 200, 1).setNumberFormat('#,##0');
  sheet.getRange(2, 15, 200, 3).setNumberFormat('#,##0');
  sheet.getRange(2, 18, 200, 1).setNumberFormat('#,##0');

  sheet.setColumnWidth(1, 40);
  sheet.setColumnWidth(2, 50);
  sheet.setColumnWidth(3, 90);
  sheet.setColumnWidth(4, 160);
  sheet.setColumnWidth(5, 80);
  sheet.setColumnWidth(6, 80);
  sheet.setColumnWidth(7, 80);
  sheet.setColumnWidth(8, 150);
  sheet.setColumnWidth(9, 90);
  sheet.setColumnWidth(10, 100);
  sheet.setColumnWidth(11, 90);
  sheet.setColumnWidth(12, 90);
  sheet.setColumnWidth(13, 90);
  sheet.setColumnWidth(14, 200);
  sheet.setColumnWidth(15, 70);
  sheet.setColumnWidth(16, 60);
  sheet.setColumnWidth(17, 60);
  sheet.setColumnWidth(18, 70);
  sheet.setColumnWidth(19, 80);
  sheet.setColumnWidth(20, 200);
  sheet.setFrozenRows(1);
}


// ═══════════════════════════════════════════════
// 5. 2026 예상 매출
// ═══════════════════════════════════════════════
function createRevenueForecastTab(ss) {
  const sheet = getOrCreateSheet(ss, '2026 예상 매출');

  sheet.getRange('A1').setValue('2026 예상 매출 — 미례국밥').setFontSize(14).setFontWeight('bold');
  sheet.getRange('A1:O1').merge().setBackground(STYLE.headerBg).setFontColor(STYLE.headerFont);

  const headers = ['항목'].concat(MONTHS).concat(['합계', '비고']);
  sheet.getRange(2, 1, 1, headers.length).setValues([headers]);
  sheet.getRange(2, 1, 1, headers.length).setBackground('#37474F').setFontColor('#FFFFFF').setFontWeight('bold');

  // ★ 합계행 (행 3)
  const sumFormulas = ['합계'];
  for (let c = 2; c <= 13; c++) {
    const col = String.fromCharCode(64 + c);
    sumFormulas.push('=SUM(' + col + '5:' + col + '20)');
  }
  sumFormulas.push('=SUM(B3:M3)');
  sumFormulas.push('');
  sheet.getRange(3, 1, 1, sumFormulas.length).setValues([sumFormulas]);
  applyTotal(sheet.getRange(3, 1, 1, headers.length));

  // 리테이너 자동 입력 (4~12월)
  const retainerRow = ['리테이너 (월정액)'];
  for (let m = 1; m <= 12; m++) {
    retainerRow.push(m >= CONFIG.startMonth && m <= CONFIG.endMonth ? CONFIG.monthlyRetainer : '');
  }
  retainerRow.push('=SUM(B5:M5)');
  retainerRow.push(CONFIG.monthlyRetainer.toLocaleString() + '/월');
  sheet.getRange(5, 1, 1, retainerRow.length).setValues([retainerRow]);

  // 별도 매출 행 (촬영비, 캠페인 등)
  sheet.getRange(6, 1).setValue('촬영/제작 (별도)');
  sheet.getRange(6, 14).setFormula('=SUM(B6:M6)');
  sheet.getRange(7, 1).setValue('기타 (별도)');
  sheet.getRange(7, 14).setFormula('=SUM(B7:M7)');

  // 누적 합계 (행 22)
  sheet.getRange(22, 1).setValue('월별 누적').setFontWeight('bold');
  sheet.getRange(22, 2).setFormula('=B3');
  for (let c = 3; c <= 13; c++) {
    const prev = String.fromCharCode(63 + c);
    const cur = String.fromCharCode(64 + c);
    sheet.getRange(22, c).setFormula('=' + prev + '22+' + cur + '3');
  }
  sheet.getRange(22, 1, 1, headers.length).setBackground('#FFF9C4').setFontWeight('bold');

  // Named Range
  try {
    ss.setNamedRange('revenue_total', sheet.getRange('N3'));
    for (let m = 1; m <= 12; m++) {
      ss.setNamedRange('revenue_' + m, sheet.getRange(String.fromCharCode(65 + m) + '3'));
    }
  } catch(e) {}

  sheet.getRange(3, 2, 20, 13).setNumberFormat('#,##0');
  sheet.setColumnWidth(1, 180);
  for (let c = 2; c <= 13; c++) { sheet.setColumnWidth(c, 100); }
  sheet.setColumnWidth(14, 120);
  sheet.setColumnWidth(15, 250);
  sheet.setFrozenRows(3);
  sheet.setFrozenColumns(1);
}


// ═══════════════════════════════════════════════
// 6. 2026 예상 지출
// ═══════════════════════════════════════════════
function createExpenseForecastTab(ss) {
  const sheet = getOrCreateSheet(ss, '2026 예상 지출');

  sheet.getRange('A1').setValue('2026 예상 지출 — 미례국밥').setFontSize(14).setFontWeight('bold');
  sheet.getRange('A1:O1').merge().setBackground(STYLE.headerBg).setFontColor(STYLE.headerFont);

  const headers = ['항목'].concat(MONTHS).concat(['합계', '비고']);
  sheet.getRange(2, 1, 1, headers.length).setValues([headers]);
  sheet.getRange(2, 1, 1, headers.length).setBackground('#37474F').setFontColor('#FFFFFF').setFontWeight('bold');

  // ★ 합계행 (행 3)
  const sumFormulas = ['합계'];
  for (let c = 2; c <= 13; c++) {
    const col = String.fromCharCode(64 + c);
    sumFormulas.push('=SUM(' + col + '5:' + col + '40)');
  }
  sumFormulas.push('=SUM(B3:M3)');
  sumFormulas.push('');
  sheet.getRange(3, 1, 1, sumFormulas.length).setValues([sumFormulas]);
  sheet.getRange(3, 1, 1, headers.length).setBackground(STYLE.warningBg).setFontWeight('bold');

  // 카테고리별 섹션
  const categories = [
    { name: '인건비', items: ['전략/디렉팅', '콘텐츠 기획', '디자인'] },
    { name: '외주비', items: ['촬영/편집', '디자인/인쇄', '기타 외주'] },
    { name: '광고비', items: ['메타 광고', '네이버 광고 (파워링크 등)', '기타 광고'] },
    { name: '인플루언서/체험단', items: ['인플루언서 씨딩 비용', '체험단 비용', '제품 협찬 (식사권 등)'] },
    { name: '경비', items: ['출장비 (부산 KTX+숙소+교통)', '미팅비', '기타 경비'] },
    { name: '툴/구독', items: ['툴 비용 (블랙키위 등)'] },
  ];

  let currentRow = 5;
  categories.forEach(cat => {
    sheet.getRange(currentRow, 1).setValue('[' + cat.name + ']').setFontWeight('bold');
    sheet.getRange(currentRow, 1, 1, headers.length).setBackground(STYLE.sectionBg);
    currentRow++;

    cat.items.forEach(item => {
      sheet.getRange(currentRow, 1).setValue('  ' + item);
      sheet.getRange(currentRow, 14).setFormula('=SUM(B' + currentRow + ':M' + currentRow + ')');
      currentRow++;
    });

    const catStart = currentRow - cat.items.length;
    const catEnd = currentRow - 1;
    sheet.getRange(currentRow, 1).setValue(cat.name + ' 소계').setFontWeight('bold');
    for (let c = 2; c <= 14; c++) {
      const col = String.fromCharCode(64 + c);
      sheet.getRange(currentRow, c).setFormula('=SUM(' + col + catStart + ':' + col + catEnd + ')');
    }
    applySubtotal(sheet.getRange(currentRow, 1, 1, headers.length));
    currentRow += 2;
  });

  // 누적 합계
  sheet.getRange(currentRow + 1, 1).setValue('월별 누적').setFontWeight('bold');
  sheet.getRange(currentRow + 1, 2).setFormula('=B3');
  for (let c = 3; c <= 13; c++) {
    const prev = String.fromCharCode(63 + c);
    const cur = String.fromCharCode(64 + c);
    sheet.getRange(currentRow + 1, c).setFormula('=' + prev + (currentRow + 1) + '+' + cur + '3');
  }
  sheet.getRange(currentRow + 1, 1, 1, headers.length).setBackground('#FFF9C4').setFontWeight('bold');

  // Named Range
  try {
    ss.setNamedRange('expense_total', sheet.getRange('N3'));
    for (let m = 1; m <= 12; m++) {
      ss.setNamedRange('expense_' + m, sheet.getRange(String.fromCharCode(65 + m) + '3'));
    }
  } catch(e) {}

  sheet.getRange(3, 2, 50, 13).setNumberFormat('#,##0');
  sheet.setColumnWidth(1, 200);
  for (let c = 2; c <= 13; c++) { sheet.setColumnWidth(c, 100); }
  sheet.setColumnWidth(14, 120);
  sheet.setColumnWidth(15, 250);
  sheet.setFrozenRows(3);
  sheet.setFrozenColumns(1);
}
