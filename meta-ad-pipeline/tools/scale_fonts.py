"""Scale all font-size values in HTML files by a given factor."""
import re
import sys

def scale_fonts(html_path: str, factor: float = 1.25):
    with open(html_path, 'r') as f:
        content = f.read()

    def replace_font_size(match):
        size = int(match.group(1))
        new_size = round(size * factor)
        # Round to nearest even for cleanliness
        if new_size % 2 != 0:
            new_size += 1
        return f"font-size: {new_size}px"

    updated = re.sub(r'font-size:\s*(\d+)px', replace_font_size, content)

    with open(html_path, 'w') as f:
        f.write(updated)

    # Count changes
    original_sizes = re.findall(r'font-size:\s*(\d+)px', content)
    new_sizes = re.findall(r'font-size:\s*(\d+)px', updated)
    print(f"Scaled {len(original_sizes)} font-size values by {factor}x in {html_path}")
    for old, new in zip(original_sizes[:8], new_sizes[:8]):
        print(f"  {old}px → {new}px")
    if len(original_sizes) > 8:
        print(f"  ... and {len(original_sizes) - 8} more")

if __name__ == "__main__":
    factor = float(sys.argv[2]) if len(sys.argv) > 2 else 1.25
    scale_fonts(sys.argv[1], factor)
