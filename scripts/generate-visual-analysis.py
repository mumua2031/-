from __future__ import annotations

import colorsys
import json
import re
from pathlib import Path

from PIL import Image

ROOT = Path(__file__).resolve().parents[1]
DATA_PATH = ROOT / "src" / "data.ts"
GENERATED_DIR = ROOT / "src" / "generated"
MANIFEST_DIR = ROOT / "import-manifests"

PATTERN_LABELS = {
    "N": ("自然纹样 (N)", "Nature Pattern (N)"),
    "H": ("人文 / 民俗纹样 (H)", "Humanities Pattern (H)"),
    "G": ("几何 / 抽象纹样 (G)", "Geometry Pattern (G)"),
}

MEANING_LABELS = {
    "B": ("吉祥祈福类 (B)", "Blessing (B)"),
    "S": ("精神信仰类 (S)", "Spiritual Belief (S)"),
    "L": ("生活志趣类 (L)", "Lifestyle (L)"),
}

COLOR_LABELS = {
    "R": ("红色系 (R)", "Red (R)"),
    "G": ("绿色系 (G)", "Green (G)"),
    "B": ("蓝色系 (B)", "Blue (B)"),
    "A": ("金色系 (A)", "Gold (A)"),
    "M": ("多色系 (M)", "Multicolor (M)"),
}

SUBJECT_KEYWORDS = [
    "九头凤",
    "凤凰",
    "彩凤",
    "凤",
    "龙",
    "仙鹤",
    "鹤",
    "鸳鸯",
    "牡丹",
    "荷花",
    "莲",
    "蝴蝶",
    "虎",
    "狮",
    "麒麟",
    "蝙蝠",
    "寿字",
    "福字",
    "黄鹤楼",
    "宝相花",
    "葡萄",
    "松鼠",
    "人物",
    "云纹",
    "花鸟",
]


def load_patterns() -> list[dict]:
    text = DATA_PATH.read_text(encoding="utf-8")
    match = re.search(r"export const mockPatterns: PatternGene\[] = (\[.*\]);\s*$", text, re.S)
    if not match:
        raise RuntimeError("Cannot locate mockPatterns array in src/data.ts")
    return json.loads(match.group(1))


def color_name(r: int, g: int, b: int) -> str:
    mx = max(r, g, b)
    mn = min(r, g, b)
    if mx < 35:
        return "黑色"
    if mx - mn < 18:
        if mx > 220:
            return "白色"
        if mx > 120:
            return "灰色"
        return "黑色"
    if r > 150 and g > 105 and b < 95:
        return "金色" if g > 135 else "棕色"
    hue, saturation, value = colorsys.rgb_to_hsv(r / 255, g / 255, b / 255)
    if saturation < 0.12:
        return "白色" if value > 0.86 else "灰色"
    degree = hue * 360
    if degree < 12 or degree >= 345:
        return "红色"
    if degree < 28:
        return "橙色"
    if degree < 55:
        return "黄色"
    if degree < 165:
        return "绿色"
    if degree < 255:
        return "蓝色"
    if degree < 305:
        return "紫色"
    return "粉色"


def compact_ratio(counts: dict[str, int]) -> str:
    total = sum(counts.values())
    if total <= 0:
        return "主色比例待原图复核。"
    top = []
    for name, count in sorted(counts.items(), key=lambda item: item[1], reverse=True):
        pct = round(count * 100 / total)
        if pct >= 4:
            top.append((name, pct))
        if len(top) >= 5:
            break
    return "，".join(f"{name}占比{pct}%" for name, pct in top)


def subject_from_name(name: str) -> str:
    found: list[str] = []
    for subject in SUBJECT_KEYWORDS:
        if subject in name and subject not in found:
            found.append(subject)
    if "凤凰" in found and "凤" in found:
        found.remove("凤")
    if "彩凤" in found and "凤" in found:
        found.remove("凤")
    if "九头凤" in found and "凤" in found:
        found.remove("凤")
    if "仙鹤" in found and "鹤" in found:
        found.remove("鹤")
    return "、".join(found[:3]) if found else "主体纹样"


def repetition_from_name(name: str) -> str:
    if any(key in name for key in ["双", "对", "鸳鸯"]):
        return "双主体呼应，辅助纹样环绕重复。"
    if any(key in name for key in ["群", "九", "五", "繁花", "四季", "百花"]):
        return "多单元分布，花叶或云水连续重复。"
    if any(key in name for key in ["缠枝", "云", "水波", "回纹"]):
        return "辅助纹样沿曲线连续重复。"
    return "主体单元突出，局部装饰重复。"


def analyze_image(path: Path) -> tuple[str, str, str]:
    if not path.exists():
        return "主色比例待原图复核。", "视觉重心待原图复核。", "对称关系待原图复核。"

    image = Image.open(path).convert("RGBA")
    image.thumbnail((360, 360))
    width, height = image.size
    pixels = image.load()
    counts: dict[str, int] = {}
    xs: list[int] = []
    ys: list[int] = []
    mask: list[list[bool]] = []

    for y in range(height):
        row: list[bool] = []
        for x in range(width):
            r, g, b, alpha = pixels[x, y]
            visible = alpha > 24
            if visible:
                xs.append(x)
                ys.append(y)
                name = color_name(r, g, b)
                counts[name] = counts.get(name, 0) + 1
            row.append(visible)
        mask.append(row)

    if not xs:
        return "主色比例待原图复核。", "视觉重心待原图复核。", "对称关系待原图复核。"

    cx = sum(xs) / len(xs) / width
    cy = sum(ys) / len(ys) / height
    horizontal_matches = 0
    horizontal_total = 0
    vertical_matches = 0
    vertical_total = 0

    for y in range(height):
        for x in range(width // 2):
            horizontal_total += 1
            if mask[y][x] == mask[y][width - 1 - x]:
                horizontal_matches += 1

    for y in range(height // 2):
        for x in range(width):
            vertical_total += 1
            if mask[y][x] == mask[height - 1 - y][x]:
                vertical_matches += 1

    horizontal_score = horizontal_matches / max(1, horizontal_total)
    vertical_score = vertical_matches / max(1, vertical_total)
    if horizontal_score > 0.88 and vertical_score > 0.88:
        symmetry = "近似中心均衡，横纵方向较稳定。"
    elif horizontal_score > 0.88:
        symmetry = "左右近似对称，上下层次有变化。"
    elif vertical_score > 0.88:
        symmetry = "上下近似对称，左右细节有变化。"
    else:
        symmetry = "非严格对称，以动态均衡组织画面。"

    dx = "居中" if 0.43 <= cx <= 0.57 else ("偏左" if cx < 0.43 else "偏右")
    dy = "" if 0.40 <= cy <= 0.60 else ("偏上" if cy < 0.40 else "偏下")
    return compact_ratio(counts), f"视觉重心{dx}{dy}。", symmetry


def expected_labels(pattern: dict) -> list[dict]:
    labels = []
    for code, mapping in (
        (pattern.get("patternCategory"), PATTERN_LABELS),
        (pattern.get("meaningCategory"), MEANING_LABELS),
        (pattern.get("colorCategory"), COLOR_LABELS),
    ):
        if code in mapping:
            zh, en = mapping[code]
            labels.append({"zh-CN": zh, "en": en})
    return labels


def main() -> None:
    patterns = load_patterns()
    visual: dict[str, dict] = {}
    audit_rows = []
    label_suggestions = []

    for pattern in patterns:
        he_code = pattern["heCode"]
        name = pattern["name"].get("zh-CN") or he_code
        subject = subject_from_name(name)
        ratio, center, symmetry = analyze_image(ROOT / "public" / pattern.get("imageUrl", "").lstrip("/"))
        carrier = pattern.get("carrier") or "绣片"

        original = f"以“{name}”为数字归档原纹样。"
        outline = f"保留{subject}外轮廓与主要装饰边界。"
        unit = f"{subject}为核心单元。"
        structure = f"{subject}为主体，结合{carrier}形制组织画面。"

        visual[he_code] = {
            "originalPattern": {"zh-CN": original, "en": original},
            "outlineExtraction": {"zh-CN": outline, "en": outline},
            "mainColorRatio": {"zh-CN": ratio, "en": ratio},
            "patternUnit": {"zh-CN": unit, "en": unit},
            "symmetry": {"zh-CN": symmetry, "en": symmetry},
            "repetition": {"zh-CN": repetition_from_name(name), "en": repetition_from_name(name)},
            "compositionCenter": {"zh-CN": center, "en": center},
            "structureDescription": {"zh-CN": structure, "en": structure},
        }

        canonical = (
            f"HE-{pattern.get('patternCategory', '')}{pattern.get('meaningCategory', '')}-"
            f"{pattern.get('colorCategory', '')}{int(pattern.get('sequence') or 0):02d}"
        )
        labels = expected_labels(pattern)
        labels_need_update = pattern.get("categoryLabels") != labels
        if labels_need_update:
            label_suggestions.append(
                {
                    "heCode": he_code,
                    "before": pattern.get("categoryLabels"),
                    "suggested": labels,
                }
            )
        audit_rows.append(
            {
                "heCode": he_code,
                "name": name,
                "canonicalHECode": canonical,
                "usesLegacyHECodeFormat": he_code != canonical,
                "mainColorRatio": ratio,
                "categoryLabelSuggestion": labels_need_update,
            }
        )

    GENERATED_DIR.mkdir(exist_ok=True)
    analysis_ts = "import type { PatternVisualAnalysis } from '../types';\n\n"
    analysis_ts += "export const patternVisualAnalysis: Record<string, PatternVisualAnalysis> = "
    analysis_ts += json.dumps(visual, ensure_ascii=False, indent=2)
    analysis_ts += ";\n"
    (GENERATED_DIR / "pattern-visual-analysis.ts").write_text(analysis_ts, encoding="utf-8")

    MANIFEST_DIR.mkdir(exist_ok=True)
    (MANIFEST_DIR / "archive-visual-audit.json").write_text(
        json.dumps({"labelSuggestions": label_suggestions, "rows": audit_rows}, ensure_ascii=False, indent=2),
        encoding="utf-8",
    )
    with (MANIFEST_DIR / "archive-visual-audit.csv").open("w", encoding="utf-8", newline="") as handle:
        handle.write("heCode,name,canonicalHECode,usesLegacyHECodeFormat,mainColorRatio,categoryLabelSuggestion\n")
        for row in audit_rows:
            values = [
                row["heCode"],
                row["name"],
                row["canonicalHECode"],
                row["usesLegacyHECodeFormat"],
                row["mainColorRatio"],
                row["categoryLabelSuggestion"],
            ]
            handle.write(",".join('"' + str(value).replace('"', '""') + '"' for value in values) + "\n")

    print(json.dumps({"patterns": len(patterns), "analysis": len(visual), "labelSuggestions": len(label_suggestions)}, ensure_ascii=False))


if __name__ == "__main__":
    main()
