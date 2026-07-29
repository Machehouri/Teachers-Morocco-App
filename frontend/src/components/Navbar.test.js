import { render, screen, waitFor } from '@testing-library/react';
import Navbar from './Navbar';

beforeEach(() => {
  localStorage.clear();
  jest.restoreAllMocks();
});

describe('Navbar when not authenticated', () => {
  test('renders TeachMe brand link', () => {
    render(<Navbar />);
    expect(screen.getByRole('link', { name: /TeachMe/i })).toBeInTheDocument();
  });

  test('renders Login and Sign up links', () => {
    render(<Navbar />);
    expect(screen.getByRole('link', { name: /Login/i })).toBeInTheDocument();
    expect(screen.getByRole('link', { name: /Sign up/i })).toBeInTheDocument();
  });
});

describe('Navbar when authenticated', () => {
  beforeEach(() => {
    localStorage.setItem('token', 'test-token');
    localStorage.setItem('role', 'student');
    localStorage.setItem('username', 'testuser');
    global.fetch = jest.fn(() =>
      Promise.resolve({ json: () => Promise.resolve([]) })
    );
  });

  afterEach(() => {
    delete global.fetch;
  });

  test('renders Home and Dashboard links', async () => {
    render(<Navbar />);
    await waitFor(() => {
      expect(screen.getByRole('link', { name: /Home/i })).toBeInTheDocument();
    });
    expect(screen.getByRole('link', { name: /Dashboard/i })).toBeInTheDocument();
  });

  test('does not render Login or Sign up when authenticated', async () => {
    render(<Navbar />);
    await waitFor(() => {
      expect(screen.queryByRole('link', { name: /Login/i })).not.toBeInTheDocument();
    });
    expect(screen.queryByRole('link', { name: /Sign up/i })).not.toBeInTheDocument();
  });

  test('shows teacher-specific links when role is teacher', async () => {
    localStorage.setItem('role', 'teacher');
    render(<Navbar />);
    await waitFor(() => {
      expect(screen.getByRole('link', { name: /Availability/i })).toBeInTheDocument();
    });
    expect(screen.getByRole('link', { name: /Create profile/i })).toBeInTheDocument();
  });

  test('displays username initials and logout button', async () => {
    render(<Navbar />);
    await waitFor(() => {
      expect(screen.getByText('TE')).toBeInTheDocument();
    });
    expect(screen.getByText(/Logout/i)).toBeInTheDocument();
  });
});
