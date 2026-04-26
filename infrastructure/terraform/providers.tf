terraform {
  required_providers {
    aws = {
      source  = "hashicorp/aws"
      version = ">= 4.0"
    }
  }
  
  backend "s3" {
      bucket = "ukfp-allocation-terraform-state-609788376528-eu-west-2-an"
      key    = "terraform.tfstate"
      region = "eu-west-2"
  }
}

provider "aws" {
  region = var.aws_region
}
