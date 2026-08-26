import { LoginUseCase } from '@/application/use-cases/login';
import type { AuthService } from '@/domain/auth/auth-service';
import { createResponse } from '@/adapters/output/response';
import type {
  APIGatewayProxyEventV2,
  APIGatewayProxyStructuredResultV2,
} from 'aws-lambda';
import { loginSchema } from './validations/login-schema';

const parseBody = (event: APIGatewayProxyEventV2): unknown => {
  if (!event.body) return {};

  const body = event.isBase64Encoded
    ? Buffer.from(event.body, 'base64').toString('utf8')
    : event.body;

  return JSON.parse(body);
};

export class LoginInput {
  constructor(private authService: AuthService) {}

  async execute(
    event: APIGatewayProxyEventV2,
  ): Promise<APIGatewayProxyStructuredResultV2> {
    let body: unknown;

    try {
      body = parseBody(event);
    } catch {
      return createResponse(400, { reason: 'Invalid JSON body' });
    }

    const validation = loginSchema.safeParse(body);

    if (!validation.success) {
      return createResponse(400, {
        reason: 'Invalid data in request',
        invalidParams: validation.error.issues,
      });
    }

    const loginUseCase = new LoginUseCase(this.authService);
    const result = await loginUseCase.execute(validation.data);

    return createResponse(result.statusCode, result.data);
  }
}
