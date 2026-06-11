"use client"

import type * as React from "react"
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetFooter } from "@/components/ui/sheet"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import type { Note } from "./notes-types"
import { formatRelative, NoteStatusPill, SourceIcon } from "./notes-utils"

export function NotesSidePanel({
  open,
  onOpenChange,
  note,
  onApprove,
  onConvertActionItem,
  busyActionItemId,
  onFetchTranscript,
  fetchingTranscript,
}: {
  open: boolean
  onOpenChange: (o: boolean) => void
  note?: Note
  onApprove?: (n: Note) => void
  onConvertActionItem?: (note: Note, actionItemId: string) => void
  busyActionItemId?: string | null
  onFetchTranscript?: () => void
  fetchingTranscript?: boolean
}) {
  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="right" className="w-full max-w-[560px]">
        {note ? (
          <div className="flex h-full flex-col">
            <SheetHeader className="mb-2">
              <SheetTitle className="flex items-center gap-2 text-base">
                <SourceIcon source={note.source} />
                <span className="truncate">{note.title}</span>
                <NoteStatusPill status={note.status} />
              </SheetTitle>
              <div className="text-xs text-neutral-600">
                by{" "}
                <span className="font-medium text-neutral-800">{note.author.name}</span>
                {" • "}
                {formatRelative(note.updatedAt)}
              </div>
            </SheetHeader>

            <Tabs defaultValue="summary" className="flex-1 overflow-hidden">
              <TabsList className="mb-3">
                <TabsTrigger value="summary">Summary</TabsTrigger>
                <TabsTrigger value="transcript">Transcript</TabsTrigger>
                <TabsTrigger value="activity">Activity</TabsTrigger>
              </TabsList>

              <TabsContent value="summary" className="space-y-4 overflow-y-auto max-h-[calc(100vh-220px)]">
                {onFetchTranscript ? (
                  <div className="rounded-lg border border-amber-200 bg-amber-50 p-3 text-sm text-amber-900">
                    <p className="mb-2">Meeting ended — pull the transcript from Vexa to generate AI notes.</p>
                    <Button
                      size="sm"
                      className="bg-neutral-900 text-white hover:bg-neutral-800"
                      disabled={fetchingTranscript}
                      onClick={onFetchTranscript}
                    >
                      {fetchingTranscript ? 'Fetching…' : 'Fetch transcript from Vexa'}
                    </Button>
                  </div>
                ) : null}
                <Section title="Executive summary">
                  {note.summary ? (
                    <p className="text-sm text-neutral-800 whitespace-pre-wrap">{note.summary}</p>
                  ) : (
                    <EmptyLine />
                  )}
                </Section>

                <Section title="Decisions">
                  {note.ai.decisions.length ? (
                    <ul className="list-disc space-y-1 pl-5 text-sm text-neutral-800">
                      {note.ai.decisions.map((d, i) => (
                        <li key={i}>{d}</li>
                      ))}
                    </ul>
                  ) : (
                    <EmptyLine />
                  )}
                </Section>

                <Section title="Action items">
                  {note.actionItems?.length ? (
                    <ul className="space-y-2 text-sm text-neutral-800">
                      {note.actionItems.map((a) => (
                        <li key={a.id} className="flex items-start justify-between gap-2 rounded-md border border-neutral-200 p-2">
                          <div className="min-w-0 flex-1">
                            <p className="font-medium">{a.title}</p>
                            {a.description ? (
                              <p className="text-xs text-neutral-600 mt-0.5">{a.description}</p>
                            ) : null}
                            {a.convertedTaskId ? (
                              <p className="text-xs text-sage-700 mt-1">Converted to task #{a.convertedTaskId}</p>
                            ) : null}
                          </div>
                          {onConvertActionItem && !a.convertedTaskId ? (
                            <Button
                              size="sm"
                              variant="outline"
                              className="h-7 shrink-0 bg-transparent"
                              disabled={busyActionItemId === a.id}
                              onClick={() => onConvertActionItem(note, a.id)}
                            >
                              {busyActionItemId === a.id ? "…" : "Convert to task"}
                            </Button>
                          ) : null}
                        </li>
                      ))}
                    </ul>
                  ) : note.ai.actions.length ? (
                    <ul className="list-disc space-y-1 pl-5 text-sm text-neutral-800">
                      {note.ai.actions.map((a, i) => (
                        <li key={i}>{a}</li>
                      ))}
                    </ul>
                  ) : (
                    <EmptyLine />
                  )}
                </Section>

                <Section title="Risks / blockers">
                  {note.ai.risks.length ? (
                    <ul className="list-disc space-y-1 pl-5 text-sm text-neutral-800">
                      {note.ai.risks.map((r, i) => (
                        <li key={i}>{r}</li>
                      ))}
                    </ul>
                  ) : (
                    <EmptyLine />
                  )}
                </Section>
              </TabsContent>

              <TabsContent value="transcript" className="space-y-3 overflow-y-auto max-h-[calc(100vh-220px)]">
                {note.transcriptText ? (
                  <Card className="p-4 text-sm leading-6 text-neutral-800 whitespace-pre-wrap">
                    {note.transcriptText}
                  </Card>
                ) : note.transcriptUrl ? (
                  <Card className="p-4 text-sm leading-6 text-neutral-800">
                    <a
                      href={note.transcriptUrl}
                      className="text-neutral-900 underline underline-offset-4 hover:text-neutral-700"
                    >
                      {note.transcriptUrl}
                    </a>
                  </Card>
                ) : (
                  <Card className="p-4 text-sm text-neutral-600">No transcript available.</Card>
                )}
              </TabsContent>

              <TabsContent value="activity" className="space-y-3">
                <Card className="p-4 text-sm text-neutral-700">
                  <ul className="list-disc space-y-1 pl-5">
                    <li>Note created</li>
                    {note.summary ? <li>AI summary generated</li> : null}
                    {note.status === "published" ? <li>Approved and published</li> : null}
                  </ul>
                </Card>
              </TabsContent>
            </Tabs>

            <SheetFooter className="mt-3 flex items-center justify-between gap-2">
              <div className="text-xs text-neutral-600">Visibility: {note.visibility}</div>
              <div className="flex items-center gap-2">
                {note.status === "needs_review" && onApprove ? (
                  <Button variant="outline" className="bg-transparent" onClick={() => onApprove(note)}>
                    Approve
                  </Button>
                ) : null}
              </div>
            </SheetFooter>
          </div>
        ) : null}
      </SheetContent>
    </Sheet>
  )
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="space-y-2">
      <h4 className="text-sm font-semibold text-neutral-900">{title}</h4>
      {children}
    </div>
  )
}

function EmptyLine() {
  return <p className="text-sm text-neutral-500">—</p>
}
