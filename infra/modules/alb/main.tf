variable "vpc_id" { type = string }
variable "subnet_ids" { type = list(string) }
variable "alb_sg_id" { type = string }
variable "alb_cert_arn" { type = string }

resource "aws_lb" "app" {
  name               = "lb-deployment-tool"
  load_balancer_type = "application"
  internal           = false
  subnets            = var.subnet_ids
  security_groups    = [var.alb_sg_id]
  ip_address_type    = "ipv4"
}

resource "aws_lb_target_group" "app_tg_8000" {
  name        = "deployment-tool-tg-8000"
  port        = 8000
  protocol    = "HTTP"
  vpc_id      = var.vpc_id
  target_type = "ip"

  health_check {
    path                = "/health"
    protocol            = "HTTP"
    port                = "traffic-port"
    interval            = 30
    timeout             = 5
    healthy_threshold   = 5
    unhealthy_threshold = 2
    matcher             = "200"
  }
}

resource "aws_lb_target_group" "legacy_tg_80" {
  name        = "deployment-tool-target-group"
  port        = 80
  protocol    = "HTTP"
  vpc_id      = var.vpc_id
  target_type = "ip"

  health_check {
    path                = "/health"
    protocol            = "HTTP"
    port                = "traffic-port"
    interval            = 30
    timeout             = 5
    healthy_threshold   = 5
    unhealthy_threshold = 2
    matcher             = "200"
  }
}

resource "aws_lb_listener" "http" {
  load_balancer_arn = aws_lb.app.arn
  port              = 80
  protocol          = "HTTP"

  default_action {
    type             = "forward"
    target_group_arn = aws_lb_target_group.app_tg_8000.arn
  }

  lifecycle {
    ignore_changes = [default_action[0].forward]
  }
}

resource "aws_lb_listener" "https" {
  load_balancer_arn = aws_lb.app.arn
  port              = 443
  protocol          = "HTTPS"
  ssl_policy        = "ELBSecurityPolicy-TLS13-1-2-Res-PQ-2025-09"
  certificate_arn   = var.alb_cert_arn

  default_action {
    type             = "forward"
    target_group_arn = aws_lb_target_group.app_tg_8000.arn
  }

  lifecycle {
    ignore_changes = [default_action[0].forward]
  }
}

output "lb_arn" { value = aws_lb.app.arn }
output "lb_dns_name" { value = aws_lb.app.dns_name }
output "tg_arn" { value = aws_lb_target_group.app_tg_8000.arn }
output "legacy_tg_arn" { value = aws_lb_target_group.legacy_tg_80.arn }
output "listener_http_arn" { value = aws_lb_listener.http.arn }
output "listener_https_arn" { value = aws_lb_listener.https.arn }
