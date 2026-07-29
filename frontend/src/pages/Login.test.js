import { render, screen } from '@testing-library/react';
import Login from './Login';

test('renders username and password inputs', () => {
  render(<Login />);
  expect(screen.getByPlaceholderText(/Enter your username/i)).toBeInTheDocument();
  expect(screen.getByPlaceholderText(/Enter your password/i)).toBeInTheDocument();
});

test('renders Sign in button', () => {
  render(<Login />);
  expect(screen.getByRole('button', { name: /Sign in/i })).toBeInTheDocument();
});

test('renders signup link', () => {
  render(<Login />);
  expect(screen.getByRole('link', { name: /Sign up/i })).toBeInTheDocument();
});
