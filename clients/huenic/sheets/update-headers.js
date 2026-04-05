/**
 * 헤더를 한글로 변경 + ER추이 탭명 변경
 *
 * Apps Script에서 실행:
 * 확장 프로그램 → Apps Script → 이 코드 붙여넣기 → ▶ 실행
 */

function updateToKorean() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();

  // ─── 주간성과 ───
  updateHeaders(ss, "주간성과", [
    "브랜드","주차","기간","팔로워","팔로워증감","게시물수","참여율","참여율증감","최고좋아요","도달","도달증감"
  ]);

  // ─── 베스트콘텐츠 ───
  updateHeaders(ss, "베스트콘텐츠", [
    "브랜드","주차","제목","유형","좋아요","댓글"
  ]);

  // ─── 월간KPI ───
  updateHeaders(ss, "월간KPI", [
    "브랜드","연도","월","팔로워","팔로워증감","팔로워증감률","월간게시물","게시물증감","게시물증감률","평균참여율","참여율증감","월간도달","도달증감","도달증감률"
  ]);

  // ─── 팔로워추이 ───
  updateHeaders(ss, "팔로워추이", [
    "브랜드","월","전체","자연유입","광고"
  ]);

  // ─── ER추이 → 참여율추이 (탭명 변경 + 헤더 변경) ───
  const erSheet = ss.getSheetByName("ER추이");
  if (erSheet) {
    erSheet.setName("참여율추이");
    const headers = ["브랜드","주차","전체","피드","릴스","스토리"];
    erSheet.getRange(1, 1, 1, headers.length).setValues([headers]);
    erSheet.getRange(1, 1, 1, headers.length).setFontWeight("bold").setBackground("#f3f4f6");
  }

  // ─── 유형 열: feed/reels/story → 피드/릴스/스토리 ───
  const contentSheet = ss.getSheetByName("베스트콘텐츠");
  if (contentSheet) {
    const lastRow = contentSheet.getLastRow();
    if (lastRow > 1) {
      const typeRange = contentSheet.getRange(2, 4, lastRow - 1, 1); // D열 = 유형
      const values = typeRange.getValues();
      const mapped = values.map(function(row) {
        var v = row[0];
        if (v === "feed") return ["피드"];
        if (v === "reels") return ["릴스"];
        if (v === "story") return ["스토리"];
        return [v];
      });
      typeRange.setValues(mapped);
    }
  }

  // ─── 브랜드 열: veggiet/vinker → 베지어트/빙커 ───
  var sheets = ss.getSheets();
  for (var s = 0; s < sheets.length; s++) {
    var sheet = sheets[s];
    var lastRow = sheet.getLastRow();
    if (lastRow <= 1) continue;
    var brandRange = sheet.getRange(2, 1, lastRow - 1, 1); // A열 = 브랜드
    var values = brandRange.getValues();
    var changed = false;
    var mapped = values.map(function(row) {
      var v = row[0];
      if (v === "veggiet") { changed = true; return ["베지어트"]; }
      if (v === "vinker") { changed = true; return ["빙커"]; }
      return [v];
    });
    if (changed) brandRange.setValues(mapped);
  }

  SpreadsheetApp.getUi().alert("완료! 모든 헤더가 한글로 변경되었습니다.");
}

function updateHeaders(ss, sheetName, headers) {
  const sheet = ss.getSheetByName(sheetName);
  if (!sheet) return;
  sheet.getRange(1, 1, 1, headers.length).setValues([headers]);
  sheet.getRange(1, 1, 1, headers.length).setFontWeight("bold").setBackground("#f3f4f6");
}
