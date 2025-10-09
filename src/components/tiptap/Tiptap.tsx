'use client';

import { TextStyleKit } from '@tiptap/extension-text-style';
import Highlight from '@tiptap/extension-highlight';
import TextAlign from '@tiptap/extension-text-align';
import type { Editor } from '@tiptap/react';
import { EditorContent, useEditor, useEditorState } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import React from 'react';

const extensions = [
    TextStyleKit,
    StarterKit,
    TextAlign.configure({
        types: ['heading', 'paragraph'],
    }),
    Highlight,
];

function MenuBar({ editor }: { editor: Editor }) {
    // Read the current editor's state, and re-render the component when it changes
    const editorState = useEditorState({
        editor,
        selector: ctx => {
            return {
                isBold: ctx.editor.isActive('bold') ?? false,
                canBold: ctx.editor.can().chain().toggleBold().run() ?? false,
                isItalic: ctx.editor.isActive('italic') ?? false,
                canItalic: ctx.editor.can().chain().toggleItalic().run() ?? false,
                isStrike: ctx.editor.isActive('strike') ?? false,
                canStrike: ctx.editor.can().chain().toggleStrike().run() ?? false,
                isCode: ctx.editor.isActive('code') ?? false,
                canCode: ctx.editor.can().chain().toggleCode().run() ?? false,
                isHighlight: ctx.editor.isActive('highlight') ?? false,
                canClearMarks: ctx.editor.can().chain().unsetAllMarks().run() ?? false,
                isParagraph: ctx.editor.isActive('paragraph') ?? false,
                isHeading1: ctx.editor.isActive('heading', { level: 1 }) ?? false,
                isHeading2: ctx.editor.isActive('heading', { level: 2 }) ?? false,
                isHeading3: ctx.editor.isActive('heading', { level: 3 }) ?? false,
                isBulletList: ctx.editor.isActive('bulletList') ?? false,
                isOrderedList: ctx.editor.isActive('orderedList') ?? false,
                isCodeBlock: ctx.editor.isActive('codeBlock') ?? false,
                isBlockquote: ctx.editor.isActive('blockquote') ?? false,
                isAlignLeft: ctx.editor.isActive({ textAlign: 'left' }) ?? false,
                isAlignCenter: ctx.editor.isActive({ textAlign: 'center' }) ?? false,
                isAlignRight: ctx.editor.isActive({ textAlign: 'right' }) ?? false,
                isAlignJustify: ctx.editor.isActive({ textAlign: 'justify' }) ?? false,
                canUndo: ctx.editor.can().chain().undo().run() ?? false,
                canRedo: ctx.editor.can().chain().redo().run() ?? false,
            };
        },
    });

    return (
        <div className="flex flex-wrap gap-1 border-b border-gray-200 p-4">
            {/* Text formatting */}
            <div className="mr-2 flex gap-1 border-r border-gray-200 pr-2">
                <button
                    onClick={() => editor.chain().focus().toggleBold().run()}
                    disabled={!editorState.canBold}
                    className={`rounded border px-3 py-1 text-sm ${
                        editorState.isBold
                            ? 'border-blue-500 bg-blue-500 text-white'
                            : 'border-gray-300 bg-white text-gray-700 hover:bg-gray-50'
                    } disabled:cursor-not-allowed disabled:opacity-50`}>
                    Bold
                </button>
                <button
                    onClick={() => editor.chain().focus().toggleItalic().run()}
                    disabled={!editorState.canItalic}
                    className={`rounded border px-3 py-1 text-sm ${
                        editorState.isItalic
                            ? 'border-blue-500 bg-blue-500 text-white'
                            : 'border-gray-300 bg-white text-gray-700 hover:bg-gray-50'
                    } disabled:cursor-not-allowed disabled:opacity-50`}>
                    Italic
                </button>
                <button
                    onClick={() => editor.chain().focus().toggleStrike().run()}
                    disabled={!editorState.canStrike}
                    className={`rounded border px-3 py-1 text-sm ${
                        editorState.isStrike
                            ? 'border-blue-500 bg-blue-500 text-white'
                            : 'border-gray-300 bg-white text-gray-700 hover:bg-gray-50'
                    } disabled:cursor-not-allowed disabled:opacity-50`}>
                    Strike
                </button>
                <button
                    onClick={() => editor.chain().focus().toggleCode().run()}
                    disabled={!editorState.canCode}
                    className={`rounded border px-3 py-1 text-sm ${
                        editorState.isCode
                            ? 'border-blue-500 bg-blue-500 text-white'
                            : 'border-gray-300 bg-white text-gray-700 hover:bg-gray-50'
                    } disabled:cursor-not-allowed disabled:opacity-50`}>
                    Code
                </button>
                <button
                    onClick={() => editor.chain().focus().toggleHighlight().run()}
                    className={`rounded border px-3 py-1 text-sm ${
                        editorState.isHighlight
                            ? 'border-yellow-400 bg-yellow-400 text-black'
                            : 'border-gray-300 bg-white text-gray-700 hover:bg-gray-50'
                    }`}>
                    Highlight
                </button>
            </div>

            {/* Headings and paragraph */}
            <div className="mr-2 flex gap-1 border-r border-gray-200 pr-2">
                <button
                    onClick={() => editor.chain().focus().setParagraph().run()}
                    className={`rounded border px-3 py-1 text-sm ${
                        editorState.isParagraph
                            ? 'border-blue-500 bg-blue-500 text-white'
                            : 'border-gray-300 bg-white text-gray-700 hover:bg-gray-50'
                    }`}>
                    P
                </button>
                <button
                    onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()}
                    className={`rounded border px-3 py-1 text-sm ${
                        editorState.isHeading1
                            ? 'border-blue-500 bg-blue-500 text-white'
                            : 'border-gray-300 bg-white text-gray-700 hover:bg-gray-50'
                    }`}>
                    H1
                </button>
                <button
                    onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
                    className={`rounded border px-3 py-1 text-sm ${
                        editorState.isHeading2
                            ? 'border-blue-500 bg-blue-500 text-white'
                            : 'border-gray-300 bg-white text-gray-700 hover:bg-gray-50'
                    }`}>
                    H2
                </button>
                <button
                    onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()}
                    className={`rounded border px-3 py-1 text-sm ${
                        editorState.isHeading3
                            ? 'border-blue-500 bg-blue-500 text-white'
                            : 'border-gray-300 bg-white text-gray-700 hover:bg-gray-50'
                    }`}>
                    H3
                </button>
            </div>

            {/* Text alignment */}
            <div className="mr-2 flex gap-1 border-r border-gray-200 pr-2">
                <button
                    onClick={() => editor.chain().focus().setTextAlign('left').run()}
                    className={`rounded border px-3 py-1 text-sm ${
                        editorState.isAlignLeft
                            ? 'border-blue-500 bg-blue-500 text-white'
                            : 'border-gray-300 bg-white text-gray-700 hover:bg-gray-50'
                    }`}>
                    Left
                </button>
                <button
                    onClick={() => editor.chain().focus().setTextAlign('center').run()}
                    className={`rounded border px-3 py-1 text-sm ${
                        editorState.isAlignCenter
                            ? 'border-blue-500 bg-blue-500 text-white'
                            : 'border-gray-300 bg-white text-gray-700 hover:bg-gray-50'
                    }`}>
                    Center
                </button>
                <button
                    onClick={() => editor.chain().focus().setTextAlign('right').run()}
                    className={`rounded border px-3 py-1 text-sm ${
                        editorState.isAlignRight
                            ? 'border-blue-500 bg-blue-500 text-white'
                            : 'border-gray-300 bg-white text-gray-700 hover:bg-gray-50'
                    }`}>
                    Right
                </button>
                <button
                    onClick={() => editor.chain().focus().setTextAlign('justify').run()}
                    className={`rounded border px-3 py-1 text-sm ${
                        editorState.isAlignJustify
                            ? 'border-blue-500 bg-blue-500 text-white'
                            : 'border-gray-300 bg-white text-gray-700 hover:bg-gray-50'
                    }`}>
                    Justify
                </button>
            </div>

            {/* Lists and blocks */}
            <div className="mr-2 flex gap-1 border-r border-gray-200 pr-2">
                <button
                    onClick={() => editor.chain().focus().toggleBulletList().run()}
                    className={`rounded border px-3 py-1 text-sm ${
                        editorState.isBulletList
                            ? 'border-blue-500 bg-blue-500 text-white'
                            : 'border-gray-300 bg-white text-gray-700 hover:bg-gray-50'
                    }`}>
                    • List
                </button>
                <button
                    onClick={() => editor.chain().focus().toggleOrderedList().run()}
                    className={`rounded border px-3 py-1 text-sm ${
                        editorState.isOrderedList
                            ? 'border-blue-500 bg-blue-500 text-white'
                            : 'border-gray-300 bg-white text-gray-700 hover:bg-gray-50'
                    }`}>
                    1. List
                </button>
                <button
                    onClick={() => editor.chain().focus().toggleCodeBlock().run()}
                    className={`rounded border px-3 py-1 text-sm ${
                        editorState.isCodeBlock
                            ? 'border-blue-500 bg-blue-500 text-white'
                            : 'border-gray-300 bg-white text-gray-700 hover:bg-gray-50'
                    }`}>
                    Code Block
                </button>
                <button
                    onClick={() => editor.chain().focus().toggleBlockquote().run()}
                    className={`rounded border px-3 py-1 text-sm ${
                        editorState.isBlockquote
                            ? 'border-blue-500 bg-blue-500 text-white'
                            : 'border-gray-300 bg-white text-gray-700 hover:bg-gray-50'
                    }`}>
                    Quote
                </button>
            </div>

            {/* Actions */}
            <div className="mr-2 flex gap-1 border-r border-gray-200 pr-2">
                <button
                    onClick={() => editor.chain().focus().unsetAllMarks().run()}
                    className="rounded border border-gray-300 bg-white px-3 py-1 text-sm text-gray-700 hover:bg-gray-50">
                    Clear marks
                </button>
                <button
                    onClick={() => editor.chain().focus().clearNodes().run()}
                    className="rounded border border-gray-300 bg-white px-3 py-1 text-sm text-gray-700 hover:bg-gray-50">
                    Clear nodes
                </button>
                <button
                    onClick={() => editor.chain().focus().setHorizontalRule().run()}
                    className="rounded border border-gray-300 bg-white px-3 py-1 text-sm text-gray-700 hover:bg-gray-50">
                    HR
                </button>
                <button
                    onClick={() => editor.chain().focus().setHardBreak().run()}
                    className="rounded border border-gray-300 bg-white px-3 py-1 text-sm text-gray-700 hover:bg-gray-50">
                    Break
                </button>
            </div>

            {/* Undo/Redo */}
            <div className="flex gap-1">
                <button
                    onClick={() => editor.chain().focus().undo().run()}
                    disabled={!editorState.canUndo}
                    className="rounded border border-gray-300 bg-white px-3 py-1 text-sm text-gray-700 hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-50">
                    Undo
                </button>
                <button
                    onClick={() => editor.chain().focus().redo().run()}
                    disabled={!editorState.canRedo}
                    className="rounded border border-gray-300 bg-white px-3 py-1 text-sm text-gray-700 hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-50">
                    Redo
                </button>
            </div>
        </div>
    );
}

const Tiptap = () => {
    const editor = useEditor({
        extensions,
        content: `
      <h2>
        Hi there,
      </h2>
      <p>
        this is a <em>basic</em> example of <strong>Tiptap</strong>. Sure, there are all kind of basic text styles you'd probably expect from a text editor. But wait until you see the lists:
      </p>
      <ul>
        <li>
          That's a bullet list with one …
        </li>
        <li>
          … or two list items.
        </li>
      </ul>
      <p>
        Isn't that great? And all of that is editable. But wait, there's more. Let's try a code block:
      </p>
      <pre><code class="language-css">body {
  display: none;
}</code></pre>
      <p style="text-align:center">
        I know, I know, this is impressive. It's only the tip of the iceberg though. Give it a try and click a little bit around. Don't forget to check the other examples too.
      </p>
      <p>
        You can also <mark>highlight text</mark> and align it in different ways.
      </p>
      <blockquote>
        Wow, that's amazing. Good work, boy! 👏
        <br />
        — Mom
      </blockquote>
    `,
        immediatelyRender: false,
    });

    if (!editor) {
        return null;
    }

    return (
        <div className="overflow-hidden rounded-lg border border-gray-300">
            <MenuBar editor={editor} />
            <div className="p-4">
                <EditorContent
                    editor={editor}
                    className="prose prose-lg max-w-none [&_.tiptap]:min-h-[400px] [&_.tiptap]:outline-none [&_.tiptap_*:first-child]:mt-0 [&_.tiptap_blockquote]:my-6 [&_.tiptap_blockquote]:border-l-4 [&_.tiptap_blockquote]:border-gray-300 [&_.tiptap_blockquote]:pl-4 [&_.tiptap_blockquote]:text-gray-700 [&_.tiptap_blockquote]:italic [&_.tiptap_code]:rounded [&_.tiptap_code]:bg-gray-100 [&_.tiptap_code]:px-1.5 [&_.tiptap_code]:py-0.5 [&_.tiptap_code]:font-mono [&_.tiptap_code]:text-sm [&_.tiptap_code]:text-gray-800 [&_.tiptap_em]:italic [&_.tiptap_h1]:mt-8 [&_.tiptap_h1]:mb-4 [&_.tiptap_h1]:text-4xl [&_.tiptap_h1]:leading-tight [&_.tiptap_h1]:font-bold [&_.tiptap_h2]:mt-8 [&_.tiptap_h2]:mb-4 [&_.tiptap_h2]:text-3xl [&_.tiptap_h2]:leading-tight [&_.tiptap_h2]:font-bold [&_.tiptap_h3]:mt-6 [&_.tiptap_h3]:mb-3 [&_.tiptap_h3]:text-2xl [&_.tiptap_h3]:leading-tight [&_.tiptap_h3]:font-bold [&_.tiptap_hr]:my-8 [&_.tiptap_hr]:border-0 [&_.tiptap_hr]:border-t [&_.tiptap_hr]:border-gray-300 [&_.tiptap_li]:my-1 [&_.tiptap_li_p]:my-1 [&_.tiptap_mark]:rounded [&_.tiptap_mark]:bg-yellow-200 [&_.tiptap_mark]:px-1 [&_.tiptap_mark]:py-0.5 [&_.tiptap_ol]:my-4 [&_.tiptap_ol]:list-decimal [&_.tiptap_ol]:pl-6 [&_.tiptap_p]:my-3 [&_.tiptap_p]:leading-relaxed [&_.tiptap_pre]:my-6 [&_.tiptap_pre]:overflow-x-auto [&_.tiptap_pre]:rounded-lg [&_.tiptap_pre]:bg-gray-900 [&_.tiptap_pre]:p-4 [&_.tiptap_pre]:font-mono [&_.tiptap_pre]:text-gray-100 [&_.tiptap_pre_code]:bg-transparent [&_.tiptap_pre_code]:p-0 [&_.tiptap_pre_code]:text-sm [&_.tiptap_pre_code]:text-current [&_.tiptap_s]:line-through [&_.tiptap_strong]:font-bold [&_.tiptap_ul]:my-4 [&_.tiptap_ul]:list-disc [&_.tiptap_ul]:pl-6"
                />
            </div>
        </div>
    );
};

export default Tiptap;
