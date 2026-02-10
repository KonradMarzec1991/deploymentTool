output "alb_dns_name" {
  value = module.alb.lb_dns_name
}

output "cloudfront_domain" {
  value = module.frontend.cloudfront_domain
}

output "rds_cluster_endpoint" {
  value = module.rds.cluster_endpoint
}

output "rds_cluster_reader_endpoint" {
  value = module.rds.cluster_reader_endpoint
}

output "s3_frontend_bucket" {
  value = module.frontend.bucket_name
}

output "ecr_repository_url" {
  value = module.ecr.repository_url
}
