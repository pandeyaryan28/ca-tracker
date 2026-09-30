import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { render, screen, fireEvent, act } from '@testing-library/react';
import { App } from '@/App';
import { ThemeProvider } from '@/context/ThemeContext';
import { ThemeToggle } from '@/components/common/ThemeToggle';
import { DataProvider } from '@/context/DataContext';
import { STORAGE_KEYS } from '@/lib/constants';

describe('Adversarial Dark/Light Mode Theming & Style Consistency Audit', () => {
  beforeEach(() => {
    localStorage.clear();
    document.documentElement.classList.remove('dark');
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('cycles theme through single-button toggle and toggles .dark class on document.documentElement', () => {
    render(
      <ThemeProvider>
        <ThemeToggle />
      </ThemeProvider>
    );

    const toggleBtn = screen.getByRole('button');
    expect(toggleBtn).toBeInTheDocument();

    const initialIsDark = document.documentElement.classList.contains('dark');
    
    act(() => {
      fireEvent.click(toggleBtn);
    });

    const toggledIsDark = document.documentElement.classList.contains('dark');
    expect(toggledIsDark).toBe(!initialIsDark);

    // Toggle again
    act(() => {
      fireEvent.click(toggleBtn);
    });
    expect(document.documentElement.classList.contains('dark')).toBe(initialIsDark);
  });

  it('verifies segmented theme picker supports explicit light, dark, and system modes and persists to localStorage', () => {
    render(
      <ThemeProvider>
        <ThemeToggle showSegmented />
      </ThemeProvider>
    );

    const lightBtn = screen.getByRole('button', { name: /Light/i });
    const darkBtn = screen.getByRole('button', { name: /Dark/i });
    const autoBtn = screen.getByRole('button', { name: /Auto/i });

    expect(lightBtn).toBeInTheDocument();
    expect(darkBtn).toBeInTheDocument();
    expect(autoBtn).toBeInTheDocument();

    // Select Light
    act(() => {
      fireEvent.click(lightBtn);
    });
    expect(document.documentElement.classList.contains('dark')).toBe(false);
    expect(localStorage.getItem(STORAGE_KEYS.THEME)).toBe('light');

    // Select Dark
    act(() => {
      fireEvent.click(darkBtn);
    });
    expect(document.documentElement.classList.contains('dark')).toBe(true);
    expect(localStorage.getItem(STORAGE_KEYS.THEME)).toBe('dark');

    // Select Auto/System
    act(() => {
      fireEvent.click(autoBtn);
    });
    expect(localStorage.getItem(STORAGE_KEYS.THEME)).toBe('system');
  });

  it('verifies dark: variant class parity on all atomic and shell containers', () => {
    const { container } = render(
      <ThemeProvider>
        <DataProvider>
          <App />
        </DataProvider>
      </ThemeProvider>
    );

    // Root div has dark:bg-zinc-950 and dark:text-zinc-50
    const rootDiv = container.firstChild as HTMLElement;
    expect(rootDiv).toHaveClass('dark:bg-zinc-950');
    expect(rootDiv).toHaveClass('dark:text-zinc-50');

    // Header has dark:border-zinc-800/80
    const header = container.querySelector('header');
    expect(header).toHaveClass('dark:border-zinc-800/80');

    // Sidebar has dark:border-zinc-800/80
    const sidebar = container.querySelector('aside');
    expect(sidebar).toHaveClass('glass-sidebar');

    // Bottom dock has dark:border-zinc-800/90
    const dockNav = container.querySelector('nav[aria-label="Mobile Navigation Dock"]');
    expect(dockNav).toHaveClass('glass-dock');
    expect(dockNav).toHaveClass('dark:border-zinc-800/90');
  });

  it('maintains theme state across tab transitions without reset or flicker', () => {
    render(
      <ThemeProvider>
        <DataProvider>
          <App />
        </DataProvider>
      </ThemeProvider>
    );

    // Set dark theme
    const themeBtn = screen.getByLabelText(/Switch to/i);
    if (!document.documentElement.classList.contains('dark')) {
      act(() => {
        fireEvent.click(themeBtn);
      });
    }
    expect(document.documentElement.classList.contains('dark')).toBe(true);

    // Navigate to all tabs
    const dock = screen.getByRole('navigation', { name: 'Mobile Navigation Dock' });
    const buttons = dock.querySelectorAll('button');

    buttons.forEach((btn) => {
      act(() => {
        fireEvent.click(btn);
      });
      // Theme must stay dark
      expect(document.documentElement.classList.contains('dark')).toBe(true);
    });
  });
});
