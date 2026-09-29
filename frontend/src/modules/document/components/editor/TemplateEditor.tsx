import * as React from 'react';
import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import { Table } from '@tiptap/extension-table';
import { TableRow } from '@tiptap/extension-table-row';
import { TableCell } from '@tiptap/extension-table-cell';
import { TableHeader } from '@tiptap/extension-table-header';
import Image from '@tiptap/extension-image';
import TextAlign from '@tiptap/extension-text-align';
import Placeholder from '@tiptap/extension-placeholder';
import Mention from '@tiptap/extension-mention';
import Underline from '@tiptap/extension-underline';
import { EditorToolbar } from './EditorToolbar';
import { PlaceholderSidebar } from './PlaceholderSidebar';
import { EditorValidationPanel } from './EditorValidationPanel';
import { createPlaceholderSuggestion } from './PlaceholderSuggestion';
import { apiClient as api } from '@/api/client';

interface TemplateEditorProps {
  initialContent?: string;
  onChange: (content: string) => void;
}

export function TemplateEditor({ initialContent, onChange }: TemplateEditorProps) {
  const editor = useEditor({
    extensions: [
      StarterKit,
      Underline,
      Table.configure({
        resizable: true,
      }),
      TableRow,
      TableHeader,
      TableCell,
      Image,
      TextAlign.configure({
        types: ['heading', 'paragraph'],
      }),
      Placeholder.configure({
        placeholder: 'Start typing your template here... (Type {{ to add placeholders)',
      }),
      Mention.configure({
        HTMLAttributes: {
          class: 'bg-primary/20 text-primary px-1 rounded font-mono',
        },
        suggestion: createPlaceholderSuggestion(async (query) => {
          try {
            const res = await api.get(`/templates/placeholders?search=${query}`);
            return res.data.data;
          } catch (e) {
            return [];
          }
        }),
        renderText({ options, node }) {
          return `${options.suggestion.char}${node.attrs.id}${options.suggestion.char}`;
        },
        renderHTML({ options, node }) {
          return [
            'span',
            options.HTMLAttributes,
            `${options.suggestion.char}${node.attrs.id}${options.suggestion.char}`,
          ];
        },
      }),
    ],
    content: initialContent || '',
    onUpdate: ({ editor }) => {
      onChange(editor.getHTML());
    },
    editorProps: {
      attributes: {
        class: 'prose prose-sm sm:prose lg:prose-lg xl:prose-2xl mx-auto focus:outline-none min-h-[500px] p-8',
      },
    },
  });

  React.useEffect(() => {
    if (editor && initialContent && editor.getHTML() !== initialContent) {
      editor.commands.setContent(initialContent);
    }
  }, [editor, initialContent]);

  React.useEffect(() => {
    if (typeof window !== 'undefined' && editor) {
      (window as any).__templateEditor = editor;
    }
    return () => {
      if (typeof window !== 'undefined' && (window as any).__templateEditor === editor) {
        delete (window as any).__templateEditor;
      }
    };
  }, [editor]);

  const handleInsertPlaceholder = (key: string) => {
    if (editor) {
      editor.chain().focus().insertContent(key).run();
    }
  };

  return (
    <div className="flex h-[calc(100vh-140px)] border rounded-md overflow-hidden bg-background">
      <div className="flex flex-col flex-1 overflow-hidden">
        <EditorToolbar editor={editor} />
        <div className="flex-1 overflow-y-auto bg-muted/5 p-4">
          <div className="bg-white shadow-sm border mx-auto max-w-4xl min-h-[800px]">
            <EditorContent editor={editor} />
          </div>
        </div>
      </div>
      <div className="w-64 border-l bg-muted/10 flex flex-col h-full">
        <div className="flex-1 overflow-hidden">
          <PlaceholderSidebar onInsert={handleInsertPlaceholder} />
        </div>
        <div className="flex-1 overflow-hidden border-t">
          <EditorValidationPanel content={editor?.getHTML() || ''} />
        </div>
      </div>
    </div>
  );
}
