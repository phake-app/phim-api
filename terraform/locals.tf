locals {
  name = "phim_api"
  author = "senpp"
  email = "hi@phuongphung.com"
  lambda_memory = 128

  tags = {
    Name = "lambda_phim_api"
    GitRepo = ""
    ManagedBy = "Terraform"
    Owner = "${local.email}"
  }
}