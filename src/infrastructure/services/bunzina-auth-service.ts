import type { LoginInput } from '@/adapters/input/validations/login-schema';
import type {
  AuthService,
  AuthServiceResponse,
} from '@/domain/auth/auth-service';
import axios, { AxiosError, type AxiosInstance } from 'axios';

export class BunzinaAuthService implements AuthService {
  private client: AxiosInstance;

  constructor(baseURL: string, timeoutMs: number) {
    this.client = axios.create({
      baseURL,
      timeout: timeoutMs,
    });
  }

  async login(input: LoginInput): Promise<AuthServiceResponse> {
    try {
      const response = await this.client.post('/auth/login', input);

      return {
        statusCode: response.status,
        data: response.data,
      };
    } catch (error) {
      if (error instanceof AxiosError && error.response) {
        return {
          statusCode: error.response.status,
          data: error.response.data,
        };
      }

      return {
        statusCode: 502,
        data: { reason: 'Authentication service unavailable' },
      };
    }
  }
}
