# bunzina-lambda

AWS Lambda de autenticacao do Bunzina, executada com Bun em container image e exposta por API Gateway em `POST /auth/login`.

## Como funciona

A Lambda valida o payload de login e delega a autenticacao para a API principal:

```text
API Gateway -> Lambda Bun -> POST /auth/login no bunzina
```

Ela nao acessa banco nem gera JWT. O token retornado e o mesmo emitido pelo
`bunzina`.

## Endpoint

O endpoint e gerado pelo API Gateway durante o deploy e pode mudar quando a
stack for removida/recriada ou quando o AWS Academy Learner Lab limpar recursos.

Para consultar o endpoint atual:

```bash
bunx serverless info --region us-east-1
```

Ou via AWS CLI:

```bash
API_ID=$(aws cloudformation list-stack-resources \
  --stack-name bunzina-lambda \
  --region us-east-1 \
  --query "StackResourceSummaries[?ResourceType=='AWS::ApiGatewayV2::Api'].PhysicalResourceId | [0]" \
  --output text)

API_URL=$(aws apigatewayv2 get-api \
  --api-id "$API_ID" \
  --region us-east-1 \
  --query "ApiEndpoint" \
  --output text)

echo "$API_URL/auth/login"
```

Exemplo de payload:

```json
{
  "document": "11144477735",
  "password": "senha123"
}
```

## Variaveis de ambiente

```bash
AWS_DEFAULT_REGION=us-east-1
BUNZINA_API_BASE_URL=https://api.bunzina.example.com
BUNZINA_API_TIMEOUT_MS=5000
ECR_IMAGE_URI=056832840038.dkr.ecr.us-east-1.amazonaws.com/bunzina-lambda:latest
```

`BUNZINA_API_BASE_URL` deve apontar para a URL real da API principal `bunzina`. A URL acima e apenas um placeholder.

## AWS Academy Learner Lab

O deploy foi preparado para o AWS Academy Learner Lab usando a role existente:

```text
arn:aws:iam::056832840038:role/LabRole
```

As credenciais do Learner Lab sao temporarias. Sempre que o lab reiniciar, exporte novamente `AWS_ACCESS_KEY_ID`, `AWS_SECRET_ACCESS_KEY` e `AWS_SESSION_TOKEN` antes de fazer deploy.

## Desenvolvimento

```bash
bun install
bun test
bunx tsc --noEmit
```

## Build e push da imagem

A imagem precisa ser enviada manualmente para o ECR com `--provenance=false`, porque a AWS Lambda rejeita alguns manifests OCI gerados pelo build automatico do Serverless/Docker.

```bash
aws ecr create-repository --repository-name bunzina-lambda --region us-east-1

aws ecr get-login-password --region us-east-1 \
  | docker login --username AWS --password-stdin 056832840038.dkr.ecr.us-east-1.amazonaws.com

bun run image:build

docker tag bunzina-lambda:lambda \
  056832840038.dkr.ecr.us-east-1.amazonaws.com/bunzina-lambda:latest

docker push 056832840038.dkr.ecr.us-east-1.amazonaws.com/bunzina-lambda:latest
```

Se o repositorio ECR ja existir, o primeiro comando pode retornar erro de duplicidade e pode ser ignorado.

## Deploy

```bash
export ECR_IMAGE_URI="056832840038.dkr.ecr.us-east-1.amazonaws.com/bunzina-lambda:latest"
export BUNZINA_API_BASE_URL="https://api.bunzina.example.com"

bun run deploy -- --region us-east-1
```

Para remover a stack:

```bash
export ECR_IMAGE_URI="056832840038.dkr.ecr.us-east-1.amazonaws.com/bunzina-lambda:latest"

bunx serverless remove --region us-east-1
```

## Teste rapido

Use a URL limpa retornada pelo API Gateway, sem colchetes ou parenteses de Markdown:

```bash
curl -i -X POST "$API_URL/auth/login" \
  -H "Content-Type: application/json" \
  -d '{"document":"invalid","password":""}'
```

Resposta esperada:

```json
{
  "reason": "Invalid data in request",
  "invalidParams": []
}
```
