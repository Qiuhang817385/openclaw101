import { Metadata } from 'next';
import fs from 'fs';
import path from 'path';
import matter from 'gray-matter';
import Link from 'next/link';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import rehypeRaw from 'rehype-raw';

export const metadata: Metadata = {
  title: '实战 | MyClaw',
  description: '个人实战经验分享，通过真实案例深入理解 OpenClaw。',
};

interface PracticePost {
  slug: string;
  frontmatter: {
    title: string;
    description: string;
    date: string;
    tags?: string[];
  };
  content: string;
}

function getPracticePosts(): PracticePost[] {
  const postsDirectory = path.join(process.cwd(), 'content', 'practice');

  if (!fs.existsSync(postsDirectory)) {
    return [];
  }

  const fileNames = fs.readdirSync(postsDirectory);
  const posts = fileNames
    .filter((fileName) => fileName.endsWith('.md'))
    .map((fileName) => {
      const slug = fileName.replace(/\.md$/, '');
      const fullPath = path.join(postsDirectory, fileName);
      const fileContents = fs.readFileSync(fullPath, 'utf8');
      const { data, content } = matter(fileContents);

      return {
        slug,
        frontmatter: {
          title: data.title || 'Untitled',
          description: data.description || '',
          date: data.date instanceof Date ? data.date.toISOString().split('T')[0] : (data.date || ''),
          tags: data.tags || [],
        },
        content,
      };
    })
    .sort((a, b) => (a.frontmatter.date < b.frontmatter.date ? 1 : -1));

  return posts;
}

export default function PracticePage() {
  const posts = getPracticePosts();

  return (
    <main className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200">
        <div className="max-w-4xl mx-auto px-4 py-8">
          <Link href="/" className="inline-flex items-center gap-2 text-gray-600 hover:text-gray-900 transition-colors mb-6">
            <span>←</span>
            <span>返回首页</span>
          </Link>
          <h1 className="text-4xl font-bold text-gray-900 mb-4">实战</h1>
          <p className="text-lg text-gray-600">
            个人实战经验分享，通过真实案例深入理解 OpenClaw。
          </p>
        </div>
      </header>

      {/* Content */}
      <div className="max-w-4xl mx-auto px-4 py-12">
        {posts.length === 0 ? (
          <div className="text-center py-16">
            <p className="text-gray-500 text-lg mb-4">暂无实战文章</p>
            <p className="text-gray-400">敬请期待更多实战内容！</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {posts.map((post) => (
              <Link
                key={post.slug}
                href={`/practice/${post.slug}`}
                className="block bg-white rounded-xl p-6 border border-gray-100 hover:border-blue-200 hover:shadow-lg transition-all duration-300 group"
              >
                <div className="flex items-center gap-2 mb-3">
                  {post.frontmatter.tags?.map((tag) => (
                    <span
                      key={tag}
                      className="px-2 py-1 bg-blue-50 text-blue-600 text-xs rounded-full"
                    >
                      {tag}
                    </span>
                  ))}
                </div>
                <h2 className="text-xl font-bold text-gray-900 mb-2 group-hover:text-blue-600 transition-colors">
                  {post.frontmatter.title}
                </h2>
                <p className="text-gray-600 mb-4 line-clamp-3">
                  {post.frontmatter.description}
                </p>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-400">{post.frontmatter.date}</span>
                  <span className="text-blue-600 text-sm font-medium group-hover:translate-x-1 inline-block transition-transform">
                    阅读全文 →
                  </span>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </main>
  );
}
