# DNS Module
# Documents DNS records for WorkForce365.ai
#
# NOTE: UpCloud Terraform provider v5 does not include native DNS resources.
# DNS is managed via the UpCloud Hub (https://hub.upcloud.com) or API directly.
# This module documents the required DNS configuration and provides outputs
# for use with `upctl` CLI or API calls.
#
# Current production DNS:
#   Domain: workforce365.ai
#   A:      wf365.workforce365.ai -> 5.22.209.180
#   Wildcard: *.wf365.workforce365.ai -> 5.22.209.180
#   CAA:    wf365.workforce365.ai -> 0 issue "letsencrypt.org"

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

variable "server_ip" {
  type        = string
  description = "Server public IP address"
  default     = "5.22.209.180"
}

variable "domain" {
  type        = string
  description = "Domain name"
  default     = "workforce365.ai"
}

variable "subdomain" {
  type        = string
  description = "Subdomain for the application"
  default     = "wf365"
}

variable "ttl" {
  type        = number
  description = "Time to live for DNS records"
  default     = 3600
}

variable "common_tags" {
  type        = map(string)
  description = "Common tags for all resources"
  default = {
    Project   = "paperclip"
    ManagedBy = "terraform"
  }
}

# DNS configuration is documented here for reference.
# Use `upctl` CLI or UpCloud API to create records:
#
#   upctl dns-zone create --name workforce365.ai
#   upctl dns-record create --zone workforce365.ai --name wf365 --type A --data 5.22.209.180 --ttl 3600
#   upctl dns-record create --zone workforce365.ai --name *.wf365 --type A --data 5.22.209.180 --ttl 3600
#   upctl dns-record create --zone workforce365.ai --name wf365 --type CAA --data '0 issue "letsencrypt.org"' --ttl 3600

output "dns_zone" {
  description = "DNS zone (manual setup required)"
  value       = var.domain
}

output "dns_records" {
  description = "DNS records to configure (manual setup required)"
  value = {
    app_a = {
      name  = "${var.subdomain}"
      type  = "A"
      data  = var.server_ip
      ttl   = var.ttl
    }
    wildcard = {
      name  = "*.${var.subdomain}"
      type  = "A"
      data  = var.server_ip
      ttl   = var.ttl
    }
    caa = {
      name  = "${var.subdomain}"
      type  = "CAA"
      data  = "0 issue \"letsencrypt.org\""
      ttl   = var.ttl
    }
  }
}

output "full_domain" {
  description = "Full application domain"
  value       = "${var.subdomain}.${var.domain}"
}

output "setup_instructions" {
  description = "Instructions for manual DNS setup"
  value       = <<-EOT
    DNS records must be configured manually via UpCloud Hub or CLI:

    1. Log in to https://hub.upcloud.com
    2. Navigate to DNS > Zones
    3. Create zone: ${var.domain}
    4. Add records:
       - A     ${var.subdomain}            ${var.server_ip}  TTL=${var.ttl}
       - A     *.${var.subdomain}          ${var.server_ip}  TTL=${var.ttl}
       - CAA   ${var.subdomain}            0 issue "letsencrypt.org"  TTL=${var.ttl}

    Or via upctl CLI:
      upctl dns-zone create --name ${var.domain}
      upctl dns-record create --zone ${var.domain} --name ${var.subdomain} --type A --data ${var.server_ip} --ttl ${var.ttl}
      upctl dns-record create --zone ${var.domain} --name *.${var.subdomain} --type A --data ${var.server_ip} --ttl ${var.ttl}
      upctl dns-record create --zone ${var.domain} --name ${var.subdomain} --type CAA --data '0 issue "letsencrypt.org"' --ttl ${var.ttl}
  EOT
}

output "terraform_limitation_note" {
  description = "Note about Terraform provider limitation"
  value       = "UpCloud Terraform provider v5 does not support DNS resources. DNS must be managed via UpCloud Hub or API."
}
