import type { LoginInput } from '@/adapters/input/validations/login-schema';
import type {
  AuthService,
  AuthServiceResponse,
} from '@/domain/auth/auth-service';

export class LoginUseCase {
  constructor(private authService: AuthService) {}

  async execute(input: LoginInput): Promise<AuthServiceResponse> {
    return await this.authService.login(input);
  }
}
