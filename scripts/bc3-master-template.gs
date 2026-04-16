/**
 * BC3팀 프로젝트 내부 마스터시트 — 표준 템플릿
 *
 * ┌─────────────────────────────────────────────┐
 * │  모든 BC3 프로젝트는 이 템플릿으로 생성한다.     │
 * │  탭 구조/열 순서를 절대 변경하지 말 것.          │
 * │  (총괄 시트 IMPORTRANGE가 깨짐)               │
 * └─────────────────────────────────────────────┘
 *
 * 사용법:
 *   1. Google Sheets에서 새 스프레드시트 생성
 *   2. 확장 프로그램 → Apps Script → 이 코드 붙여넣기
 *   3. 아래 CONFIG 섹션 수정 (프로젝트 정보 입력)
 *   4. setupMasterSheet() 실행
 *
 * 탭 구성 (6탭):
 *   1. Summary          — 프로젝트 개요 + 핵심 수치 + 계정정보 + 색인
 *   2. 비용 상세          — 월별 경비 집행 내역 (법인카드/진행비)
 *   3. 월별 비용 마진      — 견적 vs 예상비용 vs 실지출 = 마진 ★핵심
 *   4. 인플루언서 관리      — 씨딩/체험단 비용 상세
 *   5. 2026 예상 매출      — 세금계산서 기준 월별 매출
 *   6. 2026 예상 지출      — 카테고리별 월별 지출
 *
 * 총괄 시트 연동 규칙:
 *   - "월별 비용 마진" 탭: 각 월 합계행의 견적(E열)/실지출(G열)/마진(H열)/수익률(I열)
 *   - "2026 예상 매출" 탭: 합계행 (행 고정)
 *   - "2026 예상 지출" 탭: 합계행 (행 고정)
 */


// ═══════════════════════════════════════════════
// CONFIG — 프로젝트별로 여기만 수정
// ═══════════════════════════════════════════════
const CONFIG = {
  projectName: '',          // 예: '댄싱컵 브랜드 마케팅 파트너십'
  clientName: '',           // 예: '(주)위드런 / 댄싱컵'
  industry: '',             // 예: '커피 프랜차이즈'
  contractPeriod: '',       // 예: '2026.04 ~ 2026.12'
  contractAmount: '',       // 예: '5,000,000원/월 (VAT 별도)'
  startMonth: 4,            // 시작월 (1~12)
  endMonth: 12,             // 종료월 (1~12)
  monthlyRetainer: 0,       // 월 리테이너 금액 (VAT 별도)
  leadPM: '우성민',
  teamMembers: [
    // { name: '김남중', role: 'PM' },
    // { name: '이수민', role: 'Designer' },
  ],
  clientContacts: [
    // { name: '홍길동', role: '대표', contact: 'hong@example.com' },
  ],
  // 월별 비용 마진 — Part 구성 (프로젝트 성격에 따라 조정)
  parts: [
    // { name: 'Part 1', desc: '전략/브랜딩/세팅', items: 5 },
    // { name: 'Part 2', desc: 'NP/인플루언서/바이럴', items: 5 },
    // { name: '별도', desc: '촬영/출장 등', items: 3 },
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

  // 기본 Sheet1 삭제 (다른 탭이 있을 때만)
  const defaultSheet = ss.getSheetByName('Sheet1') || ss.getSheetByName('시트1');
  if (defaultSheet && ss.getSheets().length > 1) {
    ss.deleteSheet(defaultSheet);
  }

  SpreadsheetApp.flush();
  Browser.msgBox('✅ 마스터시트 생성 완료!\n\n6개 탭이 생성되었습니다.\n총괄 시트와 연동할 때 탭/열 구조를 변경하지 마세요.');
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
  range.setBackground(STYLE.headerBg)
       .setFontColor(STYLE.headerFont)
       .setFontWeight('bold');
}

function applySubtotal(range) {
  range.setBackground(STYLE.subtotalBg)
       .setFontWeight('bold');
}

function applyTotal(range) {
  range.setBackground(STYLE.totalBg)
       .setFontWeight('bold');
}

function applyMonthHeader(range) {
  range.setBackground(STYLE.monthBg)
       .setFontWeight('bold')
       .setFontSize(11);
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
  const kpiRow = overviewData.length + 4;
  sheet.getRange(kpiRow, 1).setValue('[핵심 수치 요약]').setFontWeight('bold').setFontSize(11);

  const kpiData = [
    ['총 예상 매출 (연간)', "='2026 예상 매출'!B3"],     // 예상매출 합계행
    ['총 예상 지출 (연간)', "='2026 예상 지출'!B3"],     // 예상지출 합계행
    ['예상 수익률', '=IF(B' + (kpiRow+1) + '=0,0,(B' + (kpiRow+1) + '-B' + (kpiRow+2) + ')/B' + (kpiRow+1) + ')'],
    ['현재 실매출', ''],
    ['현재 실지출', ''],
    ['현재 수익률', '=IF(B' + (kpiRow+4) + '=0,0,(B' + (kpiRow+4) + '-B' + (kpiRow+5) + ')/B' + (kpiRow+4) + ')'],
  ];
  sheet.getRange(kpiRow + 1, 1, kpiData.length, 2).setValues(kpiData);
  sheet.getRange(kpiRow + 1, 1, kpiData.length, 1).setFontWeight('bold').setFontColor(STYLE.labelColor);
  sheet.getRange(kpiRow + 1, 2, 2, 1).setNumberFormat('#,##0');
  sheet.getRange(kpiRow + 3, 2, 1, 1).setNumberFormat('0.0%');
  sheet.getRange(kpiRow + 4, 2, 2, 1).setNumberFormat('#,##0');
  sheet.getRange(kpiRow + 6, 2, 1, 1).setNumberFormat('0.0%');

  // ── 팀구성 ──
  const teamRow = kpiRow + kpiData.length + 2;
  sheet.getRange(teamRow, 1).setValue('[팀구성]').setFontWeight('bold').setFontSize(11);

  const teamData = [['BC3측', CONFIG.leadPM + ' — Lead PM']];
  CONFIG.teamMembers.forEach(m => {
    teamData.push(['', m.name + ' — ' + m.role]);
  });
  teamData.push(['', '']);
  CONFIG.clientContacts.forEach((c, i) => {
    teamData.push([i === 0 ? '클라이언트측' : '', c.name + ' — ' + c.role + (c.contact ? ' (' + c.contact + ')' : '')]);
  });
  sheet.getRange(teamRow + 1, 1, teamData.length, 2).setValues(teamData);
  sheet.getRange(teamRow + 1, 1, teamData.length, 1).setFontWeight('bold').setFontColor(STYLE.labelColor);

  // ── 계정 정보 ──
  const acctRow = teamRow + teamData.length + 2;
  sheet.getRange(acctRow, 1).setValue('[계정 정보]').setFontWeight('bold').setFontSize(11);
  sheet.getRange(acctRow, 1).setNote('⚠️ 이 섹션은 내부 전용. 공유 시트에 절대 포함 금지.');

  const acctData = [
    ['1. 인스타그램', ''],
    ['  아이디', ''],
    ['  비번', ''],
    ['', ''],
    ['2. 메타 광고', ''],
    ['  아이디', ''],
    ['  비번', ''],
    ['', ''],
    ['3. 네이버플레이스', ''],
    ['  아이디', ''],
    ['  비번', ''],
    ['', ''],
    ['4. 기타', ''],
  ];
  sheet.getRange(acctRow + 1, 1, acctData.length, 2).setValues(acctData);
  sheet.getRange(acctRow + 1, 1, acctData.length, 1).setFontColor(STYLE.labelColor);

  // ── 주요 링크 & 정산 ──
  const linkRow = acctRow + acctData.length + 2;
  sheet.getRange(linkRow, 1).setValue('[주요 링크 & 정산]').setFontWeight('bold').setFontSize(11);

  const linkHeaders = ['월'].concat(ACTIVE_MONTHS);
  sheet.getRange(linkRow + 1, 1, 1, linkHeaders.length).setValues([linkHeaders]);
  sheet.getRange(linkRow + 1, 1, 1, linkHeaders.length).setFontWeight('bold').setBackground(STYLE.sectionBg);

  const linkRows = ['운영 플랜', '견적서', '보고서', '입금', '세금계산서'];
  linkRows.forEach((label, i) => {
    sheet.getRange(linkRow + 2 + i, 1).setValue(label).setFontWeight('bold');
  });

  // ── 시트 색인 ──
  const idxRow = linkRow + linkRows.length + 4;
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
  sheet.setColumnWidth(1, 160);
  sheet.setColumnWidth(2, 280);
  for (let c = 3; c <= linkHeaders.length; c++) { sheet.setColumnWidth(c, 120); }
}


// ═══════════════════════════════════════════════
// 2. 비용 상세
// ═══════════════════════════════════════════════
function createCostDetailTab(ss) {
  const sheet = getOrCreateSheet(ss, '비용 상세');

  // 헤더
  const headers = [
    '월', 'NO', '구분', '항목',
    '비용(VAT별도)', '비용(VAT포함)',
    '결제방식', '결제날짜', '세금계산서방식', '발급날짜',
    '결제자/입금요청자', '비고'
  ];
  sheet.getRange(1, 1, 1, headers.length).setValues([headers]);
  applyHeader(sheet.getRange(1, 1, 1, headers.length));

  // 구분 드롭다운
  const catRule = SpreadsheetApp.newDataValidation()
    .requireValueInList(['진행비', '광고비', '인플루언서', '체험단', '촬영', '디자인/인쇄', '출장비', '툴비용', '기타'], true)
    .build();
  sheet.getRange(2, 3, 500, 1).setDataValidation(catRule);

  // 결제방식 드롭다운
  const payRule = SpreadsheetApp.newDataValidation()
    .requireValueInList(['법인카드', '계좌이체', '개인카드(정산)', '현금'], true)
    .build();
  sheet.getRange(2, 7, 500, 1).setDataValidation(payRule);

  // 세금계산서 방식 드롭다운
  const taxRule = SpreadsheetApp.newDataValidation()
    .requireValueInList(['발행완료', '발행예정', '해당없음'], true)
    .build();
  sheet.getRange(2, 9, 500, 1).setDataValidation(taxRule);

  // 월별 섹션 생성
  let currentRow = 2;
  for (let m = CONFIG.startMonth; m <= CONFIG.endMonth; m++) {
    // 월 헤더
    sheet.getRange(currentRow, 1).setValue(m + '월');
    applyMonthHeader(sheet.getRange(currentRow, 1, 1, headers.length));
    currentRow++;

    // 빈 행 10줄 (데이터 입력용)
    for (let i = 1; i <= 10; i++) {
      sheet.getRange(currentRow, 2).setValue(i);
      currentRow++;
    }

    // 월 합계행
    const dataStart = currentRow - 10;
    const dataEnd = currentRow - 1;
    sheet.getRange(currentRow, 1).setValue(m + '월 합계');
    sheet.getRange(currentRow, 5).setFormula('=SUM(E' + dataStart + ':E' + dataEnd + ')');
    sheet.getRange(currentRow, 6).setFormula('=SUM(F' + dataStart + ':F' + dataEnd + ')');
    applyTotal(sheet.getRange(currentRow, 1, 1, headers.length));
    currentRow += 2; // 빈 행 하나 띄우기
  }

  // 금액 서식
  sheet.getRange(2, 5, 500, 2).setNumberFormat('#,##0');

  // 열 너비
  sheet.setColumnWidth(1, 60);   // 월
  sheet.setColumnWidth(2, 40);   // NO
  sheet.setColumnWidth(3, 90);   // 구분
  sheet.setColumnWidth(4, 350);  // 항목
  sheet.setColumnWidth(5, 110);  // 비용(VAT별도)
  sheet.setColumnWidth(6, 110);  // 비용(VAT포함)
  sheet.setColumnWidth(7, 90);   // 결제방식
  sheet.setColumnWidth(8, 100);  // 결제날짜
  sheet.setColumnWidth(9, 110);  // 세금계산서방식
  sheet.setColumnWidth(10, 100); // 발급날짜
  sheet.setColumnWidth(11, 130); // 결제자
  sheet.setColumnWidth(12, 200); // 비고

  sheet.setFrozenRows(1);
}


// ═══════════════════════════════════════════════
// 3. 월별 비용 마진 ★핵심 탭
// ═══════════════════════════════════════════════
function createCostMarginTab(ss) {
  const sheet = getOrCreateSheet(ss, '월별 비용 마진');

  // 안내
  sheet.getRange('A1').setValue('* 이 탭의 월 합계행은 총괄 시트에서 IMPORTRANGE로 참조합니다. 행 삽입/삭제 시 총괄 시트가 깨질 수 있습니다.')
       .setFontSize(9).setFontColor(STYLE.noteColor);

  // 헤더 (행 2) — 미례국밥 구조 기반
  const headers = [
    '월', '구분', '항목', '내용',
    '견적(VAT별도)', '예상 비용', '실 지출',
    '마진', '수익률', '비고'
  ];
  sheet.getRange(2, 1, 1, headers.length).setValues([headers]);
  applyHeader(sheet.getRange(2, 1, 1, headers.length));

  // ── Named Ranges 등록용 월별 합계행 위치 기록 ──
  // 총괄 시트가 참조할 행 번호를 예측 가능하게 고정
  const monthTotalRows = {};
  let currentRow = 3;

  for (let m = CONFIG.startMonth; m <= CONFIG.endMonth; m++) {
    const monthStartRow = currentRow;

    // 월 헤더
    // (월 표시는 첫 번째 Part 데이터 행에서)

    // Part별 섹션
    if (CONFIG.parts.length > 0) {
      CONFIG.parts.forEach((part, pIdx) => {
        // Part 데이터 행
        const partDataStart = currentRow;
        for (let i = 0; i < part.items; i++) {
          const row = currentRow;
          if (i === 0 && pIdx === 0) {
            sheet.getRange(row, 1).setValue(m + '월');
          }
          if (i === 0) {
            sheet.getRange(row, 2).setValue(part.name);
          }
          // 마진 수식: 견적 - 실지출
          sheet.getRange(row, 8).setFormula('=E' + row + '-G' + row);
          // 수익률 수식: 마진/견적
          sheet.getRange(row, 9).setFormula('=IF(E' + row + '=0,"",H' + row + '/E' + row + ')');
          currentRow++;
        }
        const partDataEnd = currentRow - 1;

        // Part 소계행
        sheet.getRange(currentRow, 1).setValue(m + '월');
        sheet.getRange(currentRow, 2).setValue('');
        sheet.getRange(currentRow, 4).setValue(part.name + ' 소계');
        sheet.getRange(currentRow, 5).setFormula('=SUM(E' + partDataStart + ':E' + partDataEnd + ')');
        sheet.getRange(currentRow, 6).setFormula('=SUM(F' + partDataStart + ':F' + partDataEnd + ')');
        sheet.getRange(currentRow, 7).setFormula('=SUM(G' + partDataStart + ':G' + partDataEnd + ')');
        sheet.getRange(currentRow, 8).setFormula('=E' + currentRow + '-G' + currentRow);
        sheet.getRange(currentRow, 9).setFormula('=IF(E' + currentRow + '=0,"",H' + currentRow + '/E' + currentRow + ')');
        applySubtotal(sheet.getRange(currentRow, 1, 1, headers.length));
        currentRow++;
      });
    } else {
      // Part가 없으면 기본 10행
      for (let i = 0; i < 10; i++) {
        const row = currentRow;
        if (i === 0) sheet.getRange(row, 1).setValue(m + '월');
        sheet.getRange(row, 8).setFormula('=E' + row + '-G' + row);
        sheet.getRange(row, 9).setFormula('=IF(E' + row + '=0,"",H' + row + '/E' + row + ')');
        currentRow++;
      }
    }

    // ★ 월 합계행 (총괄 시트가 이 행을 참조)
    const monthDataStart = monthStartRow;
    const monthDataEnd = currentRow - 1;
    sheet.getRange(currentRow, 1).setValue(m + '월');
    sheet.getRange(currentRow, 2).setValue('');
    sheet.getRange(currentRow, 4).setValue(m + '월 합계');
    // 소계행만 합산 (Part가 있을 경우), 없으면 전체 합산
    sheet.getRange(currentRow, 5).setFormula('=SUM(E' + monthDataStart + ':E' + monthDataEnd + ')-SUMPRODUCT((REGEXMATCH(D' + monthDataStart + ':D' + monthDataEnd + ',"소계"))*(E' + monthDataStart + ':E' + monthDataEnd + '))');
    // 간단하게: 직접 데이터 행만 합산하기 어려우므로, Part 소계의 합으로 처리
    // 실제로는 Part 소계행들의 합 = 월 합계가 되어야 하므로 아래처럼
    sheet.getRange(currentRow, 5).setFormula('=SUMPRODUCT((REGEXMATCH(D' + monthDataStart + ':D' + monthDataEnd + ',"소계"))*(E' + monthDataStart + ':E' + monthDataEnd + '))');
    sheet.getRange(currentRow, 6).setFormula('=SUMPRODUCT((REGEXMATCH(D' + monthDataStart + ':D' + monthDataEnd + ',"소계"))*(F' + monthDataStart + ':F' + monthDataEnd + '))');
    sheet.getRange(currentRow, 7).setFormula('=SUMPRODUCT((REGEXMATCH(D' + monthDataStart + ':D' + monthDataEnd + ',"소계"))*(G' + monthDataStart + ':G' + monthDataEnd + '))');
    sheet.getRange(currentRow, 8).setFormula('=E' + currentRow + '-G' + currentRow);
    sheet.getRange(currentRow, 9).setFormula('=IF(E' + currentRow + '=0,"",H' + currentRow + '/E' + currentRow + ')');
    applyTotal(sheet.getRange(currentRow, 1, 1, headers.length));
    sheet.getRange(currentRow, 1, 1, headers.length).setFontSize(11);

    monthTotalRows[m] = currentRow;
    currentRow += 2; // 빈 행
  }

  // Part가 없는 경우 월 합계 수식을 단순 SUM으로 교체
  if (CONFIG.parts.length === 0) {
    // 재계산: Part 소계가 없으므로 모든 데이터행을 SUM
    // (위에서 REGEXMATCH("소계")가 0건이므로 합계가 0이 됨 → 수정 필요)
    for (let m = CONFIG.startMonth; m <= CONFIG.endMonth; m++) {
      const totalRow = monthTotalRows[m];
      const startRow = totalRow - 10; // 대략적 위치
      sheet.getRange(totalRow, 5).setFormula('=SUM(E' + (totalRow - 10) + ':E' + (totalRow - 1) + ')');
      sheet.getRange(totalRow, 6).setFormula('=SUM(F' + (totalRow - 10) + ':F' + (totalRow - 1) + ')');
      sheet.getRange(totalRow, 7).setFormula('=SUM(G' + (totalRow - 10) + ':G' + (totalRow - 1) + ')');
    }
  }

  // ★ Named Ranges 생성 (총괄 시트 연동용)
  for (let m = CONFIG.startMonth; m <= CONFIG.endMonth; m++) {
    const row = monthTotalRows[m];
    const monthName = m + '월';
    try {
      ss.setNamedRange('margin_' + m + '_견적', sheet.getRange('E' + row));
      ss.setNamedRange('margin_' + m + '_실지출', sheet.getRange('G' + row));
      ss.setNamedRange('margin_' + m + '_마진', sheet.getRange('H' + row));
      ss.setNamedRange('margin_' + m + '_수익률', sheet.getRange('I' + row));
    } catch(e) {
      // Named range 이미 존재 시 무시
    }
  }

  // 금액/비율 서식
  sheet.getRange(3, 5, 500, 4).setNumberFormat('#,##0');
  sheet.getRange(3, 9, 500, 1).setNumberFormat('0.0%');

  // 열 너비
  sheet.setColumnWidth(1, 50);   // 월
  sheet.setColumnWidth(2, 70);   // 구분
  sheet.setColumnWidth(3, 180);  // 항목
  sheet.setColumnWidth(4, 250);  // 내용
  sheet.setColumnWidth(5, 120);  // 견적
  sheet.setColumnWidth(6, 100);  // 예상 비용
  sheet.setColumnWidth(7, 100);  // 실 지출
  sheet.setColumnWidth(8, 110);  // 마진
  sheet.setColumnWidth(9, 80);   // 수익률
  sheet.setColumnWidth(10, 250); // 비고

  sheet.setFrozenRows(2);
}


// ═══════════════════════════════════════════════
// 4. 인플루언서 관리
// ═══════════════════════════════════════════════
function createInfluencerTab(ss) {
  const sheet = getOrCreateSheet(ss, '인플루언서 관리');

  // 헤더
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

  // 유형 드롭다운
  const typeRule = SpreadsheetApp.newDataValidation()
    .requireValueInList(['인플루언서', '마이크로', '나노', '블로그체험단', '카페체험단', '유튜브', '기타'], true)
    .build();
  sheet.getRange(2, 3, 200, 1).setDataValidation(typeRule);

  // 플랫폼 드롭다운
  const platformRule = SpreadsheetApp.newDataValidation()
    .requireValueInList(['인스타그램', '블로그', '유튜브', '틱톡', '카페', '기타'], true)
    .build();
  sheet.getRange(2, 6, 200, 1).setDataValidation(platformRule);

  // 상태 드롭다운
  const statusRule = SpreadsheetApp.newDataValidation()
    .requireValueInList(['후보', '컨택중', '확정', '제품발송', '방문완료', '업로드완료', '정산완료', '취소'], true)
    .build();
  sheet.getRange(2, 19, 200, 1).setDataValidation(statusRule);

  // 결제방식 드롭다운
  const payRule = SpreadsheetApp.newDataValidation()
    .requireValueInList(['무상 협찬', '유상(계좌이체)', '유상(법인카드)', '제품제공', '기타'], true)
    .build();
  sheet.getRange(2, 10, 200, 1).setDataValidation(payRule);

  // CPV 수식 (비용 / 조회수)
  for (let r = 2; r <= 201; r++) {
    sheet.getRange(r, 18).setFormula('=IF(AND(I' + r + '>0,O' + r + '>0),I' + r + '/O' + r + ',"")');
  }

  // 금액 서식
  sheet.getRange(2, 9, 200, 1).setNumberFormat('#,##0');
  sheet.getRange(2, 15, 200, 3).setNumberFormat('#,##0');
  sheet.getRange(2, 18, 200, 1).setNumberFormat('#,##0');

  // 열 너비
  sheet.setColumnWidth(1, 40);   // NO
  sheet.setColumnWidth(2, 50);   // 월
  sheet.setColumnWidth(3, 90);   // 유형
  sheet.setColumnWidth(4, 160);  // 이름/계정
  sheet.setColumnWidth(5, 80);   // 팔로워수
  sheet.setColumnWidth(6, 80);   // 플랫폼
  sheet.setColumnWidth(7, 80);   // 카테고리
  sheet.setColumnWidth(8, 150);  // 협찬 내용
  sheet.setColumnWidth(9, 90);   // 비용
  sheet.setColumnWidth(10, 100); // 결제방식
  sheet.setColumnWidth(11, 90);  // 컨택일
  sheet.setColumnWidth(12, 90);  // 방문/수령일
  sheet.setColumnWidth(13, 90);  // 업로드일
  sheet.setColumnWidth(14, 200); // 업로드 URL
  sheet.setColumnWidth(15, 70);  // 조회수
  sheet.setColumnWidth(16, 60);  // 좋아요
  sheet.setColumnWidth(17, 60);  // 댓글
  sheet.setColumnWidth(18, 70);  // CPV
  sheet.setColumnWidth(19, 80);  // 상태
  sheet.setColumnWidth(20, 200); // 비고

  sheet.setFrozenRows(1);
}


// ═══════════════════════════════════════════════
// 5. 2026 예상 매출
// ═══════════════════════════════════════════════
function createRevenueForecastTab(ss) {
  const sheet = getOrCreateSheet(ss, '2026 예상 매출');

  sheet.getRange('A1').setValue('2026 예상 매출 — ' + (CONFIG.projectName || '프로젝트명'))
       .setFontSize(14).setFontWeight('bold');
  sheet.getRange('A1:O1').merge().setBackground(STYLE.headerBg).setFontColor(STYLE.headerFont);

  // 헤더 (행 2)
  const headers = ['항목'].concat(MONTHS).concat(['합계', '비고']);
  sheet.getRange(2, 1, 1, headers.length).setValues([headers]);
  sheet.getRange(2, 1, 1, headers.length).setBackground('#37474F').setFontColor('#FFFFFF').setFontWeight('bold');

  // ★ 합계행 (행 3) — 총괄 시트가 이 행을 참조
  const sumRow = ['합계'];
  for (let c = 2; c <= 13; c++) {
    const colLetter = String.fromCharCode(64 + c);
    sumRow.push('=SUM(' + colLetter + '5:' + colLetter + '20)');
  }
  sumRow.push('=SUM(B3:M3)');
  sumRow.push('');
  sheet.getRange(3, 1, 1, sumRow.length).setValues([sumRow]);
  applyTotal(sheet.getRange(3, 1, 1, headers.length));

  // 빈 행 (행 4)
  // 데이터 시작 (행 5~)
  // 리테이너가 있으면 자동 입력
  if (CONFIG.monthlyRetainer > 0) {
    const retainerRow = ['리테이너'];
    for (let m = 1; m <= 12; m++) {
      if (m >= CONFIG.startMonth && m <= CONFIG.endMonth) {
        retainerRow.push(CONFIG.monthlyRetainer);
      } else {
        retainerRow.push('');
      }
    }
    retainerRow.push('=SUM(B5:M5)');
    retainerRow.push(CONFIG.monthlyRetainer.toLocaleString() + '/월');
    sheet.getRange(5, 1, 1, retainerRow.length).setValues([retainerRow]);
  }

  // 누적 합계행 (행 22)
  sheet.getRange(22, 1).setValue('월별 누적').setFontWeight('bold');
  sheet.getRange(22, 2).setFormula('=B3');
  for (let c = 3; c <= 13; c++) {
    const prevCol = String.fromCharCode(63 + c);
    const curCol = String.fromCharCode(64 + c);
    sheet.getRange(22, c).setFormula('=' + prevCol + '22+' + curCol + '3');
  }
  sheet.getRange(22, 1, 1, headers.length).setBackground('#FFF9C4').setFontWeight('bold');

  // Named Range
  try {
    ss.setNamedRange('revenue_total', sheet.getRange('N3'));
    for (let m = 1; m <= 12; m++) {
      const col = String.fromCharCode(65 + m); // B=1월, C=2월...
      ss.setNamedRange('revenue_' + m, sheet.getRange(col + '3'));
    }
  } catch(e) {}

  // 금액 서식
  sheet.getRange(3, 2, 20, 13).setNumberFormat('#,##0');

  // 열 너비
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

  sheet.getRange('A1').setValue('2026 예상 지출 — ' + (CONFIG.projectName || '프로젝트명'))
       .setFontSize(14).setFontWeight('bold');
  sheet.getRange('A1:O1').merge().setBackground(STYLE.headerBg).setFontColor(STYLE.headerFont);

  // 헤더 (행 2)
  const headers = ['항목'].concat(MONTHS).concat(['합계', '비고']);
  sheet.getRange(2, 1, 1, headers.length).setValues([headers]);
  sheet.getRange(2, 1, 1, headers.length).setBackground('#37474F').setFontColor('#FFFFFF').setFontWeight('bold');

  // ★ 합계행 (행 3) — 총괄 시트가 이 행을 참조
  const sumRow = ['합계'];
  for (let c = 2; c <= 13; c++) {
    const colLetter = String.fromCharCode(64 + c);
    sumRow.push('=SUM(' + colLetter + '5:' + colLetter + '40)');
  }
  sumRow.push('=SUM(B3:M3)');
  sumRow.push('');
  sheet.getRange(3, 1, 1, sumRow.length).setValues([sumRow]);
  sheet.getRange(3, 1, 1, headers.length).setBackground(STYLE.warningBg).setFontWeight('bold');

  // 카테고리별 섹션
  const categories = [
    { name: '인건비', items: ['전략/디렉팅', '콘텐츠 제작', '디자인'] },
    { name: '외주비', items: ['촬영/편집', '디자인/인쇄', '기타 외주'] },
    { name: '광고비', items: ['메타 광고', '네이버 광고', '기타 광고'] },
    { name: '인플루언서/체험단', items: ['인플루언서 비용', '체험단 비용', '제품 협찬'] },
    { name: '경비', items: ['출장비', '미팅비', '기타 경비'] },
    { name: '툴/구독', items: ['툴 비용'] },
  ];

  let currentRow = 5;
  categories.forEach(cat => {
    // 카테고리 헤더
    sheet.getRange(currentRow, 1).setValue('[' + cat.name + ']').setFontWeight('bold');
    sheet.getRange(currentRow, 1, 1, headers.length).setBackground(STYLE.sectionBg);
    currentRow++;

    // 항목 행
    cat.items.forEach(item => {
      sheet.getRange(currentRow, 1).setValue('  ' + item);
      // 행 합계
      sheet.getRange(currentRow, 14).setFormula('=SUM(B' + currentRow + ':M' + currentRow + ')');
      currentRow++;
    });

    // 카테고리 소계
    const catStart = currentRow - cat.items.length;
    const catEnd = currentRow - 1;
    sheet.getRange(currentRow, 1).setValue(cat.name + ' 소계').setFontWeight('bold');
    for (let c = 2; c <= 14; c++) {
      const colLetter = String.fromCharCode(64 + c);
      sheet.getRange(currentRow, c).setFormula('=SUM(' + colLetter + catStart + ':' + colLetter + catEnd + ')');
    }
    applySubtotal(sheet.getRange(currentRow, 1, 1, headers.length));
    currentRow += 2; // 빈 행
  });

  // 누적 합계행
  sheet.getRange(currentRow + 1, 1).setValue('월별 누적').setFontWeight('bold');
  sheet.getRange(currentRow + 1, 2).setFormula('=B3');
  for (let c = 3; c <= 13; c++) {
    const prevCol = String.fromCharCode(63 + c);
    const curCol = String.fromCharCode(64 + c);
    sheet.getRange(currentRow + 1, c).setFormula('=' + prevCol + (currentRow + 1) + '+' + curCol + '3');
  }
  sheet.getRange(currentRow + 1, 1, 1, headers.length).setBackground('#FFF9C4').setFontWeight('bold');

  // Named Range
  try {
    ss.setNamedRange('expense_total', sheet.getRange('N3'));
    for (let m = 1; m <= 12; m++) {
      const col = String.fromCharCode(65 + m);
      ss.setNamedRange('expense_' + m, sheet.getRange(col + '3'));
    }
  } catch(e) {}

  // 금액 서식
  sheet.getRange(3, 2, 50, 13).setNumberFormat('#,##0');

  // 열 너비
  sheet.setColumnWidth(1, 180);
  for (let c = 2; c <= 13; c++) { sheet.setColumnWidth(c, 100); }
  sheet.setColumnWidth(14, 120);
  sheet.setColumnWidth(15, 250);

  sheet.setFrozenRows(3);
  sheet.setFrozenColumns(1);
}
