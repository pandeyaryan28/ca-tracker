import { describe, it, expect, beforeEach } from 'vitest';
import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { DataProvider } from '@/context/DataContext';
import { ChecklistView } from '@/components/checklist/ChecklistView';

describe('Tier 3 - Combination 10: Multi-Criteria Search + Subject + Status Filter Pipeline', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it('correctly filters topics by combining subject selection (QA) + keyword search (Ratio)', () => {
    render(
      <DataProvider>
        <ChecklistView />
      </DataProvider>
    );

    const qaPill = screen.getByText(/QA - Quant/i);
    fireEvent.click(qaPill);

    const searchInput = screen.getByPlaceholderText(/Search topics/i);
    fireEvent.change(searchInput, { target: { value: 'Ratio' } });

    expect(screen.getAllByText(/Ratio/i).length).toBeGreaterThan(0);
    expect(screen.queryByText(/Theoretical Framework/i)).not.toBeInTheDocument();
  });
});
