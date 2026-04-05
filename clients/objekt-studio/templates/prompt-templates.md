# Prompt Template Library v0

> Phase 0 캘리브레이션에서 실제 테스트 후 v1으로 업그레이드.
> 카테고리별 프리셋은 레퍼런스 리서치 결과 반영하여 보완 예정.

---

## Base Structure

모든 프롬프트는 이 구조를 따른다:

```
[subject], [composition], [lighting], [background], [mood], [technical]
```

### Variable Definitions

| Variable | Description | Examples |
|----------|-------------|---------|
| subject | 제품 + 상태/배치 | "Aesop hand cream bottle, cap slightly open" |
| composition | 구도/앵글 | "centered top-down", "45-degree angle", "eye-level hero" |
| lighting | 광원 + 방향 + 강도 | "soft natural window light from left", "studio softbox, even" |
| background | 배경 소재 + 컬러 | "crumpled linen fabric, warm beige", "raw concrete surface" |
| mood | 전체 분위기 키워드 | "quiet luxury", "warm minimal", "raw and honest" |
| technical | 카메라/렌즈 시뮬레이션 | "shot on Phase One IQ4, 80mm, f/2.8, natural color" |

### Technical Presets

사진 같은 결과를 위한 카메라 시뮬레이션:

```
HIGH-END STUDIO: "shot on Phase One IQ4 150MP, Schneider 80mm f/2.8, studio lighting, medium format film look"
NATURAL LIGHT: "shot on Hasselblad X2D, XCD 90mm f/2.5, natural daylight, soft color science"
EDITORIAL: "shot on Canon EOS R5, RF 85mm f/1.2, dramatic lighting, fashion editorial grade"
MINIMAL: "shot on Fujifilm GFX100S, GF 110mm f/2, clean studio, muted tones"
```

---

## Brand Set Prompts (캐러셀용 세트)

### Hero Shot Template

```
[product full name and brand] placed [arrangement] on [surface/background],
[composition] composition, [lighting],
[mood] atmosphere, [props if any],
[technical preset],
professional commercial photography, 8k, ultra-detailed
```

### Detail Shot Template

```
extreme close-up of [specific detail — texture, label, material, cap, closure],
[product name by brand], macro photography,
[lighting — usually softer/more directional than hero],
shallow depth of field, f/2.0,
[background — blurred version of hero setup],
[technical preset]
```

### Angle Shot Template

```
[product name by brand] from [specific angle — low angle, overhead, three-quarter],
[different arrangement than hero],
[lighting — different quality/direction from hero for variety],
[background — same surface, different crop/framing],
[mood — same as hero but from different perspective],
[technical preset]
```

### Closing Shot Template

```
[brand mood scene — wider frame, environmental, atmospheric],
[product secondary or partially visible],
[emphasis on brand world — materials, textures, space],
[lighting — most atmospheric of the set],
[mood keyword intensified],
cinematic composition, [technical preset]
```

---

## Daily Object Prompt (싱글 이미지)

```
[product name], [brand],
[simple elegant composition — usually centered or rule of thirds],
[single dominant light source — afternoon sun, window light, spotlight],
[clean background — one material, one color tone],
[mood — one word: serene / tactile / sculptural / warm],
[technical preset],
minimalist still life photography
```

---

## Category Presets

### Beauty & Fragrance

```
BEAUTY HERO: "[product], placed on [marble slab / frosted glass / linen],
soft diffused studio light, slight reflection on surface,
clean minimal composition, muted warm tones,
quiet luxury aesthetic, negative space emphasis,
shot on Phase One IQ4, 80mm, f/4, color-accurate"

BEAUTY DETAIL: "macro detail of [texture — cream swirl, glass bottle refraction, label emboss],
soft directional side light, shallow depth of field,
[surface texture visible in bokeh],
tactile and sensorial, shot on Hasselblad X2D, 90mm macro, f/2.5"

BEAUTY DAILY: "[single product], centered on [surface],
golden hour window light from right,
[warm neutral background], serene and quiet,
shot on Fujifilm GFX100S, 110mm, f/2.8"
```

### Living & Home Objects

```
LIVING HERO: "[object], arranged on [wooden shelf / concrete pedestal / terrazzo],
natural daylight from large window, soft shadows,
architectural composition, geometric balance,
Scandinavian minimalism meets warmth,
shot on Hasselblad X2D, 65mm, f/4, natural color"

LIVING DETAIL: "close-up of [ceramic glaze / wick texture / glass edge / wood grain],
directional window light creating shadow play,
textural and honest, material-first approach,
shot on Phase One, 120mm macro, f/2.8"

LIVING DAILY: "[single object], [surface — oak table / stone slab],
morning side light, one long shadow,
sculptural and quiet, form-focused,
shot on Fujifilm GFX, 80mm, f/3.2"
```

### F&B Packaging

```
FNB HERO: "[package/bottle], [arrangement with complementary items — beans, leaves, fruit],
warm studio light mimicking morning sun,
[surface — kraft paper / raw wood / slate],
craft and intention, artisanal feeling,
shot on Canon EOS R5, 85mm, f/2.8, warm grade"

FNB DETAIL: "close-up of [label typography / seal / packaging texture / pour moment],
directional warm light, shallow DOF,
[background — blurred package or raw ingredient],
design-forward, detail-obsessed,
shot on Hasselblad, 90mm macro, f/2.5"

FNB DAILY: "[single package or bottle], [surface — linen / concrete / wood],
soft afternoon light, casual elegant placement,
honest and grounded, craft-meets-design,
shot on Fujifilm GFX, 110mm, f/2.8"
```

### Fashion Accessories

```
FASHION HERO: "[accessory], [dramatic placement — draped, standing, floating effect],
[studio lighting with controlled shadows — one key, one fill],
[surface — polished stone / glass / leather backdrop],
editorial edge, material and form emphasis,
shot on Canon EOS R5, RF 85mm f/1.2, editorial grade"

FASHION DETAIL: "extreme close-up of [leather grain / metal hardware / stitching / lens coating],
directional hard light creating texture contrast,
ultra-sharp, material worship,
shot on Phase One, 120mm macro, f/4, high detail"

FASHION DAILY: "[single accessory], [minimal surface — white / black / grey],
clean studio light, slight shadow for depth,
sculptural, design-object treatment,
shot on Hasselblad, 80mm, f/2.8"
```

---

## Anti-AI Prompt Additions

AI 티를 줄이기 위해 추가할 수 있는 요소들:

```
IMPERFECTION: "slight dust particles visible, minor surface imperfections, natural wear"
ANALOG FEEL: "subtle film grain, slightly warm color cast, not digitally perfect"
REAL PHYSICS: "physically accurate reflections, natural caustics, correct shadow falloff"
HUMAN TOUCH: "slightly asymmetric arrangement, casual not rigid placement"
ENVIRONMENT: "ambient light spill, background slightly out of focus with real bokeh circles"
```

### Usage

프롬프트 끝에 필요한 것만 추가:

```
[main prompt], [anti-AI addition 1], [anti-AI addition 2]
```

---

## Negative Prompt Guide

AI 이미지 생성 시 제외할 요소:

```
STANDARD NEGATIVE: "artificial looking, plastic texture, overly smooth,
CGI render, 3D render, illustration, drawing, painting,
watermark, text overlay, logo overlay,
oversaturated, HDR look, oversharpened,
perfect symmetry, too clean, sterile"

PRODUCT SPECIFIC: "wrong proportions, melted edges, floating objects,
incorrect reflections, impossible shadows,
merged objects, extra limbs if human present"
```

---

## Notes

- v0는 일반적인 상업 사진 프롬프트 패턴 기반
- Phase 0 툴 테스트에서 각 툴별 최적 프롬프트 스타일이 다를 수 있음 (Midjourney vs 힉스필드 vs Flux)
- 핀 맞추기 세션에서 OK 받은 프롬프트를 v1에 반영
- 카테고리 프리셋은 레퍼런스 리서치 결과로 디테일 보강 예정
