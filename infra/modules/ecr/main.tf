resource "aws_ecr_repository" "backend" {
  name                 = "deployment_tool"
  image_tag_mutability = "IMMUTABLE"

  image_scanning_configuration {
    scan_on_push = false
  }

  encryption_configuration {
    encryption_type = "AES256"
  }
}

output "repository_url" { value = aws_ecr_repository.backend.repository_url }
