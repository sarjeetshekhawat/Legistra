import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import Settings from '../pages/Settings.js';

describe('Settings Component', () => {
  test('renders settings page', () => {
    render(<Settings />);
    expect(screen.getByText('Settings')).toBeInTheDocument();
  });

  test('theme toggle works', () => {
    render(<Settings />);
    const lightRadio = screen.getByLabelText('Light');
    const darkRadio = screen.getByLabelText('Dark');

    expect(lightRadio).toBeChecked();
    expect(darkRadio).not.toBeChecked();

    fireEvent.click(darkRadio);
    expect(darkRadio).toBeChecked();
    expect(lightRadio).not.toBeChecked();
  });

  test('notifications checkbox works', () => {
    render(<Settings />);
    const checkbox = screen.getByLabelText('Enable notifications');

    expect(checkbox).toBeChecked();

    fireEvent.click(checkbox);
    expect(checkbox).not.toBeChecked();

    fireEvent.click(checkbox);
    expect(checkbox).toBeChecked();
  });

  test('language select works', () => {
    render(<Settings />);
    const select = screen.getByDisplayValue('English');

    fireEvent.change(select, { target: { value: 'es' } });
    expect(select.value).toBe('es');
  });
});
