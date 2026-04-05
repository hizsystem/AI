/**
 * "빈커" → "빙커" 전체 시트 일괄 변경
 * Apps Script에서 실행: 함수 fixVinker → ▶ 실행
 */
function fixVinker() {
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var sheets = ss.getSheets();
  var count = 0;

  for (var s = 0; s < sheets.length; s++) {
    var sheet = sheets[s];
    var range = sheet.getDataRange();
    var values = range.getValues();
    var changed = false;

    for (var i = 0; i < values.length; i++) {
      for (var j = 0; j < values[i].length; j++) {
        if (typeof values[i][j] === "string" && values[i][j].indexOf("빈커") !== -1) {
          values[i][j] = values[i][j].replace(/빈커/g, "빙커");
          changed = true;
          count++;
        }
      }
    }

    if (changed) {
      range.setValues(values);
    }
  }

  SpreadsheetApp.getUi().alert("완료! " + count + "개 셀을 '빙커'로 변경했습니다.");
}
