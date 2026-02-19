"use client";

import { useEffect, useMemo } from "react";
import { useCreateBlockNote } from "@blocknote/react";
import { BlockNoteView } from "@blocknote/mantine";
import "@blocknote/mantine/style.css";

type BlockNoteEditorProps = {
    value?: string;
    onChange?: (value: string) => void;
    placeholder?: string;
    className?: string;
};

export function BlockNoteEditor({
    value,
    onChange,
    placeholder = "Write a description, a project brief, or collect ideas...",
    className = "",
}: BlockNoteEditorProps) {
    const initialContent = useMemo(() => {
        if (!value) return undefined;
        try {
            return JSON.parse(value);
        } catch {
            return undefined;
        }
    }, []);

    const editor = useCreateBlockNote({
        initialContent,
    });

    useEffect(() => {
        if (!editor || !onChange) return;

        const handleChange = async () => {
            const blocks = editor.document;
            onChange(JSON.stringify(blocks));
        };

        editor.onChange(handleChange);
    }, [editor, onChange]);

    return (
        <div className={`blocknote-wrapper ${className}`}>
            <BlockNoteView
                editor={editor}
                theme="light"
                data-theming-css-variables-demo
                className="blocknote-editor"
            />
            <style jsx global>{`
        .blocknote-wrapper {
          border: none;
          width: 100%;
        }

        .blocknote-editor {
          border: none !important;
          background: transparent !important;
        }

        .blocknote-editor .bn-editor {
          padding: 0 !important;
        }

        .blocknote-editor .bn-block-outer {
          margin-top: 0.25rem;
          margin-bottom: 0.25rem;
        }

        .blocknote-editor .bn-inline-content {
          font-size: 0.875rem;
          line-height: 1.5;
          color: rgb(55, 65, 81);
        }

        .blocknote-editor [data-placeholder]::before {
          color: rgb(156, 163, 175);
          content: "${placeholder}";
        }

        .blocknote-editor .bn-side-menu {
          opacity: 0;
          transition: opacity 0.2s;
        }

        .blocknote-editor:hover .bn-side-menu,
        .blocknote-editor:focus-within .bn-side-menu {
          opacity: 1;
        }
      `}</style>
        </div>
    );
}
