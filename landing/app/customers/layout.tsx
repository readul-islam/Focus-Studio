import type { Metadata } from "next"

export const metadata: Metadata = {
  title: "Customer Stories | Interior Designers Using Focuspilot",
  description: "See how interior design studios use Focuspilot to save time and grow their business. Real stories from real designers.",
  alternates: { canonical: "https://focuspilot.io/customers" },
}

export default function CustomersLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return children
}
