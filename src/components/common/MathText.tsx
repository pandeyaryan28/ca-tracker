import React, { useMemo } from 'react';
import katex from 'katex';

interface MathTextProps {
  text: string;
  className?: string;
  block?: boolean;
}

interface TextSegment {
  type: 'text' | 'inline-math' | 'block-math';
  content: string;
}

/**
 * Splits text into segments of plain text, inline math ($...$ or \(...\)),
 * and block math ($$...$$ or \[...\]).
 * Also auto-wraps standalone raw LaTeX commands like \frac{...}{...} or \sqrt{...}
 * if not already enclosed in math delimiters.
 */
function parseMathSegments(rawText: string): TextSegment[] {
  if (!rawText) return [];

  // Normalize \( ... \) to $ ... $ and \[ ... \] to $$ ... $$
  let normalized = rawText
    .replace(/\\\[([\s\S]*?)\\\]/g, '$$$$$1$$$$')
    .replace(/\\\(([\s\S]*?)\\\)/g, '$$$1$$');

  // If text contains raw LaTeX commands like \frac or \sum but no '$', wrap the expression
  if (!normalized.includes('$') && /\\(frac|sqrt|sum|int|lim|binom|pm|times|div|le|ge|ne|alpha|beta|sigma|mu|lambda|pi)/.test(normalized)) {
    // Wrap entire formula or math tokens
    normalized = `$${normalized}$`;
  }

  const segments: TextSegment[] = [];
  // Regex to match $$...$$ (block) or $...$ (inline)
  const regex = /(\$\$[\s\S]*?\$\$|\$[^$\n]+\$)/g;
  let lastIndex = 0;
  let match: RegExpExecArray | null;

  while ((match = regex.exec(normalized)) !== null) {
    if (match.index > lastIndex) {
      segments.push({
        type: 'text',
        content: normalized.substring(lastIndex, match.index),
      });
    }

    const matchedStr = match[0];
    if (matchedStr.startsWith('$$') && matchedStr.endsWith('$$')) {
      segments.push({
        type: 'block-math',
        content: matchedStr.slice(2, -2).trim(),
      });
    } else if (matchedStr.startsWith('$') && matchedStr.endsWith('$')) {
      segments.push({
        type: 'inline-math',
        content: matchedStr.slice(1, -1).trim(),
      });
    }

    lastIndex = regex.lastIndex;
  }

  if (lastIndex < normalized.length) {
    segments.push({
      type: 'text',
      content: normalized.substring(lastIndex),
    });
  }

  return segments;
}

/**
 * Renders mathematical expressions and plain text with KaTeX.
 * Supports inline ($...$) and block ($$...$$) LaTeX expressions,
 * preserving fluid Apple-style typography and dark/light mode parity.
 */
export const MathText: React.FC<MathTextProps> = React.memo(({ text, className = '', block = false }) => {
  const segments = useMemo(() => parseMathSegments(text), [text]);

  if (!text) return null;

  if (block) {
    const renderedHtml = useMemo(() => {
      try {
        const cleanContent = text.replace(/^\$\$|\$\$$/g, '').replace(/^\$|\$$/g, '');
        return katex.renderToString(cleanContent, {
          displayMode: true,
          throwOnError: false,
          output: 'htmlAndMathml',
        });
      } catch {
        return text;
      }
    }, [text]);

    return (
      <div
        className={`math-block overflow-x-auto py-1 text-zinc-900 dark:text-zinc-100 ${className}`}
        dangerouslySetInnerHTML={{ __html: renderedHtml }}
      />
    );
  }

  return (
    <span className={`math-inline inline leading-relaxed ${className}`}>
      {segments.map((seg, i) => {
        if (seg.type === 'text') {
          return <React.Fragment key={i}>{seg.content}</React.Fragment>;
        }

        const isBlockSeg = seg.type === 'block-math';
        let renderedHtml = seg.content;
        try {
          renderedHtml = katex.renderToString(seg.content, {
            displayMode: isBlockSeg,
            throwOnError: false,
            output: 'htmlAndMathml',
          });
        } catch {
          return <span key={i} className="font-mono text-sm text-zinc-600 dark:text-zinc-400">{seg.content}</span>;
        }

        if (isBlockSeg) {
          return (
            <span
              key={i}
              className="block my-2 overflow-x-auto text-zinc-900 dark:text-zinc-100"
              dangerouslySetInnerHTML={{ __html: renderedHtml }}
            />
          );
        }

        return (
          <span
            key={i}
            className="inline-block px-0.5 text-zinc-900 dark:text-zinc-100 align-baseline"
            dangerouslySetInnerHTML={{ __html: renderedHtml }}
          />
        );
      })}
    </span>
  );
});

MathText.displayName = 'MathText';
export default MathText;
