"""
datarise 광고 소재 디자인 시스템
모든 카드뉴스/광고 이미지에 일관된 톤앤매너를 적용한다.
"""

# 컬러 팔레트
COLORS = {
    # Primary
    "primary": "#2563EB",       # 메인 블루
    "primary_dark": "#1D4ED8",  # 다크 블루
    "primary_light": "#DBEAFE", # 라이트 블루 배경

    # Accent
    "accent_orange": "#FF6B35",
    "accent_yellow": "#FFD54F",
    "accent_green": "#16A34A",
    "accent_purple": "#7C3AED",

    # Neutral
    "black": "#0A0A0A",
    "dark": "#0F172A",
    "gray_900": "#1E293B",
    "gray_700": "#374151",
    "gray_500": "#6B7280",
    "gray_300": "#D1D5DB",
    "gray_100": "#F3F4F6",
    "white": "#FFFFFF",

    # Background themes
    "bg_dark": "#0F172A",
    "bg_light": "#F8FAFC",
}

# 폰트 (시스템 + 웹폰트)
FONTS = {
    "heading": "'Pretendard', 'Apple SD Gothic Neo', sans-serif",
    "body": "'Pretendard', 'Apple SD Gothic Neo', sans-serif",
}

# 공통 CSS
BASE_CSS = """
@import url('https://cdn.jsdelivr.net/gh/orioncactus/pretendard@v1.3.9/dist/web/static/pretendard.min.css');

* {
    margin: 0;
    padding: 0;
    box-sizing: border-box;
}

body {
    width: 1080px;
    height: 1080px;
    overflow: hidden;
    font-family: 'Pretendard', 'Apple SD Gothic Neo', sans-serif;
    -webkit-font-smoothing: antialiased;
}

.slide {
    width: 1080px;
    height: 1080px;
    position: relative;
    display: flex;
    flex-direction: column;
}
"""

# 다크 테마 CSS
DARK_THEME_CSS = """
.slide {
    background: linear-gradient(180deg, #0F172A 0%, #0A0A0A 100%);
    color: #FFFFFF;
}

.tag {
    display: inline-block;
    font-size: 22px;
    font-weight: 500;
    padding: 8px 20px;
    border-radius: 100px;
    margin-bottom: 20px;
}

.hook {
    font-size: 28px;
    font-weight: 400;
    color: #94A3B8;
    line-height: 1.5;
    margin-bottom: 16px;
}

.headline {
    font-size: 52px;
    font-weight: 800;
    line-height: 1.35;
    letter-spacing: -1px;
    margin-bottom: 20px;
}

.sub {
    font-size: 24px;
    font-weight: 400;
    color: #94A3B8;
    line-height: 1.6;
}

.highlight-yellow { color: #FFD54F; }
.highlight-orange { color: #FF6B35; }
.highlight-blue { color: #60A5FA; }
.highlight-green { color: #4ADE80; }
.highlight-purple { color: #A78BFA; }
.highlight-white { color: #FFFFFF; }

.bg-yellow { background: #FFD54F; color: #0A0A0A; padding: 2px 8px; border-radius: 4px; }
.bg-orange { background: #FF6B35; color: #FFFFFF; padding: 2px 8px; border-radius: 4px; }
.bg-blue { background: #2563EB; color: #FFFFFF; padding: 2px 8px; border-radius: 4px; }

.cta-bar {
    position: absolute;
    bottom: 0;
    left: 0;
    right: 0;
    height: 88px;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 28px;
    font-weight: 700;
    color: #FFFFFF;
}

.logo {
    position: absolute;
    top: 40px;
    right: 44px;
    font-size: 24px;
    font-weight: 700;
    color: rgba(255,255,255,0.6);
    letter-spacing: 1px;
}

.content {
    flex: 1;
    display: flex;
    flex-direction: column;
    justify-content: center;
    padding: 60px 64px;
    padding-bottom: 120px;
}
"""

# 라이트 테마 CSS
LIGHT_THEME_CSS = """
.slide {
    background: linear-gradient(180deg, #F0F7FF 0%, #FFFFFF 50%, #F0F7FF 100%);
    color: #0F172A;
}

.tag {
    display: inline-block;
    font-size: 22px;
    font-weight: 600;
    padding: 8px 20px;
    border-radius: 100px;
    margin-bottom: 20px;
}

.hook {
    font-size: 28px;
    font-weight: 400;
    color: #6B7280;
    line-height: 1.5;
    margin-bottom: 16px;
}

.headline {
    font-size: 52px;
    font-weight: 800;
    line-height: 1.35;
    letter-spacing: -1px;
    color: #0F172A;
    margin-bottom: 20px;
}

.sub {
    font-size: 24px;
    font-weight: 400;
    color: #6B7280;
    line-height: 1.6;
}

.highlight-blue { color: #2563EB; }
.highlight-green { color: #16A34A; }

.cta-bar {
    position: absolute;
    bottom: 0;
    left: 0;
    right: 0;
    height: 88px;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 28px;
    font-weight: 700;
    color: #FFFFFF;
}

.logo {
    position: absolute;
    top: 40px;
    right: 44px;
    font-size: 24px;
    font-weight: 700;
    color: rgba(15,23,42,0.4);
    letter-spacing: 1px;
}

.content {
    flex: 1;
    display: flex;
    flex-direction: column;
    justify-content: center;
    padding: 60px 64px;
    padding-bottom: 120px;
}
"""
