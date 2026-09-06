# Global Variables
# WorkForce365.ai Infrastructure

variable "upcloud_username" {
  description = "UpCloud API username"
  type        = string
  sensitive   = true
}

variable "upcloud_password" {
  description = "UpCloud API password"
  type        = string
  sensitive   = true
}

variable "backend_conn_str" {
  description = "PostgreSQL connection string for Terraform state backend"
  type        = string
  sensitive   = true
}

variable "environment" {
  description = "Environment name (dev, staging, prod)"
  type        = string
  default     = "prod"

  validation {
    condition     = contains(["dev", "staging", "prod"], var.environment)
    error_message = "Environment must be one of: dev, staging, prod."
  }
}

variable "project_name" {
  description = "Project name for resource tagging"
  type        = string
  default     = "paperclip"
}

variable "region" {
  description = "UpCloud region"
  type        = string
  default     = "nl-ams1"
}

variable "server_plan" {
  description = "Server plan (CPU/RAM configuration)"
  type        = string
  default     = "4xCPU-16GB"
}

variable "common_tags" {
  description = "Common tags for all resources"
  type        = map(string)
  default = {
    Project   = "paperclip"
    ManagedBy = "terraform"
  }
}

# Production server UUID — used for terraform import
variable "production_server_uuid" {
  description = "UUID of the existing production server (for import)"
  type        = string
  default     = "00ba1bf8-0710-4dab-a2dd-0970d329978d"
}
