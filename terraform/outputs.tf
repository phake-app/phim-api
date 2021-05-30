output "api_base_url" {
  value = aws_apigatewayv2_stage.http_gateway_state.invoke_url
  description = "The public IP of the API"
}