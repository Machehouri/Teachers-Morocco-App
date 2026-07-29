import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import ProtectedRoute from './ProtectedRoute';

beforeEach(() => {
  localStorage.clear();
});

test('redirects to /login when no token in localStorage', () => {
  render(
    <MemoryRouter initialEntries={['/dashboard']}>
      <ProtectedRoute>
        <div>Protected content</div>
      </ProtectedRoute>
    </MemoryRouter>
  );
  expect(screen.queryByText('Protected content')).not.toBeInTheDocument();
});

test('renders children when token exists in localStorage', () => {
  localStorage.setItem('token', 'test-token');
  render(
    <MemoryRouter>
      <ProtectedRoute>
        <div>Protected content</div>
      </ProtectedRoute>
    </MemoryRouter>
  );
  expect(screen.getByText('Protected content')).toBeInTheDocument();
});
