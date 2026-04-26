module "frontend" {
  source      = "../modules/frontend"
  bucket_name = "${var.project_name}-frontend-${random_id.frontend_suffix.hex}"
}

resource "random_id" "frontend_suffix" {
  byte_length = 4
}