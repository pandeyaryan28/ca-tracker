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
 * Normalizes text and math tokens:
 * 1. Converts currency backticks (` 100, Price (`)) into the official Indian Rupee symbol (₹100, Price (₹)).
 * 2. Normalizes LaTeX brackets \( ... \) and \[ ... \] into $ ... $ and $$ ... $$.
 * 3. Safely wraps isolated LaTeX commands (e.g. \frac, \sqrt, \log_2, exponents) in $ delimiters without corrupting English prose.
 */
function normalizeMathText(rawText: string): string {
  if (!rawText) return '';

  // 1. Normalize currency backticks into authentic Indian Rupee symbol ₹
  let text = rawText
    .replace(/\(\s*`\s*\)/g, '(₹)')
    .replace(/`\s*(\d[\d,]*(?:\.\d+)?)/g, '₹$1')
    .replace(/`\s*(?=[A-Za-z])/g, '₹')
    .replace(/\bRs\.?\s*(\d[\d,]*(?:\.\d+)?)/g, '₹$1');

  // 2. Normalize \( ... \) to $ ... $ and \[ ... \] to $$ ... $$
  text = text
    .replace(/\\\[([\s\S]*?)\\\]/g, '$$$$$1$$$$')
    .replace(/\\\(([\s\S]*?)\\\)/g, '$$$1$$');

  // 3. If text already contains explicit math delimiters ($), do not auto-wrap whole text
  if (text.includes('$')) {
    return text;
  }

  // 4. Check if text contains raw LaTeX math commands like \frac, \sqrt, \sum, etc.
  const hasLatexCommand = /\\(frac|sqrt|sum|int|lim|binom|pm|times|div|le|ge|ne|alpha|beta|sigma|mu|lambda|pi|log|infty|approx|cdot)/.test(text);

  if (hasLatexCommand) {
    const hasEnglishWords = /[A-Za-z]{3,}\s+[A-Za-z]{3,}/.test(text);
    if (!hasEnglishWords) {
      // Entire text is a standalone formula like \frac{p}{p+q} or \sqrt{x+1}
      return `$${text}$`;
    }
    // Text has English prose mixed with LaTeX commands, e.g. "The derivative of \sqrt{x+1} is:"
    // Wrap only the LaTeX commands and their parameters
    text = text.replace(
      /(\\?(?:frac|sqrt|binom)\{[^{}]+\}(?:\{[^{}]+\})?|\\(?:sum|int|lim)(?:_\{[^{}]+\})?(?:\^\{[^{}]+\})?|\\[a-zA-Z]+(?:\{[^{}]+\})*)/g,
      '$$$1$$'
    );
  }

  return text;
}

/**
 * Splits text into segments of plain text, inline math ($...$),
 * and block math ($$...$$).
 */
function parseMathSegments(rawText: string): TextSegment[] {
  if (!rawText) return [];

  const normalized = normalizeMathText(rawText);
  const segments: TextSegment[] = [];
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
 * Sanitizes math content before feeding to KaTeX:
 * Escapes unescaped % so KaTeX does not treat it as a LaTeX comment and drop remainder.
 */
function sanitizeKatexContent(content: string): string {
  return content.replace(/(?<!\\)%/g, '\\%');
}

/**
 * Renders mathematical expressions, financial signs/symbols, and plain text with KaTeX.
 * Supports inline ($...$) and block ($$...$$) LaTeX expressions,
 * preserving fluid Apple-style typography, Indian Rupee currency (₹),
 * and dark/light mode parity.
 */
export const MathText: React.FC<MathTextProps> = React.memo(({ text, className = '', block = false }) => {
  const segments = useMemo(() => parseMathSegments(text), [text]);

  if (!text) return null;

  if (block) {
    const renderedHtml = useMemo(() => {
      try {
        const cleanContent = sanitizeKatexContent(
          text.replace(/^\$\$|\$\$$/g, '').replace(/^\$|\$$/g, '')
        );
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
        const cleanMath = sanitizeKatexContent(seg.content);
        let renderedHtml = cleanMath;
        try {
          renderedHtml = katex.renderToString(cleanMath, {
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
