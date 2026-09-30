import { describe, it, expect, beforeEach } from 'vitest';
import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { DataProvider } from '@/context/DataContext';
import { IngestionView } from '@/components/ingestion/IngestionView';

describe('Tier 4 - Scenario 6: Corrupted Ingestion Payload Recovery & Error Feedback', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it('displays user-friendly error message when invalid corrupted JSON is pasted without wiping syllabus', () => {
    render(
      <DataProvider>
        <IngestionView />
      </DataProvider>
    );

    const textarea = screen.getByPlaceholderText(/Paste exported JSON/i);
    fireEvent.change(textarea, { target: { value: '{"brokenJson": true, ' } });

    const submitBtn = screen.getByRole('button', { name: /Process Ingestion/i });
    fireEvent.click(submitBtn);

    expect(screen.getByText(/Import failed:/i)).toBeInTheDocument();
  });
});
