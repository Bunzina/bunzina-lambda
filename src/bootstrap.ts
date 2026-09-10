import { handler } from '@/handlers/login';
import type { APIGatewayProxyEventV2, Context } from 'aws-lambda';

const runtimeApi = process.env.AWS_LAMBDA_RUNTIME_API;

if (!runtimeApi) {
  throw new Error('AWS_LAMBDA_RUNTIME_API is required');
}

const invocationUrl = `http://${runtimeApi}/2018-06-01/runtime/invocation`;

const buildContext = (requestId: string): Context =>
  ({
    awsRequestId: requestId,
    callbackWaitsForEmptyEventLoop: true,
    functionName: process.env.AWS_LAMBDA_FUNCTION_NAME ?? 'bunzina-lambda',
    functionVersion: process.env.AWS_LAMBDA_FUNCTION_VERSION ?? '$LATEST',
    invokedFunctionArn: process.env.AWS_LAMBDA_FUNCTION_INVOKED_ARN ?? '',
    memoryLimitInMB: process.env.AWS_LAMBDA_FUNCTION_MEMORY_SIZE ?? '256',
    logGroupName: process.env.AWS_LAMBDA_LOG_GROUP_NAME ?? '',
    logStreamName: process.env.AWS_LAMBDA_LOG_STREAM_NAME ?? '',
    getRemainingTimeInMillis: () => 0,
    done: () => undefined,
    fail: () => undefined,
    succeed: () => undefined,
  }) as Context;

while (true) {
  const next = await fetch(`${invocationUrl}/next`);
  const requestId = next.headers.get('Lambda-Runtime-Aws-Request-Id') ?? '';
  const event = (await next.json()) as APIGatewayProxyEventV2;

  try {
    const response = await handler(event, buildContext(requestId));

    await fetch(`${invocationUrl}/${requestId}/response`, {
      method: 'POST',
      body: JSON.stringify(response),
    });
  } catch (error) {
    await fetch(`${invocationUrl}/${requestId}/error`, {
      method: 'POST',
      body: JSON.stringify({
        errorType: error instanceof Error ? error.name : 'Error',
        errorMessage: error instanceof Error ? error.message : String(error),
      }),
    });
  }
}
