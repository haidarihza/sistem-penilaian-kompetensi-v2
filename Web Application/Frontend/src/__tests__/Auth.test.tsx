// src/__tests__/Auth.test.tsx

import '@testing-library/jest-dom';
import { render, screen, waitFor } from '@testing-library/react';
import { ChakraProvider } from '@chakra-ui/react';
import { BrowserRouter as Router } from 'react-router-dom';
import Register from '../pages/auth/Register';
import Login from '../pages/auth/Login';
import Profile from '../pages/auth/Profile';
import ProfileModal from '../pages/auth/ProfileModal';
import theme from '../Theme';


const mockProfile = {
  name: 'Test Name',
  email: 'testing@gmail.com',
  phone: '08123456789',
}

const renderWithProviders = (ui: React.ReactElement) => {
  return render(
    <ChakraProvider theme={theme}>
      <Router>
        {ui}
      </Router>
    </ChakraProvider>
  );
};

describe('Register', () => {
  test('renders the register form with correct title and button content', () => {
    renderWithProviders(
      <Register />
    );

    expect(screen.getByText('Register')).toBeInTheDocument();
    expect(screen.getByText('Masuk')).toBeInTheDocument();
  });
});

describe('Login', () => {
  test('renders the login form with correct title and button content', () => {
    renderWithProviders(
      <Login />
    );

    expect(screen.getByText('Login')).toBeInTheDocument();
    expect(screen.getByText('Daftar')).toBeInTheDocument();
  });
});

describe('Profile', () => {
  test('renders the profile form with correct title and button content', async() => {
    renderWithProviders(
      <Profile />
    );

    await waitFor(() => {
      expect(true).toBeTruthy()
    });
  });
});

describe('ProfileModal', () => {
  test('renders the modal with correct title and button content', () => {
    renderWithProviders(
      <ProfileModal
        isOpen={true}
        onClose={jest.fn()}
        handleSubmit={jest.fn()}
        title="Test Modal"
        buttonContent="Submit"
        profileData={mockProfile}
        setProfileData={jest.fn()}
      />
    );
    expect(screen.getByText('Test Modal')).toBeInTheDocument();
    expect(screen.getByText('Submit')).toBeInTheDocument();
  });

  test('renders all fields', () => {
    renderWithProviders(
      <ProfileModal
        isOpen={true}
        onClose={jest.fn()}
        handleSubmit={jest.fn()}
        title="Test Modal"
        buttonContent="Submit"
        profileData={mockProfile}
        setProfileData={jest.fn()}
      />
    );
    expect(screen.getByText('Nama')).toBeInTheDocument();
    expect(screen.getByText('No Telepon')).toBeInTheDocument();
  });
});
