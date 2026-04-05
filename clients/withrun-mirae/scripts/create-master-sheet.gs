/**
 * 미례국밥 마스터시트 자동 생성
 * 실행: Google Apps Script에서 createMasterSheet() 실행
 * 새 스프레드시트를 생성하고 6개 탭 + 초기 데이터를 세팅합니다.
 */

function createMasterSheet() {
  const ss = SpreadsheetApp.create('[BR] 미례국밥 — Master Sheet');
  const ssId = ss.getId();

  // 기본 시트 이름 변경
  ss.getSheets()[0].setName('대시보드');

  // 탭 생성
  const taskSheet = ss.insertSheet('주차별 태스크');
  const kpiSheet = ss.insertSheet('KPI 트래킹');
  const kwSheet = ss.insertSheet('키워드 데이터');
  const expSheet = ss.insertSheet('체험단 관리');
  const infSheet = ss.insertSheet('인플루언서 관리');

  // 각 탭 세팅
  setupDashboard(ss.getSheetByName('대시보드'));
  setupTasks(taskSheet);
  setupKPI(kpiSheet);
  setupKeywords(kwSheet);
  setupExperience(expSheet);
  setupInfluencer(infSheet);

  // URL 로깅
  Logger.log('마스터시트 생성 완료: https://docs.google.com/spreadsheets/d/' + ssId);
  SpreadsheetApp.getUi().alert('마스터시트 생성 완료!\n\nhttps://docs.google.com/spreadsheets/d/' + ssId);
}

// ========== 1. 대시보드 ==========
function setupDashboard(sheet) {
  sheet.setColumnWidth(1, 180);
  sheet.setColumnWidth(2, 200);
  sheet.setColumnWidth(3, 200);
  sheet.setColumnWidth(4, 200);
  sheet.setColumnWidth(5, 180);
  sheet.setColumnWidth(6, 180);

  const accent = '#EA580C';
  const black = '#0D0D0D';
  const bg = '#F7F6F2';
  const grayLight = '#F3F4F6';

  // 헤더
  sheet.getRange('A1:F1').merge()
    .setValue('미례국밥 x 브랜드라이즈 | 4월')
    .setFontSize(16).setFontWeight('bold').setFontColor(black)
    .setBackground(bg).setHorizontalAlignment('left');
  sheet.setRowHeight(1, 50);

  // 미션
  sheet.getRange('A3:F3').merge()
    .setValue('MISSION: "미례국밥"을 검색하면 볼 게 있는 상태를 만든다.')
    .setFontSize(12).setFontWeight('bold').setFontColor('#FFFFFF')
    .setBackground(black).setHorizontalAlignment('center');
  sheet.setRowHeight(3, 40);

  // KPI
  sheet.getRange('A5').setValue('4월 KPI').setFontSize(10).setFontWeight('bold').setFontColor(accent);
  sheet.getRange('A6:C6').setValues([['지표', '현재', '목표']]).setFontWeight('bold').setBackground(grayLight);
  sheet.getRange('A7:C8').setValues([
    ['체험단 콘텐츠 발행', '0건', '6건+'],
    ['인스타 가이드라인', '미확정', '확정']
  ]);
  sheet.getRange('C7:C8').setFontWeight('bold').setFontColor(accent);

  // 이번주 액션
  sheet.getRange('A10').setValue('이번주 핵심 액션').setFontSize(10).setFontWeight('bold').setFontColor(accent);
  sheet.getRange('A11:D11').setValues([['✅', '액션', '담당', '상태']]).setFontWeight('bold').setBackground(grayLight);
  sheet.getRange('A12:D16').setValues([
    ['☐', '킥오프 미팅 (4/7)', 'BR+변팀장', '예정'],
    ['☐', '대표키워드 5개 교체', 'BR', '대기'],
    ['☐', '플레이스 소개문 교체', 'BR', '대기'],
    ['☐', '리뷰노트 체험단 등록', 'BR', '대기'],
    ['☐', '인스타 톤 방향 확정', 'BR+변팀장', '대기']
  ]);

  // 키워드 순위
  sheet.getRange('A18').setValue('키워드 순위 TOP 5').setFontSize(10).setFontWeight('bold').setFontColor(accent);
  sheet.getRange('A19:D19').setValues([['키워드', '월 검색', '현재 순위', '변동']]).setFontWeight('bold').setBackground(grayLight);
  sheet.getRange('A20:D24').setValues([
    ['센텀 맛집', '14,230', '9위', '42→9 ↑'],
    ['센텀시티 맛집', '5,550', '9위', '42→9 ↑'],
    ['부산 센텀 맛집', '4,530', '9위', 'NEW'],
    ['재송동 맛집', '4,460', '3위', '24→3 ↑'],
    ['센텀국밥', '460', '1위', '2→1 ↑']
  ]);
  sheet.getRange('D20:D24').setFontWeight('bold').setFontColor(accent);

  // 다음 미팅
  sheet.getRange('A26').setValue('다음 미팅').setFontSize(10).setFontWeight('bold').setFontColor(accent);
  sheet.getRange('A27:C27').setValues([['일시', '안건', '참석']]);
  sheet.getRange('A27:C27').setFontWeight('bold').setBackground(grayLight);
  sheet.getRange('A28:C28').setValues([['4/7(월)', '킥오프: 데이터 진단 + 인스타 방향 + 4월 플랜', 'BR + 변팀장']]);

  // 테두리
  sheet.getRange('A6:C8').setBorder(true, true, true, true, true, true, '#E5E7EB', SpreadsheetApp.BorderStyle.SOLID);
  sheet.getRange('A11:D16').setBorder(true, true, true, true, true, true, '#E5E7EB', SpreadsheetApp.BorderStyle.SOLID);
  sheet.getRange('A19:D24').setBorder(true, true, true, true, true, true, '#E5E7EB', SpreadsheetApp.BorderStyle.SOLID);
}

// ========== 2. 주차별 태스크 ==========
function setupTasks(sheet) {
  const headers = ['주차', '채널', '태스크', '담당', '상태', '마감일', '비고'];
  sheet.getRange('A1:G1').setValues([headers]).setFontWeight('bold').setBackground('#0D0D0D').setFontColor('#FFFFFF');
  sheet.setFrozenRows(1);

  sheet.setColumnWidth(1, 80);
  sheet.setColumnWidth(2, 100);
  sheet.setColumnWidth(3, 350);
  sheet.setColumnWidth(4, 100);
  sheet.setColumnWidth(5, 80);
  sheet.setColumnWidth(6, 100);
  sheet.setColumnWidth(7, 200);

  const data = [
    // W1
    ['W1', '공통', '블랙키위 데이터 분석', 'BR', '완료', '4/4', '2,690명/월, 포화도 2.42%'],
    ['W1', '플레이스', '에드로그 히든 키워드 분석', 'BR', '완료', '4/4', '센텀 맛집 9위 발견'],
    ['W1', '플레이스', '네이버플레이스 진단', 'BR', '진행중', '4/4', ''],
    ['W1', '공통', 'KPI 기준선 측정', 'BR', '진행중', '4/4', ''],
    ['W1', '공통', '기존 촬영 소스 검토', 'BR', '대기', '4/4', '변팀장 공유 대기'],
    ['', '', '', '', '', '', ''],
    // W2
    ['W2', '공통', '킥오프 미팅', 'BR+변팀장', '예정', '4/7', ''],
    ['W2', '인스타', '인스타 톤 방향 확정', 'BR+변팀장', '대기', '4/11', '브랜딩 vs 가맹'],
    ['W2', '플레이스', '대표키워드 5개 교체', 'BR', '대기', '4/8', '돼지우동→센텀맛집, 센텀순대국밥→재송동맛집'],
    ['W2', '플레이스', '소개문 교체 (센텀)', 'BR', '대기', '4/9', '작성 완료, 교체만'],
    ['W2', '플레이스', '소개문에 센텀맛집/재송동맛집 키워드 추가', 'BR', '대기', '4/9', ''],
    ['W2', '체험단', '리뷰노트 캠페인 등록', 'BR', '대기', '4/9', '"센텀 맛집" 키워드 지정'],
    ['W2', '체험단', '키워드 가이드 전달', '변팀장', '대기', '4/11', '1장짜리 가이드 전달'],
    ['W2', '메타', '비즈니스 계정 생성', 'BR', '대기', '4/11', ''],
    ['W2', '인스타', '인플루언서 후보 확정 (5~7명)', 'BR', '대기', '4/11', 'influencer-seeding-list.md 기반'],
    ['', '', '', '', '', '', ''],
    // W3
    ['W3', '인스타', '콘텐츠 가이드라인 확정', 'BR', '대기', '4/18', '톤+비율+시리즈 가이드'],
    ['W3', '체험단', '첫 체험단 방문 시작', 'BR+변팀장', '대기', '4/18', ''],
    ['W3', '인스타', '인플루언서 컨택 DM', 'BR', '대기', '4/16', ''],
    ['W3', '플레이스', '소식 발행 시작', 'BR', '대기', '4/18', ''],
    ['W3', '플레이스', '리뷰 답변 템플릿 적용', '변팀장', '대기', '4/14', '10종 돌려쓰기'],
    ['W3', '메타', '광고 세팅 (픽셀, 타겟)', 'BR', '대기', '4/18', ''],
    ['', '', '', '', '', '', ''],
    // W4
    ['W4', '인스타', '씨딩 릴스 수거 + QC', 'BR', '대기', '4/28', '돼지우동 면뽑기 필수'],
    ['W4', '메타', '광고 시작 (릴스 소재)', 'BR', '대기', '4/25', ''],
    ['W4', '체험단', '체험단 콘텐츠 수거 + 키워드 체크', 'BR', '대기', '4/28', ''],
    ['W4', '플레이스', '에드로그 순위 변동 체크', 'BR', '대기', '4/28', '센텀맛집/재송동맛집'],
    ['W4', '공통', '월간 리포트 작성', 'BR', '대기', '4/30', ''],
    ['W4', '공통', 'Month 2 방향 제안', 'BR', '대기', '4/30', '']
  ];

  sheet.getRange(2, 1, data.length, 7).setValues(data);

  // 상태별 조건부 서식
  const statusRange = sheet.getRange('E2:E100');
  const rules = sheet.getConditionalFormatRules();

  rules.push(SpreadsheetApp.newConditionalFormatRule()
    .whenTextEqualTo('완료').setBackground('#F0FDF4').setFontColor('#16A34A')
    .setRanges([statusRange]).build());
  rules.push(SpreadsheetApp.newConditionalFormatRule()
    .whenTextEqualTo('진행중').setBackground('#FFF7ED').setFontColor('#EA580C')
    .setRanges([statusRange]).build());
  rules.push(SpreadsheetApp.newConditionalFormatRule()
    .whenTextEqualTo('대기').setBackground('#F3F4F6').setFontColor('#6B7280')
    .setRanges([statusRange]).build());

  sheet.setConditionalFormatRules(rules);

  // 데이터 유효성 (상태 드롭다운)
  const statusValidation = SpreadsheetApp.newDataValidation()
    .requireValueInList(['대기', '진행중', '완료', '보류'], true).build();
  sheet.getRange('E2:E100').setDataValidation(statusValidation);

  // 담당 드롭다운
  const assignValidation = SpreadsheetApp.newDataValidation()
    .requireValueInList(['BR', '변팀장', '지은', 'BR+변팀장'], true).build();
  sheet.getRange('D2:D100').setDataValidation(assignValidation);

  // 채널 드롭다운
  const chValidation = SpreadsheetApp.newDataValidation()
    .requireValueInList(['플레이스', '인스타', '체험단', '메타', '공통'], true).build();
  sheet.getRange('B2:B100').setDataValidation(chValidation);
}

// ========== 3. KPI 트래킹 ==========
function setupKPI(sheet) {
  const headers = ['지표', '4/1 기준선', 'W1 (4/4)', 'W2 (4/11)', 'W3 (4/18)', 'W4 (4/30)', '목표', '달성'];
  sheet.getRange('A1:H1').setValues([headers]).setFontWeight('bold').setBackground('#0D0D0D').setFontColor('#FFFFFF');
  sheet.setFrozenRows(1);

  sheet.setColumnWidth(1, 200);
  for (let i = 2; i <= 8; i++) sheet.setColumnWidth(i, 120);

  const data = [
    ['체험단 콘텐츠 발행', '0건', '', '', '', '', '6건+', ''],
    ['인스타 가이드라인', '미확정', '', '', '', '', '확정', ''],
    ['센텀 맛집 순위', '9위', '', '', '', '', '상승', ''],
    ['재송동 맛집 순위', '3위', '', '', '', '', '유지/상승', ''],
    ['블로그 리뷰 수', '44개', '', '', '', '', '54개+', ''],
    ['방문자 리뷰', '1,296개', '', '', '', '', '', ''],
    ['인플루언서 릴스', '0건', '', '', '', '', '5~7건', '']
  ];

  sheet.getRange(2, 1, data.length, 8).setValues(data);
  sheet.getRange('G2:G8').setFontWeight('bold').setFontColor('#EA580C');
}

// ========== 4. 키워드 데이터 ==========
function setupKeywords(sheet) {
  const headers = ['키워드', '월 검색량', '현재 순위', '2주 전', '변동', '분류', '메모'];
  sheet.getRange('A1:G1').setValues([headers]).setFontWeight('bold').setBackground('#0D0D0D').setFontColor('#FFFFFF');
  sheet.setFrozenRows(1);

  sheet.setColumnWidth(1, 180);
  sheet.setColumnWidth(2, 100);
  sheet.setColumnWidth(3, 80);
  sheet.setColumnWidth(4, 80);
  sheet.setColumnWidth(5, 80);
  sheet.setColumnWidth(6, 100);
  sheet.setColumnWidth(7, 300);

  const data = [
    ['센텀 맛집', '14,230', '9', '42', '↑33', '핵심 기회', '골든타임. 대표키워드 추가 필요'],
    ['센텀시티 맛집', '5,550', '9', '42', '↑33', '핵심 기회', '센텀 맛집과 연동 상승'],
    ['부산 국밥', '5,620', '61', '~100', '↑', '장기 도전', '업체 2,078개'],
    ['부산 센텀 맛집', '4,530', '9', '-', 'NEW', '핵심 기회', ''],
    ['재송동 맛집', '4,460', '3', '24', '↑21', '핵심 기회', '지역 전환률 높음'],
    ['센텀국밥', '460', '1', '2', '↑1', '유지', '안착'],
    ['센텀점심', '460', '5', '-', 'NEW', '기회', '목적형 키워드'],
    ['센텀역맛집', '330', '5', '26', '↑21', '기회', '상승세'],
    ['센텀 돼지국밥', '300', '2', '-', '', '유지', '1위 가능'],
    ['해운대 센텀시티 맛집', '160', '9', '42', '↑33', '기회', '연동'],
    ['부산센텀국밥', '100', '1', '2', '↑1', '유지', ''],
    ['부산센텀순대국', '30', '1', '1', '-', '유지', '검색량 작지만 1위']
  ];

  sheet.getRange(2, 1, data.length, 7).setValues(data);

  // 분류별 조건부 서식
  const classRange = sheet.getRange('F2:F100');
  const rules = sheet.getConditionalFormatRules();
  rules.push(SpreadsheetApp.newConditionalFormatRule()
    .whenTextEqualTo('핵심 기회').setBackground('#FFF7ED').setFontColor('#EA580C')
    .setRanges([classRange]).build());
  rules.push(SpreadsheetApp.newConditionalFormatRule()
    .whenTextEqualTo('유지').setBackground('#F0FDF4').setFontColor('#16A34A')
    .setRanges([classRange]).build());
  rules.push(SpreadsheetApp.newConditionalFormatRule()
    .whenTextEqualTo('기회').setBackground('#EFF6FF').setFontColor('#2563EB')
    .setRanges([classRange]).build());
  sheet.setConditionalFormatRules(rules);
}

// ========== 5. 체험단 관리 ==========
function setupExperience(sheet) {
  const headers = ['#', '플랫폼', '블로거명', '블로그 URL', '매장', '방문일', '지정 키워드', '발행일', '키워드 포함', '결과물 URL', '상태'];
  sheet.getRange('A1:K1').setValues([headers]).setFontWeight('bold').setBackground('#0D0D0D').setFontColor('#FFFFFF');
  sheet.setFrozenRows(1);

  sheet.setColumnWidth(1, 40);
  sheet.setColumnWidth(2, 100);
  sheet.setColumnWidth(3, 120);
  sheet.setColumnWidth(4, 200);
  sheet.setColumnWidth(5, 80);
  sheet.setColumnWidth(6, 90);
  sheet.setColumnWidth(7, 150);
  sheet.setColumnWidth(8, 90);
  sheet.setColumnWidth(9, 80);
  sheet.setColumnWidth(10, 200);
  sheet.setColumnWidth(11, 80);

  // 드롭다운
  const platformVal = SpreadsheetApp.newDataValidation()
    .requireValueInList(['리뷰노트', '아싸뷰', '파인앳플', '직접섭외'], true).build();
  sheet.getRange('B2:B100').setDataValidation(platformVal);

  const storeVal = SpreadsheetApp.newDataValidation()
    .requireValueInList(['센텀', '전포'], true).build();
  sheet.getRange('E2:E100').setDataValidation(storeVal);

  const kwIncVal = SpreadsheetApp.newDataValidation()
    .requireValueInList(['Y', 'N'], true).build();
  sheet.getRange('I2:I100').setDataValidation(kwIncVal);

  const statusVal = SpreadsheetApp.newDataValidation()
    .requireValueInList(['대기', '방문완료', '발행완료', '노쇼'], true).build();
  sheet.getRange('K2:K100').setDataValidation(statusVal);
}

// ========== 6. 인플루언서 관리 ==========
function setupInfluencer(sheet) {
  const headers = ['#', '계정명', '채널', '팔로워', '예상 단가', '컨택 상태', '방문일', '콘텐츠 유형', '발행일', '콘텐츠 URL', '2차 활용', '비용'];
  sheet.getRange('A1:L1').setValues([headers]).setFontWeight('bold').setBackground('#0D0D0D').setFontColor('#FFFFFF');
  sheet.setFrozenRows(1);

  sheet.setColumnWidth(1, 40);
  sheet.setColumnWidth(2, 150);
  sheet.setColumnWidth(3, 80);
  sheet.setColumnWidth(4, 80);
  sheet.setColumnWidth(5, 100);
  sheet.setColumnWidth(6, 100);
  sheet.setColumnWidth(7, 90);
  sheet.setColumnWidth(8, 100);
  sheet.setColumnWidth(9, 90);
  sheet.setColumnWidth(10, 200);
  sheet.setColumnWidth(11, 80);
  sheet.setColumnWidth(12, 80);

  // 초기 후보 데이터
  const data = [
    [1, '@busan.local', '인스타', '~58K', '30~50만', '미컨택', '', '', '', '', '', ''],
    [2, '@busan_zzzzzin_', '인스타', '~10~30K', '15~25만', '미컨택', '', '릴스', '', '', '', ''],
    [3, '@broculri13', '인스타+블로그', '~10~25K', '20~30만', '미컨택', '', '', '', '', '', ''],
    [4, '@muk__jina', '인스타+블로그', '~10~20K', '20~30만', '미컨택', '', '', '', '', '', ''],
    [5, '@busan_date_', '인스타', '~10~20K', '15~25만', '미컨택', '', '', '', '', '', ''],
    [6, '@busan.local.food', '인스타', '~5~15K', '10~20만', '미컨택', '', '', '', '', '', ''],
    [7, '@muk_jeong', '인스타', '~15~30K', '20~30만', '미컨택', '', '', '', '', '', '']
  ];

  sheet.getRange(2, 1, data.length, 12).setValues(data);

  // 드롭다운
  const contactVal = SpreadsheetApp.newDataValidation()
    .requireValueInList(['미컨택', 'DM발송', '수락', '거절', '협의중'], true).build();
  sheet.getRange('F2:F100').setDataValidation(contactVal);

  const typeVal = SpreadsheetApp.newDataValidation()
    .requireValueInList(['릴스', '피드', '블로그', '유튜브'], true).build();
  sheet.getRange('H2:H100').setDataValidation(typeVal);

  const reuseVal = SpreadsheetApp.newDataValidation()
    .requireValueInList(['Y', 'N'], true).build();
  sheet.getRange('K2:K100').setDataValidation(reuseVal);

  // 상태별 조건부 서식
  const contactRange = sheet.getRange('F2:F100');
  const rules = sheet.getConditionalFormatRules();
  rules.push(SpreadsheetApp.newConditionalFormatRule()
    .whenTextEqualTo('수락').setBackground('#F0FDF4').setFontColor('#16A34A')
    .setRanges([contactRange]).build());
  rules.push(SpreadsheetApp.newConditionalFormatRule()
    .whenTextEqualTo('DM발송').setBackground('#FFF7ED').setFontColor('#EA580C')
    .setRanges([contactRange]).build());
  rules.push(SpreadsheetApp.newConditionalFormatRule()
    .whenTextEqualTo('거절').setBackground('#FEF2F2').setFontColor('#DC2626')
    .setRanges([contactRange]).build());
  sheet.setConditionalFormatRules(rules);
}
