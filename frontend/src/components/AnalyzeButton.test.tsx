import { render, screen, fireEvent } from '../test/test-utils';
import { AnalyzeButton } from './AnalyzeButton';

describe('AnalyzeButton Component', () => {
  it('should render button with correct text', () => {
    render(<AnalyzeButton onClick={() => {}} disabled={false} loading={false} />);
    expect(screen.getByRole('button', { name: /analyze/i })).toBeInTheDocument();
  });

  it('should call onClick when clicked', () => {
    const handleClick = jest.fn();
    render(<AnalyzeButton onClick={handleClick} disabled={false} loading={false} />);
    
    const button = screen.getByRole('button');
    fireEvent.click(button);
    
    expect(handleClick).toHaveBeenCalledTimes(1);
  });

  it('should be disabled when disabled prop is true', () => {
    render(<AnalyzeButton onClick={() => {}} disabled={true} loading={false} />);
    const button = screen.getByRole('button');
    expect(button).toBeDisabled();
  });

  it('should be disabled when loading is true', () => {
    render(<AnalyzeButton onClick={() => {}} disabled={false} loading={true} />);
    const button = screen.getByRole('button');
    expect(button).toBeDisabled();
  });

  it('should show loading text when loading', () => {
    render(<AnalyzeButton onClick={() => {}} disabled={false} loading={true} />);
    expect(screen.getByText(/analyzing/i)).toBeInTheDocument();
  });

  it('should not call onClick when disabled', () => {
    const handleClick = jest.fn();
    render(<AnalyzeButton onClick={handleClick} disabled={true} loading={false} />);
    
    const button = screen.getByRole('button');
    fireEvent.click(button);
    
    expect(handleClick).not.toHaveBeenCalled();
  });
});
