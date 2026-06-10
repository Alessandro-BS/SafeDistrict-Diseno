import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import '@testing-library/jest-dom';
import Chatbot from '../../src/components/Chatbot';

describe('Chatbot Component', () => {
  // Mock scrollIntoView ya que jsdom no lo implementa
  window.HTMLElement.prototype.scrollIntoView = function() {};

  it('renderiza la interfaz básica del chatbot', () => {
    // Renderear el componente
    const mockSetCurrentView = () => {};
    render(<Chatbot setCurrentView={mockSetCurrentView} />);
    
    // Verificamos que el encabezado del bot esté presente (no requiere esperar)
    expect(screen.getByText('SafeDistrict Assistant')).toBeInTheDocument();
    expect(screen.getByText('En línea')).toBeInTheDocument();
    expect(screen.getByText('Panel Admin')).toBeInTheDocument();
  });
});
