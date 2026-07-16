import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import App from './App';

describe('App Smoke Test', () => {
  it('renders application heading', () => {
    render(<App />);
    expect(screen.getByText('Vietnam High School Exam 2024 Analytics')).toBeInTheDocument();
  });
});
