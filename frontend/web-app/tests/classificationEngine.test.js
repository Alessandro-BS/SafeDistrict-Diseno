import { describe, it, expect } from 'vitest';
import { classifyText, normalizePriority } from '../src/data/classificationEngine';

describe('Motor de Clasificación de Emergencias', () => {
  it('debería clasificar un reporte de arma de fuego como CRÍTICO', () => {
    const reporte = "hay un hombre con un arma de fuego";
    const resultado = classifyText(reporte);
    
    expect(resultado.priority).toBe('Critico');
    expect(resultado.type).toBe('robo'); 
  });

  it('debería normalizar prioridades raras del backend a un estándar', () => {
    expect(normalizePriority('p1')).toBe('Crítico');
    expect(normalizePriority('low')).toBe('Bajo');
    expect(normalizePriority('high')).toBe('Alto');
  });

  it('debería asignar prioridad Critica a un accidente con palabras clave de urgencia', () => {
    // "choque" es palabra de urgencia y eleva de Alto a Critico
    const reporte = "hubo un choque de autos fuerte";
    const resultado = classifyText(reporte);
    
    expect(resultado.priority).toBe('Critico');
    expect(resultado.type).toBe('accidente');
  });
});
