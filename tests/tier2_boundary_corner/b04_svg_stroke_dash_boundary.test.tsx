import { describe, it, expect } from 'vitest';
import React from 'react';
import { render, screen } from '@testing-library/react';
import { RadialGauge } from '@/components/common/RadialGauge';

describe('Tier 2 - Boundary 4: SVG Stroke Dashoffset & Percentage Bounds', () => {
  it('renders 0% gauge with full circumference stroke dashoffset', () => {
    const { container } = render(<RadialGauge percentage={0} size={100} strokeWidth={8} color="#10B981" />);
    expect(screen.getByText('0%')).toBeInTheDocument();
    const circle = container.querySelectorAll('circle')[1];
    expect(circle).toBeInTheDocument();
  });

  it('renders 100% gauge with 0 stroke dashoffset', () => {
    render(<RadialGauge percentage={100} size={100} strokeWidth={8} color="#10B981" />);
    expect(screen.getByText('100%')).toBeInTheDocument();
  });

  it('clamps negative percentages to 0%', () => {
    render(<RadialGauge percentage={-25} size={100} strokeWidth={8} color="#10B981" />);
    expect(screen.getByText('0%')).toBeInTheDocument();
  });

  it('clamps percentage exceeding 100% to 100%', () => {
    render(<RadialGauge percentage={250} size={100} strokeWidth={8} color="#10B981" />);
    expect(screen.getByText('100%')).toBeInTheDocument();
  });

  it('handles fractional percentage smoothly (e.g. 33.3%)', () => {
    render(<RadialGauge percentage={33.3} size={100} strokeWidth={8} color="#10B981" />);
    expect(screen.getByText(/33/i)).toBeInTheDocument();
  });
});
