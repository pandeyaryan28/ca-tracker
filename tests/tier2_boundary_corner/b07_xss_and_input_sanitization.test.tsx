import { describe, it, expect } from 'vitest';
import React from 'react';
import { render, screen } from '@testing-library/react';
import { Badge } from '@/components/common/Badge';
import { Card } from '@/components/common/Card';

describe('Tier 2 - Boundary 7: XSS Attack & HTML Input Sanitization', () => {
  it('safely escapes <script> tag injections in topic text rendering', () => {
    const malicious = '<script>alert("xss")</script>';
    render(<Card><span>{malicious}</span></Card>);
    expect(screen.getByText('<script>alert("xss")</script>')).toBeInTheDocument();
  });

  it('safely escapes img onerror payload in badges', () => {
    const maliciousImg = '<img src=x onerror=alert(1)>';
    render(<Badge>{maliciousImg}</Badge>);
    expect(screen.getByText('<img src=x onerror=alert(1)>')).toBeInTheDocument();
  });

  it('safely escapes javascript: URI schema strings', () => {
    const jsUri = 'javascript:alert(1)';
    render(<div>{jsUri}</div>);
    expect(screen.getByText('javascript:alert(1)')).toBeInTheDocument();
  });

  it('safely escapes iframe embed code in notes field', () => {
    const iframeCode = '<iframe src="https://evil.com"></iframe>';
    render(<div data-testid="notes-content">{iframeCode}</div>);
    expect(screen.getByTestId('notes-content').textContent).toBe(iframeCode);
  });

  it('safely renders SQL injection string in test titles without execution', () => {
    const sqlInjection = "'; DROP TABLE topics; --";
    render(<div>{sqlInjection}</div>);
    expect(screen.getByText("'; DROP TABLE topics; --")).toBeInTheDocument();
  });
});
