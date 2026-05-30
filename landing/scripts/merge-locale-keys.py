"""Deep-merge new keys from a patch JSON into locale message files."""
from __future__ import annotations

import json
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
PATCH_DIR = Path(__file__).resolve().parent
PATCH_FILES_EN = sorted(
    p for p in PATCH_DIR.glob("i18n-patch*.json") if not p.name.endswith(".ja.json")
)
PATCH_FILES_JA = sorted(PATCH_DIR.glob("i18n-patch*.ja.json"))


def deep_merge(base: dict, patch: dict) -> dict:
    for key, value in patch.items():
        if key in base and isinstance(base[key], dict) and isinstance(value, dict):
            deep_merge(base[key], value)
        else:
            base[key] = value
    return base


def merge_file(path: Path, patch: dict) -> None:
    data = json.loads(path.read_text(encoding="utf-8"))
    deep_merge(data, patch)
    path.write_text(json.dumps(data, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")
    print(f"Updated {path.name}")


def load_merged_patch(files: list[Path]) -> dict:
    merged: dict = {}
    for path in files:
        if not path.exists():
            print(f"Skipping missing patch: {path.name}")
            continue
        deep_merge(merged, json.loads(path.read_text(encoding="utf-8")))
    return merged


def main() -> None:
    en_patch = load_merged_patch(PATCH_FILES_EN)
    ja_patch = load_merged_patch(PATCH_FILES_JA)
    if en_patch:
        merge_file(ROOT / "messages" / "en-US.json", en_patch)
    if ja_patch:
        merge_file(ROOT / "messages" / "ja-JP.json", ja_patch)
    print("Done.")


if __name__ == "__main__":
    main()
