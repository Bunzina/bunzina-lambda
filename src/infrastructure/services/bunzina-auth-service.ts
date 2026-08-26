import type { LoginInput } from '@/adapters/input/validations/login-schema';
import type {
  AuthService,
  AuthServiceResponse,
} from '@/domain/auth/auth-service';
import axios, { AxiosError, type AxiosInstance } from 'axios';

const DEFAULT_TIMEOUT_MS = 5000;

export class BunzinaAuthService implements AuthService {
  private client: AxiosInstance;

  constructor(
    baseURL = process.env.BUNZINA_API_BASE_URL,
    timeoutMs = Number(process.env.BUNZINA_API_TIMEOUT_MS ?? DEFAULT_TIMEOUT_MS),
  ) {
    if (!baseURL) {
      throw new Error('BUNZINA_API_BASE_URL is required');
    }

    this.client = axios.create({
      baseURL,
      timeout: Number.isFinite(timeoutMs) ? timeoutMs : DEFAULT_TIMEOUT_MS,
      validateStatus: () => true,
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
