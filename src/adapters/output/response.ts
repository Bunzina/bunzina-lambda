import type { APIGatewayProxyStructuredResultV2 } from 'aws-lambda';

const jsonHeaders = {
  'Content-Type': 'application/json',
};

export const createResponse = (
  statusCode: number,
  data: unknown,
): APIGatewayProxyStructuredResultV2 => ({
  statusCode,
  headers: jsonHeaders,
  body: JSON.stringify(data),
});
