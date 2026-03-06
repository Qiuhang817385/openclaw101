import { Metadata } from 'next';
import HomePage from '@/components/HomePage';

export const metadata: Metadata = {
  title: '7天掌握你的AI私人助理',
  description: '从零开始，7天掌握你的AI私人助理。教程、技能和社区资源一站式获取。',
  alternates: {
    canonical: 'https://openclaw.meetai.fun',
    languages: {
      'en': 'https://openclaw.meetai.fun/en',
      'zh': 'https://openclaw.meetai.fun',
    },
  },
  openGraph: {
    title: 'MyClaw - 从零开始，7天掌握你的AI私人助理',
    description: '从零开始，7天掌握你的AI私人助理',
    type: 'website',
    url: 'https://openclaw.meetai.fun',
    siteName: 'MyClaw',
    images: [
      {
        url: '/og-image.png',
        width: 1200,
        height: 630,
        alt: 'MyClaw - 从零开始，7天掌握你的AI私人助理',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'MyClaw - 从零开始，7天掌握你的AI私人助理',
    description: '从零开始，7天掌握你的AI私人助理',
    images: ['/og-image.png'],
  },
};

const jsonLd = {
  '@context': 'https://schema.org',
  '@type': 'WebSite',
  name: 'MyClaw',
  url: 'https://openclaw.meetai.fun',
  description: '从零开始，7天掌握你的AI私人助理',
  inLanguage: 'zh-CN',
};

export default function Home() {
  return (
    <main>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <HomePage locale="zh" />
    </main>
  );
}
