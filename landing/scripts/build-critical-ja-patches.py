#!/usr/bin/env python3
"""Generate critical JA locale patches and blog title translations."""
from __future__ import annotations

import json
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
SCRIPTS = Path(__file__).resolve().parent
BLOG_JA = ROOT / "messages" / "blog" / "ja-JP.json"
BATCH15_JA = SCRIPTS / "i18n-patch-batch15.ja.json"

CHANGELOG_UPDATES_JA = {
    "changelogPage": {
        "updates": {
            "v26": {
                "date": "2026年5月",
                "version": "2.6",
                "changes": {
                    "zapierApi": {
                        "type": "new",
                        "title": "Zapier & スタジオAPI",
                        "description": "設定 → API & WebhooksでAPIキーと署名付きWebhookを作成。プロジェクトとクライアント向けRESTエンドポイント、新規プロジェクト・クライアント・請求書のイベント対応。",
                    },
                    "notionIntegration": {
                        "type": "new",
                        "title": "Notion連携",
                        "description": "スタジオ連携でNotionを接続—共有データベースを閲覧、プロジェクト同期用にマッピング、行をFocuspilotプロジェクトに取り込み。",
                    },
                    "integrationsSettings": {
                        "type": "improvement",
                        "title": "連携設定",
                        "description": "各アプリの接続/切断とNotion設定パネル（閲覧、マッピング、同期）を備えたすっきりした連携カード。",
                    },
                },
            },
            "v25": {
                "date": "2026年5月",
                "version": "2.5",
                "changes": {
                    "gmailIntegration": {
                        "type": "new",
                        "title": "Gmail連携",
                        "description": "設定 → スタジオ → 連携でGmailを接続し、メッセージをAIインボックスに同期。クライアントメールを一つのワークスペースに。",
                    },
                    "googleCalendar": {
                        "type": "new",
                        "title": "Googleカレンダー接続",
                        "description": "スタジオ連携からGoogleカレンダーをリンクし、スタジオカレンダーでマイカレンダーをオンにして個人のGoogleイベントを表示・追加。",
                    },
                    "projectCalendarEvents": {
                        "type": "new",
                        "title": "プロジェクトカレンダーイベント",
                        "description": "特定プロジェクトまたは全プロジェクトにイベントを追加—グリッドと日詳細パネルに表示。",
                    },
                    "calendarEventDisplay": {
                        "type": "improvement",
                        "title": "カレンダーイベント表示",
                        "description": "イベントチップはテキストと背景色を一致、長いタイトルは省略表示、ホバーで全文表示、他の日付に重ならない。",
                    },
                    "projectCalendarFiltering": {
                        "type": "fix",
                        "title": "プロジェクトカレンダーフィルター",
                        "description": "日付処理とプロジェクトフィルターを修正し、全プロジェクト・単一プロジェクトビューで正しい日にイベントが表示。",
                    },
                },
            },
            "v24": {
                "date": "2025年1月",
                "version": "2.4",
                "changes": {
                    "aiEmailDrafting": {"type": "new", "title": "AIメール下書き", "description": "プロジェクトコンテキストとコミュニケーション履歴に基づきAIがクライアントメールを下書き。"},
                    "bulkPoGeneration": {"type": "new", "title": "一括発注書作成", "description": "調達スケジュールから複数の発注書を一度に作成。"},
                    "fasterDashboard": {"type": "improvement", "title": "ダッシュボード高速化", "description": "データ取得の最適化によりプロジェクトダッシュボードの読み込みが50%高速化。"},
                    "contractorPortal": {"type": "new", "title": "施工業者ポータル", "description": "施工業者に仕様、スケジュール、コミュニケーションへの安全なアクセスを提供。"},
                },
            },
            "v23": {
                "date": "2024年12月",
                "version": "2.3",
                "changes": {
                    "clientPortalPayments": {"type": "new", "title": "クライアントポータル決済", "description": "Stripe連携でクライアントがポータル内で請求書を直接支払い。"},
                    "xeroTwoWaySync": {"type": "new", "title": "Xero双方向同期", "description": "請求書と経費についてXero会計との完全双方向同期。"},
                    "pdfExport": {"type": "fix", "title": "PDFエクスポート", "description": "表と画像に影響する提案書PDFのフォーマット問題を修正。"},
                    "mobileNavigation": {"type": "improvement", "title": "モバイルナビゲーション", "description": "主要機能への素早いアクセスのためモバイルメニューを再設計。"},
                },
            },
            "v22": {
                "date": "2024年11月",
                "version": "2.2",
                "changes": {
                    "aiProductSourcing": {"type": "new", "title": "AI製品調達", "description": "サプライヤーカタログから代替製品と卸価格を自動検索。"},
                    "mobileExperience": {"type": "improvement", "title": "モバイル体験", "description": "オフライン対応の現場利用向けモバイルUIを再設計。"},
                    "search": {"type": "improvement", "title": "検索", "description": "あいまい一致でプロジェクト、製品、連絡先の検索が大幅に高速化。"},
                    "calendarSync": {"type": "fix", "title": "カレンダー同期", "description": "プロジェクトマイルストーンのGoogleカレンダー同期問題を解決。"},
                },
            },
            "v21": {
                "date": "2024年10月",
                "version": "2.1",
                "changes": {
                    "projectTemplates": {"type": "new", "title": "プロジェクトテンプレート", "description": "一貫したワークフローのためチーム間でプロジェクトテンプレートを作成・共有。"},
                    "timeTracking": {"type": "new", "title": "時間トラッキング", "description": "タスクごとに請求可能時間を記録し、請求書を自動生成。"},
                    "clientPortal": {"type": "improvement", "title": "クライアントポータル", "description": "コメントスレッドと改訂履歴を備えた新しい承認ワークフロー。"},
                },
            },
        }
    }
}

BLOG_TITLE_JA = {
    "interior-design-project-management-guide": {"title": "インテリアデザイン・プロジェクト管理：デザイナー向け完全ガイド", "excerpt": "美しいデザインは仕事の半分。スコープ、コミュニケーション、現場リーダーシップ、クライアント選定、システムが創造的ビジョンを収益性の高いストレスフリーな納品に変える方法。", "readTime": "18分"},
    "construction-management-interior-designers": {"title": "インテリアデザイナー向け施工管理：予測可能な業務を構築", "excerpt": "デザインのみではスケールしにくい。施工管理の重要性、現場での役割、プロジェクトと利益を守る施工チームの構築。", "readTime": "14分"},
    "best-interior-design-software-uk": {"title": "英国スタジオ向け最高のインテリアデザイン・プロジェクト管理ソフト（2026）", "excerpt": "英国のデザイナーが求めるスタジオソフト：Xero連携、VAT対応請求、RIBAに沿ったフェーズ、クライアントポータル、調達。", "readTime": "10分"},
    "best-interior-design-software-us": {"title": "米国ファーム向け最高のインテリアデザイン・プロジェクト管理ソフト（2026）", "excerpt": "QuickBooks対応、クライアントポータル、調達、収益性追跡—ソロから多拠点チームまでスケールするソフト選び。", "readTime": "10分"},
    "brief-to-task-map-in-minutes": {"title": "クライアントブリーフから数分でタスクマップへ", "excerpt": "キックオフメモをフェーズ別タスク、担当者、期限に—毎週スプレッドシートを作り直す必要なく。", "readTime": "7分"},
    "procurement-timelines-that-hold": {"title": "現場で守られる調達タイムライン", "excerpt": "バッファ、サプライヤー責任、クライアントに見えるステータスを備えたFF&Eスケジュール。", "readTime": "8分"},
    "email-to-action-items": {"title": "クライアントメールを自動でアクション項目に", "excerpt": "受信トレイのノイズから決定、期限、RFIを抽出する方法。", "readTime": "6分"},
    "studio-operating-system-basics": {"title": "スケールするスタジオ・オペレーティングシステム", "excerpt": "12人スタジオが大規模ファーム並みの明確さで運営できる役割、ルーティン、ツール選定。", "readTime": "9分"},
    "client-portals-reduce-approval-delays": {"title": "承認遅延を減らすクライアントポータル", "excerpt": "セレクション承認、予算影響、次のマイルストーンを妨げる要因を一か所で。", "readTime": "7分"},
    "financial-visibility-per-project": {"title": "進行中プロジェクトすべての財務可視性", "excerpt": "リアルタイムのマージン、確定支出、予測フィー—プロジェクト中に収益性を修正。", "readTime": "8分"},
    "ai-workflows-for-design-studios": {"title": "デザインスタジオ向けAIワークフロー", "excerpt": "メール、調達、提案にAIを導入—スタジオの声とガードレールを保ちながら。", "readTime": "8分"},
    "scaling-your-design-team": {"title": "デザインチームをスケールする", "excerpt": "急成長するスタジオが文化を保ち、品質を維持し、新メンバーを数週間で戦力化。", "readTime": "10分"},
    "vendor-relationships-that-last": {"title": "長続きするベンダー関係", "excerpt": "サプライヤー、職人、メーカーとのパートナーシップ—価格交渉を超えた信頼。", "readTime": "7分"},
    "design-studio-pricing-models": {"title": "デザインスタジオの料金モデル比較", "excerpt": "固定フィー、時間単価、コストプラス、サブスクリプション—各モデルの長所と適したプロジェクト。", "readTime": "9分"},
    "remote-client-collaboration": {"title": "リモートクライアントとの効果的なコラボレーション", "excerpt": "対面キックオフなしでもプレミアム体験—ポータル、動画、非同期承認。", "readTime": "7分"},
    "onboard-designers-two-weeks": {"title": "2週間でデザイナーをオンボード", "excerpt": "新入デザイナーが初プロジェクトで自信を持てる構造化オンボーディング。", "readTime": "6分"},
}


def write_json(path: Path, data: dict) -> None:
    path.write_text(json.dumps(data, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")
    print(f"Wrote {path.name}")


def main() -> None:
    write_json(SCRIPTS / "i18n-patch-batch15-changelog-updates.ja.json", CHANGELOG_UPDATES_JA)

    blog = json.loads(BLOG_JA.read_text(encoding="utf-8"))
    for slug, ja in BLOG_TITLE_JA.items():
        if slug in blog.get("blogPosts", {}):
            blog["blogPosts"][slug].update(ja)
    write_json(BLOG_JA, blog)

    batch15 = json.loads(BATCH15_JA.read_text(encoding="utf-8"))
    batch15.setdefault("changelogPage", {}).setdefault("hero", {})["subtitle"] = (
        "Focuspilotの新機能をご確認ください。プロジェクト、調達、クライアント関係をより効率的に管理できるよう、毎週アップデートをリリースしています。"
    )
    write_json(BATCH15_JA, batch15)
    print("Done.")


if __name__ == "__main__":
    main()
