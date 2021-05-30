resource "aws_api_gateway_rest_api" "Gateway" {
  name = "api_gateway"
  description = "API Gateway for Lambda"
}

resource "aws_api_gateway_method" "Method" {
  rest_api_id   = aws_api_gateway_rest_api.Gateway.id
  resource_id   = aws_api_gateway_rest_api.Gateway.root_resource_id
  http_method   = "GET"
  authorization = "NONE"
}

resource "aws_api_gateway_integration" "Integration" {
  rest_api_id = aws_api_gateway_rest_api.Gateway.id
  resource_id = aws_api_gateway_method.Method.resource_id
  http_method = aws_api_gateway_method.Method.http_method

  integration_http_method = "POST"
  type = "AWS_PROXY"
  uri = aws_lambda_function.lambda.invoke_arn
}

# Deployment
resource "aws_api_gateway_deployment" "Deployment" {
  depends_on = [
    aws_api_gateway_integration.Integration,
  ]
  rest_api_id = aws_api_gateway_rest_api.Gateway.id
  stage_name = "search"
}