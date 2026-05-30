"use client"

import type React from "react"
import Image from "next/image"
import Link from "next/link"
import { useCallback, useMemo, useState } from "react"
import { useTranslations } from "next-intl"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { cn } from "@/lib/utils"
import { useToast } from "@/hooks/use-toast"
import { LandingHeroBackground } from "@/components/landing-hero-background"
import {
  CheckCircle2,
  XCircle,
  MessageSquare,
  Truck,
  Sparkles,
  PoundSterling,
  ClipboardList,
  ShoppingCart,
  CreditCard,
} from "lucide-react"
import { CtaButton } from "@/components/cta-button"
import { BreadcrumbSchema, usePlatformBreadcrumbs } from "@/components/seo/breadcrumb-schema"

const container = "mx-auto max-w-[1200px] px-6 sm:px-8"
const H1 = "text-[30px] sm:text-5xl md:text-[56px] font-medium tracking-tight leading-[1.1]"
const H2 = "text-2xl sm:text-[30px] md:text-4xl font-medium tracking-tight"
const Lead = "text-base sm:text-lg text-stone-600"

const CLAY = "#E07A57"
const OLIVE = "#6E7A58"
const SLATE = "#4B5960"
const OCHRE = "#C78A3B"

const APPROVAL_KEYS = ["chandelier", "art"] as const
const MESSAGE_KEYS = ["designer", "client", "vendor"] as const
const FAQ_KEYS = ["branding", "approveSelections", "payInvoices", "secure"] as const
const RELATED_LINKS = [
  { key: "projects", href: "/platform/projects", icon: ClipboardList },
  { key: "procurement", href: "/platform/procurement", icon: ShoppingCart },
  { key: "finance", href: "/platform/finance", icon: CreditCard },
  { key: "pricing", href: "/pricing", icon: Sparkles },
] as const

function SoftChip({ children, color = "#4E4943" }: { children: React.ReactNode; color?: string }) {
  return (
    <span
      className="inline-flex items-center rounded-full bg-stone-100 px-2 py-0.5 text-[11px] ring-1 ring-stone-200"
      style={{ color }}
    >
      {children}
    </span>
  )
}

function Kpi({
  label,
  value,
  accent,
  sub,
}: {
  label: string
  value: string
  accent: string
  sub?: string
}) {
  return (
    <div
      className="rounded-2xl bg-white px-5 py-4 text-center shadow-[0_6px_22px_rgba(0,0,0,0.06)] ring-1"
      style={{ ringColor: "rgba(0,0,0,0.06)" as React.CSSProperties["color"] }}
    >
      <div className="text-xs font-semibold tracking-wide text-stone-600">{label}</div>
      <div className="mt-1 text-2xl font-semibold text-stone-900">{value}</div>
      {sub ? <div className="mt-1 text-[11px] text-stone-500">{sub}</div> : null}
      <div className="mx-auto mt-3 h-1.5 w-10 rounded-full" style={{ backgroundColor: accent }} />
    </div>
  )
}

type ApprovalStatus = "pending" | "approved" | "declined"

type ApprovalItem = {
  id: string
  title: string
  room: string
  vendor: string
  price: string
  img: string
  status?: ApprovalStatus
}

function StatusPill({ status }: { status: ApprovalStatus }) {
  const t = useTranslations("platformClientPortal.status")

  if (status === "approved") {
    return (
      <span
        className="inline-flex items-center rounded-full px-3 py-1 text-xs font-semibold shadow-sm"
        style={{
          backgroundColor: "rgba(110,122,88,0.16)",
          color: "#4E6243",
          boxShadow: "inset 0 0 0 1px rgba(110,122,88,0.28)",
        }}
      >
        {t("approved")}
      </span>
    )
  }
  if (status === "declined") {
    return (
      <span
        className="inline-flex items-center rounded-full px-3 py-1 text-xs font-semibold shadow-sm"
        style={{
          backgroundColor: "rgba(224,122,87,0.12)",
          color: "#B75A41",
          boxShadow: "inset 0 0 0 1px rgba(224,122,87,0.28)",
        }}
      >
        {t("declined")}
      </span>
    )
  }
  return <SoftChip color={SLATE}>{t("awaitingDecision")}</SoftChip>
}

function ApprovalCard({
  item,
  onDecide,
}: {
  item: ApprovalItem
  onDecide: (id: string, status: ApprovalStatus, comment: string) => void
}) {
  const t = useTranslations("platformClientPortal.approvalCard")
  const [status, setStatus] = useState<ApprovalStatus>(item.status ?? "pending")
  const [comment, setComment] = useState("")
  const [busy, setBusy] = useState(false)

  const decide = useCallback(
    (next: ApprovalStatus) => {
      if (busy) return
      setBusy(true)
      setTimeout(() => {
        setStatus(next)
        onDecide(item.id, next, comment.trim())
        setBusy(false)
      }, 420)
    },
    [busy, comment, item.id, onDecide],
  )

  return (
    <Card className="overflow-hidden border-stone-200 shadow-sm">
      <CardContent className="p-0">
        <div className="grid gap-0 sm:grid-cols-[180px_1fr]">
          <div className="relative h-44 w-full bg-stone-50 sm:h-full">
            <Image
              src={item.img || "/placeholder.svg?height=360&width=360&query=product"}
              alt={t("imageAlt", { title: item.title })}
              fill
              sizes="(max-width: 768px) 100vw, 180px"
              className="object-cover"
            />
          </div>

          <div className="p-4 sm:p-5">
            <div className="flex flex-wrap items-start justify-between gap-2">
              <div>
                <div className="text-base font-semibold text-stone-900">{item.title}</div>
                <div className="mt-0.5 text-xs text-stone-600">
                  {item.room} • {item.vendor}
                </div>
              </div>
              <div className="text-right">
                <div className="text-lg font-semibold text-stone-900">{item.price}</div>
                <div className="mt-1">
                  <StatusPill status={status} />
                </div>
              </div>
            </div>

            <div className="mt-3">
              <label htmlFor={`comment-${item.id}`} className="text-xs font-medium text-stone-700">
                {t("commentLabel")}
              </label>
              <Textarea
                id={`comment-${item.id}`}
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                rows={2}
                placeholder={t("commentPlaceholder")}
                className="mt-1 resize-none"
              />
            </div>

            <div className="mt-3 flex items-center gap-2">
              <Button
                type="button"
                onClick={() => decide("approved")}
                disabled={busy || status === "approved"}
                className="inline-flex items-center gap-2"
                style={{ backgroundColor: "#3F4B51" }}
              >
                <CheckCircle2 className="h-4 w-4" />
                {t("approve")}
              </Button>
              <Button
                type="button"
                variant="outline"
                onClick={() => decide("declined")}
                disabled={busy || status === "declined"}
                className="inline-flex items-center gap-2"
              >
                <XCircle className="h-4 w-4" />
                {t("decline")}
              </Button>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

function MessagesSnapshot() {
  const t = useTranslations("platformClientPortal.messages")
  const td = useTranslations("platformClientPortal.demo.messages")

  const rows = useMemo(
    () =>
      MESSAGE_KEYS.map((key) => ({
        who: td(`${key}.who`),
        text: td(`${key}.text`),
        meta: td(`${key}.meta`),
        tag: td(`${key}.tag`),
      })),
    [td],
  )

  return (
    <Card className="overflow-hidden border-stone-200 shadow-sm">
      <CardContent className="p-4 sm:p-5">
        <div className="inline-flex items-center gap-2 text-sm font-semibold text-stone-900">
          <MessageSquare className="h-4 w-4" />
          {t("snapshotTitle")}
        </div>
        <div className="mt-3 rounded-lg ring-1 ring-stone-200">
          <ul className="divide-y divide-stone-200 bg-white">
            {rows.map((r, i) => (
              <li key={i} className="flex items-center justify-between gap-3 p-3">
                <div className="min-w-0">
                  <div className="truncate text-sm text-stone-900">
                    <span className="font-medium">{r.who}:</span> {r.text}
                  </div>
                  <div className="text-xs text-stone-600">{r.meta}</div>
                </div>
                <SoftChip color={SLATE}>{r.tag}</SoftChip>
              </li>
            ))}
          </ul>
        </div>

        <div className="relative mt-4 h-[260px] overflow-hidden rounded-xl ring-1 ring-stone-200 sm:h-[320px]">
          <Image
            src="/images/client-portal/messages-updates.png"
            alt={t("imageAlt")}
            fill
            className="object-cover"
            priority={false}
          />
        </div>
      </CardContent>
    </Card>
  )
}

function InvoiceCard({
  id,
  title,
  amount,
  status,
}: {
  id: string
  title: string
  amount: string
  status: "paid" | "unpaid"
}) {
  const t = useTranslations("platformClientPortal.invoices")
  const ts = useTranslations("platformClientPortal.status")
  const isPaid = status === "paid"

  return (
    <Card className="overflow-hidden border-stone-200 shadow-sm">
      <CardContent className="p-4 sm:p-5">
        <div className="flex items-start justify-between gap-3">
          <div>
            <div className="text-sm font-semibold text-stone-900">{title}</div>
            <div className="mt-1 text-xs text-stone-600">INV-{id}</div>
          </div>
          <div className="text-right">
            <div className="inline-flex items-center gap-1 text-lg font-semibold text-stone-900">
              <PoundSterling className="h-4 w-4" />
              {amount}
            </div>
            <div className="mt-1">
              {isPaid ? (
                <span
                  className="inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold"
                  style={{ backgroundColor: "rgba(110,122,88,0.16)", color: "#4E6243" }}
                >
                  {ts("paid")}
                </span>
              ) : (
                <span
                  className="inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold"
                  style={{ backgroundColor: "rgba(224,122,87,0.12)", color: "#B75A41" }}
                >
                  {ts("unpaid")}
                </span>
              )}
            </div>
          </div>
        </div>

        <div className="mt-3 flex flex-wrap gap-2">
          <SoftChip color={SLATE}>{t("tags.portal")}</SoftChip>
          <SoftChip color={OCHRE}>{t("tags.invoice")}</SoftChip>
        </div>

        <div className="mt-3 flex gap-2">
          {isPaid ? (
            <Button type="button" variant="outline" className="w-full bg-transparent">
              {t("downloadPdf")}
            </Button>
          ) : (
            <>
              <Button type="button" className="w-full" style={{ backgroundColor: "#3F4B51" }}>
                {t("payNow")}
              </Button>
              <Button type="button" variant="outline">
                {t("viewPdf")}
              </Button>
            </>
          )}
        </div>
      </CardContent>
    </Card>
  )
}

export function ClientPortalPageContent() {
  const t = useTranslations("platformClientPortal")
  const ts = useTranslations("platformShared")
  const { toast } = useToast()
  const breadcrumbs = usePlatformBreadcrumbs("clientPortal")

  const approvals: ApprovalItem[] = useMemo(
    () =>
      APPROVAL_KEYS.map((key) => ({
        id: t(`demo.approvals.${key}.id`),
        title: t(`demo.approvals.${key}.title`),
        room: t(`demo.approvals.${key}.room`),
        vendor: t(`demo.approvals.${key}.vendor`),
        price: t(`demo.approvals.${key}.price`),
        img:
          key === "chandelier"
            ? "/images/library/orbital-brass-chandelier.png"
            : "/images/library/abstract-canvas-art.png",
        status: "pending" as const,
      })),
    [t],
  )

  const onDecide = useCallback(
    (id: string, status: ApprovalStatus, comment: string) => {
      toast({
        title: status === "approved" ? t("toast.approved") : t("toast.declined"),
        description: comment
          ? t("toast.noteWithComment", { comment })
          : t("toast.selectionStatus", { status }),
      })
    },
    [toast, t],
  )

  const faqSchema = useMemo(
    () => ({
      "@context": "https://schema.org",
      "@type": "FAQPage",
      mainEntity: FAQ_KEYS.map((key) => ({
        "@type": "Question",
        name: t(`faq.items.${key}.question`),
        acceptedAnswer: {
          "@type": "Answer",
          text: t(`faq.items.${key}.answer`),
        },
      })),
    }),
    [t],
  )

  return (
    <>
      <BreadcrumbSchema items={breadcrumbs} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }} />

      <main className="bg-white">
        <section className="relative isolate overflow-hidden bg-stone-50 pb-10 pt-12 sm:pb-12 sm:pt-16 md:pt-20">
          <LandingHeroBackground gridHeight="min(520px, 56vh)" gridFadeStop={0.58} />
          <div className={cn(container, "relative z-10")}>
            <div className="mx-auto max-w-3xl text-center">
              <Badge variant="outline" className="rounded-full border-stone-300 bg-stone-50 text-stone-700">
                {t("hero.badge")}
              </Badge>
              <h1 className={cn("mt-4 text-center", H1)}>{t("hero.title")}</h1>
              <p className={cn("mt-4 text-center", Lead)}>{t("hero.subtitle")}</p>
              <p className="mt-3 text-center text-sm text-stone-500">{t("hero.note")}</p>
            </div>

            <div className="mx-auto mt-8 max-w-4xl">
              <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
                <Kpi
                  label={t("kpis.awaitingApproval.label")}
                  value={t("kpis.awaitingApproval.value")}
                  accent={CLAY}
                />
                <Kpi
                  label={t("kpis.messages.label")}
                  value={t("kpis.messages.value")}
                  sub={t("kpis.messages.sub")}
                  accent={SLATE}
                />
                <Kpi
                  label={t("kpis.invoices.label")}
                  value={t("kpis.invoices.value")}
                  sub={t("kpis.invoices.sub")}
                  accent={OCHRE}
                />
                <Kpi
                  label={t("kpis.deliveries.label")}
                  value={t("kpis.deliveries.value")}
                  sub={t("kpis.deliveries.sub")}
                  accent={OLIVE}
                />
              </div>
            </div>
          </div>
        </section>

        <section id="approvals" className="bg-white py-14 sm:py-20">
          <div className={container}>
            <div className="mx-auto max-w-3xl text-center">
              <h2 className={H2}>{t("approvals.title")}</h2>
              <p className={cn("mt-3", Lead)}>{t("approvals.subtitle")}</p>
            </div>

            <div className="mx-auto mt-8 grid max-w-6xl gap-4 md:grid-cols-2">
              {approvals.map((a) => (
                <ApprovalCard key={a.id} item={a} onDecide={onDecide} />
              ))}
            </div>

            <div className="mx-auto mt-6 flex max-w-6xl flex-wrap items-center justify-center gap-3 text-center text-xs text-stone-600">
              <SoftChip color={SLATE}>{t("approvals.chips.linkedToProject")}</SoftChip>
              <SoftChip color={OLIVE}>{t("approvals.chips.notifiesDesigner")}</SoftChip>
              <SoftChip color={CLAY}>{t("approvals.chips.keepsHistory")}</SoftChip>
            </div>
          </div>
        </section>

        <section id="client-view" className="bg-white py-14 sm:py-20">
          <div className={container}>
            <div className="mx-auto max-w-3xl text-center">
              <h2 className={H2}>{t("clientView.title")}</h2>
              <p className={cn("mt-3", Lead)}>{t("clientView.subtitle")}</p>
            </div>

            <div className="mx-auto mt-8 max-w-5xl">
              <div className="relative aspect-[16/9] overflow-hidden rounded-2xl ring-1 ring-stone-200">
                <Image
                  src="/images/client-portal/client-view-hero.png"
                  alt={t("clientView.imageAlt")}
                  fill
                  className="object-cover"
                  priority={false}
                />
              </div>
            </div>

            <div className="mx-auto mt-6 flex max-w-5xl flex-wrap items-center justify-center gap-3 text-xs text-stone-700">
              <SoftChip color={SLATE}>{t("clientView.chips.magicLinkAccess")}</SoftChip>
              <SoftChip color={OLIVE}>{t("clientView.chips.oneClickApprovals")}</SoftChip>
              <SoftChip color={CLAY}>{t("clientView.chips.brandedExperience")}</SoftChip>
            </div>
          </div>
        </section>

        <section id="messages" className="bg-white py-14 sm:py-20">
          <div className={container}>
            <div className="grid items-start gap-8 md:grid-cols-12">
              <div className="md:col-span-5">
                <h2 className={H2}>{t("messages.title")}</h2>
                <p className={cn("mt-3", Lead)}>{t("messages.subtitle")}</p>
                <ul className="mt-6 space-y-3 text-stone-800">
                  <li className="flex items-start gap-2">
                    <MessageSquare className="mt-0.5 h-5 w-5 text-stone-900" />
                    <span className="text-base">{t("messages.bullets.postReply")}</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <Truck className="mt-0.5 h-5 w-5 text-stone-900" />
                    <span className="text-base">{t("messages.bullets.deliveryUpdates")}</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <Sparkles className="mt-0.5 h-5 w-5 text-stone-900" />
                    <span className="text-base">{t("messages.bullets.aiSummaries")}</span>
                  </li>
                </ul>
              </div>
              <div className="md:col-span-7">
                <MessagesSnapshot />
              </div>
            </div>
          </div>
        </section>

        <section id="invoices" className="bg-white py-14 sm:py-20">
          <div className={container}>
            <div className="mx-auto max-w-3xl text-center">
              <h2 className={H2}>{t("invoices.title")}</h2>
              <p className={cn("mt-3", Lead)}>{t("invoices.subtitle")}</p>
            </div>

            <div className="mx-auto mt-8 grid max-w-5xl gap-4 md:grid-cols-2">
              <InvoiceCard
                id={t("demo.invoices.phase2Deposit.id")}
                title={t("demo.invoices.phase2Deposit.title")}
                amount={t("demo.invoices.phase2Deposit.amount")}
                status="unpaid"
              />
              <InvoiceCard
                id={t("demo.invoices.approvedPendants.id")}
                title={t("demo.invoices.approvedPendants.title")}
                amount={t("demo.invoices.approvedPendants.amount")}
                status="paid"
              />
            </div>

            <div className="mx-auto mt-6 flex max-w-5xl flex-wrap items-center gap-3 text-xs text-stone-600">
              <SoftChip color={OCHRE}>{t("invoices.chips.stripeSecured")}</SoftChip>
              <SoftChip color={SLATE}>{t("invoices.chips.pdfCopies")}</SoftChip>
              <SoftChip color={OLIVE}>{t("invoices.chips.statusUpdates")}</SoftChip>
            </div>
          </div>
        </section>

        <section className="bg-stone-50 py-16 sm:py-20">
          <div className={cn(container)}>
            <div className="mx-auto max-w-3xl">
              <h2 className={cn("text-center", H2)}>{t("faq.title")}</h2>
              <p className="mt-3 text-center text-stone-600">{t("faq.subtitle")}</p>
              <div className="mt-10 space-y-6">
                {FAQ_KEYS.map((key) => (
                  <div key={key} className="rounded-lg border border-stone-200 bg-white p-6">
                    <h3 className="text-lg font-semibold text-stone-900">{t(`faq.items.${key}.question`)}</h3>
                    <p className="mt-2 text-stone-600">{t(`faq.items.${key}.answer`)}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        <section className="bg-white py-16 sm:py-20">
          <div className={container}>
            <div className="mx-auto max-w-4xl">
              <h2 className="text-2xl sm:text-[30px] md:text-4xl font-medium tracking-tight text-center text-stone-900">
                {t("related.title")}
              </h2>
              <p className="mt-3 text-center text-stone-600">{t("related.subtitle")}</p>
              <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                {RELATED_LINKS.map(({ key, href, icon: Icon }) => (
                  <Link
                    key={key}
                    href={href}
                    className="group rounded-xl border border-stone-200 bg-stone-50 p-5 transition-all hover:border-stone-300 hover:shadow-md"
                  >
                    <Icon className="h-6 w-6 text-stone-600 group-hover:text-stone-900" />
                    <h3 className="mt-3 font-semibold text-stone-900">{t(`related.items.${key}.title`)}</h3>
                    <p className="mt-1 text-sm text-stone-600">{t(`related.items.${key}.description`)}</p>
                  </Link>
                ))}
              </div>
            </div>
          </div>
        </section>

        <section className="relative isolate overflow-hidden py-24" style={{ backgroundColor: "#F1BBAA" }}>
          <div
            aria-hidden
            className="pointer-events-none absolute inset-0 opacity-[0.06]"
            style={{ backgroundImage: "url('/textures/grain.png')", backgroundSize: "200px 200px" }}
          />
          <div className={container}>
            <div className="mx-auto max-w-3xl text-center">
              <h2 className="text-2xl sm:text-[28px] md:text-[32px] font-medium tracking-tight text-stone-950">
                {t("finalCta.title")}
              </h2>
              <p className="mt-3 text-lg text-stone-900/80">{t("finalCta.subtitle")}</p>
              <div className="mt-8 flex justify-center">
                <CtaButton href="/signup" variant="slate" label={ts("startForFree")} showArrow arrowVariant="white" />
              </div>
              <p className="mt-3 text-xs sm:text-sm text-stone-900/60">{ts("noCreditCardRequired")}</p>
            </div>
          </div>
        </section>
      </main>
    </>
  )
}
