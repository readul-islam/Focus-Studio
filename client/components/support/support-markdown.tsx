'use client';

import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import Link from 'next/link';

export function SupportMarkdown({ content }: { content: string }) {
  return (
    <ReactMarkdown
      remarkPlugins={[remarkGfm]}
      components={{
        p: ({ children }) => <p className="mb-2 text-[13px] leading-relaxed text-foreground last:mb-0">{children}</p>,
        strong: ({ children }) => <strong className="font-semibold">{children}</strong>,
        ul: ({ children }) => <ul className="mb-2 list-disc space-y-1 pl-4 text-[13px]">{children}</ul>,
        ol: ({ children }) => <ol className="mb-2 list-decimal space-y-1 pl-4 text-[13px]">{children}</ol>,
        li: ({ children }) => <li className="leading-relaxed">{children}</li>,
        a: ({ href, children }) => {
          const isInternal = href?.startsWith('/');
          if (isInternal && href) {
            return (
              <Link href={href} className="font-medium text-primary underline underline-offset-2">
                {children}
              </Link>
            );
          }
          return (
            <a href={href} className="font-medium text-primary underline underline-offset-2" target="_blank" rel="noreferrer">
              {children}
            </a>
          );
        },
      }}
    >
      {content}
    </ReactMarkdown>
  );
}
