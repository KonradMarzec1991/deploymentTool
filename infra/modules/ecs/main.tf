variable "cluster_name" { type = string }
variable "subnet_ids" { type = list(string) }
variable "security_group_id" { type = string }
variable "task_family" { type = string }
variable "task_cpu" { type = string }
variable "task_memory" { type = string }
variable "task_role_arn" { type = string }
variable "execution_role_arn" { type = string }
variable "image" { type = string }
variable "database_url_secret_arn" { type = string }
variable "log_group_name" { type = string }
variable "service_name" { type = string }
variable "target_group_arn" { type = string }

resource "aws_ecs_cluster" "main" {
  name = var.cluster_name

  configuration {
    execute_command_configuration {
      logging = "DEFAULT"
    }
  }
}

resource "aws_cloudwatch_log_group" "ecs" {
  name = var.log_group_name
}

resource "aws_ecs_task_definition" "backend" {
  family                   = var.task_family
  network_mode             = "awsvpc"
  requires_compatibilities = ["FARGATE"]
  cpu                      = var.task_cpu
  memory                   = var.task_memory
  task_role_arn            = var.task_role_arn
  execution_role_arn       = var.execution_role_arn

  container_definitions = jsonencode([
    {
      name      = "backend"
      image     = var.image
      cpu       = 0
      essential = true

      portMappings = [
        {
          name          = "backend-8000-tcp"
          containerPort = 8000
          hostPort      = 8000
          protocol      = "tcp"
          appProtocol   = "http"
        }
      ]

      secrets = [
        {
          name      = "DATABASE_URL"
          valueFrom = var.database_url_secret_arn
        }
      ]

      logConfiguration = {
        logDriver = "awslogs"
        options = {
          awslogs-group         = var.log_group_name
          awslogs-region        = "us-east-1"
          awslogs-stream-prefix = "ecs"
          awslogs-create-group  = "true"
        }
      }
    }
  ])
}

resource "aws_ecs_service" "backend" {
  name            = var.service_name
  cluster         = aws_ecs_cluster.main.id
  task_definition = aws_ecs_task_definition.backend.arn
  desired_count   = 1

  capacity_provider_strategy {
    capacity_provider = "FARGATE"
    weight            = 1
    base              = 0
  }

  platform_version = "1.4.0"

  deployment_circuit_breaker {
    enable   = true
    rollback = true
  }

  deployment_maximum_percent         = 200
  deployment_minimum_healthy_percent = 100

  enable_execute_command   = true
  enable_ecs_managed_tags  = true
  availability_zone_rebalancing = "ENABLED"

  network_configuration {
    assign_public_ip = true
    subnets          = var.subnet_ids
    security_groups  = [var.security_group_id]
  }

  load_balancer {
    target_group_arn = var.target_group_arn
    container_name   = "backend"
    container_port   = 8000
  }
}

output "cluster_id" { value = aws_ecs_cluster.main.id }
output "service_name" { value = aws_ecs_service.backend.name }
output "task_definition_arn" { value = aws_ecs_task_definition.backend.arn }
output "log_group_name" { value = aws_cloudwatch_log_group.ecs.name }
