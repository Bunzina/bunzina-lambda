import type { LoginInput } from '@/adapters/input/validations/login-schema';

export interface AuthServiceResponse {
  statusCode: number;
  data: unknown;
}

export interface AuthService {
  login(input: LoginInput): Promise<AuthServiceResponse>;
}
