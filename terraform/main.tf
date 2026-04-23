# 배포 순서:
# 1. finly-agent/terraform → apply (Secrets Manager 생성)
# 2. finly-backend/terraform → apply → alb_dns_name 확인
# 3. 이 디렉터리: terraform apply -var="backend_alb_dns=<ALB_DNS>"
# 4. finly-backend의 frontend_origin 변수를 CloudFront 도메인으로 업데이트 후 재배포
# 5. npm run build && aws s3 sync dist/ s3://<bucket> --delete
# 6. aws cloudfront create-invalidation --distribution-id <ID> --paths "/*"

terraform {
  required_providers {
    aws = {
      source  = "hashicorp/aws"
      version = "~> 5.0"
    }
  }

  # 원격 상태 저장 (S3 + DynamoDB 락)
  backend "s3" {
    bucket         = "finly-terraform-state"   # 사전 생성 필요
    key            = "finly-frontend/terraform.tfstate"
    region         = "us-east-1"
    dynamodb_table = "finly-terraform-locks"   # 사전 생성 필요
    encrypt        = true
  }
}

provider "aws" {
  region = var.aws_region
}

data "aws_caller_identity" "current" {}

# ── S3 버킷 (정적 파일 호스팅) ────────────────────────────────
resource "aws_s3_bucket" "frontend" {
  bucket = var.bucket_name
}

# OAC 방식 사용 → 모든 퍼블릭 액세스 차단
resource "aws_s3_bucket_public_access_block" "frontend" {
  bucket = aws_s3_bucket.frontend.id

  block_public_acls       = true
  block_public_policy     = true
  ignore_public_acls      = true
  restrict_public_buckets = true
}

resource "aws_s3_bucket_versioning" "frontend" {
  bucket = aws_s3_bucket.frontend.id

  versioning_configuration {
    status = "Enabled"
  }
}

# ── CloudFront Origin Access Control (OAC) ────────────────────
resource "aws_cloudfront_origin_access_control" "frontend" {
  name                              = "${var.bucket_name}-oac"
  description                       = "finly 프론트엔드 S3 OAC"
  origin_access_control_origin_type = "s3"
  signing_behavior                  = "always"
  signing_protocol                  = "sigv4"
}

# ── S3 버킷 정책 (CloudFront OAC만 허용) ─────────────────────
resource "aws_s3_bucket_policy" "frontend" {
  bucket = aws_s3_bucket.frontend.id

  policy = jsonencode({
    Version = "2012-10-17"
    Statement = [
      {
        Sid    = "AllowCloudFrontServicePrincipal"
        Effect = "Allow"
        Principal = {
          Service = "cloudfront.amazonaws.com"
        }
        Action   = "s3:GetObject"
        Resource = "${aws_s3_bucket.frontend.arn}/*"
        Condition = {
          StringEquals = {
            "AWS:SourceArn" = aws_cloudfront_distribution.frontend.arn
          }
        }
      }
    ]
  })
}

# ── CloudFront Distribution ───────────────────────────────────
resource "aws_cloudfront_distribution" "frontend" {
  enabled             = true
  is_ipv6_enabled     = true
  default_root_object = "index.html"
  price_class         = "PriceClass_100"   # 북미 + 유럽
  comment             = "finly 프론트엔드 배포"

  # 오리진 1: S3 (정적 파일)
  origin {
    origin_id                = "S3Origin"
    domain_name              = aws_s3_bucket.frontend.bucket_regional_domain_name
    origin_access_control_id = aws_cloudfront_origin_access_control.frontend.id
  }

  # 오리진 2: ALB (API 프록시)
  origin {
    origin_id   = "ALBOrigin"
    domain_name = var.backend_alb_dns

    custom_origin_config {
      http_port              = 80
      https_port             = 443
      origin_protocol_policy = "http-only"
      origin_ssl_protocols   = ["TLSv1.2"]
    }
  }

  # 캐시 동작 1: /api/* → ALB (캐싱 비활성화)
  ordered_cache_behavior {
    path_pattern     = "/api/*"
    target_origin_id = "ALBOrigin"

    allowed_methods = ["GET", "HEAD", "OPTIONS", "PUT", "POST", "PATCH", "DELETE"]
    cached_methods  = ["GET", "HEAD"]

    forwarded_values {
      query_string = true
      headers      = ["*"]

      cookies {
        forward = "all"
      }
    }

    min_ttl     = 0
    default_ttl = 0
    max_ttl     = 0

    viewer_protocol_policy = "redirect-to-https"
  }

  # 기본 동작: S3 정적 파일
  default_cache_behavior {
    target_origin_id = "S3Origin"

    allowed_methods = ["GET", "HEAD"]
    cached_methods  = ["GET", "HEAD"]

    forwarded_values {
      query_string = false

      cookies {
        forward = "none"
      }
    }

    default_ttl = 86400
    max_ttl     = 31536000

    viewer_protocol_policy = "redirect-to-https"
  }

  # SPA 라우팅 지원 (React Router 등 클라이언트 사이드 라우팅)
  custom_error_response {
    error_code            = 403
    response_code         = 200
    response_page_path    = "/index.html"
  }

  custom_error_response {
    error_code            = 404
    response_code         = 200
    response_page_path    = "/index.html"
  }

  restrictions {
    geo_restriction {
      restriction_type = "none"
    }
  }

  viewer_certificate {
    cloudfront_default_certificate = true
  }
}
