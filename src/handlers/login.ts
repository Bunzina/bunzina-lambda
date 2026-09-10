import { LoginInput } from '@/adapters/input/login';
import { BunzinaAuthService } from '@/infrastructure/services/bunzina-auth-service';
import type {
  APIGatewayProxyEventV2,
  APIGatewayProxyStructuredResultV2,
  Context,
} from 'aws-lambda';

const DEFAULT_TIMEOUT_MS = 5000;

export const handler = async (
  event: APIGatewayProxyEventV2,
  _context: Context,
): Promise<APIGatewayProxyStructuredResultV2> => {
  const baseURL = process.env.BUNZINA_API_BASE_URL;

  if (!baseURL) {
    throw new Error('BUNZINA_API_BASE_URL is required');
  }

  const timeoutMs = Number(
    process.env.BUNZINA_API_TIMEOUT_MS ?? DEFAULT_TIMEOUT_MS,
  );

  const authService = new BunzinaAuthService(
    baseURL,
    Number.isFinite(timeoutMs) ? timeoutMs : DEFAULT_TIMEOUT_MS,
  );
  const loginInput = new LoginInput(authService);

  return await loginInput.execute(event);
};
