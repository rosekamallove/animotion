"use client";

import { useState, useEffect, useRef } from "react";
import { codeToHtml } from "shiki";
import { Copy, Check } from "@phosphor-icons/react";
import { Button } from "@/components/ui/button";

interface CodeBlockProps {
  code: string;
  language?: string;
  maxHeight?: number;
  showCopy?: boolean;
}

export function CodeBlock({ code, language = "tsx", maxHeight = 500, showCopy = true }: CodeBlockProps) {
  const [html, setHtml] = useState<string>("");
  const [copied, setCopied] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    let cancelled = false;
    codeToHtml(code, {
      lang: language,
      theme: "github-light",
    }).then((result) => {
      if (!cancelled) setHtml(result);
    }).catch(() => {
      // Shiki can fail during HMR in dev — fall back to plain text
    });
    return () => { cancelled = true; };
  }, [code, language]);

  const handleCopy = async () => {
    await navigator.clipboard.writeText(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="relative group rounded-lg border overflow-hidden">
      {showCopy && (
        <Button
          variant="ghost"
          size="icon-xs"
          onClick={handleCopy}
          className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity z-10 bg-background/80 backdrop-blur-sm"
        >
          {copied ? <Check size={12} weight="bold" /> : <Copy size={12} />}
        </Button>
      )}
      {html ? (
        <div
          ref={containerRef}
          className="overflow-auto text-xs leading-relaxed [&_pre]:!bg-muted/30 [&_pre]:p-4 [&_pre]:m-0"
          style={{ maxHeight }}
          dangerouslySetInnerHTML={{ __html: html }}
        />
      ) : (
        <div ref={containerRef} className="overflow-auto" style={{ maxHeight }}>
          <pre className="bg-muted/30 p-4 m-0 text-xs leading-relaxed">
            <code className="text-muted-foreground">{code}</code>
          </pre>
        </div>
      )}
    </div>
  );
}
