variable "aws_region" {
  default = "us-east-1"
}

variable "bucket_name" {
  description = "S3 버킷 이름 — 전 세계 고유해야 함"
  default     = "finly-frontend-assets"
}

variable "backend_alb_dns" {
  description = "finly-backend ALB DNS 이름 (finly-backend terraform output의 alb_dns_name)"
}
