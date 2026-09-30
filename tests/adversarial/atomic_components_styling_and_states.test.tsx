import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { Button } from '@/components/common/Button';
import { Card } from '@/components/common/Card';
import { Badge } from '@/components/common/Badge';
import { ProgressBar } from '@/components/common/ProgressBar';

describe('Adversarial Atomic Components Styling, States & Design System Verification', () => {
  describe('Button Component', () => {
    it('renders all variants with correct light/dark classes', () => {
      const { rerender } = render(<Button variant="primary">Primary</Button>);
      let btn = screen.getByRole('button');
      expect(btn).toHaveClass('bg-zinc-900');
      expect(btn).toHaveClass('dark:bg-zinc-100');

      rerender(<Button variant="secondary">Secondary</Button>);
      expect(btn).toHaveClass('bg-zinc-200/80');
      expect(btn).toHaveClass('dark:bg-zinc-800');

      rerender(<Button variant="outline">Outline</Button>);
      expect(btn).toHaveClass('border-zinc-300');
      expect(btn).toHaveClass('dark:border-zinc-700');

      rerender(<Button variant="ghost">Ghost</Button>);
      expect(btn).toHaveClass('hover:bg-zinc-100');
      expect(btn).toHaveClass('dark:hover:bg-zinc-800/60');

      rerender(<Button variant="danger">Danger</Button>);
      expect(btn).toHaveClass('bg-red-600');
    });

    it('renders loading state with disabled interaction and spinner icon', () => {
      render(<Button isLoading>Submit</Button>);
      const btn = screen.getByRole('button');
      expect(btn).toBeDisabled();
      expect(btn.querySelector('.animate-spin')).toBeInTheDocument();
    });

    it('renders left and right icons appropriately', () => {
      render(
        <Button
          leftIcon={<span data-testid="left-icon">L</span>}
          rightIcon={<span data-testid="right-icon">R</span>}
        >
          Icon Button
        </Button>
      );
      expect(screen.getByTestId('left-icon')).toBeInTheDocument();
      expect(screen.getByTestId('right-icon')).toBeInTheDocument();
    });
  });

  describe('Card Component', () => {
    it('renders glass panel and hover states', () => {
      const { rerender } = render(<Card glass hoverEffect>Glass Card</Card>);
      const card = screen.getByText('Glass Card');
      expect(card).toHaveClass('glass-panel');
      expect(card).toHaveClass('hover:border-zinc-300');

      rerender(<Card glass={false}>Solid Card</Card>);
      const solidCard = screen.getByText('Solid Card');
      expect(solidCard).toHaveClass('bg-white');
      expect(solidCard).toHaveClass('dark:bg-zinc-900');
    });
  });

  describe('Badge Component', () => {
    it('renders subject-specific badges with official ICAI color scheme tokens', () => {
      const { rerender } = render(<Badge variant="paper1">Paper 1</Badge>);
      expect(screen.getByText('Paper 1')).toHaveClass('text-emerald-700');

      rerender(<Badge variant="paper2">Paper 2</Badge>);
      expect(screen.getByText('Paper 2')).toHaveClass('text-violet-700');

      rerender(<Badge variant="paper3">Paper 3</Badge>);
      expect(screen.getByText('Paper 3')).toHaveClass('text-cyan-700');

      rerender(<Badge variant="paper4">Paper 4</Badge>);
      expect(screen.getByText('Paper 4')).toHaveClass('text-amber-700');
    });

    it('renders status badges with distinct visual styling', () => {
      const { rerender } = render(<Badge status="pending">Pending</Badge>);
      expect(screen.getByText('Pending')).toHaveClass('text-zinc-600');

      rerender(<Badge status="in_progress">In Progress</Badge>);
      expect(screen.getByText('In Progress')).toHaveClass('text-blue-700');

      rerender(<Badge status="completed">Completed</Badge>);
      expect(screen.getByText('Completed')).toHaveClass('text-emerald-700');
    });
  });

  describe('ProgressBar Component', () => {
    it('clamps values correctly between 0% and 100%', () => {
      const { rerender, container } = render(<ProgressBar value={150} max={100} showLabel />);
      expect(screen.getByText('100%')).toBeInTheDocument();
      let innerBar = container.querySelector('[role="progressbar"] > div');
      expect(innerBar).toHaveStyle({ width: '100%' });

      rerender(<ProgressBar value={-25} max={100} showLabel />);
      expect(screen.getByText('0%')).toBeInTheDocument();
      innerBar = container.querySelector('[role="progressbar"] > div');
      expect(innerBar).toHaveStyle({ width: '0%' });
    });

    it('applies subject-specific accent colors to the progress fill', () => {
      const { rerender, container } = render(<ProgressBar value={50} subjectId="paper1" />);
      let innerBar = container.querySelector('[role="progressbar"] > div');
      expect(innerBar).toHaveClass('bg-emerald-500');

      rerender(<ProgressBar value={50} subjectId="paper2" />);
      innerBar = container.querySelector('[role="progressbar"] > div');
      expect(innerBar).toHaveClass('bg-violet-500');

      rerender(<ProgressBar value={50} subjectId="paper3" />);
      innerBar = container.querySelector('[role="progressbar"] > div');
      expect(innerBar).toHaveClass('bg-cyan-500');

      rerender(<ProgressBar value={50} subjectId="paper4" />);
      innerBar = container.querySelector('[role="progressbar"] > div');
      expect(innerBar).toHaveClass('bg-amber-500');
    });
  });
});
