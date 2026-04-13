/**
 * 미례국밥 공유용 마스터시트 — 탭 자동 생성
 * 대상: 변팀장님 공유용 시트
 * 실행: setupSharedSheet() 함수 실행
 */

function setupSharedSheet() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();

  createDashboardTab(ss);
  createWeeklyTaskTab(ss);
  createDeliverableTab(ss);
  createKeywordTab(ss);
  createIntroTextTab(ss);

  SpreadsheetApp.flush();
  Browser.msgBox('공유용 시트 생성 완료!');
}

// ── 대시보드 ──
function createDashboardTab(ss) {
  let sheet = ss.getSheetByName('대시보드');
  if (!sheet) { sheet = ss.insertSheet('대시보드'); }
  else { sheet.clear(); }

  // 헤더
  sheet.getRange('A1').setValue('미례국밥 x 브랜드라이즈 | 4월 대시보드').setFontSize(14).setFontWeight('bold');
  sheet.getRange('A1:F1').merge().setBackground('#1a1a1a').setFontColor('#FFFFFF');

  // 미션
  sheet.getRange('A3').setValue('4월 미션').setFontWeight('bold').setFontSize(11);
  sheet.getRange('A4').setValue('"미례국밥을 검색하면 볼 게 있는 상태" 만들기');

  // KPI 현황
  sheet.getRange('A6').setValue('KPI 현황').setFontWeight('bold').setFontSize(11);
  sheet.getRange('A6:F6').setBackground('#E8F5E9');

  const kpiHeaders = ['지표', '4/1 기준', '현재', '목표', '달성률', '비고'];
  sheet.getRange(7, 1, 1, 6).setValues([kpiHeaders]).setFontWeight('bold').setBackground('#F5F5F5');

  const kpiData = [
    ['미례국밥 검색량', '2,690', '3,330', '유지~상승', '+24%', '등급 C+→B-'],
    ['블로그 리뷰 (센텀)', '44', '48', '+10건', '+4건', '체험단 시작 전'],
    ['방문자 리뷰 (센텀)', '1,296', '1,381', '유지', '+85건', ''],
    ['센텀 맛집 순위', '9위', '10위', 'TOP 10 유지', '', '5~24위 등락'],
    ['재송동 맛집 순위', '3위', '3~4위', 'TOP 5 유지', '', ''],
    ['인플루언서 릴스', '0', '0', '5~7건', '', 'W3 컨택 시작'],
    ['콘텐츠 포화도', '2.42%', '1.02%', '', '', '콘텐츠 부족 심화']
  ];
  sheet.getRange(8, 1, kpiData.length, 6).setValues(kpiData);

  // 이번주 핵심 액션
  sheet.getRange('A16').setValue('이번주 핵심 액션 (W3: 4/14~18)').setFontWeight('bold').setFontSize(11);
  sheet.getRange('A16:F16').setBackground('#E3F2FD');

  const actionHeaders = ['#', '태스크', '담당', '상태', '마감', '비고'];
  sheet.getRange(17, 1, 1, 6).setValues([actionHeaders]).setFontWeight('bold').setBackground('#F5F5F5');

  const actions = [
    [1, '블로그 콘텐츠 3편 발행', 'BR', '대기', '4/18', '센텀 미례국밥 x2, 전포 x1'],
    [2, '인스타 콘텐츠 가이드라인 확정', 'BR', '대기', '4/16', ''],
    [3, '인플루언서 씨딩 컨택 시작', 'BR', '대기', '4/18', 'DM 발송'],
    [4, '플레이스 소식 발행', 'BR', '대기', '4/15', '3개월 중단 → 재개'],
    [5, '소개문 교체 (센텀점)', 'BR', '대기', '4/14', '키워드 보강본 컨펌 필요'],
    [6, '미답변 리뷰 답변 (10건)', '변팀장', '대기', '4/15', '템플릿 활용']
  ];
  sheet.getRange(18, 1, actions.length, 6).setValues(actions);

  // 다음 미팅
  sheet.getRange('A25').setValue('다음 미팅').setFontWeight('bold').setFontSize(11);
  sheet.getRange('A26').setValue('2차 미팅 — 일정 조율 중 (톤 확정 + 플레이스 진단 공유 + 씨딩 리스트)');

  // 열 너비
  sheet.setColumnWidth(1, 60);
  sheet.setColumnWidth(2, 300);
  sheet.setColumnWidth(3, 80);
  sheet.setColumnWidth(4, 80);
  sheet.setColumnWidth(5, 100);
  sheet.setColumnWidth(6, 250);

  sheet.setFrozenRows(2);
}

// ── 주간 태스크 ──
function createWeeklyTaskTab(ss) {
  let sheet = ss.getSheetByName('주간 태스크');
  if (!sheet) { sheet = ss.insertSheet('주간 태스크'); }
  else { sheet.clear(); }

  const headers = ['주차', '채널', '태스크', '담당', '상태', '마감일', '비고'];
  sheet.getRange(1, 1, 1, headers.length).setValues([headers]);
  sheet.getRange(1, 1, 1, headers.length).setBackground('#1a1a1a').setFontColor('#FFFFFF').setFontWeight('bold');

  // 상태 드롭다운
  const statusRule = SpreadsheetApp.newDataValidation()
    .requireValueInList(['대기', '진행중', '완료', '보류'], true).build();
  sheet.getRange(2, 5, 100, 1).setDataValidation(statusRule);

  // 담당 드롭다운
  const ownerRule = SpreadsheetApp.newDataValidation()
    .requireValueInList(['BR', '변팀장', '인턴(지은)', 'BR+변팀장'], true).build();
  sheet.getRange(2, 4, 100, 1).setDataValidation(ownerRule);

  // 채널 드롭다운
  const channelRule = SpreadsheetApp.newDataValidation()
    .requireValueInList(['공통', '플레이스', '인스타', '체험단', '메타', '블로그', '파워링크'], true).build();
  sheet.getRange(2, 2, 100, 1).setDataValidation(channelRule);

  // W1 데이터
  const w1 = [
    ['W1', '공통', '블랙키위/에드로그 데이터 분석', 'BR', '완료', '4/4', ''],
    ['W1', '플레이스', '네이버플레이스 진단 (센텀+전포)', 'BR', '완료', '4/4', ''],
    ['W1', '공통', 'KPI 기준선 측정', 'BR', '완료', '4/4', '검색량 2,690 / 블로그 44'],
  ];

  // W2 데이터
  const w2 = [
    ['W2', '공통', '킥오프 미팅 (4/6)', 'BR+변팀장', '완료', '4/6', 'A안 브랜딩+슬로건 컨펌'],
    ['W2', '공통', '변팀장 계정/권한 요청', 'BR', '완료', '4/7', 'NP+인스타+메타'],
    ['W2', '공통', '별점 부활 대응 — 리뷰 가이드+템플릿', 'BR', '완료', '4/8', '템플릿 10종'],
    ['W2', '플레이스', '대표키워드 교체 (센텀점)', 'BR', '완료', '4/13', '해운대돼지국밥/센텀점심 추가'],
    ['W2', '플레이스', '소개문 교체 (센텀점)', 'BR', '진행중', '4/13', '키워드 보강본 컨펌 대기'],
    ['W2', '파워링크', '네이버 파워링크 세팅', 'BR', '완료', '4/13', '창업 키워드 타겟, 검수 대기'],
    ['W2', '체험단', '업체/비용 협의', 'BR+변팀장', '대기', '4/11', ''],
    ['W2', '인스타', '채널 전략서 초안', 'BR', '대기', '4/10', ''],
    ['W2', '인스타', '인플루언서 후보 리스트업', '인턴(지은)', '대기', '4/11', ''],
    ['W2', '공통', '마스터시트 생성+공유', 'BR', '진행중', '4/13', ''],
  ];

  // W3 데이터
  const w3 = [
    ['W3', '인스타', '콘텐츠 가이드라인 확정', 'BR', '대기', '4/16', ''],
    ['W3', '체험단', '첫 체험단 방문 시작', 'BR+변팀장', '대기', '4/18', ''],
    ['W3', '인스타', '인플루언서 컨택 DM', 'BR', '대기', '4/18', ''],
    ['W3', '플레이스', '소식 발행 재개', 'BR', '대기', '4/15', '3개월 중단 상태'],
    ['W3', '플레이스', '리뷰 답변 템플릿 적용', '변팀장', '대기', '4/18', '미답변 10건'],
    ['W3', '메타', '광고 세팅 (픽셀, 타겟)', 'BR', '대기', '4/18', ''],
  ];

  // W4 데이터
  const w4 = [
    ['W4', '인스타', '씨딩 릴스 수거 + QC', 'BR', '대기', '4/25', ''],
    ['W4', '메타', '광고 시작 (릴스 소재)', 'BR', '대기', '4/21', ''],
    ['W4', '체험단', '체험단 콘텐츠 수거 + 키워드 체크', 'BR', '대기', '4/28', ''],
    ['W4', '공통', '월간 리포트 작성', 'BR', '대기', '4/30', ''],
    ['W4', '공통', 'Month 2 방향 제안', 'BR', '대기', '4/30', ''],
  ];

  const allData = [...w1, ...w2, ...w3, ...w4];
  sheet.getRange(2, 1, allData.length, 7).setValues(allData);

  // 주차별 색상
  for (let i = 0; i < allData.length; i++) {
    const row = i + 2;
    const week = allData[i][0];
    let color = '#FFFFFF';
    if (week === 'W1') color = '#F3F3F3';
    if (week === 'W2') color = '#E8F5E9';
    if (week === 'W3') color = '#E3F2FD';
    if (week === 'W4') color = '#FFF3E0';
    sheet.getRange(row, 1, 1, 7).setBackground(color);
  }

  // 상태별 조건부 서식
  const completeRule = SpreadsheetApp.newConditionalFormatRule()
    .whenTextEqualTo('완료')
    .setBackground('#C8E6C9').setFontColor('#2E7D32')
    .setRanges([sheet.getRange(2, 5, 100, 1)]).build();
  const progressRule = SpreadsheetApp.newConditionalFormatRule()
    .whenTextEqualTo('진행중')
    .setBackground('#BBDEFB').setFontColor('#1565C0')
    .setRanges([sheet.getRange(2, 5, 100, 1)]).build();
  sheet.setConditionalFormatRules([completeRule, progressRule]);

  // 열 너비
  sheet.setColumnWidth(1, 50);
  sheet.setColumnWidth(2, 80);
  sheet.setColumnWidth(3, 350);
  sheet.setColumnWidth(4, 100);
  sheet.setColumnWidth(5, 70);
  sheet.setColumnWidth(6, 85);
  sheet.setColumnWidth(7, 250);

  sheet.setFrozenRows(1);
}

// ── 산출물 컨펌 ──
function createDeliverableTab(ss) {
  let sheet = ss.getSheetByName('산출물 컨펌');
  if (!sheet) { sheet = ss.insertSheet('산출물 컨펌'); }
  else { sheet.clear(); }

  // 안내문
  sheet.getRange('A1').setValue('산출물 컨펌 — 변팀장님은 D열(컨펌)에서 확인/수정요청만 해주시면 됩니다').setFontSize(10).setFontColor('#666666');

  const headers = ['날짜', '산출물명', '카테고리', '컨펌', '수정요청 메모', '담당'];
  sheet.getRange(2, 1, 1, headers.length).setValues([headers]);
  sheet.getRange(2, 1, 1, headers.length).setBackground('#1a1a1a').setFontColor('#FFFFFF').setFontWeight('bold');

  // 컨펌 드롭다운
  const confirmRule = SpreadsheetApp.newDataValidation()
    .requireValueInList(['대기', '컨펌', '수정요청'], true).build();
  sheet.getRange(3, 4, 100, 1).setDataValidation(confirmRule);

  // 카테고리 드롭다운
  const catRule = SpreadsheetApp.newDataValidation()
    .requireValueInList(['플레이스', '인스타', '체험단', '파워링크', '전략', '공통'], true).build();
  sheet.getRange(3, 3, 100, 1).setDataValidation(catRule);

  // 초기 데이터
  const data = [
    ['4/7', '리뷰 답변 템플릿 10종 + 별점 가이드', '플레이스', '대기', '', 'BR'],
    ['4/7', '인플루언서 가이드 v1', '체험단', '대기', '', 'BR'],
    ['4/13', '센텀점 대표키워드 교체 (5개)', '플레이스', '컨펌', '맛집 등록 불가로 대안 적용', 'BR'],
    ['4/13', '센텀점 소개문 (키워드 보강본)', '플레이스', '대기', '해운대돼지국밥+센텀점심 반영', 'BR'],
    ['4/13', '파워링크 캠페인 세팅', '파워링크', '완료', '비즈채널 검수 대기', 'BR'],
  ];
  sheet.getRange(3, 1, data.length, 6).setValues(data);

  // 컨펌 상태 조건부 서식
  const confirmOk = SpreadsheetApp.newConditionalFormatRule()
    .whenTextEqualTo('컨펌')
    .setBackground('#C8E6C9').setFontColor('#2E7D32')
    .setRanges([sheet.getRange(3, 4, 100, 1)]).build();
  const confirmWait = SpreadsheetApp.newConditionalFormatRule()
    .whenTextEqualTo('대기')
    .setBackground('#FFF9C4').setFontColor('#F57F17')
    .setRanges([sheet.getRange(3, 4, 100, 1)]).build();
  const confirmFix = SpreadsheetApp.newConditionalFormatRule()
    .whenTextEqualTo('수정요청')
    .setBackground('#FFCDD2').setFontColor('#C62828')
    .setRanges([sheet.getRange(3, 4, 100, 1)]).build();
  sheet.setConditionalFormatRules([confirmOk, confirmWait, confirmFix]);

  // 열 너비
  sheet.setColumnWidth(1, 70);
  sheet.setColumnWidth(2, 350);
  sheet.setColumnWidth(3, 80);
  sheet.setColumnWidth(4, 80);
  sheet.setColumnWidth(5, 300);
  sheet.setColumnWidth(6, 60);

  sheet.setFrozenRows(2);
}

// ── 키워드 데이터 (읽기용) ──
function createKeywordTab(ss) {
  let sheet = ss.getSheetByName('키워드 순위');
  if (!sheet) { sheet = ss.insertSheet('키워드 순위'); }
  else { sheet.clear(); }

  const headers = ['지점', '키워드', '메인KW', '검색량', 'W1(4/5)', 'W2(4/12)', 'W3', 'W4', '분류', '비고'];
  sheet.getRange(1, 1, 1, headers.length).setValues([headers]);
  sheet.getRange(1, 1, 1, headers.length).setBackground('#1a1a1a').setFontColor('#FFFFFF').setFontWeight('bold');

  const data = [
    ['센텀', '센텀 맛집', '', 14190, 24, 10, '', '', '기회', '5~24위 등락'],
    ['센텀', '재송동맛집', '', 4440, 3, '-', '', '', '기회', '3~10위 등락'],
    ['센텀', '센텀국밥', '★', 490, 1, 1, '', '', '유지', '1위 고정'],
    ['센텀', '센텀돼지국밥', '★', 310, 2, 2, '', '', '유지', '안정'],
    ['센텀', '센텀 순대국', '', 30, 1, 1, '', '', '유지', '1위 고정'],
    ['센텀', '센텀 미례국밥', '', 670, '-', '-', '', '', '유지', ''],
    ['센텀', '센텀점심', '★', 440, '-', 4, '', '', '기회', '신규 등장, 상승세'],
    ['센텀', '센텀역맛집', '', 330, '-', 4, '', '', '기회', '신규 등장'],
    ['센텀', '센텀시티 맛집', '', 5740, '-', 10, '', '', '기회', ''],
    ['센텀', '부산센텀국밥', '', 130, 1, 1, '', '', '유지', ''],
    ['센텀', '해운대돼지국밥', '★', 5060, '-', '-', '', '', '기회', '대표KW 추가, 포화도 8.4%'],
    ['전포', '전포 맛집', '', 33850, 8, 8, '', '', '기회', ''],
    ['전포', '전포 점심', '', '', 5, 5, '', '', '유지', ''],
    ['전포', '전포 미례국밥', '', 1220, '-', '-', '', '', '유지', '센텀의 2배'],
    ['공통', '미례국밥', '', 3330, '-', '-', '', '', '유지', '등급 C+→B-, +24%'],
    ['공통', '돼지우동', '', 310, '-', '-', '', '', '장기도전', 'NP→인스타 바이럴 전환'],
  ];
  sheet.getRange(2, 1, data.length, 10).setValues(data);

  // 검색량 서식
  sheet.getRange(2, 4, data.length, 1).setNumberFormat('#,##0');

  // 분류 드롭다운
  const classRule = SpreadsheetApp.newDataValidation()
    .requireValueInList(['유지', '기회', '장기도전'], true).build();
  sheet.getRange(2, 9, 50, 1).setDataValidation(classRule);

  // 열 너비
  sheet.setColumnWidth(1, 50);
  sheet.setColumnWidth(2, 140);
  sheet.setColumnWidth(3, 60);
  sheet.setColumnWidth(4, 80);
  sheet.setColumnWidth(10, 250);

  sheet.setFrozenRows(1);
}

// ── 소개문/산출물 본문 ──
function createIntroTextTab(ss) {
  let sheet = ss.getSheetByName('산출물 본문');
  if (!sheet) { sheet = ss.insertSheet('산출물 본문'); }
  else { sheet.clear(); }

  sheet.getRange('A1').setValue('산출물 본문 — 컨펌 후 적용할 텍스트').setFontSize(12).setFontWeight('bold');
  sheet.getRange('A1:D1').merge().setBackground('#1a1a1a').setFontColor('#FFFFFF');

  // ── 센텀점 소개문 ──
  sheet.getRange('A3').setValue('센텀점 소개문 (4/13 작성)').setFontWeight('bold').setFontSize(11);
  sheet.getRange('A3:D3').setBackground('#E3F2FD');

  const introHeaders = ['문단', '본문', '포함 키워드', '컨펌'];
  sheet.getRange(4, 1, 1, 4).setValues([introHeaders]).setFontWeight('bold').setBackground('#F5F5F5');

  const introData = [
    ['1. 매장 소개', '미례국밥 센텀점은 정성껏 우려낸 돼지 뼈 육수로 만드는 해운대 돼지국밥 전문점입니다. \'맛은 정성으로, 예는 마음으로\'라는 마음가짐으로, 매일 아침 가마솥에서 오랜 시간 끓여낸 육수 한 그릇을 내어드리고 있습니다.', '해운대 돼지국밥, 미례국밥', ''],
    ['2. 시그니처 메뉴', '센텀 미례국밥의 대표 메뉴는 돼지우동입니다. 국밥집에서 우동이라니, 처음 들으시면 조금 생소하실 수 있습니다. 하지만 한 번 드셔보시면 이해가 됩니다. 진하게 우려낸 돼지국밥 육수에 쫄깃한 우동면을 담아낸 메뉴로, 국밥의 깊은 맛과 우동의 부드러운 식감이 만나 미례국밥만의 특별한 한 그릇이 완성됩니다.', '돼지우동, 센텀 미례국밥, 미례국밥', ''],
    ['3. 기본 메뉴', '물론 기본에도 충실합니다. 미례국밥의 돼지국밥은 깊고 진한 육수에 부드럽게 삶아낸 고기를 올려, 부산 국밥 본연의 맛을 그대로 느끼실 수 있습니다. 고기를 넉넉하게 즐기고 싶으신 분들께는 한마리국밥을 추천드립니다. 순대국밥도 준비되어 있어, 취향에 맞게 선택하실 수 있습니다.', '돼지국밥, 부산 국밥, 한마리국밥, 순대국밥', ''],
    ['4. 센텀 점심', '센텀 점심 고민이시라면 미례국밥을 추천드립니다. 빠르게 나오는 뜨끈한 국밥 한 그릇이면 든든한 점심 해결이 됩니다. 센텀 국밥을 찾으시는 분들께 자신 있게 권해드리는 이유는, 맛뿐 아니라 깔끔한 공간에서 편안하게 식사하실 수 있기 때문입니다.', '센텀 점심, 센텀 국밥, 미례국밥', ''],
    ['5. 방문 유도', '해운대 돼지국밥을 드시고 싶을 때, 든든한 한 끼가 필요할 때, 또는 돼지우동이라는 새로운 메뉴가 궁금하실 때 편하게 찾아주시면 됩니다. 혼자 오셔도, 여럿이 오셔도 부담 없이 즐기실 수 있는 공간입니다.', '해운대 돼지국밥, 돼지우동', ''],
    ['6. 마무리', '센텀돼지국밥을 찾고 계셨다면, 미례국밥 센텀점에서 정성이 담긴 한 그릇을 경험해 보세요.', '센텀돼지국밥, 미례국밥', ''],
    ['7. 메뉴 안내', '돼지국밥 10,000원 / 돼지우동 11,500원 / 한마리국밥 13,000원 / 순대국밥 10,000원', '', ''],
    ['8. 주차 안내', '센텀필 상가 1관, 2관 주차장 이용 가능. 식사하시는 분께 1시간 주차권을 제공해 드립니다.', '', ''],
  ];
  sheet.getRange(5, 1, introData.length, 4).setValues(introData);
  sheet.getRange(5, 2, introData.length, 1).setWrap(true);

  // 컨펌 드롭다운
  const introConfirm = SpreadsheetApp.newDataValidation()
    .requireValueInList(['OK', '수정요청'], true).build();
  sheet.getRange(5, 4, introData.length, 1).setDataValidation(introConfirm);

  // 키워드 요약
  const kwRow = 5 + introData.length + 1;
  sheet.getRange(kwRow, 1).setValue('키워드 요약').setFontWeight('bold');
  const kwSummary = [
    ['해운대 돼지국밥', '2회'],
    ['센텀 점심', '1회'],
    ['센텀돼지국밥', '1회'],
    ['센텀 국밥', '1회'],
    ['미례국밥', '6회+'],
    ['돼지우동', '3회'],
    ['부산 국밥', '1회'],
  ];
  sheet.getRange(kwRow + 1, 1, kwSummary.length, 2).setValues(kwSummary);

  // ── 리뷰 답변 템플릿 ──
  const reviewStart = kwRow + kwSummary.length + 3;
  sheet.getRange(reviewStart, 1).setValue('리뷰 답변 템플릿 10종 (4/13 키워드 보강)').setFontWeight('bold').setFontSize(11);
  sheet.getRange(reviewStart, 1, 1, 4).setBackground('#E3F2FD');

  const reviewHeaders = ['#', '상황', '답변 본문', '포함 키워드'];
  sheet.getRange(reviewStart + 1, 1, 1, 4).setValues([reviewHeaders]).setFontWeight('bold').setBackground('#F5F5F5');

  const templates = [
    ['1', '돼지우동 칭찬', '센텀 미례국밥의 돼지우동을 맛있게 드셨다니 정말 기쁩니다. 매일 아침 우려낸 해운대 돼지국밥 육수에 쫄깃한 우동면을 담아내는 메뉴인데, 그 정성이 전해진 것 같아요. 센텀 점심 고민되실 때 또 편하게 들러주세요.', '미례국밥, 돼지우동, 해운대 돼지국밥, 센텀 점심'],
    ['2', '국밥 칭찬', '센텀 국밥 찾아 미례국밥에 와주셔서 감사합니다. 매일 아침 직접 우려내는 해운대 돼지국밥 육수라 이렇게 말씀해 주시면 힘이 납니다. 다음에는 돼지우동도 한번 드셔보세요, 센텀 미례국밥의 시그니처입니다.', '센텀 국밥, 미례국밥, 해운대 돼지국밥, 돼지우동'],
    ['3', '재방문', '센텀 미례국밥을 다시 찾아주셨군요, 정말 반갑습니다. 혹시 아직 돼지우동 안 드셔보셨다면 다음에 꼭 도전해 보세요. 해운대 돼지국밥 육수에 우동면이라 한번 드시면 자꾸 생각납니다.', '미례국밥, 돼지우동, 해운대 돼지국밥'],
    ['4', '양/든든 칭찬', '센텀 점심으로 든든하게 한 끼 해결하셨다니 다행이에요. 미례국밥의 해운대 돼지국밥은 역시 배부르게 먹어야 제맛이죠. 센텀 국밥 생각나실 때 또 찾아주세요.', '센텀 점심, 미례국밥, 해운대 돼지국밥, 센텀 국밥'],
    ['5', '분위기 칭찬', '공간까지 눈여겨봐 주셔서 감사합니다. 센텀 미례국밥은 편안하게 식사하실 수 있도록 신경 쓰고 있는데 느껴주셨다니 보람 있네요. 센텀 점심 고민되실 때 해운대 돼지국밥 한 그릇 드시러 언제든 오세요.', '미례국밥, 센텀 점심, 해운대 돼지국밥'],
    ['6', '서비스 칭찬', '따뜻하게 느끼셨다니 저희도 기분이 좋습니다. 센텀 국밥 드시러 오시는 분들이 맛뿐 아니라 편안함까지 느끼실 수 있는 미례국밥이 되겠습니다. 돼지우동도 다음에 한번 드셔보세요!', '센텀 국밥, 미례국밥, 돼지우동'],
    ['7', '처음 방문', '미례국밥 첫 방문에 좋은 인상 남겨드려서 다행입니다. 다음에 오시면 돼지우동도 꼭 드셔보세요. 해운대 돼지국밥 육수에 우동면이라 의외인데, 센텀 미례국밥의 시그니처 메뉴입니다.', '미례국밥, 돼지우동, 해운대 돼지국밥'],
    ['8', '배달 후기', '배달로도 맛있게 드셨다니 감사합니다. 매장에서 드시면 갓 끓인 해운대 돼지국밥 국물 맛이 또 다르니까, 센텀 점심 시간에 센텀 미례국밥 매장에도 한번 와주세요.', '해운대 돼지국밥, 센텀 점심, 미례국밥'],
    ['9', '추천 메뉴', '센텀 미례국밥 방문해 주셔서 감사합니다. 처음이시라면 한마리국밥이나 돼지우동을 추천드려요. 특히 돼지우동은 해운대 돼지국밥 육수에 우동면을 담은 미례국밥만의 메뉴라 한번 드셔보시면 좋을 것 같습니다.', '미례국밥, 돼지우동, 해운대 돼지국밥, 한마리국밥'],
    ['10', '아쉬운 점', '솔직한 말씀 감사합니다. 말씀해 주신 부분 바로 팀과 공유하고 개선하겠습니다. 다음에 다시 센텀 미례국밥 찾아주시면 더 나아진 해운대 돼지국밥 한 그릇으로 보답드리겠습니다.', '미례국밥, 해운대 돼지국밥'],
  ];
  sheet.getRange(reviewStart + 2, 1, templates.length, 4).setValues(templates);
  sheet.getRange(reviewStart + 2, 3, templates.length, 1).setWrap(true);

  // 열 너비
  sheet.setColumnWidth(1, 100);
  sheet.setColumnWidth(2, 500);
  sheet.setColumnWidth(3, 200);
  sheet.setColumnWidth(4, 80);

  sheet.setFrozenRows(1);
}
