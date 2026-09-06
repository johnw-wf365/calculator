# Global Outputs
# WorkForce365.ai Infrastructure

output "environment" {
  description = "Current environment"
  value       = var.environment
}

output "region" {
  description = "UpCloud region"
  value       = var.region
}

output "common_tags" {
  description = "Common tags applied to all resources"
  value       = var.common_tags
}

# Production infrastructure details
output "production_server_uuid" {
  description = "UUID of the production server"
  value       = var.production_server_uuid
}

output "production_server_ip" {
  description = "Public IP of the production server"
  value       = "5.22.209.180"
}

output "production_server_private_ip" {
  description = "Private IP of the production server (utility network)"
  value       = "10.5.18.28"
}

output "production_domain" {
  description = "Production domain"
  value       = "wf365.workforce365.ai"
}

output "production_zone" {
  description = "UpCloud zone"
  value       = "nl-ams1"
}

output "production_plan" {
  description = "Server plan"
  value       = "4xCPU-16GB (STARTER)"
}
