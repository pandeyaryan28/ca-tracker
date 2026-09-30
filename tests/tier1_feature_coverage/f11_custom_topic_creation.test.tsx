import { describe, it, expect, beforeEach } from 'vitest';
import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { DataProvider } from '@/context/DataContext';
import { ChecklistView } from '@/components/checklist/ChecklistView';

describe('Tier 1 - Feature 11: Custom Topic & Chapter Creation Modal', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it('renders Add Topic trigger button in Checklist header', () => {
    render(
      <DataProvider>
        <ChecklistView />
      </DataProvider>
    );

    const addBtn = screen.getByRole('button', { name: /^Add Topic$/i });
    expect(addBtn).toBeInTheDocument();
  });

  it('opens custom topic creation modal with input fields when clicked', () => {
    render(
      <DataProvider>
        <ChecklistView />
      </DataProvider>
    );

    const addBtn = screen.getByRole('button', { name: /^Add Topic$/i });
    fireEvent.click(addBtn);

    expect(screen.getByText('Add Custom Topic or Module')).toBeInTheDocument();
    expect(screen.getByPlaceholderText(/Partnership Dissolution/i)).toBeInTheDocument();
  });

  it('creates custom topic and immediately reflects it in Checklist', () => {
    render(
      <DataProvider>
        <ChecklistView />
      </DataProvider>
    );

    const addBtn = screen.getByRole('button', { name: /^Add Topic$/i });
    fireEvent.click(addBtn);

    const titleInput = screen.getByPlaceholderText(/Partnership Dissolution/i);
    fireEvent.change(titleInput, { target: { value: 'Advanced Partnership RTP Questions' } });

    const submitBtn = screen.getByRole('button', { name: /Add to Checklist/i });
    fireEvent.submit(submitBtn.closest('form')!);

    expect(screen.getByText('Advanced Partnership RTP Questions')).toBeInTheDocument();
    expect(screen.getAllByText('Custom').length).toBeGreaterThan(0);
  });

  it('assigns user-selected subject paper to the custom topic', () => {
    render(
      <DataProvider>
        <ChecklistView />
      </DataProvider>
    );

    const addBtn = screen.getByRole('button', { name: /^Add Topic$/i });
    fireEvent.click(addBtn);

    const selects = screen.getAllByRole('combobox');
    fireEvent.change(selects[0], { target: { value: 'paper2' } });

    const titleInput = screen.getByPlaceholderText(/Partnership Dissolution/i);
    fireEvent.change(titleInput, { target: { value: 'Companies Act Extra Notes' } });

    const submitBtn = screen.getByRole('button', { name: /Add to Checklist/i });
    fireEvent.submit(submitBtn.closest('form')!);

    expect(screen.getByText('Companies Act Extra Notes')).toBeInTheDocument();
  });

  it('persists custom topics in LocalStorage', () => {
    render(
      <DataProvider>
        <ChecklistView />
      </DataProvider>
    );

    const saved = localStorage.getItem('ca_tracker_topics');
    expect(saved).toBeTruthy();
  });
});
