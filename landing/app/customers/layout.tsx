import type { Metadata } from "next"

export const metadata: Metadata = {
  title: "Customer Stories | Interior Designers Using Techstyles",
  description: "See how interior design studios use Techstyles to save time and grow their business. Real stories from real designers.",
  alternates: { canonical: "https://techstyles.ai/customers" },
}

export default function CustomersLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return children
}
