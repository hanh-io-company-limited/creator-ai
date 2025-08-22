import './globals.css'

export const metadata = {
  title: 'Creator AI',
  description: 'AI-powered content creation platform',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  )
}