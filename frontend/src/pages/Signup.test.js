import { render, screen } from '@testing-library/react';
import Signup from './Signup';

test('renders username, email, and password inputs', () => {
  render(<Signup />);
  expect(screen.getByPlaceholderText(/Choose a username/i)).toBeInTheDocument();
  expect(screen.getByPlaceholderText(/you@example.com/i)).toBeInTheDocument();
  expect(screen.getByPlaceholderText(/Create a password/i)).toBeInTheDocument();
});

test('renders Learn and Teach role selection buttons', () => {
  render(<Signup />);
  expect(screen.getByText('Learn')).toBeInTheDocument();
  expect(screen.getByText('Teach')).toBeInTheDocument();
});

test('renders Create account button', () => {
  render(<Signup />);
  expect(
    screen.getByRole('button', { name: /Create account/i })
  ).toBeInTheDocument();
});
