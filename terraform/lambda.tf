data "archive_file" "function_archive" {
  type = "zip"
  source_dir = "${path.module}/../lambda/dist"
  output_path = "${path.module}/../lambda/dist/function.zip"
}

resource "aws_lambda_layer_version" "dependency_layer" {
  filename = "${path.module}/../dist/layers/layers.zip"
  layer_name = "dependency_layer"
  compatible_runtimes = ["nodejs12.x"]
  source_code_hash = "${base64sha256(filebase64("${path.module}/../dist/layers/layers.zip"))}"
}

resource "aws_lambda_function" "lambda" {
  filename = data.archive_file.function_archive.output_path
  function_name = local.name
  role = aws_iam_role.lambda_role.arn
  handler = "main.handler"
  runtime = "nodejs12.x"
  timeout = "15"
  memory_size = local.lambda_memory
  layers = [ aws_lambda_layer_version.dependency_layer.arn ]
}

resource "aws_lambda_permission" "lambda" {
  statement_id = "AllowExecutionFromAPIGateway"
  action = "lambda:InvokeFunction"
  function_name = aws_lambda_function.lambda.function_name
  principal = "apigateway.amazonaws.com"
  source_arn = "${aws_apigatewayv2_api.http_gateway.execution_arn}/*/*"
}