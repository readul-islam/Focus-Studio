'use client';

import { useEditor, EditorContent, type Editor } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Link from '@tiptap/extension-link';
import Placeholder from '@tiptap/extension-placeholder';
import Underline from '@tiptap/extension-underline';
import { useEffect, type ReactNode } from 'react';
import { Button } from '@/components/ui/button';
import {
  Bold,
  Italic,
  Underline as UnderlineIcon,
  List,
  ListOrdered,
  Link2,
  Strikethrough,
  RemoveFormatting,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { sanitizeComposeHtml } from '@/lib/sanitize-html';

type RichTextEditorProps = {
  value: string;
  onChange: (html: string) => void;
  placeholder?: string;
  disabled?: boolean;
  className?: string;
  /** When true, toolbar spans full width; editor body renders in a separate row (use with compose layout). */
  fullWidthToolbar?: boolean;
  /** Rendered inside the editor row (e.g. AI + attach icons). */
  leadingActions?: ReactNode;
  /** Rendered inside the editor row (e.g. send button). */
  trailingActions?: ReactNode;
};

function ToolbarButton({
  onClick,
  active,
  disabled,
  title,
  children,
}: {
  onClick: () => void;
  active?: boolean;
  disabled?: boolean;
  title: string;
  children: React.ReactNode;
}) {
  return (
    <Button
      type="button"
      variant="ghost"
      size="icon"
      className={cn(
        'h-8 w-8 text-gray-600 hover:text-gray-900',
        active && 'bg-stone-200 text-gray-900'
      )}
      onClick={onClick}
      disabled={disabled}
      title={title}
    >
      {children}
    </Button>
  );
}

export function ComposeToolbar({
  editor,
  disabled,
  className,
}: {
  editor: Editor | null;
  disabled?: boolean;
  className?: string;
}) {
  const setLink = () => {
    if (!editor) return;
    const prev = editor.getAttributes('link').href as string | undefined;
    const url = window.prompt('Link URL', prev || 'https://');
    if (url === null) return;
    if (!url.trim()) {
      editor.chain().focus().extendMarkRange('link').unsetLink().run();
      return;
    }
    editor.chain().focus().extendMarkRange('link').setLink({ href: url.trim() }).run();
  };

  if (!editor) return null;

  return (
    <div
      className={cn(
        'flex flex-wrap items-center gap-0.5 w-full px-2 py-1 border-b border-gray-100 bg-stone-50/80',
        className
      )}
    >
      <ToolbarButton
        onClick={() => editor.chain().focus().toggleBold().run()}
        active={editor.isActive('bold')}
        disabled={disabled}
        title="Bold"
      >
        <Bold className="w-4 h-4" />
      </ToolbarButton>
      <ToolbarButton
        onClick={() => editor.chain().focus().toggleItalic().run()}
        active={editor.isActive('italic')}
        disabled={disabled}
        title="Italic"
      >
        <Italic className="w-4 h-4" />
      </ToolbarButton>
      <ToolbarButton
        onClick={() => editor.chain().focus().toggleUnderline().run()}
        active={editor.isActive('underline')}
        disabled={disabled}
        title="Underline"
      >
        <UnderlineIcon className="w-4 h-4" />
      </ToolbarButton>
      <ToolbarButton
        onClick={() => editor.chain().focus().toggleStrike().run()}
        active={editor.isActive('strike')}
        disabled={disabled}
        title="Strikethrough"
      >
        <Strikethrough className="w-4 h-4" />
      </ToolbarButton>
      <span className="w-px h-5 bg-gray-200 mx-0.5" />
      <ToolbarButton
        onClick={() => editor.chain().focus().toggleBulletList().run()}
        active={editor.isActive('bulletList')}
        disabled={disabled}
        title="Bullet list"
      >
        <List className="w-4 h-4" />
      </ToolbarButton>
      <ToolbarButton
        onClick={() => editor.chain().focus().toggleOrderedList().run()}
        active={editor.isActive('orderedList')}
        disabled={disabled}
        title="Numbered list"
      >
        <ListOrdered className="w-4 h-4" />
      </ToolbarButton>
      <span className="w-px h-5 bg-gray-200 mx-0.5" />
      <ToolbarButton
        onClick={setLink}
        active={editor.isActive('link')}
        disabled={disabled}
        title="Insert link"
      >
        <Link2 className="w-4 h-4" />
      </ToolbarButton>
      <ToolbarButton
        onClick={() => editor.chain().focus().unsetAllMarks().clearNodes().run()}
        disabled={disabled}
        title="Clear formatting"
      >
        <RemoveFormatting className="w-4 h-4" />
      </ToolbarButton>
    </div>
  );
}

export function RichTextEditor({
  value,
  onChange,
  placeholder = 'Write a reply...',
  disabled = false,
  className,
  fullWidthToolbar = false,
  leadingActions,
  trailingActions,
}: RichTextEditorProps) {
  const editor = useEditor({
    immediatelyRender: false,
    extensions: [
      StarterKit.configure({
        heading: false,
        codeBlock: false,
        code: false,
        blockquote: false,
        horizontalRule: false,
      }),
      Underline,
      Link.configure({
        openOnClick: false,
        HTMLAttributes: {
          target: '_blank',
          rel: 'noopener noreferrer',
        },
      }),
      Placeholder.configure({ placeholder }),
    ],
    content: value || '',
    editable: !disabled,
    onUpdate: ({ editor: ed }) => {
      onChange(sanitizeComposeHtml(ed.getHTML()));
    },
    editorProps: {
      attributes: {
        class:
          'prose prose-sm max-w-none min-h-[80px] max-h-[200px] overflow-y-auto px-2 py-2 text-sm text-gray-900 focus:outline-none [&_p]:my-1 [&_ul]:my-2 [&_ol]:my-2 [&_ul]:list-disc [&_ul]:pl-5 [&_ol]:list-decimal [&_ol]:pl-5 [&_li]:my-0.5 [&_strong]:font-semibold',
      },
    },
  });

  useEffect(() => {
    if (!editor) return;
    const current = sanitizeComposeHtml(editor.getHTML());
    const next = sanitizeComposeHtml(value || '');
    if (current !== next) {
      editor.commands.setContent(next || '<p></p>', { emitUpdate: false });
    }
  }, [editor, value]);

  useEffect(() => {
    if (!editor) return;
    editor.setEditable(!disabled);
  }, [editor, disabled]);

  if (!editor) {
    return (
      <div className={cn('min-h-[100px] rounded-md bg-stone-50 animate-pulse', className)} />
    );
  }

  if (fullWidthToolbar) {
    const hasInlineActions = Boolean(leadingActions || trailingActions);
    return (
      <div className={cn('flex flex-col flex-1 min-w-0 min-h-0 w-full', className)}>
        <ComposeToolbar editor={editor} disabled={disabled} />
        {hasInlineActions ? (
          <div className="flex gap-1 items-end px-2 py-2 min-h-[88px]">
            {leadingActions ? (
              <div className="flex flex-col gap-1 shrink-0 self-end">{leadingActions}</div>
            ) : null}
            <EditorContent
              editor={editor}
              className="flex-1 min-w-0 [&_.tiptap]:min-h-[72px] [&_.ProseMirror]:outline-none"
            />
            {trailingActions ? (
              <div className="shrink-0 self-end mb-0.5">{trailingActions}</div>
            ) : null}
          </div>
        ) : (
          <EditorContent editor={editor} className="flex-1 min-h-0" />
        )}
      </div>
    );
  }

  return (
    <div className={cn('flex flex-col flex-1 min-w-0', className)}>
      <ComposeToolbar editor={editor} disabled={disabled} className="rounded-t-md" />
      <EditorContent editor={editor} className="flex-1 min-h-0" />
    </div>
  );
}
