import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { render, screen, fireEvent, act } from '@testing-library/react';
import { App } from '@/App';
import { ThemeProvider } from '@/context/ThemeContext';
import { DataProvider } from '@/context/DataContext';

describe('Adversarial Viewport Responsiveness & Dual Navigation Architecture', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  const renderWithProviders = (ui: React.ReactNode) => {
    return render(
      <ThemeProvider>
        <DataProvider>{ui}</DataProvider>
      </ThemeProvider>
    );
  };

  it('renders dual navigation architecture elements (Sidebar for Desktop >=1024px, BottomDock for Mobile <1024px)', () => {
    const { container } = renderWithProviders(<App />);
    
    // Sidebar exists with correct classes
    const sidebar = container.querySelector('aside[aria-label="Main Desktop Navigation"]');
    expect(sidebar).toBeInTheDocument();
    expect(sidebar).toHaveClass('hidden');
    expect(sidebar).toHaveClass('lg:flex');
    expect(sidebar).toHaveClass('glass-sidebar');

    // Bottom dock exists with correct classes
    const bottomDockNav = container.querySelector('nav[aria-label="Mobile Navigation Dock"]');
    expect(bottomDockNav).toBeInTheDocument();
    const bottomDockWrapper = bottomDockNav?.parentElement;
    expect(bottomDockWrapper).toHaveClass('lg:hidden');
    expect(bottomDockWrapper).toHaveClass('fixed');
    expect(bottomDockWrapper).toHaveClass('bottom-0');
  });

  it('verifies bottom padding compensation on main view to prevent dock obscuring content on mobile', () => {
    const { container } = renderWithProviders(<App />);
    const main = container.querySelector('main');
    expect(main).toBeInTheDocument();
    // pb-28 provides 112px clearance for mobile dock (dock is 64px + safe area), lg:pb-12 on desktop
    expect(main).toHaveClass('pb-28');
    expect(main).toHaveClass('lg:pb-12');
  });

  it('verifies sidebar collapsible toggling on desktop viewport', () => {
    const { container } = renderWithProviders(<App />);
    const sidebar = container.querySelector('aside[aria-label="Main Desktop Navigation"]');
    expect(sidebar).toHaveClass('w-64');

    const collapseButton = screen.getByLabelText('Collapse Sidebar');
    expect(collapseButton).toBeInTheDocument();

    // Collapse
    act(() => {
      fireEvent.click(collapseButton);
    });
    expect(sidebar).toHaveClass('w-20');
    expect(sidebar).not.toHaveClass('w-64');

    // Expand
    const expandButton = screen.getByLabelText('Expand Sidebar');
    expect(expandButton).toBeInTheDocument();
    act(() => {
      fireEvent.click(expandButton);
    });
    expect(sidebar).toHaveClass('w-64');
  });

  it('switches views seamlessly from both desktop sidebar and mobile bottom dock', () => {
    renderWithProviders(<App />);

    // Initial view is Command Center (Dashboard)
    expect(screen.getByRole('heading', { level: 1 })).toHaveTextContent('Command Center');

    // Click Checklist on Bottom Dock
    const bottomDock = screen.getByRole('navigation', { name: 'Mobile Navigation Dock' });
    const checklistDockBtn = bottomDock.querySelector('button:nth-child(2)');
    expect(checklistDockBtn).toBeInTheDocument();
    act(() => {
      fireEvent.click(checklistDockBtn!);
    });
    expect(screen.getByRole('heading', { level: 1 })).toHaveTextContent('Syllabus Checklist');

    // Click Tests on Sidebar
    const sidebar = screen.getByRole('complementary', { name: 'Main Desktop Navigation' });
    const allSidebarButtons = sidebar.querySelectorAll('button');
    const testsBtn = Array.from(allSidebarButtons).find((b) => b.textContent?.includes('Test Series'));
    expect(testsBtn).toBeInTheDocument();
    act(() => {
      fireEvent.click(testsBtn!);
    });
    expect(screen.getByRole('heading', { level: 1 })).toHaveTextContent('Test Series & Marks');

    // Click Revisions on Dock
    const revisionsDockBtn = bottomDock.querySelector('button:nth-child(4)');
    act(() => {
      fireEvent.click(revisionsDockBtn!);
    });
    expect(screen.getByRole('heading', { level: 1 })).toHaveTextContent('Spaced Revisions');

    // Click Ingestion on Sidebar
    const ingestionBtn = Array.from(allSidebarButtons).find((b) => b.textContent?.includes('Ingestion'));
    expect(ingestionBtn).toBeInTheDocument();
    act(() => {
      fireEvent.click(ingestionBtn!);
    });
    expect(screen.getByRole('heading', { level: 1 })).toHaveTextContent('Ingestion & Export Hub');

    // Click Settings on Sidebar
    const settingsBtn = Array.from(allSidebarButtons).find((b) => b.textContent?.includes('Settings'));
    expect(settingsBtn).toBeInTheDocument();
    act(() => {
      fireEvent.click(settingsBtn!);
    });
    expect(screen.getByRole('heading', { level: 1 })).toHaveTextContent('Settings & Profile');
  });

  it('validates mobile brand indicator is hidden on desktop (lg:hidden)', () => {
    const { container } = renderWithProviders(<App />);
    const headerMobileLogo = container.querySelector('header .lg\\:hidden');
    expect(headerMobileLogo).toBeInTheDocument();
    expect(headerMobileLogo).toHaveClass('lg:hidden');
  });
});
