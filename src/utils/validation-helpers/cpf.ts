import { z } from 'zod';

const normalizeCpf = (value: string): string => value.replace(/\D/g, '');

const isValidCpf = (value: string): boolean => {
  const cpf = normalizeCpf(value);

  if (cpf.length !== 11 || /^(\d)\1+$/.test(cpf)) return false;

  const digits = cpf.split('').map(Number);

  const calculateDigit = (factor: number): number => {
    const total = digits
      .slice(0, factor - 1)
      .reduce((sum, digit, index) => sum + digit * (factor - index), 0);
    const remainder = (total * 10) % 11;

    return remainder === 10 ? 0 : remainder;
  };

  return calculateDigit(10) === digits[9] && calculateDigit(11) === digits[10];
};

export const cpfValidation = z
  .string()
  .transform(normalizeCpf)
  .refine(isValidCpf, 'Invalid CPF');
