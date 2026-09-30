import { describe, it, expect, beforeEach } from 'vitest';
import { render, screen, fireEvent, act } from '@testing-library/react';
import { App } from '@/App';
import { BottomDock } from '@/components/layout/BottomDock';
import { Button } from '@/components/common/Button';
import { ThemeToggle } from '@/components/common/ThemeToggle';
import { ThemeProvider } from '@/context/ThemeContext';
import { DataProvider } from '@/context/DataContext';

describe('Adversarial Mobile Dock & Interactive Touch Targets Compliance (>=44px)', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it('verifies all 5 mobile bottom dock navigation items meet the >=44px touch target specification', () => {
    const onTabChangeMock = () => {};
    render(
      <BottomDock activeTab="dashboard" onTabChange={onTabChangeMock} />
    );

    const dockNav = screen.getByRole('navigation', { name: 'Mobile Navigation Dock' });
    const buttons = dockNav.querySelectorAll('button');

    expect(buttons.length).toBe(5);

    buttons.forEach((btn) => {
      // Must have touch-target class
      expect(btn).toHaveClass('touch-target');
      // Must have min-h-[44px]
      expect(btn).toHaveClass('min-h-[44px]');
      // Must have min-w-[44px]
      expect(btn).toHaveClass('min-w-[44px]');
      // Must have flex styling for centered content
      expect(btn).toHaveClass('flex');
      expect(btn).toHaveClass('items-center');
      expect(btn).toHaveClass('justify-center');
    });
  });

  it('verifies dock container height is at least 64px (h-16) to provide generous hit area', () => {
    const onTabChangeMock = () => {};
    render(
      <BottomDock activeTab="dashboard" onTabChange={onTabChangeMock} />
    );

    const dockNav = screen.getByRole('navigation', { name: 'Mobile Navigation Dock' });
    expect(dockNav).toHaveClass('h-16');
  });

  it('verifies standard Button component variants enforce >=44px touch targets by default (size="md" and size="icon")', () => {
    const { rerender } = render(<Button size="md">Click Me</Button>);
    const mdButton = screen.getByRole('button', { name: 'Click Me' });
    expect(mdButton).toHaveClass('min-h-[44px]');
    expect(mdButton).toHaveClass('touch-target');

    rerender(<Button size="icon" aria-label="Icon Action" />);
    const iconButton = screen.getByRole('button', { name: 'Icon Action' });
    expect(iconButton).toHaveClass('min-h-[44px]');
    expect(iconButton).toHaveClass('min-w-[44px]');
    expect(iconButton).toHaveClass('touch-target');

    rerender(<Button size="lg">Large Button</Button>);
    const lgButton = screen.getByRole('button', { name: 'Large Button' });
    expect(lgButton).toHaveClass('min-h-[50px]');
  });

  it('verifies ThemeToggle button conforms to touch-target standard', () => {
    render(
      <ThemeProvider>
        <ThemeToggle />
      </ThemeProvider>
    );

    const toggleButton = screen.getByRole('button');
    expect(toggleButton).toHaveClass('touch-target');
  });

  it('verifies checklist topic status toggle buttons have touch-target styling', () => {
    render(
      <ThemeProvider>
        <DataProvider>
          <App />
        </DataProvider>
      </ThemeProvider>
    );

    // Switch to Checklist
    const bottomDock = screen.getByRole('navigation', { name: 'Mobile Navigation Dock' });
    const checklistDockBtn = bottomDock.querySelector('button:nth-child(2)');
    expect(checklistDockBtn).toBeInTheDocument();
    
    act(() => {
      fireEvent.click(checklistDockBtn!);
    });

    // Verify status toggle action buttons have touch-target class
    const statusToggles = document.querySelectorAll('button[aria-label^="Toggle status for"]');
    expect(statusToggles.length).toBeGreaterThan(0);
    statusToggles.forEach((btn) => {
      expect(btn).toHaveClass('touch-target');
    });
  });
});
