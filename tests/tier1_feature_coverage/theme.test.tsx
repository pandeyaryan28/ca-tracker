import React from 'react';
import { describe, it, expect, beforeEach } from 'vitest';
import { render, screen, fireEvent, act } from '@testing-library/react';
import { ThemeProvider, useTheme } from '@/context/ThemeContext';
import { STORAGE_KEYS } from '@/lib/constants';

const ThemeTester: React.FC = () => {
  const { theme, resolvedTheme, toggleTheme, setTheme } = useTheme();
  return (
    <div>
      <div data-testid="active-theme">{theme}</div>
      <div data-testid="resolved">{resolvedTheme}</div>
      <button onClick={toggleTheme}>Toggle Mode</button>
      <button onClick={() => setTheme('light')}>Set Light</button>
      <button onClick={() => setTheme('dark')}>Set Dark</button>
      <button onClick={() => setTheme('system')}>Set System</button>
    </div>
  );
};

describe('Tier 1: Apple Minimalist Theme System (Feature #1)', () => {
  beforeEach(() => {
    localStorage.clear();
    document.documentElement.classList.remove('dark');
  });

  it('initializes dark mode class on document element by default', () => {
    render(
      <ThemeProvider>
        <ThemeTester />
      </ThemeProvider>
    );

    expect(screen.getByTestId('active-theme')).toHaveTextContent('dark');
    expect(document.documentElement.classList.contains('dark')).toBe(true);
  });

  it('smoothly toggles dark to light mode on user action', () => {
    render(
      <ThemeProvider>
        <ThemeTester />
      </ThemeProvider>
    );

    act(() => {
      fireEvent.click(screen.getByText('Toggle Mode'));
    });

    expect(screen.getByTestId('resolved')).toHaveTextContent('light');
    expect(document.documentElement.classList.contains('dark')).toBe(false);
  });

  it('sets explicit light theme and stores preference', () => {
    render(
      <ThemeProvider>
        <ThemeTester />
      </ThemeProvider>
    );

    act(() => {
      fireEvent.click(screen.getByText('Set Light'));
    });

    expect(screen.getByTestId('resolved')).toHaveTextContent('light');
    expect(localStorage.getItem(STORAGE_KEYS.THEME)).toBe('light');
  });

  it('sets explicit dark theme and stores preference', () => {
    render(
      <ThemeProvider>
        <ThemeTester />
      </ThemeProvider>
    );

    act(() => {
      fireEvent.click(screen.getByText('Set Dark'));
    });

    expect(screen.getByTestId('resolved')).toHaveTextContent('dark');
    expect(localStorage.getItem(STORAGE_KEYS.THEME)).toBe('dark');
  });

  it('hydrates saved theme preference from localStorage on mount', () => {
    localStorage.setItem(STORAGE_KEYS.THEME, 'light');

    render(
      <ThemeProvider>
        <ThemeTester />
      </ThemeProvider>
    );

    expect(screen.getByTestId('resolved')).toHaveTextContent('light');
  });
});
