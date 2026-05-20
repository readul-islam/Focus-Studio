import Link from "next/link"

export default function StudioNotFound() {
  return (
    <div className="min-h-[60vh] flex flex-col items-center justify-center px-6 text-center">
      <h1 className="text-2xl font-medium text-stone-900">Studio profile not found</h1>
      <p className="mt-2 text-stone-500 max-w-md">
        This profile may be unpublished or the link is incorrect.
      </p>
      <Link
        href="https://focuspilot.io"
        className="mt-6 text-sm font-medium text-stone-700 underline hover:text-stone-900"
      >
        Back to Focuspilot
      </Link>
    </div>
  )
}
