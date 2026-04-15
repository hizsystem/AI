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

// ── 대시보드 (KPI 트래킹) ──
function createDashboardTab(ss) {
  let sheet = ss.getSheetByName('대시보드');
  if (!sheet) { sheet = ss.insertSheet('대시보드'); }
  else { sheet.clear(); }

  // 헤더
  sheet.getRange('A1').setValue('미례국밥 x 브랜드라이즈 | KPI 대시보드').setFontSize(14).setFontWeight('bold');
  sheet.getRange('A1:H1').merge().setBackground('#1a1a1a').setFontColor('#FFFFFF');

  // 컬럼 헤더 (주차별)
  const colHeaders = ['지표', '4월 초', 'W1', 'W2', 'W3', 'W4', '4월 말', '목표'];
  sheet.getRange(3, 1, 1, 8).setValues([colHeaders]).setFontWeight('bold').setBackground('#F5F5F5');

  // ── 검색량 섹션 ──
  const row1 = 4;
  sheet.getRange(row1, 1).setValue('검색량').setFontWeight('bold');
  sheet.getRange(row1, 1, 1, 8).setBackground('#E8F5E9');

  const searchData = [
    ['미례국밥 월간 검색량', '2,690', '', '3,330', '', '', '', '유지~상승'],
  ];
  sheet.getRange(row1 + 1, 1, searchData.length, 8).setValues(searchData);

  // ── NP 센텀점 섹션 ──
  const row2 = row1 + searchData.length + 2;
  sheet.getRange(row2, 1).setValue('NP 센텀점').setFontWeight('bold');
  sheet.getRange(row2, 1, 1, 8).setBackground('#E3F2FD');

  const centumData = [
    ['조회수', '', '', '', '', '', '', ''],
    ['전화 클릭', '', '', '', '', '', '', ''],
    ['길찾기 클릭', '', '', '', '', '', '', ''],
  ];
  sheet.getRange(row2 + 1, 1, centumData.length, 8).setValues(centumData);

  // ── NP 전포점 섹션 ──
  const row3 = row2 + centumData.length + 2;
  sheet.getRange(row3, 1).setValue('NP 전포점').setFontWeight('bold');
  sheet.getRange(row3, 1, 1, 8).setBackground('#E3F2FD');

  const jeonpoData = [
    ['조회수', '', '', '', '', '', '', ''],
    ['전화 클릭', '', '', '', '', '', '', ''],
    ['길찾기 클릭', '', '', '', '', '', '', ''],
  ];
  sheet.getRange(row3 + 1, 1, jeonpoData.length, 8).setValues(jeonpoData);

  // ── 콘텐츠 실행 섹션 ──
  const row4 = row3 + jeonpoData.length + 2;
  sheet.getRange(row4, 1).setValue('콘텐츠 실행').setFontWeight('bold');
  sheet.getRange(row4, 1, 1, 8).setBackground('#FFF3E0');

  const contentData = [
    ['블로그 발행 (누적)', 0, '', '', '', '', '', '5편'],
    ['릴스/씨딩 (누적)', 0, '', '', '', '', '', '5~7개'],
    ['체험단 발행 (누적)', 0, '', '', '', '', '', ''],
  ];
  sheet.getRange(row4 + 1, 1, contentData.length, 8).setValues(contentData);

  // 열 너비
  sheet.setColumnWidth(1, 180);
  for (let c = 2; c <= 8; c++) { sheet.setColumnWidth(c, 90); }

  // 숫자 서식
  sheet.getRange(3, 2, 30, 7).setHorizontalAlignment('center');

  // 목표 열 강조
  sheet.getRange(3, 8, 30, 1).setFontColor('#EA580C').setFontWeight('bold');

  // 섹션 헤더 조건부 서식 (볼드 + 왼쪽 정렬)
  sheet.getRange(row1, 1).setHorizontalAlignment('left');
  sheet.getRange(row2, 1).setHorizontalAlignment('left');
  sheet.getRange(row3, 1).setHorizontalAlignment('left');
  sheet.getRange(row4, 1).setHorizontalAlignment('left');

  sheet.setFrozenRows(3);
  sheet.setFrozenColumns(1);
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

// ── 소개문/컨펌 자료 ──
function createIntroTextTab(ss) {
  let sheet = ss.getSheetByName('컨펌 자료');
  if (!sheet) { sheet = ss.insertSheet('컨펌 자료'); }
  else { sheet.clear(); }

  sheet.getRange('A1').setValue('컨펌 자료 — 컨펌 후 적용할 텍스트').setFontSize(12).setFontWeight('bold');
  sheet.getRange('A1:D1').merge().setBackground('#1a1a1a').setFontColor('#FFFFFF');

  // ── 센텀점 소개문 ──
  sheet.getRange('A3').setValue('센텀점 소개문 (4/13 작성)').setFontWeight('bold').setFontSize(11);
  sheet.getRange('A3:D3').setBackground('#E3F2FD');

  const introHeaders = ['문단', '본문', '포함 키워드', '컨펌'];
  sheet.getRange(4, 1, 1, 4).setValues([introHeaders]).setFontWeight('bold').setBackground('#F5F5F5');

  const introData = [
    ['1. 매장 소개', '미례국밥 센텀점은 돈골과 우골을 함께 오랜 시간 정성스레 끓여낸 육수로 만드는 해운대 돼지국밥 전문점입니다. \'맛은 정성으로, 예는 마음으로\'라는 마음가짐으로, 한 그릇 한 그릇 정성을 담아 내어드리고 있습니다.', '해운대 돼지국밥, 미례국밥', ''],
    ['2. 시그니처 메뉴', '센텀 미례국밥 하면 돼지우동입니다. 국밥집에서 우동이라니, 처음엔 좀 생소하실 수 있어요. 근데 한 번 드셔보시면 압니다. 진하게 우려낸 돼지국밥 육수에 쫄깃한 우동면을 담아낸 메뉴인데, 국밥의 깊은 맛과 우동의 부드러운 식감이 만나서 미례국밥만의 특별한 한 그릇이 됩니다.', '돼지우동, 센텀 미례국밥, 미례국밥', ''],
    ['3. 기본 메뉴', '물론 기본에도 충실합니다. 미례국밥의 돼지국밥은 깊고 진한 육수에 부드럽게 삶아낸 고기를 올려, 부산 국밥 본연의 맛을 그대로 느끼실 수 있어요. 한마리국밥은 오겹·가브리·전지·사태 네 가지 부위를 풍성하게 담아내서 다양한 맛을 한 그릇에 즐기실 수 있습니다. 순대국밥도 준비되어 있어요.', '돼지국밥, 부산 국밥, 한마리국밥, 순대국밥', ''],
    ['4. 센텀 점심', '센텀 점심 고민되시면 미례국밥 한번 와보세요. 뜨끈한 국밥 한 그릇이면 든든하게 해결됩니다. 센텀 국밥을 찾으시는 분들께 자신 있게 권해드리는 건, 맛은 물론이고 깨끗하고 넓은 공간에서 편하게 드실 수 있기 때문이에요.', '센텀 점심, 센텀 국밥, 미례국밥', ''],
    ['5. 방문 유도', '해운대 돼지국밥이 땡기실 때, 든든한 한 끼가 필요하실 때, 돼지우동이라는 새로운 메뉴가 궁금하실 때 편하게 들러주세요. 혼자 오셔도, 여럿이 오셔도 부담 없는 공간입니다.', '해운대 돼지국밥, 돼지우동', ''],
    ['6. 마무리', '센텀돼지국밥 찾고 계셨다면, 미례국밥 센텀점에서 정성 담긴 한 그릇 경험해 보세요.', '센텀돼지국밥, 미례국밥', ''],
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
    ['1', '돼지우동 칭찬', '센텀 미례국밥의 돼지우동을 맛있게 드셨다니 정말 기쁩니다. 오래 정성스레 우려낸 해운대 돼지국밥 육수에 쫄깃한 우동면을 담아내는 메뉴인데, 그 정성이 전해진 것 같아요. 센텀 점심 고민되실 때 또 편하게 들러주세요.', '미례국밥, 돼지우동, 해운대 돼지국밥, 센텀 점심'],
    ['2', '국밥 칭찬', '센텀 국밥 찾아 미례국밥에 와주셔서 감사합니다. 직접 우려내는 해운대 돼지국밥 육수라 이렇게 말씀해 주시면 힘이 납니다. 다음에는 돼지우동도 한번 드셔보세요, 센텀 미례국밥의 시그니처입니다.', '센텀 국밥, 미례국밥, 해운대 돼지국밥, 돼지우동'],
    ['3', '재방문', '센텀 미례국밥을 다시 찾아주셨군요, 정말 반갑습니다. 혹시 아직 돼지우동 안 드셔보셨다면 다음에 꼭 도전해 보세요. 해운대 돼지국밥 육수에 우동면이라 한번 드시면 자꾸 생각납니다.', '미례국밥, 돼지우동, 해운대 돼지국밥'],
    ['4', '양/든든 칭찬', '센텀 점심으로 든든하게 한 끼 해결하셨다니 다행이에요. 미례국밥의 해운대 돼지국밥은 역시 배부르게 먹어야 제맛이죠. 센텀 국밥 생각나실 때 또 찾아주세요.', '센텀 점심, 미례국밥, 해운대 돼지국밥, 센텀 국밥'],
    ['5', '분위기 칭찬', '공간까지 눈여겨봐 주셔서 감사합니다. 센텀 미례국밥은 편안하게 식사하실 수 있도록 신경 쓰고 있는데 느껴주셨다니 보람 있네요. 센텀 점심 고민되실 때 해운대 돼지국밥 한 그릇 드시러 언제든 오세요.', '미례국밥, 센텀 점심, 해운대 돼지국밥'],
    ['6', '서비스 칭찬', '따뜻하게 느끼셨다니 저희도 기분이 좋습니다. 센텀 국밥 드시러 오시는 분들이 맛뿐 아니라 편안함까지 느끼실 수 있는 미례국밥이 되겠습니다. 돼지우동도 다음에 한번 드셔보세요!', '센텀 국밥, 미례국밥, 돼지우동'],
    ['7', '처음 방문', '미례국밥 첫 방문에 좋은 인상 남겨드려서 다행입니다. 다음에 오시면 돼지우동도 꼭 드셔보세요. 해운대 돼지국밥 육수에 우동면이라 의외인데, 센텀 미례국밥의 시그니처 메뉴입니다.', '미례국밥, 돼지우동, 해운대 돼지국밥'],
    ['8', '단체/모임', '여러 분이서 함께 찾아주셨군요, 감사합니다! 센텀 미례국밥은 자리가 넓어서 모임이나 회식에도 편하게 이용하실 수 있어요. 다음에 오시면 돼지우동도 한번 드셔보세요, 해운대 돼지국밥 육수에 우동면이라 꼭 한번 드셔볼 만합니다.', '미례국밥, 돼지우동, 해운대 돼지국밥'],
    ['9', '추천 메뉴', '센텀 미례국밥 방문해 주셔서 감사합니다. 처음이시라면 한마리국밥이나 돼지우동을 추천드려요. 특히 돼지우동은 해운대 돼지국밥 육수에 우동면을 담은 미례국밥만의 메뉴라 한번 드셔보시면 좋을 것 같습니다.', '미례국밥, 돼지우동, 해운대 돼지국밥, 한마리국밥'],
    ['10', '아쉬운 점 (프레임)', '솔직한 말씀 감사합니다. [구체적 내용에 맞게 수정] 말씀해 주신 부분 바로 팀과 공유하고 개선하겠습니다. 다음에 다시 센텀 미례국밥 찾아주시면 더 나아진 해운대 돼지국밥 한 그릇으로 보답드리겠습니다.', '미례국밥, 해운대 돼지국밥 (필수 포함, 나머지는 상황에 맞게)'],
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
