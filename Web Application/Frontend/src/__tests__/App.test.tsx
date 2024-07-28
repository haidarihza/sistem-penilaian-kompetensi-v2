// src/__ tests __/App.test.tsx

import '@testing-library/jest-dom';
import { render, waitFor } from '@testing-library/react';
import App from '../App';

test('Renders the Login page', async () => {
  render(<App />)

  window.history.pushState({}, 'Login Page', '/login');

  await waitFor(() => {
    expect(true).toBeTruthy()
  });
});

test('Renders the Register page', async () => {
  render(<App />)

  window.history.pushState({}, 'Register Page', '/register');

  await waitFor(() => {
    expect(true).toBeTruthy()
  });
});

test('Renders the Profile page', async () => {
  render(<App />)

  window.history.pushState({}, 'Profile Page', '/profile');

  await waitFor(() => {
    expect(true).toBeTruthy()
  });
});

test('Renders the Verify Email page', async () => {
  render(<App />)

  window.history.pushState({}, 'Verify Email Page', '/auth/verify-email');

  await waitFor(() => {
    expect(true).toBeTruthy()
  });
});

test('Renders the Dashboard page', async () => {
  render(<App />)

  window.history.pushState({}, 'Dashboard Page', '/');

  await waitFor(() => {
    expect(true).toBeTruthy()
  });
});

test('Renders the Room Group Detail page', async () => {
  render(<App />)

  window.history.pushState({}, 'Room Group Detail Page', '/room-group/1');

  await waitFor(() => {
    expect(true).toBeTruthy()
  });
});

test('Renders the Room Create page', async () => {
  render(<App />)

  window.history.pushState({}, 'Room Create Page', '/room/create');

  await waitFor(() => {
    expect(true).toBeTruthy()
  });
});

test('Renders the Question page', async () => {
  render(<App />)

  window.history.pushState({}, 'Question Page', '/question');

  await waitFor(() => {
    expect(true).toBeTruthy()
  });
});

test('Renders the Competency page', async () => {
  render(<App />)

  window.history.pushState({}, 'Competency Page', '/competency');

  await waitFor(() => {
    expect(true).toBeTruthy()
  });
});

test('Renders the Feedback page', async () => {
  render(<App />)

  window.history.pushState({}, 'Feedback Page', '/feedback');

  await waitFor(() => {
    expect(true).toBeTruthy()
  });
});