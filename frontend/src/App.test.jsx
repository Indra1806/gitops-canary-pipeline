import React from 'react';
import { render, screen, fireEvent, act } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import App from './App';

// Mock localStorage
const localStorageMock = (() => {
  let store = {};
  return {
    getItem: vi.fn((key) => store[key] || null),
    setItem: vi.fn((key, value) => {
      store[key] = value.toString();
    }),
    removeItem: vi.fn((key) => {
      delete store[key];
    }),
    clear: vi.fn(() => {
      store = {};
    }),
  };
})();

Object.defineProperty(window, 'localStorage', {
  value: localStorageMock,
});

describe('App Component', () => {
  beforeEach(() => {
    vi.useFakeTimers();
    localStorageMock.clear();
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('renders loading state initially', () => {
    render(<App />);
    expect(screen.getByText('ClinicOS')).toBeInTheDocument();
    // The loader is present by class name
    const loader = document.querySelector('.loader');
    expect(loader).toBeInTheDocument();
  });

  it('renders login page after loading', () => {
    render(<App />);
    
    act(() => {
      vi.advanceTimersByTime(1000);
    });

    expect(screen.getByText('Sign In')).toBeInTheDocument();
    expect(screen.getByText('Clinic Management System')).toBeInTheDocument();
  });

  it('allows user to login', () => {
    render(<App />);
    
    act(() => {
      vi.advanceTimersByTime(1000);
    });

    expect(screen.getByText('Sign In')).toBeInTheDocument();

    // Default credentials are pre-filled in the component state for demo purposes
    const loginButton = screen.getByText('Sign In', { selector: 'button' });
    
    fireEvent.click(loginButton);

    expect(screen.getByText(/Hello, Dr./i)).toBeInTheDocument();
    expect(screen.getByText('Dashboard')).toBeInTheDocument();
  });

  it('navigates to Patients page', () => {
    render(<App />);
    
    act(() => {
      vi.advanceTimersByTime(1000);
    });

    fireEvent.click(screen.getByText('Sign In', { selector: 'button' }));

    // Click Patients in sidebar
    const patientsLink = screen.getByText('Patients');
    fireEvent.click(patientsLink);

    expect(screen.getByText('Patient Management')).toBeInTheDocument();
  });

  it('logs out correctly', () => {
    render(<App />);
    
    act(() => {
      vi.advanceTimersByTime(1000);
    });

    fireEvent.click(screen.getByText('Sign In', { selector: 'button' }));

    // Find logout button. It has title="Logout"
    const logoutBtn = screen.getByTitle('Logout');
    fireEvent.click(logoutBtn);

    expect(screen.getByText('Sign In')).toBeInTheDocument();
  });
});