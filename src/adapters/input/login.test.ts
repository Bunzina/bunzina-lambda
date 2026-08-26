import type { AuthService } from '@/domain/auth/auth-service';
import type { APIGatewayProxyEventV2 } from 'aws-lambda';
import { describe, expect, test } from 'bun:test';
import { LoginInput } from './login';

const makeEvent = (body: unknown): APIGatewayProxyEventV2 =>
  ({
    body: typeof body === 'string' ? body : JSON.stringify(body),
    isBase64Encoded: false,
  }) as APIGatewayProxyEventV2;

const makeLoginInput = (authService: AuthService): LoginInput =>
  new LoginInput(authService);

describe('login input', () => {
  test('should return 400 for invalid JSON', async () => {
    const authService: AuthService = {
      login: async () => ({ statusCode: 200, data: { token: 'token' } }),
    };

    const response = await makeLoginInput(authService).execute(makeEvent('{'));

    expect(response.statusCode).toBe(400);
    expect(JSON.parse(response.body!)).toEqual({ reason: 'Invalid JSON body' });
  });

  test('should return 400 for invalid CPF', async () => {
    const authService: AuthService = {
      login: async () => ({ statusCode: 200, data: { token: 'token' } }),
    };

    const response = await makeLoginInput(authService).execute(
      makeEvent({ document: 'invalid', password: 'senha123' }),
    );

    expect(response.statusCode).toBe(400);
  });

  test('should return 400 for empty password', async () => {
    const authService: AuthService = {
      login: async () => ({ statusCode: 200, data: { token: 'token' } }),
    };

    const response = await makeLoginInput(authService).execute(
      makeEvent({ document: '111.444.777-35', password: '' }),
    );

    expect(response.statusCode).toBe(400);
  });

  test('should return token when auth service succeeds', async () => {
    const authService: AuthService = {
      login: async (input) => ({
        statusCode: 200,
        data: { token: `token-for-${input.document}` },
      }),
    };

    const response = await makeLoginInput(authService).execute(
      makeEvent({ document: '111.444.777-35', password: 'senha123' }),
    );

    expect(response.statusCode).toBe(200);
    expect(JSON.parse(response.body!)).toEqual({
      token: 'token-for-11144477735',
    });
  });

  test('should forward auth service 401 response', async () => {
    const authService: AuthService = {
      login: async () => ({
        statusCode: 401,
        data: { reason: 'Invalid credentials' },
      }),
    };

    const response = await makeLoginInput(authService).execute(
      makeEvent({ document: '11144477735', password: 'wrong' }),
    );

    expect(response.statusCode).toBe(401);
    expect(JSON.parse(response.body!)).toEqual({
      reason: 'Invalid credentials',
    });
  });
});
