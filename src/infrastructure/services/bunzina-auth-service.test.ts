import axios, { AxiosError } from 'axios';
import { beforeEach, describe, expect, mock, test } from 'bun:test';
import { BunzinaAuthService } from './bunzina-auth-service';

const postMock = mock();

mock.module('axios', () => ({
  default: {
    create: mock(() => ({
      post: postMock,
    })),
  },
  AxiosError: class AxiosError extends Error {
    response?: { status: number; data: unknown };

    constructor(response?: { status: number; data: unknown }) {
      super('axios error');
      this.response = response;
    }
  },
}));

describe('bunzina auth service', () => {
  beforeEach(() => {
    postMock.mockReset();
  });

  test('should call bunzina login route', async () => {
    postMock.mockResolvedValueOnce({ status: 200, data: { token: 'jwt' } });

    const service = new BunzinaAuthService('http://bunzina.test', 5000);
    const response = await service.login({
      document: '11144477735',
      password: 'senha123',
    });

    expect(axios.create).toHaveBeenCalledWith({
      baseURL: 'http://bunzina.test',
      timeout: 5000,
    });
    expect(postMock).toHaveBeenCalledWith('/auth/login', {
      document: '11144477735',
      password: 'senha123',
    });
    expect(response).toEqual({ statusCode: 200, data: { token: 'jwt' } });
  });

  test('should forward bunzina error responses', async () => {
    const error = new AxiosError('axios error');
    Object.defineProperty(error, 'response', {
      value: {
        status: 401,
        data: { reason: 'Invalid credentials' },
      },
    });

    postMock.mockRejectedValueOnce(error);

    const service = new BunzinaAuthService('http://bunzina.test', 5000);
    const response = await service.login({
      document: '11144477735',
      password: 'wrong',
    });

    expect(response).toEqual({
      statusCode: 401,
      data: { reason: 'Invalid credentials' },
    });
  });

  test('should return 502 when bunzina is unavailable', async () => {
    postMock.mockRejectedValueOnce(new Error('network error'));

    const service = new BunzinaAuthService('http://bunzina.test', 5000);
    const response = await service.login({
      document: '11144477735',
      password: 'senha123',
    });

    expect(response).toEqual({
      statusCode: 502,
      data: { reason: 'Authentication service unavailable' },
    });
  });
});
