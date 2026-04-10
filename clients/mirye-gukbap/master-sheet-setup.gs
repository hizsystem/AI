/**
 * 미례국밥 내부 마스터시트 — 탭 자동 생성
 * 대상: ★★★내부★★★ 2026 미례국밥 Master Sheet
 * 실행: setupAllTabs() 함수 실행
 */

function setupAllTabs() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();

  setupSummaryUpdate(ss);
  createCostDetailTab(ss);
  createMonthlyPnLTab(ss);
  createWeeklyTaskTab(ss);
  createKPITab(ss);
  createKeywordTab(ss);
  createInfluencerTab(ss);
  createExperienceTeamTab(ss);

  SpreadsheetApp.flush();
  Browser.msgBox('모든 탭 생성 완료!');
}

// ── Summary 탭 업데이트 ──
function setupSummaryUpdate(ss) {
  const sheet = ss.getSheetByName('Summary');
  if (!sheet) return;

  sheet.getRange('B3').setValue('(주)위드런');
  sheet.getRange('B5').setValue('2026.04 ~ (월 단위, 3개월 권장)');
  sheet.getRange('B6').setValue('5,000,000/월 (VAT 별도)');

  // 시트 색인 추가
  const indexData = [
    ['비용 상세', '건바이건 지출 내역 (현대재단 포맷)'],
    ['월간 P&L', '매출 - 지출 = 차익'],
    ['인플루언서 관리', '씨딩 캠페인 전체 관리 (단가 포함)'],
    ['체험단 관리', '블로그 체험단 관리 (단가 포함)'],
    ['주차별 태스크', 'W1~W4 실무 관리'],
    ['KPI 트래킹', '주간 성과 지표'],
    ['키워드 데이터', 'NP 키워드 순위 추적']
  ];
  sheet.getRange(19, 1, indexData.length, 2).setValues(indexData);
}

// ── 비용 상세 탭 ──
function createCostDetailTab(ss) {
  let sheet = ss.getSheetByName('비용 상세');
  if (sheet) { ss.deleteSheet(sheet); }
  sheet = ss.insertSheet('비용 상세');

  // 헤더
  const headers = ['월', 'NO', '구분', '항목', '비용(VAT별도)', '비용(VAT포함)', '공유비용(VAT별도)', '공유비용(VAT포함)', '결제방식', '결제날짜', '세금계산서방식', '발급날짜', '결제자/입금요청자', '비고'];
  sheet.getRange(1, 1, 1, headers.length).setValues([headers]);

  // 헤더 서식
  const headerRange = sheet.getRange(1, 1, 1, headers.length);
  headerRange.setBackground('#0D0D0D').setFontColor('#FFFFFF').setFontWeight('bold').setFontSize(9);
  headerRange.setHorizontalAlignment('center');

  // 4월 초기 데이터
  const data = [
    ['4월', 1, '외주비', '채널 운영 전략 수립 (인스타 컨셉/무드보드/가이드라인/KPI)', 1000000, '', '', '', '', '', '', '', '', ''],
    ['4월', 2, '외주비', 'NP 키워드 최적화 (소개문/태그/광고세팅/소식/리뷰가이드)', 1000000, '', '', '', '', '', '', '', '', ''],
    ['4월', 3, '외주비', '블로그 체험단 운영 15건 (기존 블로그 5편 → 체험단 교체)', 400000, '', '', '', '', '', '', '', '', '기존 70만→40만 (30만 절감)'],
    ['4월', 4, '매체비', '인플루언서 씨딩 5~7명 (무가+코디+QC)', 800000, '', '', '', '', '', '', '', '', ''],
    ['4월', 5, '외주비', '메타 광고 세팅+운영 (세팅비)', 300000, '', '', '', '', '', '', '', '', ''],
    ['4월', 6, '광고비', '메타 광고비 (릴스 부스트)', 500000, '', '', '', '', '', '', '', '', '광고비 실비'],
    ['4월', 7, '외주비', '리뷰 시스템 구조화 (템플릿10종/이벤트/운영가이드)', 700000, '', '', '', '', '', '', '', '', ''],
    ['4월', 8, '광고비', 'NP 플레이스 광고비 (일 5,000원 x 30일)', 150000, '', '', '', '', '', '', '', '', '광고비 실비'],
    ['4월', 9, '진행비', '에드로그 구독 (키워드 추적 툴)', 20000, '', '', '', '', '', '', '', '', '월정액'],
    ['4월', 10, '진행비', '부산 출장 교통비', '', '', '', '', '', '', '', '', '', '미정 — 확정 후 입력'],
    ['4월', 11, '진행비', '부산 출장 식비', '', '', '', '', '', '', '', '', '', '미정'],
    ['4월', 12, '진행비', '짐벌 대여', '', '', '', '', '', '', '', '', '', '미정 — 필요 시']
  ];
  sheet.getRange(2, 1, data.length, data[0].length).setValues(data);

  // 합계 행
  const sumRow = data.length + 3;
  sheet.getRange(sumRow, 3).setValue('4월 합계').setFontWeight('bold');
  sheet.getRange(sumRow, 5).setFormula('=SUMPRODUCT((A2:A' + (data.length+1) + '="4월")*(E2:E' + (data.length+1) + '))');
  sheet.getRange(sumRow, 5).setFontWeight('bold').setNumberFormat('#,##0');

  // 구분 드롭다운
  const rule = SpreadsheetApp.newDataValidation()
    .requireValueInList(['외주비', '광고비', '진행비', '매체비', '이벤트'], true)
    .build();
  sheet.getRange(2, 3, 100, 1).setDataValidation(rule);

  // 결제방식 드롭다운
  const payRule = SpreadsheetApp.newDataValidation()
    .requireValueInList(['입금/원천징수', '법인카드', '세금계산서', '개인카드'], true)
    .build();
  sheet.getRange(2, 9, 100, 1).setDataValidation(payRule);

  // 비용 컬럼 서식
  sheet.getRange(2, 5, 100, 4).setNumberFormat('#,##0');

  // 구분별 조건부 서식
  addCategoryColors(sheet, data.length);

  // 열 너비
  sheet.setColumnWidth(1, 50);  // 월
  sheet.setColumnWidth(2, 40);  // NO
  sheet.setColumnWidth(3, 70);  // 구분
  sheet.setColumnWidth(4, 400); // 항목
  sheet.setColumnWidth(5, 110); // 비용
  sheet.setColumnWidth(6, 110);
  sheet.setColumnWidth(14, 200); // 비고

  // 고정
  sheet.setFrozenRows(1);
}

function addCategoryColors(sheet, rowCount) {
  const colors = {
    '외주비': '#FFF2CC',
    '광고비': '#D9EAD3',
    '매체비': '#CFE2F3',
    '진행비': '#F4CCCC',
    '이벤트': '#D9D2E9'
  };

  for (let i = 2; i <= rowCount + 1; i++) {
    const val = sheet.getRange(i, 3).getValue();
    if (colors[val]) {
      sheet.getRange(i, 3).setBackground(colors[val]);
    }
  }
}

// ── 월간 P&L 탭 ──
function createMonthlyPnLTab(ss) {
  let sheet = ss.getSheetByName('월간 P&L');
  if (sheet) { ss.deleteSheet(sheet); }
  sheet = ss.insertSheet('월간 P&L');

  // 헤더
  const months = ['항목', '4월', '5월', '6월', '7월', '8월', '9월', '10월', '11월', '12월', '연간합계'];
  sheet.getRange(1, 1, 1, months.length).setValues([months]);
  sheet.getRange(1, 1, 1, months.length).setBackground('#0D0D0D').setFontColor('#FFFFFF').setFontWeight('bold').setFontSize(9).setHorizontalAlignment('center');

  // 행 구성
  const rows = [
    ['[매출]'],
    ['리테이너', 5000000, 5000000, 5000000, 5000000, 5000000, 5000000, 5000000, 5000000, 5000000],
    ['촬영/제작 (별도)'],
    ['매출 합계'],  // row 5 = SUM
    [''],
    ['[지출]'],
    ['외주비'],     // row 8 = 비용상세에서 수동 or SUMPRODUCT
    ['광고비'],     // row 9
    ['매체비'],     // row 10
    ['진행비'],     // row 11
    ['지출 합계'],  // row 12 = SUM
    [''],
    ['차익'],       // row 14 = 매출 - 지출
    ['수익률']      // row 15 = 차익 / 매출
  ];

  sheet.getRange(2, 1, rows.length, 1).setValues(rows.map(r => [r[0]]));

  // 4월 매출 데이터
  sheet.getRange(3, 2).setValue(5000000); // 리테이너

  // 4월 지출 데이터 (견적서 기준)
  sheet.getRange(8, 2).setValue(3400000);  // 외주비 (전략100+NP100+체험단40+메타세팅30+리뷰70)
  sheet.getRange(9, 2).setValue(650000);   // 광고비 (메타50+NP15)
  sheet.getRange(10, 2).setValue(800000);  // 매체비 (인플루언서)
  sheet.getRange(11, 2).setValue(20000);   // 진행비 (에드로그) + 출장비 미정

  // 수식: 매출 합계 (row 5)
  for (let col = 2; col <= 10; col++) {
    const c = columnLetter(col);
    sheet.getRange(5, col).setFormula('=SUM(' + c + '3:' + c + '4)');
    sheet.getRange(12, col).setFormula('=SUM(' + c + '8:' + c + '11)');
    sheet.getRange(14, col).setFormula('=' + c + '5-' + c + '12');
    sheet.getRange(15, col).setFormula('=IF(' + c + '5=0,"",'+c+'14/' + c + '5)');
  }

  // 연간합계 (K열)
  for (let row of [3, 4, 5, 8, 9, 10, 11, 12, 14]) {
    sheet.getRange(row, 11).setFormula('=SUM(B' + row + ':J' + row + ')');
  }
  sheet.getRange(15, 11).setFormula('=IF(K5=0,"",K14/K5)');

  // 서식
  sheet.getRange(2, 1, rows.length, 1).setFontWeight('bold');
  sheet.getRange(2, 2, rows.length, 10).setNumberFormat('#,##0');
  sheet.getRange(15, 2, 1, 10).setNumberFormat('0.0%');

  // 섹션 색상
  sheet.getRange(2, 1, 1, 11).setBackground('#E8F5E9'); // 매출 헤더
  sheet.getRange(5, 1, 1, 11).setBackground('#C8E6C9').setFontWeight('bold'); // 매출 합계
  sheet.getRange(7, 1, 1, 11).setBackground('#FFEBEE'); // 지출 헤더
  sheet.getRange(12, 1, 1, 11).setBackground('#FFCDD2').setFontWeight('bold'); // 지출 합계
  sheet.getRange(14, 1, 1, 11).setBackground('#E3F2FD').setFontWeight('bold'); // 차익
  sheet.getRange(15, 1, 1, 11).setBackground('#BBDEFB').setFontWeight('bold'); // 수익률

  // 열 너비
  sheet.setColumnWidth(1, 160);
  for (let i = 2; i <= 11; i++) { sheet.setColumnWidth(i, 100); }

  sheet.setFrozenRows(1);
  sheet.setFrozenColumns(1);
}

// ── 주차별 태스크 탭 ──
function createWeeklyTaskTab(ss) {
  let sheet = ss.getSheetByName('주차별 태스크');
  if (sheet) { ss.deleteSheet(sheet); }
  sheet = ss.insertSheet('주차별 태스크');

  const headers = ['주차', '채널', '태스크', '담당', '상태', '마감일', '비고'];
  sheet.getRange(1, 1, 1, headers.length).setValues([headers]);
  sheet.getRange(1, 1, 1, headers.length).setBackground('#0D0D0D').setFontColor('#FFFFFF').setFontWeight('bold').setFontSize(9);

  // 상태 드롭다운
  const statusRule = SpreadsheetApp.newDataValidation()
    .requireValueInList(['대기', '진행중', '완료', '보류'], true)
    .build();
  sheet.getRange(2, 5, 100, 1).setDataValidation(statusRule);

  // 담당 드롭다운
  const ownerRule = SpreadsheetApp.newDataValidation()
    .requireValueInList(['Green', '인턴(지은)', 'BR공동', '변팀장'], true)
    .build();
  sheet.getRange(2, 4, 100, 1).setDataValidation(ownerRule);

  // 채널 드롭다운
  const channelRule = SpreadsheetApp.newDataValidation()
    .requireValueInList(['공통', '플레이스', '인스타', '체험단', '메타', '블로그'], true)
    .build();
  sheet.getRange(2, 2, 100, 1).setDataValidation(channelRule);

  // W2 초기 데이터
  const tasks = [
    ['W2', '공통', '킥오프 미팅 완료 (4/6)', 'BR공동', '완료', '2026-04-06', 'A안 브랜딩+슬로건 컨펌'],
    ['W2', '공통', '변팀장 계정/권한 요청', 'Green', '진행중', '2026-04-07', '메일 발송 완료'],
    ['W2', '공통', '별점 부활 대응 — 리뷰 가이드+템플릿 전달', 'Green', '대기', '2026-04-08', ''],
    ['W2', '플레이스', '대표키워드 교체 (센텀맛집/전포맛집)', 'Green', '대기', '2026-04-09', '계정 수령 후'],
    ['W2', '플레이스', '소개문 교체 (센텀+전포)', 'Green', '대기', '2026-04-09', '계정 수령 후'],
    ['W2', '체험단', '업체/비용 협의', 'Green', '대기', '2026-04-08', '변팀장과 통화'],
    ['W2', '메타', '비즈니스 계정 확인/생성', 'Green', '대기', '2026-04-09', '변팀장 확인 후'],
    ['W2', '인스타', '채널 전략서 초안', 'Green', '대기', '2026-04-10', ''],
    ['W2', '인스타', '인플루언서 후보 리스트업 시작', '인턴(지은)', '대기', '2026-04-11', ''],
    ['W2', '공통', '마스터시트 생성+위드런 공유', 'Green', '진행중', '2026-04-11', ''],
    ['W2', '공통', 'W1 슬랙 체크인 발송', 'Green', '대기', '2026-04-11', '']
  ];
  sheet.getRange(2, 1, tasks.length, tasks[0].length).setValues(tasks);

  // 열 너비
  sheet.setColumnWidth(1, 50);
  sheet.setColumnWidth(2, 80);
  sheet.setColumnWidth(3, 350);
  sheet.setColumnWidth(4, 100);
  sheet.setColumnWidth(5, 70);
  sheet.setColumnWidth(6, 100);
  sheet.setColumnWidth(7, 200);

  sheet.setFrozenRows(1);
}

// ── KPI 트래킹 탭 ──
function createKPITab(ss) {
  let sheet = ss.getSheetByName('KPI 트래킹');
  if (sheet) { ss.deleteSheet(sheet); }
  sheet = ss.insertSheet('KPI 트래킹');

  const headers = ['기록일', 'NP조회수(센텀)', 'NP조회수(전포)', 'NP전화(센텀)', 'NP전화(전포)', 'NP길찾기(센텀)', 'NP길찾기(전포)', 'NP리뷰수(센텀)', 'NP리뷰수(전포)', '블로그발행(누적)', '릴스확보(누적)', '인스타팔로워', '메타광고지출', '비고'];
  sheet.getRange(1, 1, 1, headers.length).setValues([headers]);
  sheet.getRange(1, 1, 1, headers.length).setBackground('#0D0D0D').setFontColor('#FFFFFF').setFontWeight('bold').setFontSize(9);

  // 주차 라벨
  const weeks = [
    ['2026-04-07', '', '', '', '', '', '', '', '', '', '', '', '', 'W2 시작 (베이스라인)'],
    ['2026-04-14', '', '', '', '', '', '', '', '', '', '', '', '', 'W3'],
    ['2026-04-21', '', '', '', '', '', '', '', '', '', '', '', '', 'W4'],
    ['2026-04-28', '', '', '', '', '', '', '', '', '', '', '', '', '4월 마감']
  ];
  sheet.getRange(2, 1, weeks.length, weeks[0].length).setValues(weeks);

  sheet.getRange(2, 2, 100, 12).setNumberFormat('#,##0');
  sheet.setColumnWidth(1, 100);
  sheet.setColumnWidth(14, 200);
  sheet.setFrozenRows(1);
}

// ── 키워드 데이터 탭 ──
function createKeywordTab(ss) {
  let sheet = ss.getSheetByName('키워드 데이터');
  if (sheet) { ss.deleteSheet(sheet); }
  sheet = ss.insertSheet('키워드 데이터');

  const headers = ['키워드', '월 검색량', 'W1 순위', 'W2 순위', 'W3 순위', 'W4 순위', '변동', '분류', '메모'];
  sheet.getRange(1, 1, 1, headers.length).setValues([headers]);
  sheet.getRange(1, 1, 1, headers.length).setBackground('#0D0D0D').setFontColor('#FFFFFF').setFontWeight('bold').setFontSize(9);

  // 초기 키워드 데이터
  const keywords = [
    ['센텀 맛집', 14230, '', 9, '', '', '', '유지', '42→9위 급상승'],
    ['재송동 맛집', '', '', 3, '', '', '', '유지', ''],
    ['전포 맛집', 33850, '', 8, '', '', '', '기회', '키워드 교체 후 추적'],
    ['센텀 국밥', '', '', 1, '', '', '', '유지', ''],
    ['센텀 돼지국밥', '', '', 1, '', '', '', '유지', ''],
    ['전포 미례국밥', 1220, '', '', '', '', '', '유지', '검색량 센텀의 2배'],
    ['센텀 미례국밥', 670, '', '', '', '', '', '유지', ''],
    ['미례국밥', 2690, '', '', '', '', '', '유지', '전월 대비 +62%'],
    ['돼지우동', 310, '', '', '', '', '', '장기도전', 'NP 아닌 인스타에서 바이럴']
  ];
  sheet.getRange(2, 1, keywords.length, keywords[0].length).setValues(keywords);

  // 분류 드롭다운
  const classRule = SpreadsheetApp.newDataValidation()
    .requireValueInList(['유지', '기회', '장기도전'], true)
    .build();
  sheet.getRange(2, 8, 50, 1).setDataValidation(classRule);

  sheet.getRange(2, 2, 50, 1).setNumberFormat('#,##0');
  sheet.setColumnWidth(1, 140);
  sheet.setColumnWidth(9, 250);
  sheet.setFrozenRows(1);
}

// ── 인플루언서 관리 탭 (full — 단가/마진 포함) ──
function createInfluencerTab(ss) {
  let sheet = ss.getSheetByName('인플루언서 관리');
  if (sheet) { ss.deleteSheet(sheet); }
  sheet = ss.insertSheet('인플루언서 관리');

  const headers = ['#', '계정명', '채널', '팔로워', '예상단가', '컨택상태', '방문일', '콘텐츠유형', '발행일', '콘텐츠URL', '2차활용동의', '실제비용', '마진', '비고'];
  sheet.getRange(1, 1, 1, headers.length).setValues([headers]);
  sheet.getRange(1, 1, 1, headers.length).setBackground('#0D0D0D').setFontColor('#FFFFFF').setFontWeight('bold').setFontSize(9);

  // 컨택상태 드롭다운
  const contactRule = SpreadsheetApp.newDataValidation()
    .requireValueInList(['미컨택', 'DM발송', '수락', '거절', '방문완료', '콘텐츠수거'], true)
    .build();
  sheet.getRange(2, 6, 50, 1).setDataValidation(contactRule);

  // 콘텐츠유형 드롭다운
  const typeRule = SpreadsheetApp.newDataValidation()
    .requireValueInList(['릴스', '피드', '블로그', '스토리', '유튜브'], true)
    .build();
  sheet.getRange(2, 8, 50, 1).setDataValidation(typeRule);

  // 2차활용동의 드롭다운
  const yesNoRule = SpreadsheetApp.newDataValidation()
    .requireValueInList(['Y', 'N', '미확인'], true)
    .build();
  sheet.getRange(2, 11, 50, 1).setDataValidation(yesNoRule);

  sheet.getRange(2, 4, 50, 1).setNumberFormat('#,##0');
  sheet.getRange(2, 5, 50, 1).setNumberFormat('#,##0');
  sheet.getRange(2, 12, 50, 1).setNumberFormat('#,##0');
  sheet.getRange(2, 13, 50, 1).setNumberFormat('#,##0');

  sheet.setColumnWidth(2, 140);
  sheet.setColumnWidth(4, 80);
  sheet.setColumnWidth(10, 250);
  sheet.setColumnWidth(14, 200);
  sheet.setFrozenRows(1);
}

// ── 체험단 관리 탭 (full — 건당비용 포함) ──
function createExperienceTeamTab(ss) {
  let sheet = ss.getSheetByName('체험단 관리');
  if (sheet) { ss.deleteSheet(sheet); }
  sheet = ss.insertSheet('체험단 관리');

  const headers = ['#', '플랫폼', '블로거명', '블로그URL', '매장', '방문일', '지정키워드', '발행일', '키워드포함', '결과URL', '상태', '건당비용', '비고'];
  sheet.getRange(1, 1, 1, headers.length).setValues([headers]);
  sheet.getRange(1, 1, 1, headers.length).setBackground('#0D0D0D').setFontColor('#FFFFFF').setFontWeight('bold').setFontSize(9);

  // 매장 드롭다운
  const storeRule = SpreadsheetApp.newDataValidation()
    .requireValueInList(['센텀점', '전포점'], true)
    .build();
  sheet.getRange(2, 5, 50, 1).setDataValidation(storeRule);

  // 키워드포함 드롭다운
  const ynRule = SpreadsheetApp.newDataValidation()
    .requireValueInList(['Y', 'N'], true)
    .build();
  sheet.getRange(2, 9, 50, 1).setDataValidation(ynRule);

  // 상태 드롭다운
  const statusRule = SpreadsheetApp.newDataValidation()
    .requireValueInList(['대기', '방문완료', '발행완료', '노쇼', '키워드미포함'], true)
    .build();
  sheet.getRange(2, 11, 50, 1).setDataValidation(statusRule);

  // 플랫폼 드롭다운
  const platRule = SpreadsheetApp.newDataValidation()
    .requireValueInList(['리뷰노트', '아싸뷰', '레뷰', '직접컨택', '기타'], true)
    .build();
  sheet.getRange(2, 2, 50, 1).setDataValidation(platRule);

  sheet.getRange(2, 12, 50, 1).setNumberFormat('#,##0');
  sheet.setColumnWidth(3, 120);
  sheet.setColumnWidth(4, 200);
  sheet.setColumnWidth(7, 140);
  sheet.setColumnWidth(10, 250);
  sheet.setFrozenRows(1);
}

// ── 유틸 ──
function columnLetter(col) {
  return String.fromCharCode(64 + col);
}
