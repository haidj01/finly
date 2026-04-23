output "cloudfront_domain_name" {
  description = "CloudFront 배포 도메인 (VITE_API_URL로 사용)"
  value       = "https://${aws_cloudfront_distribution.frontend.domain_name}"
}

output "cloudfront_distribution_id" {
  description = "CloudFront 배포 ID (캐시 무효화용)"
  value       = aws_cloudfront_distribution.frontend.id
}

output "s3_bucket_name" {
  description = "빌드 파일 업로드 대상 S3 버킷 이름"
  value       = aws_s3_bucket.frontend.bucket
}
