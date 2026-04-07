/**
 * 비용 상세 탭 — 구분 변경 시 자동 색상
 * Apps Script에 추가 후 저장만 하면 자동 작동 (별도 실행 불필요)
 */

function onEdit(e) {
  const sheet = e.source.getActiveSheet();
  const range = e.range;

  // 비용 상세 탭의 C열(구분)이 변경될 때만 작동
  if (sheet.getName() !== '비용 상세') return;
  if (range.getColumn() !== 3) return;

  const colors = {
    '외주비': '#FFF2CC',
    '광고비': '#D9EAD3',
    '매체비': '#CFE2F3',
    '진행비': '#F4CCCC',
    '이벤트': '#D9D2E9'
  };

  const val = range.getValue();
  const color = colors[val] || '#FFFFFF';
  range.setBackground(color);
}
