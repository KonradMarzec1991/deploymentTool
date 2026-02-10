variable "subnet_ids" { type = list(string) }
variable "rds_sg_id" { type = string }
variable "db_master_username" { type = string }
variable "db_master_user_secret_kms_key_id" { type = string }
variable "db_kms_key_id" { type = string }
variable "monitoring_role_arn" { type = string }

resource "aws_db_subnet_group" "main" {
  name        = "default-vpc-09a261d3b358a6931"
  description = "Created from the RDS Management Console"
  subnet_ids  = var.subnet_ids
}

resource "aws_rds_cluster" "main" {
  cluster_identifier              = "database-1"
  engine                          = "aurora-postgresql"
  engine_version                  = "17.4"
  availability_zones              = ["us-east-1d", "us-east-1a", "us-east-1b"]
  master_username                 = var.db_master_username
  manage_master_user_password     = false
  db_subnet_group_name            = aws_db_subnet_group.main.name
  db_cluster_parameter_group_name = "default.aurora-postgresql17"
  vpc_security_group_ids          = [var.rds_sg_id]
  storage_encrypted               = true
  kms_key_id                      = var.db_kms_key_id
  backup_retention_period         = 7
  preferred_backup_window         = "04:34-05:04"
  preferred_maintenance_window    = "wed:08:28-wed:08:58"
  port                            = 5432
  deletion_protection             = true
  copy_tags_to_snapshot           = true
  iam_database_authentication_enabled = false
  storage_type                    = "aurora-iopt1"
  performance_insights_enabled    = true
  skip_final_snapshot             = true

  lifecycle {
    ignore_changes = [
      enable_global_write_forwarding,
      enable_local_write_forwarding,
    ]
  }
}

resource "aws_rds_cluster_instance" "primary" {
  identifier                 = "database-1-instance-1"
  cluster_identifier         = aws_rds_cluster.main.id
  instance_class             = "db.r6g.2xlarge"
  engine                     = "aurora-postgresql"
  engine_version             = "17.4"
  db_parameter_group_name    = "default.aurora-postgresql17"
  availability_zone          = "us-east-1d"
  auto_minor_version_upgrade = true
  publicly_accessible        = false
  promotion_tier             = 1
  ca_cert_identifier         = "rds-ca-rsa2048-g1"
  monitoring_interval        = 60
  monitoring_role_arn        = var.monitoring_role_arn
  performance_insights_enabled          = true
  performance_insights_kms_key_id        = var.db_kms_key_id
  performance_insights_retention_period = 7
  copy_tags_to_snapshot       = false

  tags = {
    "devops-guru-default" = "database-1"
  }
}

resource "aws_rds_cluster_instance" "replica" {
  identifier                 = "database-1-instance-1-us-east-1a"
  cluster_identifier         = aws_rds_cluster.main.id
  instance_class             = "db.r6g.2xlarge"
  engine                     = "aurora-postgresql"
  engine_version             = "17.4"
  db_parameter_group_name    = "default.aurora-postgresql17"
  availability_zone          = "us-east-1a"
  auto_minor_version_upgrade = true
  publicly_accessible        = false
  promotion_tier             = 1
  ca_cert_identifier         = "rds-ca-rsa2048-g1"
  monitoring_interval        = 60
  monitoring_role_arn        = var.monitoring_role_arn
  performance_insights_enabled          = true
  performance_insights_kms_key_id        = var.db_kms_key_id
  performance_insights_retention_period = 7
  copy_tags_to_snapshot       = false

  tags = {
    "devops-guru-default" = "database-1"
  }
}

output "cluster_endpoint" { value = aws_rds_cluster.main.endpoint }
output "cluster_reader_endpoint" { value = aws_rds_cluster.main.reader_endpoint }
