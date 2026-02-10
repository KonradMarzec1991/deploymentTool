variable "region" {
  type    = string
  default = "us-east-1"
}

variable "alb_acm_cert_arn" {
  type    = string
  default = "arn:aws:acm:us-east-1:622711946516:certificate/059c0805-e7ff-4af1-9bc9-2eb951a00b1e"
}

variable "cloudfront_acm_cert_arn" {
  type    = string
  default = "arn:aws:acm:us-east-1:622711946516:certificate/059c0805-e7ff-4af1-9bc9-2eb951a00b1e"
}

variable "database_url_secret_arn" {
  type        = string
  description = "Secrets Manager ARN containing DATABASE_URL"
}

variable "db_master_username" {
  type    = string
  default = "postgres"
}

variable "db_master_user_secret_kms_key_id" {
  type    = string
  default = "arn:aws:kms:us-east-1:622711946516:key/65a44da4-77df-4ab7-bd99-29501f7fa748"
}

variable "db_kms_key_id" {
  type    = string
  default = "arn:aws:kms:us-east-1:622711946516:key/010bd4a5-ca9f-412d-90a1-8531dffe7939"
}

variable "database_url_secret_kms_key_arn" {
  type        = string
  description = "KMS key ARN for decrypting DATABASE_URL secret (if customer-managed)"
  default     = null
}
