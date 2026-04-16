/**
 * 미례국밥 인스타그램 콘텐츠 기획
 * 대상: 수민(디자이너) + 지은(인턴) 실행용
 * 실행: createInstagramPlan()
 */

function createInstagramPlan() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();

  createSeriesTab(ss);
  createCalendarTab(ss);
  createCaptionTab(ss);
  createHashtagTab(ss);
  createProfileTab(ss);
  createHighlightTab(ss);

  SpreadsheetApp.flush();
  Browser.msgBox('인스타그램 콘텐츠 기획 시트 생성 완료!');
}

// ── 1. 콘텐츠 시리즈 ──
function createSeriesTab(ss) {
  let sheet = ss.getSheetByName('콘텐츠 시리즈');
  if (sheet) ss.deleteSheet(sheet);
  sheet = ss.insertSheet('콘텐츠 시리즈');

  sheet.getRange('A1').setValue('미례국밥 인스타그램 콘텐츠 시리즈').setFontSize(14).setFontWeight('bold');
  sheet.getRange('A1:F1').merge().setBackground('#1a1a1a').setFontColor('#FFFFFF');

  sheet.getRange('A2').setValue('톤: "정성이 보이는데 격식은 차리지 않는 곳" | 방향: A안 브랜딩 (킥오프 컨펌) | 바이럴 키워드: 돼지우동').setFontSize(10).setFontColor('#666666');
  sheet.getRange('A2:F2').merge();

  const headers = ['시리즈명', '빈도', '유형', '역할', '요소', '레퍼런스'];
  sheet.getRange(4, 1, 1, 6).setValues([headers]).setFontWeight('bold').setBackground('#F5F5F5');

  const data = [
    ['★ 돼지우동 이야기', '주 1~2회', '릴스 (15~30초)', '바이럴 핵심 — 돼지우동 검색량 만들기\n모든 콘텐츠의 기준점', '음식', '인플루언서 가이드 참고\n면 들어올리기 = 핵심 장면'],
    ['한 그릇의 아침', '주 1회', '피드 (싱글/캐러셀)', '채널 루틴 — 팔로워 유지/성장\n매장의 하루를 보여줌', '사람+매장', '서관면옥 참고\n매일 오픈/준비 과정'],
    ['재료 이야기', '격주 1회', '피드 (캐러셀)', '신뢰 구축 — 국내산 원육, 신동진쌀, 매장 김치\n"이런 재료 쓰는 곳"', '재료', '변팀장님 기존 체험단 미션에서\n재료 강조했던 포인트'],
    ['손님 한마디', '주 1회', '피드/스토리', '사회적 증거 — 리뷰 캡처, 리그램\n"다른 사람도 맛있게 먹었네"', '음식+사람', '체험단/인플루언서 콘텐츠 리그램'],
    ['부산에서 온', '월 1~2회', '피드 (캐러셀)', '브랜드 스토리 — 전포본점→센텀 확장\n부산 로컬 정체성', '매장', '삼진어묵 참고\n"부산 로컬→전국" 서사'],
  ];
  sheet.getRange(5, 1, data.length, 6).setValues(data);

  // 1순위 강조
  sheet.getRange(5, 1, 1, 6).setBackground('#FFF3E0');

  // 열 너비
  sheet.setColumnWidth(1, 150);
  sheet.setColumnWidth(2, 80);
  sheet.setColumnWidth(3, 130);
  sheet.setColumnWidth(4, 250);
  sheet.setColumnWidth(5, 80);
  sheet.setColumnWidth(6, 200);

  // 줄바꿈
  sheet.getRange(5, 4, data.length, 1).setWrap(true);
  sheet.getRange(5, 6, data.length, 1).setWrap(true);

  // 피드 비율 안내
  const ratioRow = 5 + data.length + 1;
  sheet.getRange(ratioRow, 1).setValue('피드 비율 가이드').setFontWeight('bold');
  sheet.getRange(ratioRow + 1, 1, 3, 2).setValues([
    ['음식', '70%'],
    ['매장일상 + 재료', '20%'],
    ['사람 (손/뒷모습)', '10%'],
  ]);

  sheet.setFrozenRows(4);
}

// ── 2. 4월 캘린더 ──
function createCalendarTab(ss) {
  let sheet = ss.getSheetByName('4월 캘린더');
  if (sheet) ss.deleteSheet(sheet);
  sheet = ss.insertSheet('4월 캘린더');

  sheet.getRange('A1').setValue('4월 W3~W4 콘텐츠 캘린더 (주 3개 = 총 6개)').setFontSize(14).setFontWeight('bold');
  sheet.getRange('A1:H1').merge().setBackground('#1a1a1a').setFontColor('#FFFFFF');

  const headers = ['날짜', '요일', '유형', '시리즈', '콘텐츠 제목', '요소', '담당', '상태'];
  sheet.getRange(3, 1, 1, 8).setValues([headers]).setFontWeight('bold').setBackground('#F5F5F5');

  const data = [
    ['4/16', '수', '릴스', '★ 돼지우동 이야기', '돼지우동 씨즐 — 면 들어올리기 + 육수 보글', '음식', '', '대기'],
    ['4/18', '금', '피드(캐러셀)', '메뉴 소개', '전체 메뉴 4종 소개 + 가격', '음식', '', '대기'],
    ['4/20', '일', '피드', '재료 이야기', '국내산 원육 / 신동진쌀 / 매장 직접 담근 김치', '재료', '', '대기'],
    ['4/22', '화', '릴스', '★ 돼지우동 이야기', '"국밥집에서 우동 시키면 생기는 일" 반전', '음식', '', '대기'],
    ['4/24', '목', '피드', '한 그릇의 아침', '육수 뜨는 손, 오픈 준비, 첫 세팅', '사람+매장', '', '대기'],
    ['4/26', '토', '릴스', '★ 돼지우동 이야기', '돼지우동 먹는 법 가이드 (육수→면→고기)', '음식', '', '대기'],
  ];
  sheet.getRange(4, 1, data.length, 8).setValues(data);

  // 릴스 행 강조
  [4, 7, 9].forEach(row => {
    sheet.getRange(row, 1, 1, 8).setBackground('#FFF3E0');
  });

  // 상태 드롭다운
  const statusRule = SpreadsheetApp.newDataValidation()
    .requireValueInList(['대기', '소스선별', '캡션작성', '디자인중', '컨펌대기', '발행완료'], true).build();
  sheet.getRange(4, 8, 10, 1).setDataValidation(statusRule);

  // 담당 드롭다운
  const ownerRule = SpreadsheetApp.newDataValidation()
    .requireValueInList(['수민', '지은', '수민+지은', 'Green'], true).build();
  sheet.getRange(4, 7, 10, 1).setDataValidation(ownerRule);

  // 조건부 서식
  const doneRule = SpreadsheetApp.newConditionalFormatRule()
    .whenTextEqualTo('발행완료')
    .setBackground('#C8E6C9').setFontColor('#2E7D32')
    .setRanges([sheet.getRange(4, 8, 10, 1)]).build();
  sheet.setConditionalFormatRules([doneRule]);

  // 열 너비
  sheet.setColumnWidth(1, 60);
  sheet.setColumnWidth(2, 40);
  sheet.setColumnWidth(3, 100);
  sheet.setColumnWidth(4, 140);
  sheet.setColumnWidth(5, 320);
  sheet.setColumnWidth(6, 80);
  sheet.setColumnWidth(7, 70);
  sheet.setColumnWidth(8, 80);

  sheet.setFrozenRows(3);
}

// ── 3. 캡션 ──
function createCaptionTab(ss) {
  let sheet = ss.getSheetByName('캡션');
  if (sheet) ss.deleteSheet(sheet);
  sheet = ss.insertSheet('캡션');

  sheet.getRange('A1').setValue('콘텐츠별 캡션 초안').setFontSize(14).setFontWeight('bold');
  sheet.getRange('A1:D1').merge().setBackground('#1a1a1a').setFontColor('#FFFFFF');

  sheet.getRange('A2').setValue('톤: 말하듯 편하게. 존댓말이지만 딱딱하지 않게. 이모지 최소. :-)는 OK').setFontSize(10).setFontColor('#666666');
  sheet.getRange('A2:D2').merge();

  const headers = ['날짜', '콘텐츠', '캡션 초안', '컨펌'];
  sheet.getRange(4, 1, 1, 4).setValues([headers]).setFontWeight('bold').setBackground('#F5F5F5');

  const data = [
    ['4/16\n릴스', '돼지우동 씨즐',
      '국밥집에서 우동을 시켰습니다.\n\n진하게 우려낸 돼지국밥 육수에\n쫄깃한 우동면을 더한,\n미례국밥만의 돼지우동.\n\n한 번 드셔보시면\n왜 자꾸 생각나는지 아실 거예요.\n\n📍 전포본점 | 센텀점\n🕐 11:00 - 21:00',
      ''],
    ['4/18\n피드', '메뉴 소개',
      '미례국밥, 뭐 드실지 고민되시면 :-)\n\n🍲 돼지국밥 10,000원\n— 깊고 진한 육수에 부드러운 고기\n\n🍜 돼지우동 11,500원\n— 국밥 육수 + 쫄깃한 우동면, 시그니처\n\n🥘 한마리국밥 13,000원\n— 오겹·가브리·전지·사태 네 부위 한 번에\n\n🫕 순대국밥 10,000원\n— 속 꽉 찬 순대와 진한 국물\n\n국내산 원육, 신동진쌀,\n매장에서 직접 담근 김치까지.\n\n📍 전포본점 | 센텀점',
      ''],
    ['4/20\n피드', '재료 이야기',
      '미례국밥이 재료에 신경 쓰는 이유.\n\n국내산 원육만 사용하고,\n밥은 신동진 쌀로 짓고,\n김치는 매일 매장에서 직접 담급니다.\n\n한 그릇에 들어가는 것 하나하나가\n다 이유가 있어요.\n\n맛은 정성으로, 예는 마음으로.\n\n📍 전포본점 | 센텀점',
      ''],
    ['4/22\n릴스', '국밥집 우동 반전',
      '국밥집에서 우동 시키면\n이게 나옵니다.\n\n처음엔 다들 "국밥집에서 우동?" 하시는데\n한 번 드시면 다음에 또 시킵니다.\n\n돼지국밥 육수에 우동면이라\n이런 조합은 여기밖에 없거든요.\n\n미례국밥 돼지우동,\n한 번 드셔보세요 :-)\n\n📍 전포본점 | 센텀점',
      ''],
    ['4/24\n피드', '한 그릇의 아침',
      '오늘도 육수부터 시작합니다.\n\n아침마다 솥에 불을 올리고\n오랜 시간 정성스레 끓여내는 것부터\n미례국밥의 하루가 시작돼요.\n\n그 정성이 한 그릇에 담겨\n오늘도 여러분 앞에 놓입니다.\n\n📍 전포본점 | 센텀점',
      ''],
    ['4/26\n릴스', '돼지우동 먹는 법',
      '돼지우동, 이렇게 드세요.\n\n1. 먼저 육수 한 숟갈\n2. 쫄깃한 우동면 한 젓가락\n3. 부드러운 고기까지 같이\n\n국밥의 깊은 맛과\n우동의 부드러움이 한 번에.\n\n미례국밥 돼지우동,\n오늘 한 그릇 어때요? :-)\n\n📍 전포본점 | 센텀점',
      ''],
  ];
  sheet.getRange(5, 1, data.length, 4).setValues(data);

  // 컨펌 드롭다운
  const confirmRule = SpreadsheetApp.newDataValidation()
    .requireValueInList(['초안', '수정중', '컨펌'], true).build();
  sheet.getRange(5, 4, 10, 1).setDataValidation(confirmRule);

  // 줄바꿈
  sheet.getRange(5, 3, data.length, 1).setWrap(true);
  sheet.getRange(5, 1, data.length, 1).setWrap(true);

  // 열 너비
  sheet.setColumnWidth(1, 60);
  sheet.setColumnWidth(2, 140);
  sheet.setColumnWidth(3, 450);
  sheet.setColumnWidth(4, 70);

  sheet.setFrozenRows(4);
}

// ── 4. 해시태그 ──
function createHashtagTab(ss) {
  let sheet = ss.getSheetByName('해시태그');
  if (sheet) ss.deleteSheet(sheet);
  sheet = ss.insertSheet('해시태그');

  sheet.getRange('A1').setValue('해시태그 세트').setFontSize(14).setFontWeight('bold');
  sheet.getRange('A1:C1').merge().setBackground('#1a1a1a').setFontColor('#FFFFFF');

  sheet.getRange('A2').setValue('* 띄어쓰기 없이 붙여쓰기 | 캡션 하단에 배치 | 총 15~20개 권장').setFontSize(10).setFontColor('#666666');
  sheet.getRange('A2:C2').merge();

  const headers = ['구분', '해시태그', '용도'];
  sheet.getRange(4, 1, 1, 3).setValues([headers]).setFontWeight('bold').setBackground('#F5F5F5');

  const data = [
    ['공통 (항상 포함)', '#미례국밥 #돼지우동 #얼큰돼지우동 #부산맛집 #부산국밥 #돼지국밥', '브랜드 + 바이럴 키워드'],
    ['센텀점 추가', '#센텀맛집 #센텀돼지국밥 #센텀점심 #해운대맛집 #센텀역맛집 #재송동맛집', '센텀 로컬 검색'],
    ['전포점 추가', '#전포맛집 #전포돼지국밥 #전포점심 #전포동맛집 #전포밥집 #서면맛집', '전포 로컬 검색'],
    ['음식 일반', '#국밥 #국밥맛집 #돼지국밥맛집 #한마리국밥 #순대국밥 #우동', '카테고리 노출'],
    ['상황별', '#점심메뉴 #점심추천 #혼밥 #직장인점심 #든든한한끼 #해장', '검색 의도'],
    ['계정 태그', '@miryegukbap_official', '모든 게시물에 포함'],
  ];
  sheet.getRange(5, 1, data.length, 3).setValues(data);

  // 복사용 세트
  const copyRow = 5 + data.length + 2;
  sheet.getRange(copyRow, 1).setValue('복사용 — 센텀점 게시물').setFontWeight('bold');
  sheet.getRange(copyRow + 1, 1).setValue('#미례국밥 #돼지우동 #얼큰돼지우동 #부산맛집 #부산국밥 #돼지국밥 #센텀맛집 #센텀돼지국밥 #센텀점심 #해운대맛집 #국밥맛집 #점심추천 #든든한한끼').setFontColor('#1565C0');

  sheet.getRange(copyRow + 3, 1).setValue('복사용 — 전포점 게시물').setFontWeight('bold');
  sheet.getRange(copyRow + 4, 1).setValue('#미례국밥 #돼지우동 #얼큰돼지우동 #부산맛집 #부산국밥 #돼지국밥 #전포맛집 #전포돼지국밥 #전포점심 #전포동맛집 #국밥맛집 #점심추천 #든든한한끼').setFontColor('#1565C0');

  // 열 너비
  sheet.setColumnWidth(1, 130);
  sheet.setColumnWidth(2, 500);
  sheet.setColumnWidth(3, 150);

  sheet.getRange(5, 2, data.length, 1).setWrap(true);

  sheet.setFrozenRows(4);
}

// ── 5. 프로필 바이오 ──
function createProfileTab(ss) {
  let sheet = ss.getSheetByName('프로필');
  if (sheet) ss.deleteSheet(sheet);
  sheet = ss.insertSheet('프로필');

  sheet.getRange('A1').setValue('인스타그램 프로필 설정').setFontSize(14).setFontWeight('bold');
  sheet.getRange('A1:C1').merge().setBackground('#1a1a1a').setFontColor('#FFFFFF');

  const headers = ['항목', '현재', '제안'];
  sheet.getRange(3, 1, 1, 3).setValues([headers]).setFontWeight('bold').setBackground('#F5F5F5');

  const data = [
    ['계정명', '@miryegukbap_official', '유지'],
    ['이름(표시명)', '미례국밥', '미례국밥 | 돼지우동 전문'],
    ['바이오 1줄', '', '국밥집에서 우동? 한 번 드셔보시면 압니다.'],
    ['바이오 2줄', '', '🍜 시그니처 돼지우동 | 돼지국밥 | 한마리국밥'],
    ['바이오 3줄', '', '📍 전포본점 · 센텀점'],
    ['바이오 4줄', '', '⏰ 매일 11:00 - 21:00'],
    ['링크', 'miryegukbap.com', '리틀리 링크 (아래 구성)'],
    ['카테고리', '', '음식점'],
    ['연락처 버튼', '', '전화 + 길찾기 활성화'],
  ];
  sheet.getRange(4, 1, data.length, 3).setValues(data);

  // 리틀리 링크 구성
  const linkRow = 4 + data.length + 2;
  sheet.getRange(linkRow, 1).setValue('리틀리 링크 구성 (제안)').setFontWeight('bold');
  sheet.getRange(linkRow, 1, 1, 3).setBackground('#E3F2FD');

  const links = [
    ['1', '전포본점 네이버플레이스 예약', 'https://m.place.naver.com/restaurant/1688300738'],
    ['2', '센텀점 네이버플레이스 예약', '(센텀점 플레이스 URL)'],
    ['3', '메뉴 보기', 'miryegukbap.com'],
    ['4', '창업 문의', '(창업 문의 폼 or 카톡)'],
  ];
  sheet.getRange(linkRow + 1, 1, links.length, 3).setValues(links);

  // 바이오 미리보기
  const previewRow = linkRow + links.length + 2;
  sheet.getRange(previewRow, 1).setValue('바이오 미리보기').setFontWeight('bold');
  sheet.getRange(previewRow + 1, 1).setValue(
    '미례국밥 | 돼지우동 전문\n' +
    '국밥집에서 우동? 한 번 드셔보시면 압니다.\n' +
    '🍜 시그니처 돼지우동 | 돼지국밥 | 한마리국밥\n' +
    '📍 전포본점 · 센텀점\n' +
    '⏰ 매일 11:00 - 21:00'
  ).setWrap(true).setFontSize(11);

  // 열 너비
  sheet.setColumnWidth(1, 130);
  sheet.setColumnWidth(2, 300);
  sheet.setColumnWidth(3, 300);

  sheet.setFrozenRows(3);
}

// ── 6. 하이라이트 기획 ──
function createHighlightTab(ss) {
  let sheet = ss.getSheetByName('하이라이트');
  if (sheet) ss.deleteSheet(sheet);
  sheet = ss.insertSheet('하이라이트');

  sheet.getRange('A1').setValue('스토리 하이라이트 기획').setFontSize(14).setFontWeight('bold');
  sheet.getRange('A1:D1').merge().setBackground('#1a1a1a').setFontColor('#FFFFFF');

  sheet.getRange('A2').setValue('* 하이라이트 커버는 브랜드 컬러(검정 or 따뜻한 톤)로 통일 | 아이콘 스타일: 미니멀 라인').setFontSize(10).setFontColor('#666666');
  sheet.getRange('A2:D2').merge();

  const headers = ['하이라이트명', '아이콘', '포함 콘텐츠', '우선순위'];
  sheet.getRange(4, 1, 1, 4).setValues([headers]).setFontWeight('bold').setBackground('#F5F5F5');

  const data = [
    ['메뉴', '🍜', '돼지우동 / 돼지국밥 / 한마리국밥 / 순대국밥\n각 메뉴 사진 + 간단 설명 + 가격', '★ 필수'],
    ['돼지우동', '🔥', '돼지우동 릴스 모음\n씨즐 / 먹는 법 / 반전 콘텐츠', '★ 필수'],
    ['전포본점', '📍', '전포본점 매장 사진 / 위치 안내 / 주차\n오시는 길 지도 캡처', '★ 필수'],
    ['센텀점', '📍', '센텀점 매장 사진 / 위치 안내 / 주차\n오시는 길 지도 캡처', '★ 필수'],
    ['후기', '💬', '손님 리뷰 캡처 / 인플루언서 리그램\n네이버 리뷰 스크린샷', '권장'],
    ['재료', '🌾', '국내산 원육 / 신동진쌀 / 매장 김치\n재료 이야기 시리즈 저장', '권장'],
    ['창업안내', '🏠', '가맹 문의 안내 (5% 비중)\n프로필 링크로 연결', '나중에'],
  ];
  sheet.getRange(5, 1, data.length, 4).setValues(data);

  // 필수 강조
  for (let i = 0; i < 4; i++) {
    sheet.getRange(5 + i, 4).setFontColor('#EA580C').setFontWeight('bold');
  }

  // 줄바꿈
  sheet.getRange(5, 3, data.length, 1).setWrap(true);

  // 열 너비
  sheet.setColumnWidth(1, 100);
  sheet.setColumnWidth(2, 50);
  sheet.setColumnWidth(3, 350);
  sheet.setColumnWidth(4, 80);

  sheet.setFrozenRows(4);
}
