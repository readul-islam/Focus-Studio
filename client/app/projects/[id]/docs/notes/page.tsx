"use client"
import { PermissionGuard } from '@/components/PermissionGuard';

import * as React from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { mockNotes } from "@/components/notes-mocks"
import type { Note } from "@/components/notes-types"
import { NotesSidePanel } from "@/components/notes-side-panel"
import { NoteStatusPill, SourceIcon, formatRelative, LinkedChips } from "@/components/notes-utils"
import { Search, Filter, ChevronDown, ChevronLeft } from "lucide-react"
import { useTranslations } from "next-intl"

function NotesListPageContent({ params }: { params: { id: string } }) {
  const t = useTranslations("projectDocsNotesPage")
  const [sort, setSort] = React.useState<"title" | "updated_desc" | "updated_asc">("updated_desc")
  const [query, setQuery] = React.useState("")
  const [open, setOpen] = React.useState(false)
  const [selected, setSelected] = React.useState<Note | undefined>(undefined)
  const router = useRouter()

  const notes = React.useMemo(() => {
    const q = query.toLowerCase()
    const list = mockNotes.filter((n) => [n.title, n.summary].some((t) => t.toLowerCase().includes(q)))
    switch (sort) {
      case "title":
        list.sort((a, b) => a.title.localeCompare(b.title))
        break
      case "updated_asc":
        list.sort((a, b) => new Date(a.updatedAt).getTime() - new Date(b.updatedAt).getTime())
        break
      default:
        list.sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime())
    }
    return list
  }, [sort, query])

  function openNote(n: Note) {
    setSelected(n)
    setOpen(true)
  }

  return (
    <div className="flex-1 bg-stone-50 p-6">
      <div className="mx-auto max-w-7xl space-y-6">
        {/* Toolbar */}
        <div className="flex flex-col items-start justify-between gap-3 sm:flex-row sm:items-center">
          <div className="flex w-full flex-1 flex-wrap items-center gap-3">
            <Button
              type="button"
              variant="outline"
              size="sm"
              className="bg-transparent"
              onClick={() => router.push(`/projects/${params.id}/docs`)}
              aria-label={t("backToDocs")}
            >
              <ChevronLeft className="mr-1 h-4 w-4" />
              {t("backToDocs")}
            </Button>

            <div className="relative">
              <Search
                className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-neutral-400"
                aria-hidden={true}
              />
              <Input
                placeholder={t("searchPlaceholder")}
                className="w-80 pl-9"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
              />
            </div>

            <Button variant="outline" size="sm" className="hidden bg-transparent sm:inline-flex">
              <Filter className="mr-2 h-4 w-4" />
              {t("filter")}
            </Button>
          </div>

          <div className="flex items-center gap-2">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button className="bg-neutral-900 text-white hover:bg-neutral-800">
                  {t("newNote")}
                  <ChevronDown className="ml-1 h-4 w-4 opacity-80" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem>
                  {t("fromZoom")}
                </DropdownMenuItem>
                <DropdownMenuItem>
                  {t("fromSiteVisit")}
                </DropdownMenuItem>
                <DropdownMenuItem>
                  {t("blankNote")}
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>

        {/* List container with thin horizontal scrollbar */}
        <div className="ai-notes-scroll overflow-x-auto rounded-xl border border-neutral-200 bg-white">
          {/* Header: match global list styling; tighter gaps between mid columns */}
          <div className="sticky top-0 z-10 grid grid-cols-12 gap-1 border-b border-gray-200 bg-white px-4 py-3 text-sm font-medium text-gray-600">
            <div className="col-span-4">{t("heading")}</div>
            <div className="col-span-2">{t("source")}</div>
            <div className="col-span-2">{t("status")}</div>
            <div className="col-span-2">{t("linked")}</div>
            {/* Wider actions column so buttons stay on one line */}
            <div className="col-span-2" />
          </div>

          {/* Rows */}
          <div role="table" aria-label={t("notesListAria")} className="divide-y divide-neutral-200">
            {notes.map((n) => (
              <div
                key={n.id}
                role="row"
                tabIndex={0}
                onKeyDown={(e) => {
                  if (e.key === "Enter" || e.key === " ") openNote(n)
                }}
                className="grid grid-cols-12 items-center gap-1 bg-white px-4 py-3 hover:bg-stone-50 focus:outline-none focus:ring-2 focus:ring-neutral-300"
                onClick={() => openNote(n)}
              >
                {/* Heading column: 2-line summary, tight leading, truncation */}
                <div className="col-span-4 min-w-0">
                  <div className="flex min-w-0 items-center gap-2">
                    <span className="block max-w-full truncate whitespace-nowrap text-sm font-medium text-neutral-900">
                      {n.title}
                    </span>
                    <span className="shrink-0 text-xs text-neutral-500">
                      {"• "}
                      {formatRelative(n.updatedAt)}
                    </span>
                  </div>
                  <p className="line-clamp-2 text-xs leading-snug text-neutral-600">{n.summary}</p>
                </div>

                <div className="col-span-2">
                  <div className="inline-flex items-center gap-1 rounded-md border border-neutral-300 bg-stone-50 px-2 py-0.5 text-xs text-neutral-700">
                    <SourceIcon source={n.source} />
                    {n.source === "zoom"
                      ? t("sourceZoom")
                      : n.source === "mobile"
                        ? t("sourceMobile")
                        : n.source === "upload"
                          ? t("sourceUpload")
                          : n.source === "ai"
                            ? t("sourceAi")
                            : t("sourceOther")}
                  </div>
                </div>

                <div className="col-span-2">
                  <NoteStatusPill status={n.status} />
                </div>

                <div className="col-span-2">
                  <LinkedChips links={n.linked} />
                </div>

                {/* Actions: keep on one line, compact spacing */}
                <div className="col-span-2">
                  <div className="flex items-center justify-end gap-1 whitespace-nowrap">
                    {n.status === "needs_review" ? (
                      <Button
                        size="sm"
                        variant="outline"
                        className="h-7 shrink-0 bg-transparent px-2 text-xs"
                        onClick={(e) => {
                          e.stopPropagation()
                        }}
                      >
                        {t("approve")}
                      </Button>
                    ) : null}
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button
                          size="sm"
                          variant="outline"
                          className="h-7 shrink-0 bg-transparent px-2 text-xs"
                          onClick={(e) => e.stopPropagation()}
                        >
                          {t("convert")}
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem>{t("convertTask")}</DropdownMenuItem>
                        <DropdownMenuItem>{t("convertRfi")}</DropdownMenuItem>
                        <DropdownMenuItem>{t("convertPo")}</DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                    <Button
                      size="sm"
                      variant="outline"
                      className="h-7 shrink-0 bg-transparent px-2 text-xs"
                      onClick={(e) => {
                        e.stopPropagation()
                      }}
                    >
                      {t("link")}
                    </Button>
                    <Button
                      size="sm"
                      className="h-7 shrink-0 bg-neutral-900 px-2 text-xs text-white hover:bg-neutral-800"
                      onClick={(e) => {
                        e.stopPropagation()
                        openNote(n)
                      }}
                    >
                      {t("open")}
                    </Button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        <style jsx>{`
          .ai-notes-scroll {
            /* Thin, low-profile horizontal scrollbar */
            scrollbar-width: thin;
            scrollbar-color: #d4d4d8 transparent; /* thumb gray-300, transparent track */
          }
          .ai-notes-scroll::-webkit-scrollbar {
            height: 6px;
          }
          .ai-notes-scroll::-webkit-scrollbar-track {
            background: transparent;
          }
          .ai-notes-scroll::-webkit-scrollbar-thumb {
            background-color: #d4d4d8; /* gray-300 */
            border-radius: 9999px;
          }
        `}</style>
      </div>

      <NotesSidePanel open={open} onOpenChange={setOpen} note={selected} />
    </div>
  )
}

export default function NotesListPage({ params }: { params: { id: string } }) {
  return (
    <PermissionGuard permission="documents.view" redirectTo="/projects">
      <NotesListPageContent params={params} />
    </PermissionGuard>
  );
}