"use client";

import { useMemo } from "react";
import { useCreateBlockNote } from "@blocknote/react";
import { BlockNoteView } from "@blocknote/mantine";
import "@blocknote/mantine/style.css";

type BlockNoteViewerProps = {
    content: string;
    className?: string;
};

/**
 * Read-only BlockNote viewer for displaying rich text content
 * stored as JSON by the BlockNoteEditor
 */
export function BlockNoteViewer({ content, className = "" }: BlockNoteViewerProps) {
    const initialContent = useMemo(() => {
        if (!content) return undefined;
        try {
            return JSON.parse(content);
        } catch {
            return undefined;
        }
    }, [content]);

    const editor = useCreateBlockNote({
        initialContent,
    });

    // If content is not valid BlockNote JSON, render as plain text
    if (!initialContent) {
        return (
            <p className="text-sm text-gray-700 dark:text-gray-300">
                {content}
            </p>
        );
    }

    return (
        <div className={`blocknote-viewer ${className}`}>
            <BlockNoteView
                editor={editor}
                editable={false}
                theme="light"
                className="blocknote-viewer-inner"
            />
            <style jsx global>{`
                .blocknote-viewer {
                    border: none;
                    width: 100%;
                }

                .blocknote-viewer-inner {
                    border: none !important;
                    background: transparent !important;
                }

                .blocknote-viewer-inner .bn-editor {
                    padding: 0 !important;
                }

                .blocknote-viewer-inner .bn-block-outer {
                    margin-top: 0.15rem;
                    margin-bottom: 0.15rem;
                }

                .blocknote-viewer-inner .bn-inline-content {
                    font-size: 0.875rem;
                    line-height: 1.5;
                    color: rgb(55, 65, 81);
                }

                .blocknote-viewer-inner .bn-side-menu {
                    display: none !important;
                }

                .blocknote-viewer-inner .bn-drag-handle-menu {
                    display: none !important;
                }
            `}</style>
        </div>
    );
}
