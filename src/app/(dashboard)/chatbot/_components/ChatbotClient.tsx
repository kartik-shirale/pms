"use client";

import { useChat } from "@ai-sdk/react";
import { useRef, useEffect, useState, useCallback } from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import SendIcon from "@mui/icons-material/Send";
import SmartToyIcon from "@mui/icons-material/SmartToy";
import PersonIcon from "@mui/icons-material/Person";
import AutoAwesomeIcon from "@mui/icons-material/AutoAwesome";
import AttachFileIcon from "@mui/icons-material/AttachFile";
import CloseIcon from "@mui/icons-material/Close";
import InsertDriveFileIcon from "@mui/icons-material/InsertDriveFile";
import ImageIcon from "@mui/icons-material/Image";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import type { UIMessage, FileUIPart } from "ai";

interface ChatbotClientProps {
  userName: string;
  userRole: string;
}

const getWelcomeMessage = (role: string, name: string): UIMessage => ({
  id: "welcome",
  role: "assistant",
  parts: [
    {
      type: "text",
      text:
        role === "department_head"
          ? `Hey **${name}**! 👋 I'm your PMS assistant.\n\nAs a **Department Head**, I can help you **create tasks** — including multiple tasks at once, each assigned to different team members.\n\nJust tell me what tasks you'd like to create!`
          : `Hey **${name}**! 👋 I'm your PMS assistant. I can help you **create tasks** and **milestones** through conversation — even multiple at once!\n\nJust tell me what you'd like to do.`,
    },
  ],
});

const ACCEPTED_FILE_TYPES =
  "image/*,.pdf,.doc,.docx,.txt,.csv,.xls,.xlsx,.json,.md";
const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB
const MAX_FILES = 5;

// Convert File to FileUIPart (data URL)
const fileToFileUIPart = (file: File): Promise<FileUIPart> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      resolve({
        type: "file",
        mediaType: file.type || "application/octet-stream",
        filename: file.name,
        url: reader.result as string,
      });
    };
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
};

// Get icon for file type
const getFileIcon = (mediaType: string) => {
  if (mediaType.startsWith("image/")) {
    return <ImageIcon className="w-3.5 h-3.5" />;
  }
  return <InsertDriveFileIcon className="w-3.5 h-3.5" />;
};

// Format file size
const formatFileSize = (bytes: number) => {
  if (bytes < 1024) return bytes + " B";
  if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + " KB";
  return (bytes / (1024 * 1024)).toFixed(1) + " MB";
};

export function ChatbotClient({ userName, userRole }: ChatbotClientProps) {
  const [input, setInput] = useState("");
  const [attachedFiles, setAttachedFiles] = useState<File[]>([]);
  const { messages, sendMessage, status, error } = useChat({
    messages: [getWelcomeMessage(userRole, userName)],
  });

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const isLoading = status === "submitted" || status === "streaming";

  // Auto-scroll to bottom
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // Auto-resize textarea
  const handleTextareaInput = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setInput(e.target.value);
    e.target.style.height = "auto";
    e.target.style.height = Math.min(e.target.scrollHeight, 160) + "px";
  };

  // Handle file selection
  const handleFileSelect = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const selectedFiles = Array.from(e.target.files || []);
      const validFiles = selectedFiles.filter((file) => {
        if (file.size > MAX_FILE_SIZE) {
          return false;
        }
        return true;
      });

      setAttachedFiles((prev) => {
        const combined = [...prev, ...validFiles];
        return combined.slice(0, MAX_FILES);
      });

      // Reset input so the same file can be re-selected
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    },
    [],
  );

  // Remove attached file
  const removeFile = useCallback((index: number) => {
    setAttachedFiles((prev) => prev.filter((_, i) => i !== index));
  }, []);

  const handleSend = async () => {
    if ((!input.trim() && attachedFiles.length === 0) || isLoading) return;

    if (attachedFiles.length > 0) {
      const fileParts = await Promise.all(attachedFiles.map(fileToFileUIPart));
      sendMessage({
        text: input.trim() || "Please review the attached file(s).",
        files: fileParts,
      });
    } else {
      sendMessage({ text: input.trim() });
    }

    setInput("");
    setAttachedFiles([]);
    if (inputRef.current) {
      inputRef.current.style.height = "auto";
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  // Handle drag & drop
  const [isDragging, setIsDragging] = useState(false);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const droppedFiles = Array.from(e.dataTransfer.files).filter(
      (f) => f.size <= MAX_FILE_SIZE,
    );
    setAttachedFiles((prev) => [...prev, ...droppedFiles].slice(0, MAX_FILES));
  }, []);

  // Extract text from message parts
  const getMessageText = (message: UIMessage): string => {
    return message.parts
      .filter(
        (part): part is { type: "text"; text: string } => part.type === "text",
      )
      .map((part) => part.text)
      .join("");
  };

  // Extract file parts from message
  const getMessageFiles = (message: UIMessage): FileUIPart[] => {
    return message.parts.filter(
      (part): part is FileUIPart => part.type === "file",
    );
  };

  // Check if a message has tool invocations (for loading state)
  const hasToolParts = (message: UIMessage): boolean => {
    return message.parts.some(
      (part) =>
        part.type !== "text" &&
        part.type !== "step-start" &&
        part.type !== "file",
    );
  };

  return (
    <div
      className="flex flex-col h-[calc(100vh-4rem)] max-w-7xl mx-auto"
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
    >
      {/* Header */}
      <div className="flex items-center gap-3 px-6 py-4 border-b">
        <div>
          <h1 className="text-lg font-semibold text-custom-primary-text">
            PMS Assistant
          </h1>
        </div>
      </div>

      {/* Drag overlay */}
      {isDragging && (
        <div className="absolute inset-0 z-50 flex items-center justify-center bg-violet-500/10 backdrop-blur-sm border-2 border-dashed border-violet-500 rounded-xl pointer-events-none">
          <div className="flex flex-col items-center gap-2 text-violet-600 dark:text-violet-400">
            <AttachFileIcon className="w-10 h-10" />
            <p className="text-sm font-medium">Drop files here</p>
          </div>
        </div>
      )}

      {/* Messages */}
      <div className="flex-1 overflow-y-auto px-6 py-4 space-y-6">
        {messages
          .filter((m) => m.role !== "system")
          .map((message) => {
            const text = getMessageText(message);
            const files = getMessageFiles(message);

            // Tool-only messages with no text — show gathering indicator
            if (
              message.role === "assistant" &&
              !text &&
              !files.length &&
              hasToolParts(message)
            ) {
              return (
                <div key={message.id} className="flex items-start gap-3">
                  <div className="flex items-center justify-center w-8 h-8 rounded-full bg-gradient-to-br from-violet-500 to-indigo-600 text-white shrink-0">
                    <SmartToyIcon className="w-4 h-4" />
                  </div>
                  <div className="flex items-center gap-2 px-4 py-2 rounded-2xl bg-custom-foreground border text-sm text-custom-secondary-text">
                    <div className="flex gap-1">
                      <span className="w-1.5 h-1.5 bg-violet-400 rounded-full animate-bounce [animation-delay:0ms]" />
                      <span className="w-1.5 h-1.5 bg-violet-400 rounded-full animate-bounce [animation-delay:150ms]" />
                      <span className="w-1.5 h-1.5 bg-violet-400 rounded-full animate-bounce [animation-delay:300ms]" />
                    </div>
                    <span>Gathering information...</span>
                  </div>
                </div>
              );
            }

            if (!text && !files.length) return null;

            const isUser = message.role === "user";

            return (
              <div
                key={message.id}
                className={cn(
                  "flex items-start gap-3",
                  isUser && "flex-row-reverse",
                )}
              >
                {/* Avatar */}
                <div
                  className={cn(
                    "flex items-center justify-center w-8 h-8 rounded-full shrink-0",
                    isUser
                      ? "bg-custom-primary-text text-custom-background"
                      : "bg-gradient-to-br from-violet-500 to-indigo-600 text-white",
                  )}
                >
                  {isUser ? (
                    <PersonIcon className="w-4 h-4" />
                  ) : (
                    <SmartToyIcon className="w-4 h-4" />
                  )}
                </div>

                {/* Message */}
                <div
                  className={cn(
                    "max-w-[80%] rounded-2xl px-4 py-3 text-sm leading-relaxed",
                    isUser
                      ? "bg-custom-primary-text text-custom-background rounded-tr-sm"
                      : "bg-custom-foreground border text-custom-primary-text rounded-tl-sm",
                  )}
                >
                  {/* File attachments */}
                  {files.length > 0 && (
                    <div className="flex flex-wrap gap-2 mb-2">
                      {files.map((file, i) => (
                        <div key={i}>
                          {file.mediaType.startsWith("image/") ? (
                            <img
                              src={file.url}
                              alt={file.filename || "Attached image"}
                              className="max-w-[200px] max-h-[150px] rounded-lg object-cover"
                            />
                          ) : (
                            <div
                              className={cn(
                                "flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs",
                                isUser
                                  ? "bg-white/15"
                                  : "bg-black/5 dark:bg-white/10",
                              )}
                            >
                              {getFileIcon(file.mediaType)}
                              <span className="truncate max-w-[120px]">
                                {file.filename || "File"}
                              </span>
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  )}

                  {/* Text content */}
                  {text &&
                    (isUser ? (
                      <p className="whitespace-pre-wrap">{text}</p>
                    ) : (
                      <div className="prose prose-sm dark:prose-invert max-w-none prose-p:my-1 prose-headings:my-2 prose-ul:my-1 prose-ol:my-1 prose-li:my-0.5 prose-table:my-2 prose-pre:my-2 prose-pre:bg-black/5 prose-pre:dark:bg-white/5 prose-td:px-3 prose-td:py-1.5 prose-th:px-3 prose-th:py-1.5 prose-table:border-collapse prose-table:border prose-td:border prose-th:border prose-th:bg-black/5 prose-th:dark:bg-white/10">
                        <ReactMarkdown remarkPlugins={[remarkGfm]}>
                          {text}
                        </ReactMarkdown>
                      </div>
                    ))}
                </div>
              </div>
            );
          })}

        {/* Loading indicator */}
        {isLoading &&
          !messages.some(
            (m) =>
              m.role === "assistant" && !getMessageText(m) && hasToolParts(m),
          ) && (
            <div className="flex items-start gap-3">
              <div className="flex items-center justify-center w-8 h-8 rounded-full bg-gradient-to-br from-violet-500 to-indigo-600 text-white shrink-0">
                <SmartToyIcon className="w-4 h-4" />
              </div>
              <div className="flex items-center gap-2 px-4 py-3 rounded-2xl bg-custom-foreground border">
                <div className="flex gap-1">
                  <span className="w-1.5 h-1.5 bg-violet-400 rounded-full animate-bounce [animation-delay:0ms]" />
                  <span className="w-1.5 h-1.5 bg-violet-400 rounded-full animate-bounce [animation-delay:150ms]" />
                  <span className="w-1.5 h-1.5 bg-violet-400 rounded-full animate-bounce [animation-delay:300ms]" />
                </div>
              </div>
            </div>
          )}

        {/* Error */}
        {error && (
          <div className="flex items-center justify-center px-4 py-3 rounded-xl bg-red-50 dark:bg-red-950/20 border border-red-200 dark:border-red-800 text-red-600 dark:text-red-400 text-sm">
            Something went wrong. Please try again.
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Input area */}
      <div className="px-6 py-4 border-t bg-custom-background">
        {/* Attached files preview */}
        {attachedFiles.length > 0 && (
          <div className="flex flex-wrap gap-2 mb-3">
            {attachedFiles.map((file, index) => (
              <div
                key={`${file.name}-${index}`}
                className="flex items-center gap-2 px-3 py-1.5 bg-custom-foreground border rounded-xl text-xs text-custom-primary-text group"
              >
                {getFileIcon(file.type)}
                <span className="truncate max-w-[120px]">{file.name}</span>
                <span className="text-custom-secondary-text">
                  {formatFileSize(file.size)}
                </span>
                <button
                  type="button"
                  onClick={() => removeFile(index)}
                  className="ml-0.5 p-0.5 rounded-full hover:bg-red-100 dark:hover:bg-red-900/30 text-custom-secondary-text hover:text-red-500 transition-colors"
                >
                  <CloseIcon className="w-3 h-3" />
                </button>
              </div>
            ))}
          </div>
        )}

        <div className="flex items-end gap-2 bg-custom-foreground border rounded-full px-4 py-2 focus-within:ring-2 focus-within:ring-violet-500/20 focus-within:border-violet-500/50 transition-all">
          {/* Hidden file input */}
          <input
            ref={fileInputRef}
            type="file"
            accept={ACCEPTED_FILE_TYPES}
            multiple
            onChange={handleFileSelect}
            className="hidden"
          />

          {/* Attach button */}
          <Button
            type="button"
            size="icon"
            variant="ghost"
            onClick={() => fileInputRef.current?.click()}
            disabled={isLoading || attachedFiles.length >= MAX_FILES}
            className="h-8 w-8 rounded-full text-custom-secondary-text hover:text-violet-500 hover:bg-violet-50 dark:hover:bg-violet-950/30 disabled:opacity-40 shrink-0"
            title={
              attachedFiles.length >= MAX_FILES
                ? `Max ${MAX_FILES} files`
                : "Attach files"
            }
          >
            <AttachFileIcon className="w-4 h-4" />
          </Button>

          <textarea
            ref={inputRef}
            value={input}
            onChange={handleTextareaInput}
            onKeyDown={handleKeyDown}
            placeholder={userRole === "department_head" ? "Create tasks for team members..." : "Create tasks or milestones..."}
            rows={1}
            className="flex-1 bg-transparent text-sm text-custom-primary-text placeholder:text-custom-secondary-text outline-none resize-none min-h-[36px] max-h-[160px] py-1.5"
            disabled={isLoading}
          />

          <div className="flex items-center gap-1 shrink-0 pb-0.5">
            <Button
              type="button"
              size="icon"
              onClick={handleSend}
              disabled={
                (!input.trim() && attachedFiles.length === 0) || isLoading
              }
              className="h-8 w-8 rounded-full bg-gradient-to-r from-violet-500 to-indigo-600 hover:from-violet-600 hover:to-indigo-700 text-white disabled:opacity-40 disabled:cursor-not-allowed transition-all"
            >
              <SendIcon className="w-4 h-4" />
            </Button>
          </div>
        </div>

        <p className="text-[10px] text-custom-secondary-text text-center mt-2">
          Powered by Gemini AI • Attach images, PDFs & documents up to 10MB
        </p>
      </div>
    </div>
  );
}
