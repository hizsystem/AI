/**
 * 네이버 플레이스 진단 체크리스트 — Google Apps Script
 *
 * 사용법:
 * 1. Google Sheets에서 [확장 프로그램 > Apps Script] 열기
 * 2. 이 코드를 붙여넣기
 * 3. [배포 > 새 배포] → 유형: 웹 앱 → 액세스: 누구나 → 배포
 * 4. 생성된 URL을 복사하여 체크리스트 HTML의 SCRIPT_URL에 붙여넣기
 */

function doPost(e) {
  try {
    const data = JSON.parse(e.postData.contents);
    const ss = SpreadsheetApp.getActiveSpreadsheet();
    let sheet = ss.getSheetByName('진단응답');

    // 시트가 없으면 생성 + 헤더 추가
    if (!sheet) {
      sheet = ss.insertSheet('진단응답');
      sheet.appendRow([
        '제출시간',
        '매장명', '업종', '상권', '플레이스URL', '연락처',
        'S1-1 리뷰수', 'S1-2 리뷰유도', 'S2 광고', 'S3-1 예약', 'S3-2 쿠폰', 'S3-3 톡톡',
        'A1-1 대표사진', 'A1-2 메뉴사진', 'A1-3 영상', 'A2-1 키워드세팅', 'A2-2 키워드목록',
        'A3-1 소식', 'A3-2 이벤트', 'A4 체험단',
        'B1-1 영업시간', 'B1-2 업주인증', 'B1-3 편의시설', 'B2 소개문', 'B3-1 AI브리핑', 'B3-2 지역명',
        'X1-1 인스타', 'X1-2 당근', 'X1-3 블로그', 'X2 커넥트',
        '경쟁매장', '고민', '에드로그'
      ]);
      // 헤더 스타일
      sheet.getRange(1, 1, 1, 32).setFontWeight('bold').setBackground('#f3f4f6');
      sheet.setFrozenRows(1);
    }

    // 데이터 추가
    sheet.appendRow([
      new Date().toLocaleString('ko-KR', { timeZone: 'Asia/Seoul' }),
      data['store-name'] || '',
      data['store-type'] || '',
      data['store-area'] || '',
      data['store-url'] || '',
      data['store-contact'] || '',
      data['s1-review-count'] || '',
      data['s1-review-guide'] || '',
      data['s2-ad'] || '',
      data['s3-reserve'] || '',
      data['s3-coupon'] || '',
      data['s3-talktalk'] || '',
      data['a1-photo'] || '',
      data['a1-menu-photo'] || '',
      data['a1-video'] || '',
      data['a2-keyword'] || '',
      data['a2-keyword-list'] || '',
      data['a3-news'] || '',
      data['a3-event'] || '',
      data['a4-blog'] || '',
      data['b1-hours'] || '',
      data['b1-owner'] || '',
      data['b1-facility'] || '',
      data['b2-intro'] || '',
      data['b3-ai'] || '',
      data['b3-name-region'] || '',
      data['x1-insta'] || '',
      data['x1-carrot'] || '',
      data['x1-blog'] || '',
      data['x2-connect'] || '',
      data['extra-competitor'] || '',
      data['extra-concern'] || '',
      data['extra-adlog'] || ''
    ]);

    return ContentService
      .createTextOutput(JSON.stringify({ status: 'ok' }))
      .setMimeType(ContentService.MimeType.JSON);

  } catch (err) {
    return ContentService
      .createTextOutput(JSON.stringify({ status: 'error', message: err.toString() }))
      .setMimeType(ContentService.MimeType.JSON);
  }
}

// GET 요청 테스트용
function doGet() {
  return ContentService
    .createTextOutput('네이버 플레이스 진단 체크리스트 API가 정상 동작 중입니다.')
    .setMimeType(ContentService.MimeType.TEXT);
}
