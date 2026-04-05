/**
 * 시트 구조 간소화 + 자동 계산 + % 포맷
 *
 * 변경 사항:
 * 1. 주간성과: 입력 5개만, 나머지 자동 계산, % 표시
 * 2. 참여율추이 탭 삭제 → 주간성과에서 자동 추출
 * 3. 월간KPI: 입력 4개만, 나머지 자동 계산, % 표시
 * 4. 모든 % 셀에 "4.5%" 형식 표시
 *
 * Apps Script: 함수 simplifySheets → ▶ 실행
 */

function simplifySheets() {
  var ss = SpreadsheetApp.getActiveSpreadsheet();

  rebuildWeekly(ss);
  rebuildMonthlyKPI(ss);
  formatPercentCells(ss);
  deleteERTab(ss);

  SpreadsheetApp.getUi().alert(
    "완료!\n\n" +
    "▶ 주간성과: 팔로워, 게시물수, 총반응, 최고좋아요, 도달만 입력\n" +
    "▶ 베스트콘텐츠: 제목, 유형, 좋아요, 댓글만 입력\n" +
    "▶ 월간KPI: 팔로워, 월간게시물, 월간도달만 입력\n" +
    "▶ 팔로워추이: 전체, 자연유입, 광고만 입력\n\n" +
    "나머지는 전부 자동 계산됩니다.\n" +
    "참여율추이 탭은 삭제되었습니다 (주간성과에서 자동 추출)."
  );
}

// ━━━ 주간성과 재구축 ━━━
function rebuildWeekly(ss) {
  var sheet = ss.getSheetByName("주간성과");
  if (!sheet) return;

  var lastRow = sheet.getLastRow();
  var lastCol = sheet.getLastColumn();
  var oldData = lastRow > 1 ? sheet.getRange(2, 1, lastRow - 1, lastCol).getValues() : [];
  var oldHeaders = sheet.getRange(1, 1, 1, lastCol).getValues()[0];

  // 기존 데이터에서 필요한 열 인덱스 찾기
  var idx = {};
  for (var i = 0; i < oldHeaders.length; i++) {
    idx[String(oldHeaders[i]).trim()] = i;
  }

  // 새 구조
  // A:브랜드  B:주차  C:기간
  // D:팔로워(입력)  E:팔로워증감(자동)
  // F:게시물수(입력)
  // G:총반응(입력)  H:참여율(자동)  I:참여율증감(자동)
  // J:최고좋아요(입력)
  // K:도달(입력)  L:도달증감(자동)
  var newHeaders = [
    "브랜드", "주차", "기간",
    "팔로워", "팔로워증감",
    "게시물수",
    "총반응", "참여율", "참여율증감",
    "최고좋아요",
    "도달", "도달증감"
  ];

  sheet.clear();
  sheet.getRange(1, 1, 1, newHeaders.length).setValues([newHeaders]);

  // 기존 데이터 매핑
  for (var i = 0; i < oldData.length; i++) {
    var row = i + 2;
    var old = oldData[i];

    // 기본 데이터 (열 이름으로 찾기)
    var brand = getVal(old, idx, "브랜드", "");
    var week = getVal(old, idx, "주차", "");
    var period = getVal(old, idx, "기간", "");
    var followers = getNum(old, idx, "팔로워", 0);
    var postsCount = getNum(old, idx, "게시물수", 0);
    var topLikes = getNum(old, idx, "최고좋아요", 0);
    var reach = getNum(old, idx, "도달", 0);

    // 총반응: 기존에 있으면 사용, 없으면 참여율에서 역산
    var totalEngagement = getNum(old, idx, "총반응", 0);
    if (totalEngagement === 0) {
      var oldER = getNum(old, idx, "참여율", 0);
      totalEngagement = Math.round(oldER * followers / 100);
    }

    // 입력 데이터 세팅
    sheet.getRange(row, 1).setValue(brand);     // A: 브랜드
    sheet.getRange(row, 2).setValue(week);       // B: 주차
    sheet.getRange(row, 3).setValue(period);     // C: 기간
    sheet.getRange(row, 4).setValue(followers);  // D: 팔로워
    sheet.getRange(row, 6).setValue(postsCount); // F: 게시물수
    sheet.getRange(row, 7).setValue(totalEngagement); // G: 총반응
    sheet.getRange(row, 10).setValue(topLikes);  // J: 최고좋아요
    sheet.getRange(row, 11).setValue(reach);     // K: 도달

    // 자동 계산 수식
    // E: 팔로워증감
    if (row === 2) {
      sheet.getRange(row, 5).setValue(0);
    } else {
      sheet.getRange(row, 5).setFormula('=IF(A'+row+'=A'+(row-1)+',D'+row+'-D'+(row-1)+',0)');
    }

    // H: 참여율 = 총반응/팔로워×100
    sheet.getRange(row, 8).setFormula('=IF(D'+row+'>0,ROUND(G'+row+'/D'+row+'*100,1),0)');

    // I: 참여율증감
    if (row === 2) {
      sheet.getRange(row, 9).setValue(0);
    } else {
      sheet.getRange(row, 9).setFormula('=IF(A'+row+'=A'+(row-1)+',ROUND(H'+row+'-H'+(row-1)+',1),0)');
    }

    // L: 도달증감
    if (row === 2) {
      sheet.getRange(row, 12).setValue(0);
    } else {
      sheet.getRange(row, 12).setFormula('=IF(A'+row+'=A'+(row-1)+',K'+row+'-K'+(row-1)+',0)');
    }
  }

  // 스타일링
  var dataRows = oldData.length;
  if (dataRows > 0) {
    // 자동 계산 열: 연한 파랑 배경
    var autoColor = "#eef2ff";
    [5, 8, 9, 12].forEach(function(col) {
      sheet.getRange(2, col, dataRows, 1).setBackground(autoColor);
    });

    // 입력 열: 연한 노랑 배경
    var inputColor = "#fefce8";
    [4, 6, 7, 10, 11].forEach(function(col) {
      sheet.getRange(2, col, dataRows, 1).setBackground(inputColor);
    });
  }

  // 헤더 스타일
  var headerRange = sheet.getRange(1, 1, 1, newHeaders.length);
  headerRange.setFontWeight("bold").setBackground("#f3f4f6");

  // 헤더 노트
  sheet.getRange(1, 4).setNote("✏️ 직접 입력");
  sheet.getRange(1, 5).setNote("🔄 자동 계산");
  sheet.getRange(1, 6).setNote("✏️ 직접 입력");
  sheet.getRange(1, 7).setNote("✏️ 직접 입력: 좋아요+댓글+저장 합계");
  sheet.getRange(1, 8).setNote("🔄 자동 계산: 총반응/팔로워×100");
  sheet.getRange(1, 9).setNote("🔄 자동 계산");
  sheet.getRange(1, 10).setNote("✏️ 직접 입력");
  sheet.getRange(1, 11).setNote("✏️ 직접 입력");
  sheet.getRange(1, 12).setNote("🔄 자동 계산");

  // 열 너비 자동
  for (var i = 1; i <= newHeaders.length; i++) sheet.autoResizeColumn(i);
}

// ━━━ 월간KPI 재구축 ━━━
function rebuildMonthlyKPI(ss) {
  var sheet = ss.getSheetByName("월간KPI");
  if (!sheet) return;

  var lastRow = sheet.getLastRow();
  if (lastRow <= 1) return;

  // 입력: D(팔로워), G(월간게시물), J(평균참여율), L(월간도달)
  // 자동: E(팔로워증감), F(팔로워증감률), H(게시물증감), I(게시물증감률),
  //       K(참여율증감), M(도달증감), N(도달증감률)

  for (var row = 2; row <= lastRow; row++) {
    var prev = row - 1;

    if (row === 2) {
      [5,6,8,9,11,13,14].forEach(function(col) {
        sheet.getRange(row, col).setValue(0);
      });
    } else {
      // E: 팔로워증감
      sheet.getRange(row, 5).setFormula('=IF(A'+row+'=A'+prev+',D'+row+'-D'+prev+',0)');
      // F: 팔로워증감률
      sheet.getRange(row, 6).setFormula('=IF(AND(A'+row+'=A'+prev+',D'+prev+'>0),ROUND((D'+row+'-D'+prev+')/D'+prev+'*100,1),0)');
      // H: 게시물증감
      sheet.getRange(row, 8).setFormula('=IF(A'+row+'=A'+prev+',G'+row+'-G'+prev+',0)');
      // I: 게시물증감률
      sheet.getRange(row, 9).setFormula('=IF(AND(A'+row+'=A'+prev+',G'+prev+'>0),ROUND((G'+row+'-G'+prev+')/G'+prev+'*100,1),0)');
      // K: 참여율증감
      sheet.getRange(row, 11).setFormula('=IF(A'+row+'=A'+prev+',ROUND(J'+row+'-J'+prev+',1),0)');
      // M: 도달증감
      sheet.getRange(row, 13).setFormula('=IF(A'+row+'=A'+prev+',L'+row+'-L'+prev+',0)');
      // N: 도달증감률
      sheet.getRange(row, 14).setFormula('=IF(AND(A'+row+'=A'+prev+',L'+prev+'>0),ROUND((L'+row+'-L'+prev+')/L'+prev+'*100,1),0)');
    }
  }

  var dataRows = lastRow - 1;
  var autoColor = "#eef2ff";
  var inputColor = "#fefce8";

  // 자동 열
  [5,6,8,9,11,13,14].forEach(function(col) {
    sheet.getRange(2, col, dataRows, 1).setBackground(autoColor);
    sheet.getRange(1, col).setNote("🔄 자동 계산");
  });
  // 입력 열
  [4,7,10,12].forEach(function(col) {
    sheet.getRange(2, col, dataRows, 1).setBackground(inputColor);
    sheet.getRange(1, col).setNote("✏️ 직접 입력");
  });
}

// ━━━ % 포맷 적용 ━━━
function formatPercentCells(ss) {
  // 주간성과: H(참여율), I(참여율증감)
  var weekly = ss.getSheetByName("주간성과");
  if (weekly && weekly.getLastRow() > 1) {
    var rows = weekly.getLastRow() - 1;
    weekly.getRange(2, 8, rows, 1).setNumberFormat('0.0"%"');  // 참여율
    weekly.getRange(2, 9, rows, 1).setNumberFormat('+0.0"%";-0.0"%";0.0"%"'); // 참여율증감
  }

  // 월간KPI: F(팔로워증감률), I(게시물증감률), J(평균참여율), K(참여율증감), N(도달증감률)
  var monthly = ss.getSheetByName("월간KPI");
  if (monthly && monthly.getLastRow() > 1) {
    var rows = monthly.getLastRow() - 1;
    monthly.getRange(2, 6, rows, 1).setNumberFormat('0.0"%"');   // 팔로워증감률
    monthly.getRange(2, 9, rows, 1).setNumberFormat('0.0"%"');   // 게시물증감률
    monthly.getRange(2, 10, rows, 1).setNumberFormat('0.0"%"');  // 평균참여율
    monthly.getRange(2, 11, rows, 1).setNumberFormat('+0.0"%";-0.0"%";0.0"%"'); // 참여율증감
    monthly.getRange(2, 14, rows, 1).setNumberFormat('0.0"%"');  // 도달증감률
  }
}

// ━━━ 참여율추이 탭 삭제 ━━━
function deleteERTab(ss) {
  var erSheet = ss.getSheetByName("참여율추이") || ss.getSheetByName("ER추이");
  if (erSheet && ss.getSheets().length > 1) {
    ss.deleteSheet(erSheet);
  }
}

// ━━━ 유틸 ━━━
function getVal(row, idx, key, def) {
  if (idx[key] === undefined) return def;
  return row[idx[key]] || def;
}

function getNum(row, idx, key, def) {
  if (idx[key] === undefined) return def;
  var v = row[idx[key]];
  if (typeof v === "number") return v;
  var n = parseFloat(String(v).replace(/[,%]/g, ""));
  return isNaN(n) ? def : n;
}
