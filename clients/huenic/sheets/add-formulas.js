/**
 * 구글시트에 자동 계산 수식 추가
 *
 * 변경 사항:
 * - 주간성과: "참여율" 열 제거 → "총반응" 열 추가, 참여율 자동 계산
 * - 주간성과: 팔로워증감, 참여율증감, 도달증감 자동 계산
 * - 월간KPI: 모든 증감/증감률 자동 계산
 *
 * Apps Script: 함수 addFormulas → ▶ 실행
 */

function addFormulas() {
  var ss = SpreadsheetApp.getActiveSpreadsheet();

  setupWeeklyMetrics(ss);
  setupMonthlyKPI(ss);

  SpreadsheetApp.getUi().alert(
    "완료! 자동 계산 수식이 적용되었습니다.\n\n" +
    "주간성과: 팔로워, 게시물수, 총반응, 도달만 입력하면 나머지 자동 계산\n" +
    "월간KPI: 팔로워, 월간게시물, 평균참여율, 월간도달만 입력하면 나머지 자동 계산"
  );
}

function setupWeeklyMetrics(ss) {
  var sheet = ss.getSheetByName("주간성과");
  if (!sheet) return;

  // 현재 데이터 백업
  var lastRow = sheet.getLastRow();
  var data = lastRow > 1 ? sheet.getRange(2, 1, lastRow - 1, sheet.getLastColumn()).getValues() : [];

  // 새 헤더 구조:
  // A:브랜드  B:주차  C:기간  D:팔로워  E:팔로워증감(자동)  F:게시물수
  // G:총반응(입력)  H:참여율(자동)  I:참여율증감(자동)  J:최고좋아요  K:도달  L:도달증감(자동)
  var newHeaders = [
    "브랜드", "주차", "기간", "팔로워", "팔로워증감", "게시물수",
    "총반응", "참여율", "참여율증감", "최고좋아요", "도달", "도달증감"
  ];

  // 시트 클리어 후 새 헤더
  sheet.clear();
  sheet.getRange(1, 1, 1, newHeaders.length).setValues([newHeaders]);
  sheet.getRange(1, 1, 1, newHeaders.length).setFontWeight("bold").setBackground("#f3f4f6");

  // 자동 계산 열 색상 표시 (연한 파랑 배경)
  // E:팔로워증감, H:참여율, I:참여율증감, L:도달증감

  // 기존 데이터를 새 구조로 변환
  // 기존: 브랜드,주차,기간,팔로워,팔로워증감,게시물수,참여율,참여율증감,최고좋아요,도달,도달증감
  // 신규: 브랜드,주차,기간,팔로워,팔로워증감(자동),게시물수,총반응(신규),참여율(자동),참여율증감(자동),최고좋아요,도달,도달증감(자동)

  if (data.length > 0) {
    for (var i = 0; i < data.length; i++) {
      var row = i + 2; // 데이터 시작 행
      var oldRow = data[i];

      // A:브랜드, B:주차, C:기간 — 그대로
      sheet.getRange(row, 1).setValue(oldRow[0]); // 브랜드
      sheet.getRange(row, 2).setValue(oldRow[1]); // 주차
      sheet.getRange(row, 3).setValue(oldRow[2]); // 기간

      // D:팔로워 — 입력값
      sheet.getRange(row, 4).setValue(oldRow[3]); // 팔로워

      // F:게시물수 — 입력값
      sheet.getRange(row, 6).setValue(oldRow[5]); // 게시물수

      // G:총반응 — 역산 (기존 참여율 × 팔로워 / 100)
      var oldER = oldRow[6]; // 기존 참여율
      var oldFollowers = oldRow[3]; // 기존 팔로워
      var estimatedEngagements = Math.round(oldER * oldFollowers / 100);
      sheet.getRange(row, 7).setValue(estimatedEngagements); // 총반응

      // J:최고좋아요 — 입력값
      sheet.getRange(row, 10).setValue(oldRow[8]); // 최고좋아요

      // K:도달 — 입력값
      sheet.getRange(row, 11).setValue(oldRow[9]); // 도달
    }

    // 수식 추가 (브랜드별로 이전 행 찾기)
    for (var i = 0; i < data.length; i++) {
      var row = i + 2;

      // E: 팔로워증감 = 같은 브랜드의 이전 행과 비교
      // 첫 행이면 0, 아니면 이번 팔로워 - 이전 팔로워
      if (i === 0) {
        sheet.getRange(row, 5).setValue(0);
      } else {
        sheet.getRange(row, 5).setFormula(
          '=IF(A' + row + '=A' + (row-1) + ', D' + row + '-D' + (row-1) + ', 0)'
        );
      }

      // H: 참여율 = 총반응 / 팔로워 × 100 (소수점 1자리)
      sheet.getRange(row, 8).setFormula(
        '=ROUND(G' + row + '/D' + row + '*100, 1)'
      );

      // I: 참여율증감
      if (i === 0) {
        sheet.getRange(row, 9).setValue(0);
      } else {
        sheet.getRange(row, 9).setFormula(
          '=IF(A' + row + '=A' + (row-1) + ', ROUND(H' + row + '-H' + (row-1) + ', 1), 0)'
        );
      }

      // L: 도달증감
      if (i === 0) {
        sheet.getRange(row, 12).setValue(0);
      } else {
        sheet.getRange(row, 12).setFormula(
          '=IF(A' + row + '=A' + (row-1) + ', K' + row + '-K' + (row-1) + ', 0)'
        );
      }
    }

    // 자동 계산 열 배경색 (연한 파랑)
    var autoColColor = "#eef2ff";
    sheet.getRange(2, 5, data.length, 1).setBackground(autoColColor); // 팔로워증감
    sheet.getRange(2, 8, data.length, 1).setBackground(autoColColor); // 참여율
    sheet.getRange(2, 9, data.length, 1).setBackground(autoColColor); // 참여율증감
    sheet.getRange(2, 12, data.length, 1).setBackground(autoColColor); // 도달증감
  }

  // 헤더에 설명 노트 추가
  sheet.getRange(1, 5).setNote("자동 계산 (직접 입력 X)");
  sheet.getRange(1, 7).setNote("좋아요 + 댓글 + 저장 합계 입력");
  sheet.getRange(1, 8).setNote("자동 계산: 총반응/팔로워×100");
  sheet.getRange(1, 9).setNote("자동 계산 (직접 입력 X)");
  sheet.getRange(1, 12).setNote("자동 계산 (직접 입력 X)");

  // 열 너비 자동
  for (var i = 1; i <= newHeaders.length; i++) {
    sheet.autoResizeColumn(i);
  }
}

function setupMonthlyKPI(ss) {
  var sheet = ss.getSheetByName("월간KPI");
  if (!sheet) return;

  var lastRow = sheet.getLastRow();
  if (lastRow <= 1) return;

  // 월간KPI 헤더:
  // A:브랜드 B:연도 C:월 D:팔로워 E:팔로워증감 F:팔로워증감률
  // G:월간게시물 H:게시물증감 I:게시물증감률
  // J:평균참여율 K:참여율증감
  // L:월간도달 M:도달증감 N:도달증감률

  // 입력: D(팔로워), G(월간게시물), J(평균참여율), L(월간도달)
  // 자동: E,F,H,I,K,M,N

  for (var row = 2; row <= lastRow; row++) {
    if (row === 2) {
      // 첫 행은 증감 0
      sheet.getRange(row, 5).setValue(0);  // 팔로워증감
      sheet.getRange(row, 6).setValue(0);  // 팔로워증감률
      sheet.getRange(row, 8).setValue(0);  // 게시물증감
      sheet.getRange(row, 9).setValue(0);  // 게시물증감률
      sheet.getRange(row, 11).setValue(0); // 참여율증감
      sheet.getRange(row, 13).setValue(0); // 도달증감
      sheet.getRange(row, 14).setValue(0); // 도달증감률
    } else {
      var prev = row - 1;
      // 팔로워증감/률
      sheet.getRange(row, 5).setFormula('=IF(A'+row+'=A'+prev+', D'+row+'-D'+prev+', 0)');
      sheet.getRange(row, 6).setFormula('=IF(A'+row+'=A'+prev+', ROUND((D'+row+'-D'+prev+')/D'+prev+'*100, 1), 0)');
      // 게시물증감/률
      sheet.getRange(row, 8).setFormula('=IF(A'+row+'=A'+prev+', G'+row+'-G'+prev+', 0)');
      sheet.getRange(row, 9).setFormula('=IF(A'+row+'=A'+prev+', IF(G'+prev+'=0, 0, ROUND((G'+row+'-G'+prev+')/G'+prev+'*100, 1)), 0)');
      // 참여율증감
      sheet.getRange(row, 11).setFormula('=IF(A'+row+'=A'+prev+', ROUND(J'+row+'-J'+prev+', 1), 0)');
      // 도달증감/률
      sheet.getRange(row, 13).setFormula('=IF(A'+row+'=A'+prev+', L'+row+'-L'+prev+', 0)');
      sheet.getRange(row, 14).setFormula('=IF(A'+row+'=A'+prev+', ROUND((L'+row+'-L'+prev+')/L'+prev+'*100, 1), 0)');
    }
  }

  // 자동 계산 열 배경색
  var autoColColor = "#eef2ff";
  var dataRows = lastRow - 1;
  [5,6,8,9,11,13,14].forEach(function(col) {
    sheet.getRange(2, col, dataRows, 1).setBackground(autoColColor);
  });

  // 헤더 노트
  [5,6,8,9,11,13,14].forEach(function(col) {
    sheet.getRange(1, col).setNote("자동 계산 (직접 입력 X)");
  });
}
