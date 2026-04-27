import { Metadata } from 'next';
import { notFound } from 'next/navigation';
import fs from 'fs';
import path from 'path';
import matter from 'gray-matter';
import Link from 'next/link';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import rehypeRaw from 'rehype-raw';

interface Props {
  params: Promise<{ slug: string }>;
}

function getPost(slug: string): { frontmatter: any; content: string } | null {
  const filePath = path.join(process.cwd(), 'content', 'practice', `${slug}.md`);
  if (!fs.existsSync(filePath)) return null;

  const fileContents = fs.readFileSync(filePath, 'utf8');
  const { data, content } = matter(fileContents);

  // Convert date to string if it's a Date object
  if (data.date instanceof Date) {
    data.date = data.date.toISOString().split('T')[0];
  }

  return { frontmatter: data, content };
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const data = getPost(slug);
  if (!data) return { title: 'Not Found' };

  return {
    title: `${data.frontmatter.title} | Practice | MyClaw`,
    description: data.frontmatter.description,
  };
}

export default async function PracticeDetailPage({ params }: Props) {
  const { slug } = await params;
  const data = getPost(slug);

  if (!data) {
    notFound();
  }

  const { frontmatter, content } = data;

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200">
        <div className="max-w-4xl mx-auto px-4 py-4 flex items-center justify-between">
          <Link href="/en/practice" className="flex items-center gap-2 text-gray-600 hover:text-gray-900 transition-colors">
            <span>←</span>
            <span>Back to Practice</span>
          </Link>
        </div>
      </header>

      {/* Hero */}
      <div className="bg-gradient-to-b from-gray-100 to-gray-50 py-16">
        <div className="max-w-4xl mx-auto px-4 text-center">
          <div className="flex items-center justify-center gap-2 mb-4">
            {frontmatter.tags?.map((tag: string) => (
              <span
                key={tag}
                className="px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-sm"
              >
                {tag}
              </span>
            ))}
          </div>
          <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
            {frontmatter.title}
          </h1>
          <p className="text-xl text-gray-600 mb-4">{frontmatter.description}</p>
          <span className="text-gray-400">{frontmatter.date}</span>
        </div>
      </div>

      {/* Content */}
      <article className="max-w-4xl mx-auto px-4 py-12">
        <div className="markdown-body">
          <ReactMarkdown
            remarkPlugins={[remarkGfm]}
            rehypePlugins={[rehypeRaw]}
            components={{
              h1: ({ children }) => <h1 className="text-3xl font-bold text-gray-900 mt-12 mb-6">{children}</h1>,
              h2: ({ children }) => <h2 className="text-2xl font-bold text-gray-900 mt-12 mb-6 pb-2 border-b border-gray-200">{children}</h2>,
              h3: ({ children }) => <h3 className="text-xl font-semibold text-gray-900 mt-10 mb-4">{children}</h3>,
              h4: ({ children }) => <h4 className="text-lg font-semibold text-gray-900 mt-8 mb-4">{children}</h4>,
              p: ({ children }) => <p className="text-gray-700 leading-relaxed mb-4">{children}</p>,
              strong: ({ children }) => <strong className="text-gray-900 font-semibold">{children}</strong>,
              em: ({ children }) => <em className="text-gray-700">{children}</em>,
              a: ({ href, children }) => <a href={href} className="text-blue-600 hover:text-blue-700 underline" target="_blank" rel="noopener noreferrer">{children}</a>,
              ul: ({ children }) => <ul className="my-4 ml-6 list-disc text-gray-700 space-y-2">{children}</ul>,
              ol: ({ children }) => <ol className="my-4 ml-6 list-decimal text-gray-700 space-y-2">{children}</ol>,
              li: ({ children }) => <li className="text-gray-700">{children}</li>,
              code: ({ className, children }) => {
                const isBlock = className?.includes('language-');
                if (isBlock) {
                  return <code className={`${className} block text-gray-800 font-mono text-sm leading-relaxed`}>{children}</code>;
                }
                return <code className="bg-gray-100 px-1.5 py-0.5 rounded text-emerald-700 text-sm font-mono border border-gray-200">{children}</code>;
              },
              pre: ({ children }) => <pre className="bg-gray-900 border border-gray-700 rounded-xl p-5 overflow-x-auto my-6 text-sm shadow-lg text-gray-100">{children}</pre>,
              blockquote: ({ children }) => <blockquote className="border-l-4 border-blue-500 bg-blue-50 pl-4 pr-4 py-3 my-4 rounded-r-lg text-gray-700">{children}</blockquote>,
              table: ({ children }) => <div className="overflow-x-auto my-6"><table className="w-full border-collapse border border-gray-200 rounded-lg overflow-hidden">{children}</table></div>,
              thead: ({ children }) => <thead className="bg-gray-100">{children}</thead>,
              tbody: ({ children }) => <tbody className="divide-y divide-gray-200">{children}</tbody>,
              tr: ({ children }) => <tr className="border-b border-gray-200 hover:bg-gray-50 transition-colors">{children}</tr>,
              th: ({ children }) => <th className="px-4 py-3 text-left text-gray-900 font-semibold border-r border-gray-200 last:border-r-0">{children}</th>,
              td: ({ children }) => <td className="px-4 py-3 text-gray-700 border-r border-gray-200 last:border-r-0">{children}</td>,
              hr: () => <hr className="my-8 border-gray-200" />,
              img: ({ src, alt }) => <img src={src} alt={alt} className="my-6 rounded-lg max-w-full" />,
            }}
          >
            {content}
          </ReactMarkdown>
        </div>
      </article>

      {/* Back link */}
      <nav className="border-t border-gray-200 py-8">
        <div className="max-w-4xl mx-auto px-4">
          <Link
            href="/en/practice"
            className="inline-flex items-center gap-2 px-5 py-3 bg-gray-200 hover:bg-gray-300 rounded-lg transition-colors text-gray-800"
          >
            <span>←</span>
            <span>Back to Practice List</span>
          </Link>
        </div>
      </nav>
    </div>
  );
}
