#!/usr/bin/env python3
"""Build messages/ja-JP.json from en-US.json (batch Japanese translation)."""
from __future__ import annotations

import json
import re
import time
from pathlib import Path

from deep_translator import GoogleTranslator

ROOT = Path(__file__).resolve().parents[1]
SRC = ROOT / "messages" / "en-US.json"
DST = ROOT / "messages" / "ja-JP.json"
BATCH = 80
SEP = "\n⟦SEP⟧\n"

PLACEHOLDER_RE = re.compile(r"(\{[^{}]+\})")

translator = GoogleTranslator(source="en", target="ja")


def protect(text: str) -> tuple[str, list[str]]:
    tokens: list[str] = []

    def repl(m: re.Match[str]) -> str:
        tokens.append(m.group(0))
        return f"⟦{len(tokens) - 1}⟧"

    return PLACEHOLDER_RE.sub(repl, text), tokens


def restore(text: str, tokens: list[str]) -> str:
    for i, tok in enumerate(tokens):
        text = text.replace(f"⟦{i}⟧", tok)
    return text


def collect_strings(obj, path: list[str], out: list[tuple[list[str], str]]) -> None:
    if isinstance(obj, dict):
        for k, v in obj.items():
            collect_strings(v, path + [k], out)
    elif isinstance(obj, list):
        for i, v in enumerate(obj):
            collect_strings(v, path + [str(i)], out)
    elif isinstance(obj, str):
        out.append((path, obj))


def set_at(root: dict, path: list[str], value: str) -> None:
    cur: dict | list = root
    for key in path[:-1]:
        cur = cur[int(key)] if isinstance(cur, list) else cur[key]
    last = path[-1]
    if isinstance(cur, list):
        cur[int(last)] = value
    else:
        cur[last] = value


def translate_batch(texts: list[str]) -> list[str]:
    protected = []
    all_tokens: list[list[str]] = []
    for t in texts:
        p, tok = protect(t)
        protected.append(p)
        all_tokens.append(tok)
    joined = SEP.join(protected)
    for attempt in range(4):
        try:
            translated = translator.translate(joined)
            break
        except Exception:
            time.sleep(2 ** attempt)
    else:
        translated = joined
    parts = translated.split(SEP)
    if len(parts) != len(texts):
        parts = [translator.translate(p) for p in protected]
    return [restore(parts[i], all_tokens[i]) for i in range(len(texts))]


def main() -> None:
    with open(SRC, encoding="utf-8") as f:
        data = json.load(f)

    items = []
    collect_strings(data, [], items)
    print(f"Translating {len(items)} strings in batches of {BATCH}...", flush=True)

    for i in range(0, len(items), BATCH):
        batch = items[i : i + BATCH]
        texts = [t for _, t in batch]
        translated = translate_batch(texts)
        for (path, _), ja in zip(batch, translated):
            set_at(data, path, ja)
        print(f"  {min(i + BATCH, len(items))}/{len(items)}", flush=True)
        time.sleep(0.3)

    with open(DST, "w", encoding="utf-8") as f:
        json.dump(data, f, ensure_ascii=False, indent=2)
        f.write("\n")
    print(f"Wrote {DST}", flush=True)


if __name__ == "__main__":
    main()
