import { render, screen } from '@testing-library/react';
import App from './App';

test('renders TeachMe brand name', () => {
  render(<App />);
  const brandElement = screen.getByRole('link', { name: /TeachMe/i });
  expect(brandElement).toBeInTheDocument();
});
