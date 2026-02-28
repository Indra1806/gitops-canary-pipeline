import React from 'react';
import { render, screen, fireEvent, act } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { Icon, Toast, Modal, UiverseButton } from './index';

describe('Icon Component', () => {
  it('renders the correct icon for a known name', () => {
    render(<Icon name="dashboard" />);
    expect(screen.getByText('🏥')).toBeInTheDocument();
  });

  it('renders the default icon for an unknown name', () => {
    render(<Icon name="unknown" />);
    expect(screen.getByText('•')).toBeInTheDocument();
  });

  it('applies the correct font size', () => {
    const { container } = render(<Icon name="dashboard" size={24} />);
    // span is the first child
    expect(container.firstChild).toHaveStyle({ fontSize: '24px' });
  });
});

describe('Toast Component', () => {
  it('renders the message and type', () => {
    render(<Toast message="Success!" type="success" onClose={() => {}} />);
    expect(screen.getByText('Success!')).toBeInTheDocument();
    expect(screen.getByText('✓')).toBeInTheDocument(); // Success icon
  });

  it('renders warning icon for non-success type', () => {
    render(<Toast message="Error!" type="error" onClose={() => {}} />);
    expect(screen.getByText('⚠')).toBeInTheDocument();
  });

  it('calls onClose when the close button is clicked', () => {
    const onClose = vi.fn();
    render(<Toast message="Test" onClose={onClose} />);
    fireEvent.click(screen.getByRole('button'));
    expect(onClose).toHaveBeenCalledTimes(1);
  });

  it('calls onClose automatically after 3 seconds', () => {
    vi.useFakeTimers();
    const onClose = vi.fn();
    render(<Toast message="Test" onClose={onClose} />);
    
    act(() => {
      vi.advanceTimersByTime(3000);
    });
    
    expect(onClose).toHaveBeenCalledTimes(1);
    vi.useRealTimers();
  });
});

describe('Modal Component', () => {
  it('renders title, children, and footer', () => {
    render(
      <Modal title="My Modal" footer={<button>Footer Action</button>} onClose={() => {}}>
        <p>Modal Content</p>
      </Modal>
    );
    
    expect(screen.getByText('My Modal')).toBeInTheDocument();
    expect(screen.getByText('Modal Content')).toBeInTheDocument();
    expect(screen.getByText('Footer Action')).toBeInTheDocument();
  });

  it('calls onClose when clicking the overlay', () => {
    const onClose = vi.fn();
    const { container } = render(
      <Modal title="Test" onClose={onClose}>Content</Modal>
    );
    
    // The overlay is the outer div with class 'modal-overlay'
    fireEvent.click(container.firstChild);
    expect(onClose).toHaveBeenCalledTimes(1);
  });

  it('does not call onClose when clicking inside the modal content', () => {
    const onClose = vi.fn();
    render(
      <Modal title="Test" onClose={onClose}>
        <button>Inside</button>
      </Modal>
    );
    
    fireEvent.click(screen.getByText('Inside'));
    expect(onClose).not.toHaveBeenCalled();
  });

  it('calls onClose when clicking the close button', () => {
    const onClose = vi.fn();
    render(<Modal title="Test" onClose={onClose}>Content</Modal>);
    
    // The close button is the UiverseButton in the header
    const closeButton = screen.getAllByRole('button')[0];
    fireEvent.click(closeButton);
    expect(onClose).toHaveBeenCalledTimes(1);
  });
});

describe('UiverseButton Component', () => {
  it('renders text correctly', () => {
    render(<UiverseButton text="Click Me" />);
    // UiverseButton renders text twice (actual-text and hover-text)
    const elements = screen.getAllByText(/Click Me/);
    expect(elements.length).toBeGreaterThan(0);
  });

  it('passes props to the button element', () => {
    const onClick = vi.fn();
    render(<UiverseButton text="Click" onClick={onClick} disabled />);
    
    const button = screen.getByRole('button');
    expect(button).toBeDisabled();
    
    fireEvent.click(button);
    expect(onClick).not.toHaveBeenCalled(); // Disabled button shouldn't fire click
  });
});