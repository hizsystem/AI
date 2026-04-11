// ============================================================
// 이커머스, 그 세계에 대하여 — Figma 슬라이드 자동 생성 플러그인
// 16장 프레젠테이션 (1920×1080)
// ============================================================

const W = 1920;
const H = 1080;
const GAP = 100; // 프레임 간 간격

// ── 컬러 팔레트 ──
const C = {
  bg:       { r: 0.98, g: 0.97, b: 0.95 },  // #FAF7F2
  card:     { r: 1,    g: 1,    b: 1    },   // #FFFFFF
  subtle:   { r: 0.94, g: 0.93, b: 0.91 },  // #F0EDE7
  border:   { r: 0.91, g: 0.89, b: 0.86 },  // #E8E3DB
  text:     { r: 0.10, g: 0.10, b: 0.10 },  // #1A1A1A
  textSub:  { r: 0.42, g: 0.40, b: 0.38 },  // #6B6560
  textDim:  { r: 0.66, g: 0.64, b: 0.62 },  // #A8A29E
  coral:    { r: 0.83, g: 0.47, b: 0.42 },  // #D4796A
  mint:     { r: 0.42, g: 0.68, b: 0.58 },  // #6BAE94
  lavender: { r: 0.61, g: 0.56, b: 0.77 },  // #9B8EC4
  rose:     { r: 0.77, g: 0.47, b: 0.47 },  // #C47878
  white:    { r: 1,    g: 1,    b: 1    },
};

// ── 타이포 사이즈 ──
const FONT = "Noto Sans KR";

// ── 유틸리티 ──
function rgb(hex) {
  const r = parseInt(hex.slice(1,3),16)/255;
  const g = parseInt(hex.slice(3,5),16)/255;
  const b = parseInt(hex.slice(5,7),16)/255;
  return { r, g, b };
}

function alphaFill(color, opacity) {
  return { type: "SOLID", color, opacity: opacity || 1 };
}

function solidFill(color) {
  return [{ type: "SOLID", color }];
}

function solidPaint(color, opacity) {
  return [{ type: "SOLID", color, opacity: opacity || 1 }];
}

// ── 프레임 생성 ──
function createSlideFrame(index, name) {
  const frame = figma.createFrame();
  frame.name = `${String(index + 1).padStart(2, '0')} — ${name}`;
  frame.resize(W, H);
  frame.x = index * (W + GAP);
  frame.y = 0;
  frame.fills = solidPaint(C.bg);
  frame.layoutMode = "NONE";
  return frame;
}

// ── 텍스트 노드 생성 ──
async function createText(opts) {
  const t = figma.createText();
  await figma.loadFontAsync({ family: FONT, style: opts.style || "Light" });
  t.fontName = { family: FONT, style: opts.style || "Light" };
  t.characters = opts.text;
  t.fontSize = opts.size || 20;
  t.lineHeight = opts.lineHeight ? { value: opts.lineHeight, unit: "PIXELS" } : { unit: "AUTO" };
  t.fills = solidPaint(opts.color || C.text);
  if (opts.letterSpacing) t.letterSpacing = { value: opts.letterSpacing, unit: "PIXELS" };
  if (opts.textAlignHorizontal) t.textAlignHorizontal = opts.textAlignHorizontal;
  if (opts.width) { t.resize(opts.width, t.height); t.textAutoResize = "HEIGHT"; }
  return t;
}

// 부분 색상 텍스트 — segments 배열: [{text, color, style}]
async function createRichText(opts) {
  const t = figma.createText();
  // 모든 필요한 폰트 로드
  const styles = new Set(opts.segments.map(s => s.style || opts.defaultStyle || "Light"));
  for (const st of styles) {
    await figma.loadFontAsync({ family: FONT, style: st });
  }
  // 전체 텍스트 조합
  const fullText = opts.segments.map(s => s.text).join("");
  t.fontName = { family: FONT, style: opts.defaultStyle || "Light" };
  t.characters = fullText;
  t.fontSize = opts.size || 20;
  if (opts.lineHeight) t.lineHeight = { value: opts.lineHeight, unit: "PIXELS" };
  if (opts.letterSpacing) t.letterSpacing = { value: opts.letterSpacing, unit: "PIXELS" };
  if (opts.textAlignHorizontal) t.textAlignHorizontal = opts.textAlignHorizontal;
  if (opts.width) { t.resize(opts.width, t.height); t.textAutoResize = "HEIGHT"; }
  // 각 segment별 스타일 적용
  let pos = 0;
  for (const seg of opts.segments) {
    const len = seg.text.length;
    if (seg.color) t.setRangeFills(pos, pos + len, solidPaint(seg.color));
    if (seg.style) t.setRangeFontName(pos, pos + len, { family: FONT, style: seg.style });
    if (seg.size) t.setRangeFontSize(pos, pos + len, seg.size);
    if (seg.letterSpacing) t.setRangeLetterSpacing(pos, pos + len, { value: seg.letterSpacing, unit: "PIXELS" });
    pos += len;
  }
  return t;
}

// ── 카드(라운드 박스) 생성 ──
function createCard(opts) {
  const r = figma.createFrame();
  r.resize(opts.width || 700, opts.height || 200);
  r.fills = solidPaint(opts.bgColor || C.card);
  r.strokes = solidPaint(opts.strokeColor || C.border);
  r.strokeWeight = opts.strokeWeight || 1;
  r.cornerRadius = opts.radius || 14;
  if (opts.layoutMode) {
    r.layoutMode = opts.layoutMode;
    r.primaryAxisAlignItems = opts.primaryAlign || "CENTER";
    r.counterAxisAlignItems = opts.counterAlign || "CENTER";
    r.paddingTop = opts.padY || 24;
    r.paddingBottom = opts.padY || 24;
    r.paddingLeft = opts.padX || 32;
    r.paddingRight = opts.padX || 32;
    r.itemSpacing = opts.itemSpacing || 8;
  }
  r.layoutMode = "NONE"; // keep manual for placement
  return r;
}

// ── pill 생성 ──
function createPill(opts) {
  const frame = figma.createFrame();
  frame.layoutMode = "HORIZONTAL";
  frame.primaryAxisAlignItems = "CENTER";
  frame.counterAxisAlignItems = "CENTER";
  frame.paddingTop = opts.padY || 10;
  frame.paddingBottom = opts.padY || 10;
  frame.paddingLeft = opts.padX || 20;
  frame.paddingRight = opts.padX || 20;
  frame.cornerRadius = 40;
  frame.fills = solidPaint(opts.bgColor || C.card);
  frame.strokes = solidPaint(opts.strokeColor || C.border);
  frame.strokeWeight = 1.5;
  frame.counterAxisSizingMode = "AUTO";
  frame.primaryAxisSizingMode = "AUTO";
  return frame;
}

// ── 사진 플레이스홀더 ──
function createPhotoPlaceholder(w, h, label) {
  const frame = figma.createFrame();
  frame.resize(w, h);
  frame.fills = solidPaint(C.subtle);
  frame.strokes = solidPaint(C.border);
  frame.strokeWeight = 2;
  frame.dashPattern = [8, 6];
  frame.cornerRadius = 16;
  return frame;
}

// ── 프로그레스 바 ──
function createProgressBar(frame, slideIndex, total) {
  const bar = figma.createRectangle();
  const barWidth = (slideIndex / (total - 1)) * W;
  bar.resize(Math.max(barWidth, 2), 3);
  bar.x = 0;
  bar.y = 0;
  bar.fills = [{
    type: "GRADIENT_LINEAR",
    gradientStops: [
      { position: 0, color: { ...C.coral, a: 1 } },
      { position: 1, color: { ...C.lavender, a: 1 } }
    ],
    gradientTransform: [[1, 0, 0], [0, 1, 0]]
  }];
  frame.appendChild(bar);
  return bar;
}

// ── 페이지 번호 ──
async function createPageNumber(frame, index, total) {
  const t = await createText({
    text: `${index + 1} / ${total}`,
    size: 13,
    style: "Medium",
    color: C.textDim,
  });
  t.x = W - 80;
  t.y = H - 44;
  frame.appendChild(t);
}

// ── 중앙 배치 ──
function centerX(node, parentWidth) {
  node.x = (parentWidth - node.width) / 2;
}

// ============================================================
// 슬라이드 빌더
// ============================================================

async function buildSlide01(frame) {
  // 타이틀 슬라이드
  const label = await createText({ text: "INTERNAL LECTURE — 2026", size: 12, style: "Bold", color: C.textDim, letterSpacing: 4, textAlignHorizontal: "CENTER", width: W });
  label.y = 320;
  label.x = 0;
  frame.appendChild(label);

  const title = await createRichText({
    segments: [
      { text: "이커머스,\n", style: "Black", color: C.text },
      { text: "그 세계", style: "Black", color: C.coral },
      { text: "에 대하여", style: "Black", color: C.text },
    ],
    size: 50, defaultStyle: "Black", lineHeight: 68, textAlignHorizontal: "CENTER", width: W,
  });
  title.y = 360;
  title.x = 0;
  frame.appendChild(title);

  const body = await createText({ text: "에이전시에서는\n쉽게 접하기 어려운 세계", size: 20, style: "Light", color: C.textSub, textAlignHorizontal: "CENTER", width: W });
  body.y = 520;
  body.x = 0;
  frame.appendChild(body);

  const sub = await createText({ text: "우성민 (Green)", size: 17, style: "Regular", color: C.textDim, textAlignHorizontal: "CENTER", width: W });
  sub.y = 590;
  sub.x = 0;
  frame.appendChild(sub);
}

async function buildSlide02(frame) {
  const label = await createText({ text: "ACT 1 — 우리가 아는 세계", size: 12, style: "Bold", color: C.textDim, letterSpacing: 4, textAlignHorizontal: "CENTER", width: W });
  label.y = 240;
  frame.appendChild(label);

  const title = await createText({ text: "우리가 아는 마케팅", size: 38, style: "Bold", color: C.text, textAlignHorizontal: "CENTER", width: W });
  title.y = 280;
  frame.appendChild(title);

  // 카드
  const cardW = 700, cardH = 260;
  const card = createCard({ width: cardW, height: cardH });
  card.x = (W - cardW) / 2;
  card.y = 350;
  frame.appendChild(card);

  const items = ["브리프 받는다", "크리에이티브 만든다", "매체 태운다", "데이터 리포트 뽑는다"];
  for (let i = 0; i < items.length; i++) {
    const row = await createRichText({
      segments: [
        { text: "→  ", style: "Bold", color: C.coral },
        { text: items[i], style: "Regular", color: C.textSub },
      ],
      size: 20, defaultStyle: "Regular",
    });
    row.x = 60;
    row.y = 30 + i * 52;
    card.appendChild(row);
  }

  const body = await createText({ text: "솔직히, 여기까지가 저의 세계였습니다.", size: 20, style: "Light", color: C.textSub, textAlignHorizontal: "CENTER", width: W });
  body.y = 640;
  frame.appendChild(body);
}

async function buildSlide03(frame) {
  const sub = await createText({ text: "그런데 한 번이라도\n이런 생각 해보신 적 있으신가요?", size: 26, style: "Bold", color: C.textDim, textAlignHorizontal: "CENTER", width: W, lineHeight: 40 });
  sub.y = 320;
  frame.appendChild(sub);

  const main = await createRichText({
    segments: [
      { text: ""내가 만든 콘텐츠/광고로\n진짜 ", style: "Black", color: C.text },
      { text: "물건이 팔렸을까?", style: "Black", color: C.coral },
      { text: """, style: "Black", color: C.text },
    ],
    size: 44, defaultStyle: "Black", lineHeight: 62, textAlignHorizontal: "CENTER", width: W,
  });
  main.y = 430;
  frame.appendChild(main);
}

async function buildSlide04(frame) {
  const label = await createText({ text: "이커머스에 필요한 것들", size: 12, style: "Bold", color: C.textDim, letterSpacing: 4, textAlignHorizontal: "CENTER", width: W });
  label.y = 160;
  frame.appendChild(label);

  const sub = await createText({ text: "이커머스를 하려면 이 모든 것이 필요합니다", size: 24, style: "Bold", color: C.textSub, textAlignHorizontal: "CENTER", width: W });
  sub.y = 200;
  frame.appendChild(sub);

  // Pill 그리드 — 2줄
  const normalPills = ["제품/PMF", "가격 전략", "플랫폼 전략", "물류/배송", "CS/고객관리"];
  const focusPills = ["퍼널 설계", "CRM/리텐션"];
  const normalPills2 = ["콘텐츠", "퍼포먼스 광고", "브랜딩"];

  // Row 1
  let startX = 340;
  let y1 = 280;
  for (const name of normalPills) {
    const pill = createPill({ bgColor: C.card, strokeColor: C.border });
    const t = await createText({ text: name, size: 15, style: "Medium", color: C.textDim });
    pill.appendChild(t);
    pill.x = startX;
    pill.y = y1;
    frame.appendChild(pill);
    startX += t.width + 50;
  }

  // Row 2 — focus pills first
  startX = 340;
  let y2 = 345;
  for (const name of focusPills) {
    const pill = createPill({ bgColor: { r: 0.83, g: 0.47, b: 0.42 }, strokeColor: C.coral });
    pill.fills = solidPaint(C.coral, 0.06);
    const t = await createText({ text: name, size: 15, style: "Bold", color: C.coral });
    pill.appendChild(t);
    pill.x = startX;
    pill.y = y2;
    frame.appendChild(pill);
    startX += t.width + 50;
  }
  for (const name of normalPills2) {
    const pill = createPill({ bgColor: C.card, strokeColor: C.border });
    const t = await createText({ text: name, size: 15, style: "Medium", color: C.textDim });
    pill.appendChild(t);
    pill.x = startX;
    pill.y = y2;
    frame.appendChild(pill);
    startX += t.width + 50;
  }

  // 설명 텍스트
  const body = await createRichText({
    segments: [
      { text: "이 중에서 오늘은,\n제가 직접 겪으면서 가장 크게 배운 ", style: "Light", color: C.textSub },
      { text: "두 가지", style: "Bold", color: C.coral },
      { text: "를 이야기하겠습니다.", style: "Light", color: C.textSub },
    ],
    size: 19, defaultStyle: "Light", textAlignHorizontal: "CENTER", width: W, lineHeight: 34,
  });
  body.y = 460;
  frame.appendChild(body);

  // 2개 태그
  const tagW = 260, tagH = 48;
  const tag1 = figma.createFrame();
  tag1.resize(tagW, tagH);
  tag1.fills = solidPaint(C.mint, 0.1);
  tag1.cornerRadius = 10;
  tag1.x = (W / 2) - tagW - 10;
  tag1.y = 560;
  frame.appendChild(tag1);
  const t1 = await createText({ text: "퍼널 — 사게 하는 설계", size: 16, style: "Bold", color: C.mint, textAlignHorizontal: "CENTER", width: tagW });
  t1.y = 12;
  tag1.appendChild(t1);

  const tag2 = figma.createFrame();
  tag2.resize(tagW + 40, tagH);
  tag2.fills = solidPaint(C.lavender, 0.1);
  tag2.cornerRadius = 10;
  tag2.x = (W / 2) + 10;
  tag2.y = 560;
  frame.appendChild(tag2);
  const t2 = await createText({ text: "CRM 로드맵 — 남게 하는 설계", size: 16, style: "Bold", color: C.lavender, textAlignHorizontal: "CENTER", width: tagW + 40 });
  t2.y = 12;
  tag2.appendChild(t2);
}

async function buildSlide05(frame) {
  const label = await createText({ text: "ACT 2 — 제가 만난 세계", size: 12, style: "Bold", color: C.textDim, letterSpacing: 4, textAlignHorizontal: "CENTER", width: W });
  label.y = 220;
  frame.appendChild(label);

  const title = await createRichText({
    segments: [
      { text: "이커머스는\n", style: "Bold", color: C.text },
      { text: "완전히 다른 세계", style: "Bold", color: C.coral },
      { text: "였습니다", style: "Bold", color: C.text },
    ],
    size: 38, defaultStyle: "Bold", lineHeight: 54, textAlignHorizontal: "CENTER", width: W,
  });
  title.y = 260;
  frame.appendChild(title);

  const photo = createPhotoPlaceholder(500, 260, "📸 리솔츠 자사몰 or 제품 사진");
  centerX(photo, W);
  photo.y = 400;
  frame.appendChild(photo);

  const photoLabel = await createText({ text: "📸 리솔츠 자사몰 or 제품 사진", size: 14, style: "Regular", color: C.textDim, textAlignHorizontal: "CENTER", width: 500 });
  photoLabel.x = photo.x;
  photoLabel.y = 520;
  frame.appendChild(photoLabel);

  const body = await createText({ text: "3년 동안 리솔츠(ReSaltZ)의\n국내 마케팅을 맡게 되면서 알게 됐습니다.", size: 20, style: "Light", color: C.textSub, textAlignHorizontal: "CENTER", width: W, lineHeight: 36 });
  body.y = 700;
  frame.appendChild(body);
}

async function buildSlide06(frame) {
  const t1 = await createRichText({
    segments: [
      { text: "모든 액션이 ", style: "Bold", color: C.text },
      { text: "매출", style: "Bold", color: C.coral },
      { text: "로 향해야 합니다", style: "Bold", color: C.text },
    ],
    size: 38, defaultStyle: "Bold", textAlignHorizontal: "CENTER", width: W,
  });
  t1.y = 390;
  frame.appendChild(t1);

  const t2 = await createRichText({
    segments: [
      { text: "그리고 그건, 내 의도대로\n만들 수 있는 숫자가 ", style: "Bold", color: C.textSub },
      { text: "아닙니다", style: "Bold", color: C.coral },
    ],
    size: 38, defaultStyle: "Bold", textAlignHorizontal: "CENTER", width: W, lineHeight: 54,
  });
  t2.y = 460;
  frame.appendChild(t2);
}

async function buildSlide07(frame) {
  // Pillar tag
  const tag = figma.createFrame();
  tag.resize(180, 32);
  tag.fills = solidPaint(C.mint, 0.12);
  tag.cornerRadius = 20;
  centerX(tag, W);
  tag.y = 120;
  frame.appendChild(tag);
  const tagT = await createText({ text: "PILLAR 1 — 퍼널", size: 12, style: "Bold", color: C.mint, letterSpacing: 1, textAlignHorizontal: "CENTER", width: 180 });
  tagT.y = 7;
  tag.appendChild(tagT);

  // 사진
  const photo = createPhotoPlaceholder(400, 200, "📸 Teaforest 향수");
  centerX(photo, W);
  photo.y = 175;
  frame.appendChild(photo);
  const photoLabel = await createText({ text: "📸 Teaforest 향수 제품 사진", size: 14, style: "Regular", color: C.textDim, textAlignHorizontal: "CENTER", width: 400 });
  photoLabel.x = photo.x;
  photoLabel.y = 290;
  frame.appendChild(photoLabel);

  // 제품명
  const prodName = await createText({ text: "리솔츠 — Teaforest 향수", size: 19, style: "Light", color: C.textDim, textAlignHorizontal: "CENTER", width: W });
  prodName.y = 410;
  frame.appendChild(prodName);

  // Before
  const beforeLabel = await createText({ text: "우리가 쓰고 있던 카피", size: 15, style: "Light", color: C.textDim, textAlignHorizontal: "CENTER", width: W });
  beforeLabel.y = 465;
  frame.appendChild(beforeLabel);

  await figma.loadFontAsync({ family: FONT, style: "Bold" });
  const beforeCopy = await createText({ text: ""다도의 리추얼을 담은 티포레스트"", size: 24, style: "Bold", color: C.textDim, textAlignHorizontal: "CENTER", width: W });
  beforeCopy.textDecoration = "STRIKETHROUGH";
  beforeCopy.y = 495;
  frame.appendChild(beforeCopy);

  // After
  const afterLabel = await createText({ text: "고객이 실제로 한 말", size: 15, style: "Light", color: C.mint, textAlignHorizontal: "CENTER", width: W });
  afterLabel.y = 560;
  frame.appendChild(afterLabel);

  const afterCopy = await createText({ text: ""맑고 투명한 향기.\n달지 않은 쟈스민 향수"", size: 34, style: "Bold", color: C.text, textAlignHorizontal: "CENTER", width: W, lineHeight: 48 });
  afterCopy.y = 595;
  frame.appendChild(afterCopy);
}

async function buildSlide08(frame) {
  const intro = await createText({ text: "그 카피를 광고에 그대로 썼더니", size: 20, style: "Light", color: C.textDim, textAlignHorizontal: "CENTER", width: W });
  intro.y = 260;
  frame.appendChild(intro);

  const before = await createText({ text: "ROAS 0.5", size: 56, style: "Black", color: C.textDim, textAlignHorizontal: "CENTER", width: W });
  before.y = 310;
  frame.appendChild(before);

  const beforeSub = await createText({ text: "← 평균 이랬던 광고가", size: 20, style: "Light", color: C.textDim, textAlignHorizontal: "CENTER", width: W });
  beforeSub.y = 380;
  frame.appendChild(beforeSub);

  const after = await createText({ text: "ROAS 2+", size: 80, style: "Black", color: C.mint, textAlignHorizontal: "CENTER", width: W });
  after.y = 440;
  frame.appendChild(after);

  const afterSub = await createText({ text: "고객의 언어로 바꿨을 뿐인데.", size: 20, style: "Bold", color: C.mint, textAlignHorizontal: "CENTER", width: W });
  afterSub.y = 540;
  frame.appendChild(afterSub);

  const foot = await createText({ text: "퍼널의 입구 — 고객의 언어로 말해야 사람이 들어옵니다.", size: 16, style: "Light", color: C.textSub, textAlignHorizontal: "CENTER", width: W });
  foot.y = 620;
  frame.appendChild(foot);
}

async function buildSlide09(frame) {
  const sub = await createText({ text: "하지만 카피만의 힘이 아니었습니다.", size: 22, style: "Bold", color: C.textSub, textAlignHorizontal: "CENTER", width: W });
  sub.y = 180;
  frame.appendChild(sub);

  const title = await createRichText({
    segments: [
      { text: "그 뒤에 이미 설계된 ", style: "Bold", color: C.text },
      { text: "퍼널", style: "Bold", color: C.mint },
      { text: "이 있었습니다", style: "Bold", color: C.text },
    ],
    size: 34, defaultStyle: "Bold", textAlignHorizontal: "CENTER", width: W,
  });
  title.y = 220;
  frame.appendChild(title);

  // 깔대기 3단 — 노출, 유입, 전환
  const funnelY = 310;
  const bars = [
    { w: 520, label: "노출", desc: "광고, 검색, SNS, 바이럴", color: C.mint, opacity: 1 },
    { w: 380, label: "유입", desc: "클릭, 랜딩", color: C.mint, opacity: 0.8 },
    { w: 240, label: "전환", desc: "상세 → 리뷰 → 장바구니 → 결제", color: C.coral, opacity: 1 },
  ];
  for (let i = 0; i < bars.length; i++) {
    const b = bars[i];
    const rect = figma.createFrame();
    rect.resize(b.w, 52);
    rect.fills = solidPaint(b.color, b.opacity);
    rect.cornerRadius = 8;
    centerX(rect, W);
    rect.y = funnelY + i * 58;
    frame.appendChild(rect);

    const txt = await createRichText({
      segments: [
        { text: b.label, style: "Bold", color: C.white },
        { text: "  " + b.desc, style: "Light", color: C.white },
      ],
      size: 16, defaultStyle: "Bold", textAlignHorizontal: "CENTER", width: b.w,
    });
    txt.y = 14;
    rect.appendChild(txt);
  }

  // 화살표
  const arrow = await createText({ text: "↑ 여기를 확대해보면", size: 20, style: "Regular", color: C.textDim, textAlignHorizontal: "CENTER", width: W });
  arrow.y = 510;
  frame.appendChild(arrow);

  // 흐름 카드
  const flowW = 680, flowH = 48;
  const flowCard = createCard({ width: flowW, height: flowH, strokeColor: C.border, radius: 10 });
  centerX(flowCard, W);
  flowCard.y = 555;
  frame.appendChild(flowCard);

  const steps = ["랜딩", "상세페이지", "리뷰", "장바구니", "결제"];
  const stepText = steps.join("  →  ");
  const flowT = await createText({ text: stepText, size: 14, style: "Medium", color: C.textSub, textAlignHorizontal: "CENTER", width: flowW });
  flowT.y = 14;
  flowCard.appendChild(flowT);

  const foot = await createText({ text: "각 구간마다 고객이 이탈합니다. 이 이탈을 줄이는 것이 퍼널 설계입니다.", size: 15, style: "Light", color: C.textSub, textAlignHorizontal: "CENTER", width: W });
  foot.y = 630;
  frame.appendChild(foot);
}

async function buildSlide10(frame) {
  const title = await createRichText({
    segments: [
      { text: "이탈은 ", style: "Bold", color: C.text },
      { text: "디테일", style: "Bold", color: C.coral },
      { text: "에서 일어납니다", style: "Bold", color: C.text },
    ],
    size: 32, defaultStyle: "Bold", textAlignHorizontal: "CENTER", width: W,
  });
  title.y = 80;
  frame.appendChild(title);

  // 3열 상단 카드
  const cardData3 = [
    { label: "랜딩", desc: "광고와 랜딩 메시지가\n다르면 즉시 이탈", stat: "로딩 3초 초과 시 이탈 +32%" },
    { label: "상세페이지", desc: "이미지/정보 부족,\n가격 불명확", stat: "상세→장바구니 전환율 평균 8~10%" },
    { label: "리뷰", desc: "리뷰 부족, 신뢰 부재,\n부정 리뷰 미관리", stat: "리뷰 없으면 전환율 최대 3.5배 차이" },
  ];
  const cw = 240, ch = 200, gap = 16;
  const startX3 = (W - (cw * 3 + gap * 2)) / 2;
  for (let i = 0; i < 3; i++) {
    const d = cardData3[i];
    const card = createCard({ width: cw, height: ch, radius: 12 });
    card.x = startX3 + i * (cw + gap);
    card.y = 150;
    frame.appendChild(card);

    const lbl = await createText({ text: d.label, size: 16, style: "Bold", color: C.rose });
    lbl.x = 20; lbl.y = 20;
    card.appendChild(lbl);

    const desc = await createText({ text: d.desc, size: 14, style: "Light", color: C.textSub, width: cw - 40, lineHeight: 22 });
    desc.x = 20; desc.y = 52;
    card.appendChild(desc);

    const stat = await createText({ text: d.stat, size: 13, style: "Medium", color: C.rose, width: cw - 40 });
    stat.x = 20; stat.y = ch - 45;
    card.appendChild(stat);
  }

  // 2열 하단
  const cardData2 = [
    { label: "장바구니", desc: "예상 못한 배송비,\n회원가입 강제", stat: "장바구니 이탈률 평균 70%" },
    { label: "결제", desc: "간편결제 미지원,\n복잡한 결제 프로세스", stat: "간편결제 없으면 13% 추가 이탈" },
  ];
  const startX2 = (W - (cw * 2 + gap)) / 2;
  for (let i = 0; i < 2; i++) {
    const d = cardData2[i];
    const card = createCard({ width: cw, height: ch, radius: 12 });
    card.x = startX2 + i * (cw + gap);
    card.y = 150 + ch + gap;
    frame.appendChild(card);

    const lbl = await createText({ text: d.label, size: 16, style: "Bold", color: C.rose });
    lbl.x = 20; lbl.y = 20;
    card.appendChild(lbl);

    const desc = await createText({ text: d.desc, size: 14, style: "Light", color: C.textSub, width: cw - 40, lineHeight: 22 });
    desc.x = 20; desc.y = 52;
    card.appendChild(desc);

    const stat = await createText({ text: d.stat, size: 13, style: "Medium", color: C.rose, width: cw - 40 });
    stat.x = 20; stat.y = ch - 45;
    card.appendChild(stat);
  }

  const source = await createText({ text: "출처: Baymard Institute, Google, Smart Insights", size: 14, style: "Light", color: C.textDim, textAlignHorizontal: "CENTER", width: W });
  source.y = H - 80;
  frame.appendChild(source);
}

async function buildSlide11(frame) {
  const title = await createRichText({
    segments: [
      { text: "그래서 ", style: "Bold", color: C.text },
      { text: "구간별로 쪼개서", style: "Bold", color: C.coral },
      { text: " 봐야 합니다", style: "Bold", color: C.text },
    ],
    size: 32, defaultStyle: "Bold", textAlignHorizontal: "CENTER", width: W,
  });
  title.y = 160;
  frame.appendChild(title);

  // 카드
  const cardW = 700, cardH = 220;
  const card = createCard({ width: cardW, height: cardH });
  centerX(card, W);
  card.y = 230;
  frame.appendChild(card);

  const lines = [
    { bold: "어디서 유입", rest: "했는지 — UTM으로 채널별 추적" },
    { bold: "어디서 이탈", rest: "했는지 — 구간별 전환율 확인" },
    { bold: "왜 이탈", rest: "했는지 — 데이터로 원인 분석" },
    { bold: "어떤 액션", rest: "을 할지 — 분석이 있어야 마케팅이 나옵니다" },
  ];
  for (let i = 0; i < lines.length; i++) {
    const l = lines[i];
    const row = await createRichText({
      segments: [
        { text: l.bold, style: "Bold", color: C.text },
        { text: l.rest, style: "Light", color: C.textSub },
      ],
      size: 18, defaultStyle: "Light",
    });
    row.x = 50;
    row.y = 28 + i * 46;
    card.appendChild(row);
  }

  // 사진 영역
  const photo = createPhotoPlaceholder(700, 160, "📸 GA4 퍼널 분석 화면");
  centerX(photo, W);
  photo.y = 480;
  frame.appendChild(photo);
  const photoLabel = await createText({ text: "📸 GA4 퍼널 분석 화면 or 전환율 대시보드", size: 14, style: "Regular", color: C.textDim, textAlignHorizontal: "CENTER", width: 700 });
  photoLabel.x = photo.x;
  photoLabel.y = 560;
  frame.appendChild(photoLabel);

  const foot = await createText({ text: "감이 아니라 데이터로. 이게 이커머스의 기본이었습니다.", size: 16, style: "Light", color: C.textSub, textAlignHorizontal: "CENTER", width: W });
  foot.y = 680;
  frame.appendChild(foot);
}

async function buildSlide12(frame) {
  // Pillar tag
  const tag = figma.createFrame();
  tag.resize(220, 32);
  tag.fills = solidPaint(C.lavender, 0.12);
  tag.cornerRadius = 20;
  centerX(tag, W);
  tag.y = 140;
  frame.appendChild(tag);
  const tagT = await createText({ text: "PILLAR 2 — CRM 로드맵", size: 12, style: "Bold", color: C.lavender, letterSpacing: 1, textAlignHorizontal: "CENTER", width: 220 });
  tagT.y = 7;
  tag.appendChild(tagT);

  const title = await createRichText({
    segments: [
      { text: "한 번 온 고객을\n", style: "Bold", color: C.text },
      { text: "다시 오게", style: "Bold", color: C.lavender },
      { text: " 하는 설계", style: "Bold", color: C.text },
    ],
    size: 32, defaultStyle: "Bold", lineHeight: 46, textAlignHorizontal: "CENTER", width: W,
  });
  title.y = 190;
  frame.appendChild(title);

  // 3열 CRM 카드
  const layers = [
    { num: "LAYER 1", title: "터치포인트 점검", desc: "고객이 받는 모든 자동 메시지를 점검하고 재설계합니다.", example: "회원가입 → 결제완료 → 배송시작 → 배송완료 → 리뷰요청" },
    { num: "LAYER 2", title: "세그먼트 분류", desc: "고객을 행동 기반으로 나누고, 각각 다른 메시지를 설계합니다.", example: "장바구니 이탈 / 30일 미구매 / 적립금 미사용 / VIP 등" },
    { num: "LAYER 3", title: "타겟 캠페인", desc: "세그먼트별 맞춤 캠페인을 설계하고 자동화합니다.", example: "장바구니 리마인드 / 이탈 고객 리텐션 / 재구매 유도" },
  ];
  const cw = 255, ch = 280, gap = 20;
  const startX = (W - (cw * 3 + gap * 2)) / 2;
  for (let i = 0; i < 3; i++) {
    const l = layers[i];
    const card = createCard({ width: cw, height: ch, radius: 14 });
    card.x = startX + i * (cw + gap);
    card.y = 320;
    frame.appendChild(card);

    const num = await createText({ text: l.num, size: 12, style: "Bold", color: C.lavender, letterSpacing: 2 });
    num.x = 22; num.y = 22;
    card.appendChild(num);

    const t = await createText({ text: l.title, size: 18, style: "Black", color: C.text });
    t.x = 22; t.y = 48;
    card.appendChild(t);

    const d = await createText({ text: l.desc, size: 14, style: "Light", color: C.textSub, width: cw - 44, lineHeight: 22 });
    d.x = 22; d.y = 84;
    card.appendChild(d);

    const ex = await createText({ text: l.example, size: 13, style: "Light", color: C.textDim, width: cw - 44, lineHeight: 20 });
    ex.x = 22; ex.y = ch - 70;
    card.appendChild(ex);
  }

  const foot = await createRichText({
    segments: [
      { text: "리솔츠에서 ", style: "Light", color: C.textSub },
      { text: "79개 세그먼트", style: "Bold", color: C.lavender },
      { text: "를 만들어\n고객 행동에 따라 다른 메시지를 보냈습니다.", style: "Light", color: C.textSub },
    ],
    size: 17, defaultStyle: "Light", textAlignHorizontal: "CENTER", width: W, lineHeight: 30,
  });
  foot.y = 640;
  frame.appendChild(foot);
}

async function buildSlide13(frame) {
  const sub = await createText({ text: "리솔츠에서 실제로 한 것들", size: 20, style: "Bold", color: C.textDim, textAlignHorizontal: "CENTER", width: W });
  sub.y = 120;
  frame.appendChild(sub);

  // 2x2 카드
  const cases = [
    { label: "자동 메시지 재설계", desc: "회원가입, 결제완료, 배송, 리뷰요청 등 고객에게 닿는 모든 메시지의 톤과 타이밍을 전면 재설계" },
    { label: "세그먼트 79개 설계", desc: ""적립금 3천원 이상 보유, 7일 내 미구매"\n"장바구니 담은 지 3일, 결제 없음" 등 행동 기반 분류" },
    { label: "장바구니 이탈 캠페인", desc: "주문서 작성 중 이탈 고객에게 상품 추천, 장바구니 상품 리마인드, 할인 알림 자동 발송" },
    { label: "이탈 고객 리텐션", desc: "최근 방문했지만 구매 없는 고객, 30일 이상 미구매 고객에게 맞춤 상품 추천" },
  ];
  const cw = 340, ch = 180, gap = 16;
  const startX = (W - (cw * 2 + gap)) / 2;
  for (let i = 0; i < 4; i++) {
    const c = cases[i];
    const col = i % 2;
    const row = Math.floor(i / 2);
    const card = createCard({ width: cw, height: ch, radius: 12 });
    card.x = startX + col * (cw + gap);
    card.y = 180 + row * (ch + gap);
    frame.appendChild(card);

    const lbl = await createText({ text: c.label, size: 16, style: "Bold", color: C.lavender });
    lbl.x = 22; lbl.y = 22;
    card.appendChild(lbl);

    const desc = await createText({ text: c.desc, size: 14, style: "Light", color: C.textSub, width: cw - 44, lineHeight: 22 });
    desc.x = 22; desc.y = 56;
    card.appendChild(desc);
  }

  // 사진 영역
  const photo = createPhotoPlaceholder(720, 140, "📸 CRM 로드맵 Figma 캡처");
  centerX(photo, W);
  photo.y = 590;
  frame.appendChild(photo);
  const photoLabel = await createText({ text: "📸 CRM 로드맵 Figma 캡처 or 오디언스 세그먼트 리스트", size: 14, style: "Regular", color: C.textDim, textAlignHorizontal: "CENTER", width: 720 });
  photoLabel.x = photo.x;
  photoLabel.y = 660;
  frame.appendChild(photoLabel);
}

async function buildSlide14(frame) {
  const label = await createText({ text: "이 모든 것이 합쳐지면", size: 12, style: "Bold", color: C.textDim, letterSpacing: 4, textAlignHorizontal: "CENTER", width: W });
  label.y = 110;
  frame.appendChild(label);

  const title = await createRichText({
    segments: [
      { text: "퍼널", style: "Bold", color: C.mint },
      { text: " + ", style: "Bold", color: C.text },
      { text: "CRM", style: "Bold", color: C.lavender },
      { text: " + ", style: "Bold", color: C.text },
      { text: "모든 채널 유기적으로", style: "Bold", color: C.coral },
    ],
    size: 30, defaultStyle: "Bold", textAlignHorizontal: "CENTER", width: W,
  });
  title.y = 150;
  frame.appendChild(title);

  // 브랜드 이슈 + KPI 카드
  const issueW = 460, kpiW = 160, rowH = 80;
  const rowY = 220;
  const issueCard = createCard({ width: issueW, height: rowH, radius: 12 });
  issueCard.x = (W - issueW - kpiW - 14) / 2;
  issueCard.y = rowY;
  frame.appendChild(issueCard);

  const issueLabel = await createText({ text: "브랜드 이슈", size: 14, style: "Regular", color: C.textDim });
  issueLabel.x = 22; issueLabel.y = 12;
  issueCard.appendChild(issueLabel);
  const issueTitle = await createText({ text: "베지어트 × 올리브영 라이브", size: 17, style: "Bold", color: C.text });
  issueTitle.x = 22; issueTitle.y = 40;
  issueCard.appendChild(issueTitle);

  const kpiCard = createCard({ width: kpiW, height: rowH, radius: 12 });
  kpiCard.x = issueCard.x + issueW + 14;
  kpiCard.y = rowY;
  frame.appendChild(kpiCard);

  const kpiLabel = await createText({ text: "올영 KPI", size: 14, style: "Regular", color: C.textDim });
  kpiLabel.x = 22; kpiLabel.y = 12;
  kpiCard.appendChild(kpiLabel);
  const kpiVal = await createText({ text: "500만원", size: 17, style: "Bold", color: C.text });
  kpiVal.x = 22; kpiVal.y = 40;
  kpiCard.appendChild(kpiVal);

  // 쏟아부은 화력 카드
  const fireW = issueW + kpiW + 14;
  const fireCard = createCard({ width: fireW, height: 100, radius: 12 });
  fireCard.x = issueCard.x;
  fireCard.y = rowY + rowH + 14;
  frame.appendChild(fireCard);

  const fireLabel = await createText({ text: "쏟아부은 화력", size: 14, style: "Regular", color: C.textDim });
  fireLabel.x = 22; fireLabel.y = 14;
  fireCard.appendChild(fireLabel);

  const pillNames = ["체험단", "CRM", "Meta 광고", "인스타 티징", "인플루언서 바이럴"];
  let px = 22;
  for (const name of pillNames) {
    const pill = createPill({ padY: 6, padX: 14, bgColor: C.coral, strokeColor: C.coral });
    pill.fills = solidPaint(C.coral, 0.06);
    const t = await createText({ text: name, size: 13, style: "Medium", color: C.coral });
    pill.appendChild(t);
    pill.x = px;
    pill.y = 44;
    fireCard.appendChild(pill);
    px += t.width + 38;
  }

  // 결과 박스
  const resultW = 380, resultH = 80;
  const result = figma.createFrame();
  result.resize(resultW, resultH);
  result.fills = solidPaint(C.card);
  result.strokes = solidPaint(C.mint);
  result.strokeWeight = 2;
  result.cornerRadius = 14;
  centerX(result, W);
  result.y = 480;
  frame.appendChild(result);

  const resLabel = await createText({ text: "최종 매출", size: 14, style: "Regular", color: C.textDim, textAlignHorizontal: "CENTER", width: resultW });
  resLabel.y = 10;
  result.appendChild(resLabel);

  const resVal = await createRichText({
    segments: [
      { text: "2,400만원", style: "Black", color: C.mint },
      { text: "  KPI 대비 480%", style: "Light", color: C.textDim, size: 15 },
    ],
    size: 40, defaultStyle: "Black", textAlignHorizontal: "CENTER", width: resultW,
  });
  resVal.y = 34;
  result.appendChild(resVal);
}

async function buildSlide15(frame) {
  const label = await createText({ text: "SUMMARY", size: 12, style: "Bold", color: C.textDim, letterSpacing: 4, textAlignHorizontal: "CENTER", width: W });
  label.y = 180;
  frame.appendChild(label);

  const title = await createText({ text: "오늘 나눈 이야기", size: 30, style: "Bold", color: C.text, textAlignHorizontal: "CENTER", width: W });
  title.y = 220;
  frame.appendChild(title);

  // 2열 카드
  const pillars = [
    { labelText: "PILLAR 1", labelColor: C.mint, title: "퍼널", titleColor: C.mint, desc: "고객의 언어로 입구를 만들고,\n구간별 디테일로 이탈을 줄이고,\n데이터로 쪼개서 봅니다." },
    { labelText: "PILLAR 2", labelColor: C.lavender, title: "CRM 로드맵", titleColor: C.lavender, desc: "터치포인트를 점검하고,\n세그먼트를 나누고,\n맞춤 캠페인을 설계합니다." },
  ];
  const cw = 360, ch = 240, gap = 20;
  const startX = (W - (cw * 2 + gap)) / 2;
  for (let i = 0; i < 2; i++) {
    const p = pillars[i];
    const card = createCard({ width: cw, height: ch, radius: 14 });
    card.x = startX + i * (cw + gap);
    card.y = 290;
    frame.appendChild(card);

    const lbl = await createText({ text: p.labelText, size: 11, style: "Bold", color: p.labelColor, letterSpacing: 2 });
    lbl.x = 22; lbl.y = 22;
    card.appendChild(lbl);

    const t = await createText({ text: p.title, size: 20, style: "Black", color: p.titleColor });
    t.x = 22; t.y = 48;
    card.appendChild(t);

    const d = await createText({ text: p.desc, size: 14, style: "Light", color: C.textSub, width: cw - 44, lineHeight: 24 });
    d.x = 22; d.y = 90;
    card.appendChild(d);
  }

  // 원칙 바
  const barW = cw * 2 + gap;
  const bar = createCard({ width: barW, height: 56, radius: 14 });
  bar.x = startX;
  bar.y = 555;
  frame.appendChild(bar);

  const barText = await createRichText({
    segments: [
      { text: "그리고 기회가 올 때, ", style: "Light", color: C.textSub },
      { text: "모든 채널을 유기적으로", style: "Bold", color: C.coral },
      { text: " 쏟아붓습니다.", style: "Light", color: C.textSub },
    ],
    size: 16, defaultStyle: "Light", textAlignHorizontal: "CENTER", width: barW,
  });
  barText.y = 16;
  bar.appendChild(barText);

  const foot = await createText({ text: "이 모든 것을 설계하는 것. 그게 이커머스이고, 그게 진짜 마케팅입니다.", size: 18, style: "Light", color: C.textSub, textAlignHorizontal: "CENTER", width: W, lineHeight: 32 });
  foot.y = 640;
  frame.appendChild(foot);
}

async function buildSlide16(frame) {
  const title = await createText({ text: "Q&A", size: 46, style: "Black", color: C.text, textAlignHorizontal: "CENTER", width: W });
  title.y = 440;
  frame.appendChild(title);

  const body = await createText({ text: "궁금하신 점 있으시면 편하게 질문해주세요.", size: 20, style: "Light", color: C.textSub, textAlignHorizontal: "CENTER", width: W });
  body.y = 520;
  frame.appendChild(body);
}

// ============================================================
// 메인 실행
// ============================================================
async function main() {
  // 폰트 사전 로드
  const fontStyles = ["Light", "Regular", "Medium", "Bold", "Black"];
  for (const style of fontStyles) {
    await figma.loadFontAsync({ family: FONT, style });
  }

  const slideNames = [
    "타이틀",
    "우리가 아는 마케팅",
    "진짜 팔렸을까?",
    "이커머스에 필요한 것들",
    "리솔츠 소개",
    "매출 = 모든 것",
    "Teaforest — 고객의 언어",
    "ROAS 결과",
    "퍼널 깔대기",
    "이탈 디테일",
    "구간별 데이터",
    "CRM 3레이어",
    "리솔츠 CRM 실제 사례",
    "베지어트 올영 라이브",
    "Summary",
    "Q&A",
  ];

  const builders = [
    buildSlide01, buildSlide02, buildSlide03, buildSlide04,
    buildSlide05, buildSlide06, buildSlide07, buildSlide08,
    buildSlide09, buildSlide10, buildSlide11, buildSlide12,
    buildSlide13, buildSlide14, buildSlide15, buildSlide16,
  ];

  const frames = [];
  for (let i = 0; i < 16; i++) {
    const f = createSlideFrame(i, slideNames[i]);
    frames.push(f);
  }

  for (let i = 0; i < 16; i++) {
    await builders[i](frames[i]);
    // 프로그레스 바 + 페이지 번호
    createProgressBar(frames[i], i, 16);
    await createPageNumber(frames[i], i, 16);
  }

  // 뷰포트를 첫 슬라이드로 이동
  figma.viewport.scrollAndZoomIntoView(frames);

  figma.notify(`✅ 16장 슬라이드 생성 완료!`);
  figma.closePlugin();
}

main();
