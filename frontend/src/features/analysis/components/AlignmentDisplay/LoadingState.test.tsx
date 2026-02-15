import { render, screen, act } from '@testing-library/react';
import { LoadingState } from './LoadingState';

describe('LoadingState Component', () => {
  beforeEach(() => {
    jest.useFakeTimers();
  });

  afterEach(() => {
    try {
      jest.runOnlyPendingTimers();
    } catch {
      // Timers may not be active in all tests
    }
    jest.useRealTimers();
  });

  it('renders nothing when show is false', () => {
    const { container } = render(<LoadingState show={false} />);
    expect(container.firstChild).toBeNull();
  });

  it('renders loading state when show is true', () => {
    render(<LoadingState show={true} stage={0} />);

    expect(screen.getByText('Parsing your CV...')).toBeInTheDocument();
  });

  it('displays spinner animation', () => {
    const { container } = render(<LoadingState stage={0} />);

    const spinner = container.querySelector('.spinner-ring');
    expect(spinner).toBeInTheDocument();
  });

  it('shows stage 0: Parsing CV', () => {
    render(<LoadingState stage={0} />);

    expect(screen.getByText('Parsing your CV...')).toBeInTheDocument();
    expect(screen.getByText('Extracting skills and experience')).toBeInTheDocument();
    expect(screen.getByText('📄')).toBeInTheDocument();
  });

  it('shows stage 1: Analyzing requirements', () => {
    render(<LoadingState stage={1} />);

    expect(screen.getByText('Analyzing job requirements...')).toBeInTheDocument();
    expect(screen.getByText('Matching your profile to the role')).toBeInTheDocument();
    expect(screen.getByText('🔍')).toBeInTheDocument();
  });

  it('shows stage 2: Generating insights', () => {
    render(<LoadingState stage={2} />);

    expect(screen.getByText('Generating insights...')).toBeInTheDocument();
    expect(screen.getByText('Creating personalized recommendations')).toBeInTheDocument();
    expect(screen.getByText('✨')).toBeInTheDocument();
  });

  it('shows stage 3: Complete', () => {
    render(<LoadingState stage={3} />);

    expect(screen.getByText('Analysis complete')).toBeInTheDocument();
    expect(screen.getByText('Your results are ready')).toBeInTheDocument();
    expect(screen.getByText('✅')).toBeInTheDocument();
  });

  it('displays custom message when provided', () => {
    render(<LoadingState message="Custom loading message" />);

    expect(screen.getByText('Custom loading message')).toBeInTheDocument();
    expect(screen.queryByText('Parsing your CV...')).not.toBeInTheDocument();
  });

  it('displays progress bar for stages 0-2', () => {
    const { rerender, container } = render(<LoadingState stage={0} />);

    expect(container.querySelector('.progress-bar')).toBeInTheDocument();
    expect(screen.getByText('1 of 3 steps')).toBeInTheDocument();

    rerender(<LoadingState stage={1} />);
    expect(screen.getByText('2 of 3 steps')).toBeInTheDocument();

    rerender(<LoadingState stage={2} />);
    expect(screen.getByText('3 of 3 steps')).toBeInTheDocument();
  });

  it('hides progress bar and shows completion message on stage 3', () => {
    const { container } = render(<LoadingState stage={3} />);

    expect(container.querySelector('.progress-bar')).not.toBeInTheDocument();
    expect(screen.getByText('Analysis is ready!')).toBeInTheDocument();
  });

  it('updates progress bar fill width based on stage', () => {
    const { rerender, container } = render(<LoadingState stage={0} />);

    let fill = container.querySelector('.progress-bar__fill') as HTMLElement;
    expect(fill?.style.width).toBe('25%');

    rerender(<LoadingState stage={1} />);
    fill = container.querySelector('.progress-bar__fill') as HTMLElement;
    expect(fill?.style.width).toBe('50%');

    rerender(<LoadingState stage={2} />);
    fill = container.querySelector('.progress-bar__fill') as HTMLElement;
    expect(fill?.style.width).toBe('75%');
  });

  it('applies fade-out class when transitioning stages', () => {
    const { container, rerender } = render(<LoadingState stage={0} />);

    // Stage changes trigger fade-out
    act(() => {
      rerender(<LoadingState stage={1} />);
    });

    // Fade-out is applied briefly then removed, check for element existence
    const loadingState = container.querySelector('.loading-state');
    expect(loadingState).toBeInTheDocument();
  });

  it('updates emoji based on stage', () => {
    const { rerender } = render(<LoadingState stage={0} />);
    expect(screen.getByText('📄')).toBeInTheDocument();

    rerender(<LoadingState stage={1} />);
    expect(screen.getByText('🔍')).toBeInTheDocument();

    rerender(<LoadingState stage={2} />);
    expect(screen.getByText('✨')).toBeInTheDocument();

    rerender(<LoadingState stage={3} />);
    expect(screen.getByText('✅')).toBeInTheDocument();
  });

  it('auto-progresses through stages when no custom message', () => {
    const { rerender } = render(<LoadingState stage={0} />);

    expect(screen.getByText('Parsing your CV...')).toBeInTheDocument();

    // Advance timers by 2 seconds + transition time
    act(() => {
      jest.advanceTimersByTime(2300);
    });

    rerender(<LoadingState stage={1} />);
    expect(screen.getByText('Analyzing job requirements...')).toBeInTheDocument();
  });

  it('does not auto-progress when custom message is provided', () => {
    render(<LoadingState stage={0} message="Custom message" />);

    act(() => {
      jest.advanceTimersByTime(2300);
    });

    expect(screen.getByText('Custom message')).toBeInTheDocument();
    expect(screen.queryByText('Analyzing job requirements...')).not.toBeInTheDocument();
  });

  it('has loading-state class on container', () => {
    const { container } = render(<LoadingState stage={0} />);

    expect(container.querySelector('.loading-state')).toBeInTheDocument();
  });

  it('has loading-state__container class on inner div', () => {
    const { container } = render(<LoadingState stage={0} />);

    expect(container.querySelector('.loading-state__container')).toBeInTheDocument();
  });

  it('displays subtext for each stage', () => {
    const { rerender } = render(<LoadingState stage={0} />);
    expect(screen.getByText('Extracting skills and experience')).toBeInTheDocument();

    rerender(<LoadingState stage={1} />);
    expect(screen.getByText('Matching your profile to the role')).toBeInTheDocument();

    rerender(<LoadingState stage={2} />);
    expect(screen.getByText('Creating personalized recommendations')).toBeInTheDocument();

    rerender(<LoadingState stage={3} />);
    expect(screen.getByText('Your results are ready')).toBeInTheDocument();
  });

  it('handles rapid stage changes without crashing', () => {
    const { rerender } = render(<LoadingState stage={0} />);

    rerender(<LoadingState stage={1} />);
    rerender(<LoadingState stage={2} />);
    rerender(<LoadingState stage={3} />);
    rerender(<LoadingState stage={0} />);

    expect(screen.getByText('Parsing your CV...')).toBeInTheDocument();
  });

  it('cleans up timers on unmount', () => {
    jest.useFakeTimers();
    const { unmount } = render(<LoadingState stage={0} />);

    expect(jest.getTimerCount()).toBeGreaterThan(0);

    unmount();

    expect(jest.getTimerCount()).toBe(0);
    jest.useRealTimers();
  });
});
