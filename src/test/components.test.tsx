import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { Button } from '@/components/common/Button';
import { Card } from '@/components/common/Card';
import { Badge } from '@/components/common/Badge';
import { ProgressBar } from '@/components/common/ProgressBar';
import { ThemeToggle } from '@/components/common/ThemeToggle';
import { ThemeProvider } from '@/context/ThemeContext';

describe('Atomic UI Components', () => {
  it('renders Button with variants and triggers onClick', () => {
    const handleClick = vi.fn();
    render(
      <Button variant="primary" size="md" onClick={handleClick}>
        Test Button
      </Button>
    );

    const btn = screen.getByRole('button', { name: /test button/i });
    expect(btn).toBeInTheDocument();
    fireEvent.click(btn);
    expect(handleClick).toHaveBeenCalledTimes(1);
  });

  it('renders Card with children and styles', () => {
    render(
      <Card hoverEffect className="custom-card">
        <div>Card Content</div>
      </Card>
    );

    expect(screen.getByText('Card Content')).toBeInTheDocument();
  });

  it('renders Badge with correct status and paper variants', () => {
    const { rerender } = render(<Badge status="completed">Completed</Badge>);
    expect(screen.getByText('Completed')).toBeInTheDocument();

    rerender(<Badge subjectId="paper1">Accounting</Badge>);
    expect(screen.getByText('Accounting')).toBeInTheDocument();
  });

  it('renders ProgressBar with aria accessibility attributes', () => {
    render(<ProgressBar value={75} max={100} showLabel />);

    const bar = screen.getByRole('progressbar');
    expect(bar).toHaveAttribute('aria-valuenow', '75');
    expect(screen.getByText('75%')).toBeInTheDocument();
  });

  it('renders ThemeToggle in segmented mode', () => {
    render(
      <ThemeProvider>
        <ThemeToggle showSegmented />
      </ThemeProvider>
    );

    expect(screen.getByRole('button', { name: /light/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /auto/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /dark/i })).toBeInTheDocument();
  });
});
