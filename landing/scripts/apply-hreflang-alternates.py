#!/usr/bin/env python3
"""Replace canonical-only alternates with localeHreflangAlternates() in metadata files."""
from __future__ import annotations

import re
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
APP = ROOT / "app"

IMPORT_LINE = 'import { localeHreflangAlternates } from "@/lib/seo-alternates"\n'

# canonical URL -> path arg for localeHreflangAlternates (without leading slash)
CANONICAL_RE = re.compile(
    r"alternates:\s*\{\s*canonical:\s*(`[^`]+`|\"https://focuspilot\.io(?:/([^\"]+))?\")\s*,?\s*\}",
    re.MULTILINE | re.DOTALL,
)


def path_from_canonical(match: re.Match[str]) -> tuple[str, bool]:
    raw = match.group(1)
    if raw.startswith("`"):
        inner = raw[1:-1]
        if inner.startswith("https://focuspilot.io/"):
            return inner.removeprefix("https://focuspilot.io/"), False
        return inner, True
    path = match.group(2) or ""
    return path, False


def replacement_for(path: str, is_template_literal: bool = False) -> str:
    if is_template_literal:
        return f"alternates: localeHreflangAlternates(`{path}`)"
    if not path:
        return "alternates: localeHreflangAlternates()"
    return f'alternates: localeHreflangAlternates("{path}")'


def update_file(path: Path) -> bool:
    text = path.read_text(encoding="utf-8")
    if "localeHreflangAlternates" in text:
        # Still update if canonical blocks remain
        if not CANONICAL_RE.search(text):
            return False
    elif "alternates: { canonical" not in text and not CANONICAL_RE.search(text):
        return False

    new_text, count = CANONICAL_RE.subn(
        lambda m: replacement_for(*path_from_canonical(m)), text
    )
    if count == 0:
        return False

    if IMPORT_LINE.strip() not in new_text:
        # Insert after last import from next-intl or after first import block
        lines = new_text.splitlines(keepends=True)
        insert_at = 0
        for i, line in enumerate(lines):
            if line.startswith("import "):
                insert_at = i + 1
        lines.insert(insert_at, IMPORT_LINE)
        new_text = "".join(lines)

    path.write_text(new_text, encoding="utf-8")
    print(f"Updated {path.relative_to(ROOT)} ({count} alternates)")
    return True


def main() -> None:
    updated = 0
    for file in sorted(APP.rglob("*.tsx")):
        if update_file(file):
            updated += 1
    print(f"Done. {updated} files updated.")


if __name__ == "__main__":
    main()
