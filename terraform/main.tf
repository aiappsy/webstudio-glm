terraform {
  required_version = ">= 1.0"
  required_providers {
    aws = {
      source  = "hashicorp/aws"
      version = "~ 5.0"
    }
    kubernetes = {
      source  = "hashicorp/kubernetes"
      version = "~ 2.0"
    }
  }

  provider "aws" {
    region = var.region
  }

  provider "kubernetes" {
    config_path = "~/.kube/config"
    config_context = "arn:aws:eks:${var.region}:${var.cluster_name}"
  }

  # VPC
  resource "aws_vpc" "main" {
    cidr_block           = "10.0.0.0/16"
    enable_dns_hostnames = true
    enable_dns_support   = true

    tags = {
      Name        = "${var.project_name}-vpc"
      Environment = var.environment
      Project     = var.project_name
    }
  }

  # Internet Gateway
  resource "aws_internet_gateway" "main" {
    vpc_id = aws_vpc.main.id

    tags = {
      Name        = "${var.project_name}-igw"
      Environment = var.environment
      Project     = var.project_name
    }
  }

  # Public Subnets
  resource "aws_subnet" "public" {
    count = 2

    vpc_id                  = aws_vpc.main.id
    cidr_block              = "10.0.${count.index}.0/24"
    availability_zone       = "${var.region}${count.index == 0 ? "a" : "b"}"

    map_public_ip_on_launch = true

    tags = {
      Name        = "${var.project_name}-public-${count.index}"
      Environment = var.environment
      Project     = var.project_name
    }
  }

  # Private Subnets
  resource "aws_subnet" "private" {
    count = 2

    vpc_id                  = aws_vpc.main.id
    cidr_block              = "10.0.${count.index + 2}.0/24"
    availability_zone       = "${var.region}${count.index == 0 ? "a" : "b"}"

    tags = {
      Name        = "${var.project_name}-private-${count.index}"
      Environment = var.environment
      Project     = var.project_name
    }
  }

  # EKS Cluster
  resource "aws_eks_cluster" "main" {
    name     = var.cluster_name
    role_arn = aws_iam_role.eks_cluster.arn
    version  = "1.28"

    vpc_config {
      subnet_ids = aws_subnet.private[*].id
    }

    enabled_cluster_log_types = ["api", "audit", "authenticator", "controllerManager", "scheduler"]

    tags = {
      Name        = var.project_name
      Environment = var.environment
      Project     = var.project_name
    }
  }

  # Node Group
  resource "aws_eks_node_group" "main" {
    cluster_name = aws_eks_cluster.main.name
    node_group_name = "${var.project_name}-nodes"
    node_role_arn = aws_iam_role.eks_node.arn
    subnet_ids     = aws_subnet.private[*].id

    scaling_config {
      desired_size = 3
      max_size     = 6
      min_size     = 2
    }

    instance_types = ["t3.medium"]

    tags = {
      Name        = "${var.project_name}-node-group"
      Environment = var.environment
      Project     = var.project_name
    }
  }

  # RDS PostgreSQL
  resource "aws_db_instance" "main" {
    identifier = var.database_name
    engine     = "postgres"
    engine_version = "15.4"
    instance_class = "db.t3.micro"
    
    allocated_storage     = 20
    max_allocated_storage = 100
    storage_type          = "gp2"
    storage_encrypted    = true
    
    db_name  = var.database_name
    username = "postgres"
    password = var.database_password
    
    vpc_security_group_ids = [aws_security_group.database.id]
    db_subnet_group_name   = aws_db_subnet_group.main.name
    
    backup_retention_period = 7
    backup_window          = "03:00-04:00"
    maintenance_window     = "sun:04:00-sun:05:00"
    
    skip_final_snapshot  = true
    final_snapshot_identifier = false
    
    tags = {
      Name        = var.database_name
      Environment = var.environment
      Project     = var.project_name
    }
  }

  # ElastiCache Redis
  resource "aws_elasticache_subnet_group" "main" {
    name       = "${var.project_name}-cache-subnet"
    subnet_ids = aws_subnet.private[*].id
  }

  resource "aws_elasticache_replication_group" "main" {
    replication_group_id       = aws_elasticache_replication_group.main.id
    replication_group_description = "${var.project_name} Redis replication group"
    node_type                 = "cache.t3.micro"
    port                      = 6379
    parameter_group_name        = aws_elasticache_parameter_group.main.name
    subnet_group_name          = aws_elasticache_subnet_group.main.name
    security_group_ids         = [aws_security_group.cache.id]
    
    at_rest_encryption_enabled  = true
    transit_encryption_enabled   = true
    
    automatic_failover_enabled  = true
    multi_az_enabled            = true
    
    tags = {
      Name        = "${var.project_name}-cache"
      Environment = var.environment
      Project     = var.project_name
    }
  }

  # Security Groups
  resource "aws_security_group" "cluster" {
    name        = "${var.project_name}-cluster"
    description = "Security group for EKS cluster"
    vpc_id      = aws_vpc.main.id
    
    tags = {
      Name        = "${var.project_name}-cluster-sg"
      Environment = var.environment
      Project     = var.project_name
    }
  }

  resource "aws_security_group" "nodes" {
    name        = "${var.project_name}-nodes"
    description = "Security group for EKS worker nodes"
    vpc_id      = aws_vpc.main.id
    
    tags = {
      Name        = "${var.project_name}-nodes-sg"
      Environment = var.environment
      Project     = var.project_name
    }
  }

  resource "aws_security_group" "database" {
    name        = "${var.project_name}-database"
    description = "Security group for RDS PostgreSQL"
    vpc_id      = aws_vpc.main.id
    
    tags = {
      Name        = "${var.project_name}-database-sg"
      Environment = var.environment
      Project     = var.project_name
    }
  }

  resource "aws_security_group" "cache" {
    name        = "${var.project_name}-cache"
    description = "Security group for ElastiCache Redis"
    vpc_id      = aws_vpc.main.id
    
    tags = {
      Name        = "${var.project_name}-cache-sg"
      Environment = var.environment
      Project     = var.project_name
    }
  }

  # Route 53
  resource "aws_route53_zone" "main" {
    name = var.domain_name
    
    tags = {
      Name        = "${var.project_name}-dns"
      Environment = var.environment
      Project     = var.project_name
    }
  }

  resource "aws_route53_record" "www" {
    zone_id = aws_route53_zone.main.zone_id
    name    = "www"
    type    = "A"
    ttl     = 300
    records = [aws_lb.main.dns_name]
  }

  resource "aws_route53_record" "api" {
    zone_id = aws_route53_zone.main.zone_id
    name    = "api"
    type    = "A"
    ttl     = 300
    records = [aws_lb.main.dns_name]
  }

  # Load Balancer
  resource "aws_lb" "main" {
    name               = "${var.project_name}-lb"
    internal           = false
    load_balancer_type = "application"
    security_groups    = [aws_security_group.nodes.id]
    subnets           = aws_subnet.public[*].id

    tags = {
      Name        = "${var.project_name}-lb"
      Environment = var.environment
      Project     = var.project_name
    }
  }

  # S3 Bucket
  resource "aws_s3_bucket" "main" {
    bucket = "${var.project_name}-assets"
    
    tags = {
      Name        = "${var.project_name}-s3"
      Environment = var.environment
      Project     = var.project_name
    }
  }

  # CloudWatch Log Group
  resource "aws_cloudwatch_log_group" "main" {
    name = "/aws/eks/${var.project_name}/cluster"

    tags = {
      Name        = "${var.project_name}-logs"
      Environment = var.environment
      Project     = var.project_name
    }
  }

  outputs {
    cluster_name = aws_eks_cluster.main.name
    cluster_endpoint = aws_eks_cluster.main.endpoint
    database_endpoint = aws_db_instance.main.endpoint
    cache_endpoint = aws_elasticache_replication_group.main.primary_endpoint_address
    load_balancer_dns = aws_lb.main.dns_name
    s3_bucket_name = aws_s3_bucket.main.bucket
  }
}