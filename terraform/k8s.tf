terraform {
  required_version = ">= 1.0"
  required_providers {
    aws = {
      source  = "hashicorp/aws"
      version = "~ 5.0"
    }
  }

  provider "aws" {
    region = var.region
  }
}

# Provider for Kubernetes
provider "kubernetes" {
  config_path = "~/.kube/config"
  config_context = "arn:aws:eks:${var.region}:${var.cluster_name}"
}

# Kubernetes namespace
resource "kubernetes_namespace" "main" {
  metadata {
    name = var.project_name
  }
}

# Kubernetes ConfigMap
resource "kubernetes_config_map" "main" {
  metadata {
    name = "${var.project_name}-config"
    namespace = kubernetes_namespace.main.metadata[0].name
  }

  data = {
    NODE_ENV = var.environment
    PORT = "3000"
  }
}

# Kubernetes Secret
resource "kubernetes_secret" "main" {
  metadata {
    name = "${var.project_name}-secrets"
    namespace = kubernetes_namespace.main.metadata[0].name
  }

  data = {
    DATABASE_URL = var.database_url
    NEXTAUTH_SECRET = var.nextauth_secret
    OPENROUTER_API_KEY = var.openrouter_api_key
  }
}

# Kubernetes Deployment
resource "kubernetes_deployment" "main" {
  metadata {
    name = var.project_name
    namespace = kubernetes_namespace.main.metadata[0].name
    labels = {
      app = var.project_name
    }
  }

  spec {
    replicas = 3
    
    selector {
      match_labels = {
        app = var.project_name
      }
    }

    template {
      metadata {
        labels = {
          app = var.project_name
        }
      }

      spec {
        container {
          name = var.project_name
          image = "aiappsy-web-studio:latest"
          
          ports = [{
            containerPort = 3000
          }]
          
          env_from = [{
            config_map_ref = {
              name = kubernetes_config_map.main.metadata[0].name
            }
          }, {
            secret_ref = {
              name = kubernetes_secret.main.metadata[0].name
            }
          }]
          
          resources {
            requests = {
              memory = "256Mi"
              cpu = "250m"
            }
            limits = {
              memory = "512Mi"
              cpu = "500m"
            }
          }
          
          liveness_probe {
            http_get {
              path = "/api/health"
              port = 3000
            }
            initial_delay_seconds = 30
            period_seconds = 10
          }
          
          readiness_probe {
            http_get {
              path = "/api/health"
              port = 3000
            }
            initial_delay_seconds = 5
            period_seconds = 5
          }
        }
      }
    }
  }
}

# Kubernetes Service
resource "kubernetes_service" "main" {
  metadata {
    name = "${var.project_name}-service"
    namespace = kubernetes_namespace.main.metadata[0].name
    labels = {
      app = var.project_name
    }
  }

  spec {
    selector {
      app = var.project_name
    }

    ports = [{
      port = 80
      target_port = 3000
      protocol = "TCP"
    }]

    type = "ClusterIP"
  }
}

# Kubernetes HorizontalPodAutoscaler
resource "kubernetes_horizontal_pod_autoscaler" "main" {
  metadata {
    name = "${var.project_name}-hpa"
    namespace = kubernetes_namespace.main.metadata[0].name
  }

  spec {
    scale_target_ref = {
      api_version = "apps/v1"
      kind = "Deployment"
      name = kubernetes_deployment.main.metadata[0].name
    }

    min_replicas = 2
    max_replicas = 10

    metrics = [{
      type = "Resource"
      resource = {
        name = "cpu"
        target = {
          type = "Utilization"
          average_utilization = 70
        }
      }
    }, {
      type = "Resource"
      resource = {
        name = "memory"
        target = {
          type = "Utilization"
          average_utilization = 80
        }
      }
    }]
  }
}