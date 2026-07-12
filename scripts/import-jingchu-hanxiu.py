import json
import os
import re
import shutil
import zipfile
import xml.etree.ElementTree as ET
from collections import defaultdict
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
SOURCE_DIR = Path(r"C:\Users\Administrator\Desktop\毕设设计\汉绣纹样图库\荆楚汉绣")
DOCX_PATH = Path(r"C:\Users\Administrator\Desktop\毕设设计\汉绣纹样图库\书籍\荆楚汉绣.docx")
DATA_PATH = ROOT / "src" / "data.ts"
TRANSPARENT_DIR = ROOT / "public" / "patterns-transparent"
ORIGINAL_DIR = ROOT / "public" / "patterns"
MANIFEST_PATH = ROOT / "import-manifests" / "jingchu-hanxiu-import-audit.json"

CODE_RE = re.compile(r"^(HE-[NHG]-[BSL]-[RGBAM](\d{2}))\s*(.*?)\.(png|jpe?g)$", re.I)
DOC_CODE_RE = re.compile(r"HE-[NHG]-[BSL]-[RGBAM]\d{2}")

PATTERN_LABELS = {
    "N": ("自然纹样 (N)", "Nature Pattern (N)", "自然纹样"),
    "H": ("人文 / 民俗纹样 (H)", "Humanities Pattern (H)", "人文 / 民俗纹样"),
    "G": ("几何 / 抽象纹样 (G)", "Geometry Pattern (G)", "几何 / 抽象纹样"),
}

MEANING_LABELS = {
    "B": ("吉祥祈福类 (B)", "Blessing (B)", "吉祥祈福类"),
    "S": ("精神信仰类 (S)", "Spiritual Belief (S)", "精神信仰类"),
    "L": ("生活志趣类 (L)", "Lifestyle (L)", "生活志趣类"),
}

COLOR_LABELS = {
    "R": ("红色系 (R)", "Red (R)", "红色系"),
    "G": ("绿色系 (G)", "Green (G)", "绿色系"),
    "B": ("蓝色系 (B)", "Blue (B)", "蓝色系"),
    "A": ("金色系 (A)", "Gold (A)", "金色系"),
    "M": ("多色系 (M)", "Multicolor (M)", "多色系"),
}

FIELD_NAMES = [
    "标准名称",
    "纹样大类",
    "寓意大类",
    "色彩大类",
    "年代",
    "地域",
    "产地",
    "出土地/产地",
    "收藏单位",
    "载体",
    "工艺",
    "织造工艺",
    "刺绣工艺",
    "纹样内容",
    "来源",
    "版权",
    "版权说明",
    "创作者/传承人",
    "创作者",
    "传承人",
    "文化解读",
]

FIELD_RE = re.compile(
    r"(?:^|[\n\s])(?:\d+[.、]\s*)?("
    + "|".join(re.escape(name) for name in sorted(FIELD_NAMES, key=len, reverse=True))
    + r")\s*[：:]\s*"
)


def ml(value: str) -> dict:
    text = clean_text(value) or "暂无资料"
    return {"zh-CN": text, "en": text}


def clean_text(value: str) -> str:
    if not value:
        return ""
    value = re.sub(r"\s+", " ", value)
    value = re.sub(r"\s+---[\s\S]*$", "", value)
    value = re.sub(r"\s+#{2,}[\s\S]*$", "", value)
    value = re.sub(r"\s+总表单行[\s\S]*$", "", value)
    value = re.sub(r"\s+单行总览[\s\S]*$", "", value)
    value = re.sub(r"\s+藏品\s*\d+[\s\S]*$", "", value)
    value = re.sub(r"\s*(?:---|###?|表格|单行总览)\s*$", "", value)
    value = re.sub(r"\s*\|.*$", "", value)
    return value.strip(" \t\r\n-：:")


def code_parts(code: str):
    match = re.match(r"HE-([NHG])-([BSL])-([RGBAM])(\d{2})$", code)
    if not match:
        raise ValueError(f"Invalid HE code: {code}")
    return match.group(1), match.group(2), match.group(3), int(match.group(4))


def compact_id(code: str) -> str:
    pattern, meaning, color, sequence = code_parts(code)
    return f"HE-{pattern}{meaning}-{color}{sequence:02d}"


def parse_docx_text(path: Path) -> str:
    with zipfile.ZipFile(path) as docx:
        root = ET.fromstring(docx.read("word/document.xml"))
    ns = {"w": "http://schemas.openxmlformats.org/wordprocessingml/2006/main"}
    paragraphs = []
    for paragraph in root.findall(".//w:p", ns):
        text = "".join(node.text or "" for node in paragraph.findall(".//w:t", ns)).strip()
        if text:
            paragraphs.append(text)
    text = "\n".join(paragraphs)
    text = re.sub(r"\s+---\s+", "\n---\n", text)
    text = re.sub(r"\s+(#{1,4}\s*)", r"\n\1", text)
    text = re.sub(r"\s+(藏品\s*\d+\s+HE-)", r"\n\1", text)
    text = re.sub(r"\s+(新增\d+\s*\|)", r"\n\1", text)
    return text


def extract_fields(window: str) -> dict:
    matches = list(FIELD_RE.finditer(window))
    fields = {}
    for index, match in enumerate(matches):
        field = match.group(1)
        end = matches[index + 1].start() if index + 1 < len(matches) else len(window)
        fields[field] = clean_text(window[match.end() : end])
    return fields


def parse_doc_records(text: str) -> dict:
    occurrences = list(DOC_CODE_RE.finditer(text))
    candidates = defaultdict(list)

    for index, match in enumerate(occurrences):
        code = match.group(0)
        end = occurrences[index + 1].start() if index + 1 < len(occurrences) else min(len(text), match.start() + 5000)
        window = text[match.start() : end]
        fields = extract_fields(window)
        heading_tail = clean_text(window.split("\n", 1)[0].replace(code, ""))
        score = sum(1 for value in fields.values() if value) * 10 + min(len(window), 3500) / 3500
        candidates[code].append({"fields": fields, "headingTail": heading_tail, "score": score})

    records = {}
    for code, items in candidates.items():
        best = max(items, key=lambda item: item["score"])
        fields = best["fields"]
        name = fields.get("标准名称") or best["headingTail"]
        records[code] = {"fields": fields, "name": clean_text(name)}

    return records


def parse_source_images():
    rows = []
    for path in sorted(SOURCE_DIR.iterdir()):
        if not path.is_file():
            continue
        match = CODE_RE.match(path.name)
        if not match:
            continue
        rows.append(
            {
                "code": match.group(1).upper(),
                "fileName": path.name,
                "titleFromFile": clean_text(match.group(3)),
                "sourcePath": path,
                "extension": match.group(4).lower().replace("jpeg", "jpg"),
            }
        )
    return rows


def process_image(row: dict):
    code = row["code"]
    original_ext = row["extension"]
    original_target = ORIGINAL_DIR / f"{code}.{original_ext}"

    ORIGINAL_DIR.mkdir(parents=True, exist_ok=True)
    shutil.copy2(row["sourcePath"], original_target)

    return {
        "imageUrl": f"/patterns/{code}.{original_ext}",
        "originalImageUrl": f"/patterns/{code}.{original_ext}",
    }


def first_value(fields: dict, names: list[str]) -> str:
    for name in names:
        if fields.get(name):
            return fields[name]
    return ""


def build_pattern(row: dict, doc_record: dict | None, image_urls: dict) -> dict:
    code = row["code"]
    pattern_code, meaning_code, color_code, sequence = code_parts(code)
    fields = doc_record["fields"] if doc_record else {}
    name = (doc_record or {}).get("name") or row["titleFromFile"]
    if not name:
        name = row["titleFromFile"] or code

    region = first_value(fields, ["地域", "产地", "出土地/产地"]) or "暂无资料"
    source = first_value(fields, ["来源"])
    collection = first_value(fields, ["收藏单位"])
    if collection and source and collection not in source:
        origin = f"{source}；收藏单位：{collection}"
    else:
        origin = source or (f"图片文件夹导入：{row['fileName']}" if not doc_record else "暂无资料")

    craft = first_value(fields, ["工艺", "刺绣工艺", "织造工艺"]) or "暂无资料"
    motif = first_value(fields, ["纹样内容"]) or name
    culture = first_value(fields, ["文化解读"]) or "暂无资料"
    copyright_text = first_value(fields, ["版权", "版权说明"]) or "暂无资料"
    inheritor = first_value(fields, ["创作者/传承人", "创作者", "传承人"]) or "暂无资料"
    era = first_value(fields, ["年代"]) or "暂无资料"
    carrier = first_value(fields, ["载体"]) or "暂无资料"

    literature = (
        f"纹样判定：{motif}，归{PATTERN_LABELS[pattern_code][2]}；"
        f"寓意判定：按HE寓意分类归{MEANING_LABELS[meaning_code][2]}；"
        f"色彩判定：按HE色彩分类归{COLOR_LABELS[color_code][2]}"
    )

    if culture != "暂无资料":
        symbolism_text = culture
    else:
        symbolism_text = "暂无资料"

    return {
        "id": compact_id(code),
        "heCode": code,
        "patternCategory": pattern_code,
        "meaningCategory": meaning_code,
        "colorCategory": color_code,
        "sequence": sequence,
        "name": ml(name),
        "imageUrl": image_urls["imageUrl"],
        "originalImageUrl": image_urls["originalImageUrl"],
        "categoryLabels": [
            {"zh-CN": PATTERN_LABELS[pattern_code][0], "en": PATTERN_LABELS[pattern_code][1]},
            {"zh-CN": MEANING_LABELS[meaning_code][0], "en": MEANING_LABELS[meaning_code][1]},
            {"zh-CN": COLOR_LABELS[color_code][0], "en": COLOR_LABELS[color_code][1]},
        ],
        "era": era,
        "carrier": carrier,
        "region": region,
        "copyrightOwner": copyright_text,
        "format": "PNG",
        "resolution": "高清数字归档",
        "craft": ml(craft),
        "symbolism": ml(symbolism_text),
        "origin": ml(origin),
        "scenario": ml(MEANING_LABELS[meaning_code][2].replace("类", "")),
        "literature": ml(literature),
        "inheritor": ml(inheritor),
        "createdAt": "2026-07-12T00:00:00Z",
        "views": 1000 + (sum(ord(char) for char in code) % 2500),
    }


def read_existing_patterns():
    source = DATA_PATH.read_text(encoding="utf-8")
    match = re.search(r"export const mockPatterns: PatternGene\[] = ([\s\S]*);\s*$", source)
    if not match:
        raise RuntimeError("mockPatterns export not found")
    return source[: match.start()], json.loads(match.group(1))


def write_patterns(prefix: str, patterns: list[dict]):
    DATA_PATH.write_text(
        prefix + "export const mockPatterns: PatternGene[] = " + json.dumps(patterns, ensure_ascii=False, indent=2) + ";\n",
        encoding="utf-8",
    )


def main():
    doc_text = parse_docx_text(DOCX_PATH)
    doc_records = parse_doc_records(doc_text)
    image_rows = parse_source_images()
    prefix, existing = read_existing_patterns()
    existing_by_code = {pattern["heCode"]: pattern for pattern in existing}

    imported = []
    audit = []
    for row in image_rows:
        image_urls = process_image(row)
        doc_record = doc_records.get(row["code"])
        pattern = build_pattern(row, doc_record, image_urls)
        imported.append(pattern)
        audit.append(
            {
                "heCode": row["code"],
                "fileName": row["fileName"],
                "wordMatched": bool(doc_record),
                "replacedExisting": row["code"] in existing_by_code,
                "name": pattern["name"]["zh-CN"],
                "imageUrl": pattern["imageUrl"],
                "originalImageUrl": pattern["originalImageUrl"],
            }
        )

    import_codes = {pattern["heCode"] for pattern in imported}
    merged = [pattern for pattern in existing if pattern["heCode"] not in import_codes] + imported

    seen = set()
    duplicates = []
    for pattern in merged:
        if pattern["heCode"] in seen:
            duplicates.append(pattern["heCode"])
        seen.add(pattern["heCode"])
    if duplicates:
        raise RuntimeError(f"Duplicate HE codes after import: {duplicates}")

    write_patterns(prefix, merged)
    MANIFEST_PATH.parent.mkdir(parents=True, exist_ok=True)
    MANIFEST_PATH.write_text(
        json.dumps(
            {
                "sourceDir": str(SOURCE_DIR),
                "docxPath": str(DOCX_PATH),
                "imageCount": len(image_rows),
                "wordMatchedCount": sum(1 for item in audit if item["wordMatched"]),
                "missingWordRecords": [item for item in audit if not item["wordMatched"]],
                "replacedExistingCount": sum(1 for item in audit if item["replacedExisting"]),
                "finalPatternCount": len(merged),
                "items": audit,
            },
            ensure_ascii=False,
            indent=2,
        ),
        encoding="utf-8",
    )

    print(
        json.dumps(
            {
                "imageCount": len(image_rows),
                "wordMatchedCount": sum(1 for item in audit if item["wordMatched"]),
                "missingWordRecords": [item["heCode"] for item in audit if not item["wordMatched"]],
                "replacedExistingCount": sum(1 for item in audit if item["replacedExisting"]),
                "finalPatternCount": len(merged),
            },
            ensure_ascii=False,
        )
    )


if __name__ == "__main__":
    main()
