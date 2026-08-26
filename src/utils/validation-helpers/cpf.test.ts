import { describe, expect, test } from 'bun:test';
import { cpfValidation } from './cpf';

describe('cpf validation', () => {
  test('should normalize and validate formatted CPF', () => {
    expect(cpfValidation.parse('111.444.777-35')).toBe('11144477735');
  });

  test('should validate unformatted CPF', () => {
    expect(cpfValidation.parse('11144477735')).toBe('11144477735');
  });

  test('should reject invalid CPF', () => {
    expect(() => cpfValidation.parse('11111111111')).toThrow('Invalid CPF');
  });
});
