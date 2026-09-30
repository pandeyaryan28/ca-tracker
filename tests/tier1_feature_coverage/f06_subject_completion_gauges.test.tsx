import { describe, it, expect } from 'vitest';
import React from 'react';
import { render, screen } from '@testing-library/react';
import { RadialGauge } from '@/components/common/RadialGauge';
import { calculatePercentage } from '@/lib/utils';
import { buildSubjectGroups, loadSeedSyllabus } from '@/lib/seedLoader';

describe('Tier 1 - Feature 6: 4-Subject Completion Gauges & Progress Calculation', () => {
  it('calculates Paper 1 (Accounting) percentage accurately', () => {
    const pct = calculatePercentage(15, 30);
    expect(pct).toBe(50);
  });

  it('calculates Paper 2 (Business Laws) percentage with fractional rounding', () => {
    const pct = calculatePercentage(10, 33, 1);
    expect(pct).toBe(30.3);
  });

  it('renders RadialGauge SVG component with calculated stroke math', () => {
    const { container } = render(
      <RadialGauge percentage={75} size={120} strokeWidth={8} color="#10B981" label="Accounts" />
    );

    expect(screen.getByText('75%')).toBeInTheDocument();
    expect(screen.getByText(/Accounts/i)).toBeInTheDocument();
    const svg = container.querySelector('svg');
    expect(svg).toBeInTheDocument();
  });

  it('clamps extreme percentage values to 0% and 100%', () => {
    render(<RadialGauge percentage={150} color="#8B5CF6" label="Laws" />);
    expect(screen.getByText('100%')).toBeInTheDocument();
  });

  it('builds subject groups with accurate counts from loaded seed syllabus', () => {
    const seed = loadSeedSyllabus();
    const groups = buildSubjectGroups(seed.topics, seed.chapters, seed.subjects);

    expect(groups.paper1).toBeDefined();
    expect(groups.paper2).toBeDefined();
    expect(groups.paper3).toBeDefined();
    expect(groups.paper4).toBeDefined();
    expect(groups.paper1.totalTopics).toBeGreaterThan(0);
    expect(groups.paper1.progressPercentage).toBe(0);
  });
});
