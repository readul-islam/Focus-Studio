"""Export blog post content from lib/blog-data.ts to messages/blog/en-US.json."""
from __future__ import annotations

import json
import re
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
DEFAULT_SRC = ROOT / "lib" / "blog-data.ts"
OUT_DIR = ROOT / "messages" / "blog"
OUT = OUT_DIR / "en-US.json"

AUTHOR_MAP = {
    "AUTHORS.maya": "maya",
    "AUTHORS.james": "james",
    "AUTHORS.elena": "elena",
    "AUTHORS.priya": "priya",
}


def extract_posts(source: str) -> list[dict]:
    block = source.split("export const blogPosts")[1].split("\n]\n")[0]
    chunks = re.split(r"\n  \{", block)
    posts: list[dict] = []
    for chunk in chunks:
        if "slug:" not in chunk:
            continue
        slug_m = re.search(r'slug: "([^"]+)"', chunk)
        if not slug_m:
            continue
        slug = slug_m.group(1)

        def qfield(name: str) -> str | None:
            m = re.search(rf'{name}: "((?:\\.|[^"\\])*)"', chunk, re.DOTALL)
            if not m:
                return None
            return bytes(m.group(1), "utf-8").decode("unicode_escape")

        title = qfield("title") or ""

        excerpt_m = re.search(
            r'excerpt:\s*\n\s*"((?:[^"\\]|\\.)*)"',
            chunk,
            re.DOTALL,
        )
        excerpt = excerpt_m.group(1) if excerpt_m else (qfield("excerpt") or "")
        excerpt = bytes(excerpt, "utf-8").decode("unicode_escape")
        read_time = qfield("readTime") or ""

        cat_m = re.search(r'category: "([^"]+)"', chunk)
        category = cat_m.group(1) if cat_m else "workflow"

        tags_m = re.search(r"tags: \[(.*?)\]", chunk, re.DOTALL)
        tags: list[str] = []
        if tags_m:
            tags = re.findall(r'"([^"]+)"', tags_m.group(1))

        pub_m = re.search(r'publishedAt: "([^"]+)"', chunk)
        published_at = pub_m.group(1) if pub_m else ""

        feat_m = re.search(r"featured: true", chunk)
        featured = bool(feat_m)

        img_m = re.search(r'featuredImage: "([^"]+)"', chunk)
        featured_image = img_m.group(1) if img_m else ""

        auth_m = re.search(r"author: (AUTHORS\.\w+)", chunk)
        author_id = AUTHOR_MAP.get(auth_m.group(1), "elena") if auth_m else "elena"

        content_m = re.search(r"content: `\s*(.*?)\s*`,", chunk, re.DOTALL)
        content = content_m.group(1).strip() if content_m else ""

        posts.append(
            {
                "slug": slug,
                "category": category,
                "tags": tags,
                "publishedAt": published_at,
                "readTime": read_time,
                "featured": featured,
                "featuredImage": featured_image,
                "authorId": author_id,
                "title": title,
                "excerpt": excerpt,
                "content": content,
            }
        )
    return posts


def main() -> None:
    import sys

    src_path = Path(sys.argv[1]) if len(sys.argv) > 1 else DEFAULT_SRC
    if not src_path.exists():
        # Fall back to git version when blog-data.ts was slimmed down
        import subprocess

        for git_path in ("landing/lib/blog-data.ts", "lib/blog-data.ts"):
            try:
                source = subprocess.check_output(
                    ["git", "show", f"HEAD:{git_path}"],
                    cwd=ROOT.parent,
                    text=True,
                    encoding="utf-8",
                )
                break
            except subprocess.CalledProcessError:
                source = None
        if not source:
            raise SystemExit(f"Cannot find blog source at {src_path}")
    else:
        source = src_path.read_text(encoding="utf-8")
    posts = extract_posts(source)
    blog_posts = {
        p["slug"]: {
            "title": p["title"],
            "excerpt": p["excerpt"],
            "content": p["content"],
            "readTime": p["readTime"],
        }
        for p in posts
    }
    blog_meta = [
        {
            "slug": p["slug"],
            "category": p["category"],
            "tags": p["tags"],
            "publishedAt": p["publishedAt"],
            "featured": p.get("featured", False),
            "featuredImage": p["featuredImage"],
            "authorId": p["authorId"],
        }
        for p in posts
    ]
    OUT_DIR.mkdir(parents=True, exist_ok=True)
    OUT.write_text(
        json.dumps(
            {
                "blogAuthors": {
                    "maya": {"name": "Maya Okonkwo", "role": "Head of Product"},
                    "james": {"name": "James Whitfield", "role": "Studio Operations Lead"},
                    "elena": {"name": "Elena Vasquez", "role": "Senior Interior Designer"},
                    "priya": {"name": "Priya Nair", "role": "Client Experience"},
                },
                "blogPosts": blog_posts,
            },
            ensure_ascii=False,
            indent=2,
        )
        + "\n",
        encoding="utf-8",
    )
    (ROOT / "scripts" / "blog-post-meta.json").write_text(
        json.dumps(blog_meta, ensure_ascii=False, indent=2) + "\n", encoding="utf-8"
    )
    print(f"Exported {len(posts)} posts to {OUT}")


if __name__ == "__main__":
    main()
