data "aws_acm_certificate" "issued" {
  domain = var.acm_certificate_domain
  statuses = [ "ISSUED" ]
}

# HTTP Gateway
resource "aws_apigatewayv2_api" "http_gateway" {
  name = "http_gateway"
  description = "HTTP API gateway for Lambda"
  protocol_type = "HTTP"

  cors_configuration {
    allow_credentials = false
    allow_headers     = ["*"]
    allow_methods     = ["*"]
    allow_origins     = ["https://phim.phake.dev", "http://localhost:3000"]
    expose_headers    = ["*"]
    max_age           = 3600
  }
}

resource "aws_apigatewayv2_stage" "http_gateway_state" {
  api_id = aws_apigatewayv2_api.http_gateway.id
  name = "$default"
  auto_deploy = true
  lifecycle {
    ignore_changes = [
      deployment_id,
      default_route_settings
    ]
  }
}

resource "aws_apigatewayv2_integration" "http_gateway_integration" {
  api_id = aws_apigatewayv2_api.http_gateway.id
  integration_type = "AWS_PROXY"

  timeout_milliseconds = "15000"
  connection_type = "INTERNET"
  description = "HTTP API gateway intergration for Lambda"
  integration_method = "POST"
  integration_uri = aws_lambda_function.lambda.invoke_arn
  passthrough_behavior = "WHEN_NO_MATCH"

  lifecycle {
    ignore_changes = [
      passthrough_behavior
    ]
  }
}

resource "aws_apigatewayv2_route" "http_gateway_route" {
  api_id = aws_apigatewayv2_api.http_gateway.id
  route_key = "GET /"

  target = "integrations/${aws_apigatewayv2_integration.http_gateway_integration.id}"
}

resource "aws_apigatewayv2_domain_name" "http_gateway_domain_name" {
  domain_name = var.domain_name

  domain_name_configuration {
    certificate_arn = data.aws_acm_certificate.issued.arn
    endpoint_type = "REGIONAL"
    security_policy = "TLS_1_2"
  }
}

resource "aws_apigatewayv2_api_mapping" "http_gateway_mapping" {
  api_id = aws_apigatewayv2_api.http_gateway.id
  domain_name = aws_apigatewayv2_domain_name.http_gateway_domain_name.id
  stage = aws_apigatewayv2_stage.http_gateway_state.id
  api_mapping_key = "phim"
}