# Database Module
# Manages PostgreSQL database provisioning for WorkForce365.ai
#
# Current state: PostgreSQL 17 runs in Docker on the compute VM
#   Container: paperclip-postgres
#   Port:      5432 (localhost only)
#   Database:  paperclip
#   User:      paperclip
#   Version:   17.11
#
# Future state: Migrate to UpCloud Managed Database when budget allows
#   Plan: 2x2xCPU-4GB-25GB (~$50/mo)
#   Benefits: Automated backups, HA, zero-cost data transfer, 99.999% SLA

terraform {
  required_providers {
    upcloud = {
      source  = "UpCloudLtd/upcloud"
      version = "~> 5.0"
    }
  }
}

variable "environment" {
  type        = string
  description = "Environment name (dev, staging, prod)"
}

variable "server_id" {
  type        = string
  description = "Server ID for database host (current Docker setup)"
  default     = ""
}

variable "database_name" {
  type        = string
  description = "Database name"
  default     = "paperclip"
}

variable "database_user" {
  type        = string
  description = "Database user"
  default     = "paperclip"
}

variable "database_port" {
  type        = number
  description = "Database port"
  default     = 5432
}

variable "use_managed_db" {
  type        = bool
  description = "Use UpCloud Managed Database (requires ~$50/mo)"
  default     = false
}

variable "common_tags" {
  type        = map(string)
  description = "Common tags for all resources"
  default = {
    Project   = "paperclip"
    ManagedBy = "terraform"
  }
}

# UpCloud Managed Database (future use - currently disabled)
# Uncomment when budget allows (~$50/mo for 2CPU-4GB)
# resource "upcloud_managed_database_postgresql" "paperclip" {
#   name  = "paperclip-${var.environment}-db"
#   plan  = "2x2xCPU-4GB-25GB"
#   title = "Paperclip PostgreSQL ${var.environment}"
#   zone  = "nl-ams1"
#   properties {
#     timezone = "UTC"
#   }
# }

# Database configuration for current Docker setup
locals {
  db_host              = var.use_managed_db ? "upcloud-managed-db" : "localhost"
  db_connection_string = "postgresql://${var.database_user}:***@${local.db_host}:${var.database_port}/${var.database_name}"
}

output "database_host" {
  description = "Database host"
  value       = local.db_host
}

output "database_port" {
  description = "Database port"
  value       = var.database_port
}

output "database_name" {
  description = "Database name"
  value       = var.database_name
}

output "database_user" {
  description = "Database user"
  value       = var.database_user
}

output "connection_string" {
  description = "Database connection string (without password)"
  value       = local.db_connection_string
  sensitive   = true
}

output "managed_db_enabled" {
  description = "Whether managed database is enabled"
  value       = var.use_managed_db
}

output "migration_notes" {
  description = "Notes for future migration to UpCloud Managed Database"
  value       = <<-EOT
    Current: PostgreSQL 17 in Docker on compute VM (paperclip-postgres container)
    Future: UpCloud Managed Database (2x2xCPU-4GB-25GB, ~$50/mo)

    Migration steps:
    1. Enable use_managed_db = true
    2. Create managed database instance
    3. Use pg_dump/pg_restore to migrate data
    4. Update application connection string
    5. Decommission Docker PostgreSQL

    Docker PostgreSQL details:
      Container: paperclip-postgres
      Port: 5432 (localhost only)
      Database: paperclip
      User: paperclip
      Extensions: pgcrypto, uuid-ossp
  EOT
}
