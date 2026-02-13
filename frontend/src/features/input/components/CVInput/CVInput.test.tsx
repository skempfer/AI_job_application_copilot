import { render, screen, fireEvent } from '../../../../test/test-utils';
import { CVInput } from './CVInput';

describe('CVInput Component', () => {
  it('should render textarea element', () => {
    render(<CVInput value="" onChange={() => {}} />);
    const textarea = screen.getByPlaceholderText(/paste your complete cv here/i);
    expect(textarea).toBeInTheDocument();
  });

  it('should display current value', () => {
    const testValue = 'Senior Engineer with 5 years experience';
    render(<CVInput value={testValue} onChange={() => {}} />);
    const textarea = screen.getByDisplayValue(testValue);
    expect(textarea).toBeInTheDocument();
  });

  it('should call onChange when user types', () => {
    const handleChange = jest.fn();
    render(<CVInput value="" onChange={handleChange} />);
    
    const textarea = screen.getByPlaceholderText(/paste your complete cv here/i);
    fireEvent.change(textarea, { target: { value: 'New CV content' } });
    
    expect(handleChange).toHaveBeenCalledWith('New CV content');
  });

  it('should be disabled when disabled prop is true', () => {
    render(<CVInput value="" onChange={() => {}} disabled={true} />);
    const textarea = screen.getByPlaceholderText(/paste your complete cv here/i);
    expect(textarea).toBeDisabled();
  });

  it('should not be disabled when disabled prop is false', () => {
    render(<CVInput value="" onChange={() => {}} disabled={false} />);
    const textarea = screen.getByPlaceholderText(/paste your complete cv here/i);
    expect(textarea).not.toBeDisabled();
  });

  it('should show character count', () => {
    const testValue = 'A'.repeat(100);
    render(<CVInput value={testValue} onChange={() => {}} />);
    expect(screen.getByText(/100/)).toBeInTheDocument();
  });
});
