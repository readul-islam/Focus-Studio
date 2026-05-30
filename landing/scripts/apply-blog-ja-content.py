#!/usr/bin/env python3
"""Apply Japanese blog article bodies to messages/blog/ja-JP.json."""
from __future__ import annotations

import json
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
SCRIPTS = Path(__file__).resolve().parent
BLOG_JA = ROOT / "messages" / "blog" / "ja-JP.json"

sys.path.insert(0, str(SCRIPTS))
from blog_content_ja_data import BLOG_CONTENT_JA  # noqa: E402


def deep_merge(base: dict, overlay: dict) -> dict:
    result = dict(base)
    for key, value in overlay.items():
        if (
            key in result
            and isinstance(result[key], dict)
            and isinstance(value, dict)
        ):
            result[key] = deep_merge(result[key], value)
        else:
            result[key] = value
    return result


def main() -> None:
    blog = json.loads(BLOG_JA.read_text(encoding="utf-8"))
    patch = {"blogPosts": BLOG_CONTENT_JA}
    merged = deep_merge(blog, patch)

    en_starts = ("<p>As an ", "<p>Many interior", "<p>Most studios", "<p>Procurement is",
                 "<p>Client email", "<p>Talent alone", "<p>Approval delays", "<p>Studios often",
                 "<p>Biophilic design", "<p>Minimal cold", "<p>AI accelerates", "<p>Critique builds",
                 "<p>Fixed fees", "<p>Hiring is expensive", "<p>British interior", "<p>American interior")

    for slug, fields in BLOG_CONTENT_JA.items():
        content = fields.get("content", "")
        if any(content.startswith(s) for s in en_starts):
            print(f"WARN: {slug} content may still be English")

    BLOG_JA.write_text(
        json.dumps(merged, ensure_ascii=False, indent=2) + "\n",
        encoding="utf-8",
    )
    print(f"Updated {len(BLOG_CONTENT_JA)} posts in {BLOG_JA.relative_to(ROOT)}")


if __name__ == "__main__":
    main()
