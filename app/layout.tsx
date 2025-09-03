import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: "Fit'imi Yorumla - YZ Kıyafet Değerlendirici",
  description: 'Kıyafetini yapay zekaya yorumlat veya övdür. Bir fotoğraf yükle ve paylaşılabilir bir skor kartında puan, stil analizi ve ipuçları al.',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="tr">
      <body>{children}</body>
    </html>
  )
}