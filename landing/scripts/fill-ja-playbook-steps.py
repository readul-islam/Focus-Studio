"""Copy EN playbook steps/prompts into ja-JP where missing (prompts stay EN for AI use)."""
from __future__ import annotations

import json
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
en = json.loads((ROOT / "messages/en-US.json").read_text(encoding="utf-8"))
ja_path = ROOT / "messages/ja-JP.json"
ja = json.loads(ja_path.read_text(encoding="utf-8"))

en_ch = en["resourcesAiPlaybook"]["chapters"]
ja_ch = ja.setdefault("resourcesAiPlaybook", {}).setdefault("chapters", {})

for chapter_id, en_data in en_ch.items():
    ja_chapter = ja_ch.setdefault(chapter_id, {})
    if "steps" not in ja_chapter and "steps" in en_data:
        ja_chapter["steps"] = en_data["steps"]
    if "prompts" not in ja_chapter and "prompts" in en_data:
        ja_chapter["prompts"] = en_data["prompts"]

ja_path.write_text(json.dumps(ja, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")
print("Filled ja-JP playbook steps/prompts from en-US")
