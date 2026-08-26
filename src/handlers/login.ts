import { LoginInput } from '@/adapters/input/login';
import { BunzinaAuthService } from '@/infrastructure/services/bunzina-auth-service';
import type {
  APIGatewayProxyEventV2,
  APIGatewayProxyStructuredResultV2,
  Context,
} from 'aws-lambda';

export const handler = async (
  event: APIGatewayProxyEventV2,
  _context: Context,
): Promise<APIGatewayProxyStructuredResultV2> => {
  const authService = new BunzinaAuthService();
  const loginInput = new LoginInput(authService);

  return await loginInput.execute(event);
};
