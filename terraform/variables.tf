variable "project_name" {
  description = "Name of the project"
  type        = string
  default     = "aiappsy-web-studio"
}

variable "environment" {
  description = "Environment (development, staging, production)"
  type        = string
  default     = "production"
}

variable "region" {
  description = "AWS region"
  type        = string
  default     = "us-west-2"
}

variable "cluster_name" {
  description = "EKS cluster name"
  type        = string
  default     = "aiappsy-cluster"
}

variable "database_name" {
  description = "RDS database name"
  type        = string
  default     = "aiappsy-postgres"
}

variable "database_password" {
  description = "RDS database password"
  type        = string
  sensitive   = true
}

variable "domain_name" {
  description = "Domain name for Route 53"
  type        = string
  default     = "aiappsy.com"
}

variable "ssl_certificate_arn" {
  description = "SSL certificate ARN for Route 53"
  type        = string
  default     = ""
}