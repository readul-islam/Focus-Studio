"use client"

import * as React from "react"
import type { Note } from "./notes-types"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { ChevronDown } from "lucide-react"
import { AIPill } from "./ai-pill"
import { SourceIcon, NoteStatusPill, formatRelative } from "./notes-utils"
import { cn } from "@/lib/utils"

type Filter = "all" | "needs_review" | "published"
type Sort = "newest" | "oldest" | "title"

export function NotesFeed({
  notes,
  onOpen,
  onApprove,
  onConvertTask,
  onNewNote,
  emptyCtaLabel = "✨ New Note",
  emptyDescription = "Record a site visit or paste a meeting transcript to generate AI notes.",
  className,
}: {
  notes: Note[]
  onOpen: (n: Note) => void
  onApprove?: (n: Note) => void
  onConvertTask?: (n: Note) => void
  onNewNote?: () => void
  emptyCtaLabel?: string
  emptyDescription?: string
  className?: string
}) {
  const [filter, setFilter] = React.useState<Filter>("all")
  const [sort, setSort] = React.useState<Sort>("newest")

  const list = React.useMemo(() => {
    let l = [...notes]
    if (filter !== "all") {
      l = l.filter((n) => n.status === filter)
    }
    switch (sort) {
      case "title":
        l.sort((a, b) => a.title.localeCompare(b.title))
        break
      case "oldest":
        l.sort((a, b) => new Date(a.updatedAt).getTime() - new Date(b.updatedAt).getTime())
        break
      default:
        l.sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime())
    }
    return l
  }, [notes, filter, sort])

  const hasItems = list.length > 0

  return (
    <Card className={cn("rounded-xl bg-white", className)}>
      <CardContent className="p-4 sm:p-6">
        <div className="mb-3 flex flex-wrap items-center gap-2">
          {(
            [
              { key: "all", label: "All" },
              { key: "needs_review", label: "Needs review" },
              { key: "published", label: "Published" },
            ] as const
          ).map((f) => {
            const active = filter === f.key
            return (
              <button
                key={f.key}
                type="button"
                onClick={() => setFilter(f.key)}
                aria-pressed={active}
                className={cn(
                  "inline-flex items-center rounded-md border px-2.5 py-1 text-xs font-medium",
                  active
                    ? "border-neutral-900 bg-neutral-900 text-white"
                    : "border-neutral-300 bg-white text-neutral-700 hover:bg-stone-50",
                )}
              >
                {f.label}
              </button>
            )
          })}

          <div className="ml-auto flex items-center gap-2">
            {onNewNote ? (
              <Button
                size="sm"
                className="h-8 bg-neutral-900 text-white hover:bg-neutral-800"
                onClick={onNewNote}
              >
                {emptyCtaLabel}
              </Button>
            ) : null}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button size="sm" variant="outline" className="h-8 rounded-md bg-transparent">
                  Sort
                  <ChevronDown className="ml-1 h-4 w-4 opacity-70" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onSelect={() => setSort("newest")}>Newest</DropdownMenuItem>
                <DropdownMenuItem onSelect={() => setSort("oldest")}>Oldest</DropdownMenuItem>
                <DropdownMenuItem onSelect={() => setSort("title")}>Title</DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>

        {hasItems ? (
          <div className="space-y-2.5">
            {list.map((n) => (
              <div
                key={n.id}
                className="flex items-center gap-4 rounded-lg border border-neutral-200 bg-white p-3 transition-colors hover:bg-stone-50 focus-within:ring-2 focus-within:ring-neutral-300"
              >
                <div className="flex items-center gap-2">
                  <SourceIcon source={n.source} />
                  <AIPill />
                </div>

                <div className="min-w-0 flex-1">
                  <button
                    type="button"
                    onClick={() => onOpen(n)}
                    className="block text-left"
                    aria-label={`Open note: ${n.title}`}
                  >
                    <div className="flex items-center gap-2">
                      <span className="truncate text-sm font-medium text-neutral-900">{n.title}</span>
                      <NoteStatusPill status={n.status} />
                    </div>
                    <p className="line-clamp-1 text-xs text-neutral-600">
                      by{" "}
                      <span className="font-medium text-neutral-800">{n.author.name}</span>
                      {" • "}
                      {formatRelative(n.updatedAt)}
                    </p>
                  </button>
                </div>

                <div className="flex items-center gap-1">
                  {n.status === "needs_review" && onApprove ? (
                    <Button
                      size="sm"
                      variant="outline"
                      className="h-8 bg-transparent"
                      onClick={() => onApprove(n)}
                    >
                      Approve
                    </Button>
                  ) : null}

                  {onConvertTask ? (
                    <Button
                      size="sm"
                      variant="outline"
                      className="h-8 bg-transparent"
                      onClick={() => onConvertTask(n)}
                    >
                      Convert →
                    </Button>
                  ) : null}

                  <Button
                    size="sm"
                    className="h-8 bg-neutral-900 text-white hover:bg-neutral-800"
                    onClick={() => onOpen(n)}
                  >
                    Open
                  </Button>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center gap-2 rounded-lg border border-dashed border-neutral-300 bg-white p-10 text-center">
            <h4 className="text-sm font-semibold text-neutral-900">No notes yet</h4>
            <p className="max-w-sm text-xs text-neutral-600">{emptyDescription}</p>
            {onNewNote ? (
              <Button
                className="mt-2 bg-neutral-900 text-white hover:bg-neutral-800"
                onClick={onNewNote}
              >
                {emptyCtaLabel}
              </Button>
            ) : null}
          </div>
        )}
      </CardContent>
    </Card>
  )
}
