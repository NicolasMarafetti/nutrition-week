import type { Metadata } from "next"
import { Geist } from "next/font/google"
import "./globals.css"
import Nav from "@/components/nav"

const geist = Geist({ subsets: ["latin"], variable: "--font-geist" })

const siteUrl = process.env.VERCEL_PROJECT_PRODUCTION_URL
  ? `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}`
  : "http://localhost:3000"

const description =
  "NutriWeek analyse votre semaine de repas type et vérifie que vous couvrez tous vos besoins : calories, protéines, glucides, lipides, vitamines, minéraux, acides aminés, oméga-3 et plus de 30 nutriments essentiels."

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: "NutriWeek — Planificateur nutritionnel hebdomadaire",
    template: "%s · NutriWeek",
  },
  description,
  applicationName: "NutriWeek",
  keywords: [
    "nutrition",
    "planificateur de repas",
    "semaine type",
    "macros",
    "micronutriments",
    "vitamines",
    "protéines",
    "bilan nutritionnel",
  ],
  authors: [{ name: "NutriWeek" }],
  openGraph: {
    title: "NutriWeek — Planificateur nutritionnel hebdomadaire",
    description,
    url: siteUrl,
    siteName: "NutriWeek",
    locale: "fr_FR",
    type: "website",
  },
  twitter: {
    card: "summary",
    title: "NutriWeek — Planificateur nutritionnel hebdomadaire",
    description,
  },
  robots: {
    index: true,
    follow: true,
  },
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="fr" className={`${geist.variable} h-full`}>
      <body className="min-h-full bg-zinc-950 text-zinc-100 antialiased">
        <Nav />
        <main className="max-w-7xl mx-auto px-4 py-6">{children}</main>
      </body>
    </html>
  )
}
