variable "aws_region" {
  type = string
  default = "ap-southeast-1"
}

variable "aws_profile" {
  type = string
  default = "default"
}

variable "domain_name" {
  type = string
  default = "api.phake.dev"
}

variable "acm_certificate_domain" {
  type = string
  default = "*.phake.dev"
}