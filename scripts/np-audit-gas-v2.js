/**
 * NP 진단 자동화 — GAS v2
 * 4개 탭에 데이터 자동 분배: 매장 현황, 진단 상세, 태스크, 견적
 *
 * 사용법:
 * 1. Google Sheets에서 [확장 프로그램 > Apps Script] 열기
 * 2. 이 코드를 붙여넣기
 * 3. [배포 > 새 배포] → 유형: 웹 앱 → 액세스: 누구나 → 배포
 * 4. 생성된 URL을 /np-audit 커맨드의 GAS_WEBHOOK_URL에 설정
 */

var TABS = {
  PRICE: '가격표',
  OVERVIEW: '매장 현황',
  DETAIL: '진단 상세',
  TASKS: '태스크',
  ESTIMATE: '견적'
};

function doPost(e) {
  try {
    var data = JSON.parse(e.postData.contents);
    var ss = SpreadsheetApp.getActiveSpreadsheet();

    if (data.type === 'full-audit') {
      writeOverview(ss, data);
      writeDetail(ss, data);
      writeTasks(ss, data);
      writeEstimate(ss, data);
    }

    return ContentService
      .createTextOutput(JSON.stringify({ status: 'ok', tabs_updated: 4 }))
      .setMimeType(ContentService.MimeType.JSON);

  } catch (err) {
    return ContentService
      .createTextOutput(JSON.stringify({ status: 'error', message: err.toString() }))
      .setMimeType(ContentService.MimeType.JSON);
  }
}

function writeOverview(ss, data) {
  var sheet = getOrCreateSheet(ss, TABS.OVERVIEW, [
    '매장명', '업종', '상권', '총점', '등급',
    'S점수', 'A점수', 'B점수', '보너스',
    '진단일', '추천패키지', '계약상태'
  ]);

  var s = data.scores;
  var sTotal = s.s1.score + s.s2.score + s.s3.score;
  var aTotal = s.a1.score + s.a2.score + s.a3.score + s.a4.score;
  var bTotal = s.b1.score + s.b2.score + s.b3.score;
  var xTotal = s.x1.score + s.x2.score;

  sheet.appendRow([
    data.store.name,
    data.store.category,
    data.store.area,
    data.total,
    data.grade,
    sTotal,
    aTotal,
    bTotal,
    xTotal,
    data.date,
    data.estimate.package,
    '진단완료'
  ]);
}

function writeDetail(ss, data) {
  var sheet = getOrCreateSheet(ss, TABS.DETAIL, [
    '매장명',
    'S1점수', 'S1판정', 'S2점수', 'S2판정', 'S3점수', 'S3판정',
    'A1점수', 'A1판정', 'A2점수', 'A2판정', 'A3점수', 'A3판정', 'A4점수', 'A4판정',
    'B1점수', 'B1판정', 'B2점수', 'B2판정', 'B3점수', 'B3판정',
    'X1점수', 'X1판정', 'X2점수', 'X2판정',
    '진단일'
  ]);

  var s = data.scores;
  sheet.appendRow([
    data.store.name,
    s.s1.score, s.s1.verdict, s.s2.score, s.s2.verdict, s.s3.score, s.s3.verdict,
    s.a1.score, s.a1.verdict, s.a2.score, s.a2.verdict, s.a3.score, s.a3.verdict, s.a4.score, s.a4.verdict,
    s.b1.score, s.b1.verdict, s.b2.score, s.b2.verdict, s.b3.score, s.b3.verdict,
    s.x1.score, s.x1.verdict, s.x2.score, s.x2.verdict,
    data.date
  ]);
}

function writeTasks(ss, data) {
  var sheet = getOrCreateSheet(ss, TABS.TASKS, [
    '매장명', '태스크', '우선순위', '담당', '상태', '생성일', '마감', '출처항목', '비고'
  ]);

  var baseDate = new Date(data.date);

  data.tasks.forEach(function(t) {
    var weekNum = parseInt(t.priority.replace('week', ''));
    var deadline = new Date(baseDate);
    deadline.setDate(deadline.getDate() + (weekNum * 7));

    sheet.appendRow([
      data.store.name,
      t.task,
      t.priority,
      t.owner,
      '미완료',
      data.date,
      Utilities.formatDate(deadline, 'Asia/Seoul', 'yyyy-MM-dd'),
      t.source,
      ''
    ]);
  });
}

function writeEstimate(ss, data) {
  var sheet = getOrCreateSheet(ss, TABS.ESTIMATE, [
    '매장명', '등급', '추천패키지', '기본가', '옵션항목', '옵션가', '합계', '제안일', '상태'
  ]);

  var row = sheet.getLastRow() + 1;
  var priceTab = TABS.PRICE;
  var optionsList = data.estimate.options.join(', ');

  var basePriceFormula = '=IFERROR(VLOOKUP("' + data.estimate.package + '",' + priceTab + '!A:B,2,FALSE),0)';

  var optionFormulaParts = data.estimate.options.map(function(opt) {
    return 'IFERROR(VLOOKUP("' + opt + '",' + priceTab + '!A:B,2,FALSE),0)';
  });
  var optionPriceFormula = optionFormulaParts.length > 0
    ? '=' + optionFormulaParts.join('+')
    : '=0';

  var totalFormula = '=D' + row + '+F' + row;

  sheet.getRange(row, 1).setValue(data.store.name);
  sheet.getRange(row, 2).setValue(data.grade);
  sheet.getRange(row, 3).setValue(data.estimate.package);
  sheet.getRange(row, 4).setFormula(basePriceFormula);
  sheet.getRange(row, 5).setValue(optionsList);
  sheet.getRange(row, 6).setFormula(optionPriceFormula);
  sheet.getRange(row, 7).setFormula(totalFormula);
  sheet.getRange(row, 8).setValue(data.estimate.date || data.date);
  sheet.getRange(row, 9).setValue('제안 전');
}

function getOrCreateSheet(ss, name, headers) {
  var sheet = ss.getSheetByName(name);
  if (!sheet) {
    sheet = ss.insertSheet(name);
    sheet.appendRow(headers);
    sheet.getRange(1, 1, 1, headers.length).setFontWeight('bold').setBackground('#f3f4f6');
    sheet.setFrozenRows(1);
  }
  return sheet;
}

function doGet() {
  return ContentService
    .createTextOutput('NP 진단 자동화 GAS v2 정상 동작 중')
    .setMimeType(ContentService.MimeType.TEXT);
}
