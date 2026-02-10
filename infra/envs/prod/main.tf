terraform {
  required_version = ">= 1.5.0"

  required_providers {
    aws = {
      source  = "hashicorp/aws"
      version = "~> 5.0"
    }
  }
}

provider "aws" {
  region = var.region
}

locals {
  vpc_cidr = "172.31.0.0/16"
  subnets = [
    { name = "us_east_1f", cidr = "172.31.64.0/20", az = "us-east-1f" },
    { name = "us_east_1d", cidr = "172.31.32.0/20", az = "us-east-1d" },
    { name = "us_east_1e", cidr = "172.31.48.0/20", az = "us-east-1e" },
    { name = "us_east_1a", cidr = "172.31.0.0/20",  az = "us-east-1a" },
    { name = "us_east_1c", cidr = "172.31.16.0/20", az = "us-east-1c" },
    { name = "us_east_1b", cidr = "172.31.80.0/20", az = "us-east-1b" },
  ]
}

module "network" {
  source     = "../../modules/network"
  vpc_cidr   = local.vpc_cidr
  subnets    = local.subnets
  admin_cidr = "83.175.176.55/32"
}

module "iam" {
  source                         = "../../modules/iam"
  database_url_secret_arn         = var.database_url_secret_arn
  database_url_secret_kms_key_arn = var.database_url_secret_kms_key_arn
}

module "alb" {
  source       = "../../modules/alb"
  vpc_id       = module.network.vpc_id
  subnet_ids   = module.network.subnet_ids
  alb_sg_id    = module.network.alb_sg_id
  alb_cert_arn = var.alb_acm_cert_arn
}

module "ecs" {
  source                  = "../../modules/ecs"
  cluster_name            = "deployment_tool_cluster"
  subnet_ids              = module.network.subnet_ids
  security_group_id       = module.network.ecs_task_sg_id
  task_family             = "deployment_tool_td"
  task_cpu                = "256"
  task_memory             = "512"
  task_role_arn           = module.iam.ecs_tasks_role_arn
  execution_role_arn      = module.iam.ecs_task_execution_role_arn
  image                   = "622711946516.dkr.ecr.us-east-1.amazonaws.com/deployment_tool:latest4"
  database_url_secret_arn = var.database_url_secret_arn
  log_group_name          = "/ecs/deployment_tool_td"
  service_name            = "deployment_tool_td-service-tp4r2e7p"
  target_group_arn        = module.alb.tg_arn
}

module "rds" {
  source                       = "../../modules/rds"
  subnet_ids                   = module.network.subnet_ids
  rds_sg_id                    = module.network.rds_sg_id
  db_master_username           = var.db_master_username
  db_master_user_secret_kms_key_id = var.db_master_user_secret_kms_key_id
  db_kms_key_id                = var.db_kms_key_id
  monitoring_role_arn          = module.iam.rds_monitoring_role_arn
}

module "frontend" {
  source                    = "../../modules/frontend"
  bucket_name               = "deployment-tool-frontend-dev"
  cloudfront_acm_cert_arn   = var.cloudfront_acm_cert_arn
}

module "ecr" {
  source = "../../modules/ecr"
}
