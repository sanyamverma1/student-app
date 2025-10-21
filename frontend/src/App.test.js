// src/App.test.js

import { render, screen } from '@testing-library/react';
import App from './App';

test('renders the login page on the root route', () => {
  // Render the whole application.
  render(<App />);

  const loginButton = screen.getByText(/login/i, { selector: 'button' });

  // Assert that this element is actually in the document.
  expect(loginButton).toBeInTheDocument();
});