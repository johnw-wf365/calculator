# Compute Module
# Manages UpCloud server instances for WorkForce365.ai
#
# Existing production server:
#   Hostname: paperclip-hermes-1
#   UUID:    00ba1bf8-0710-4dab-a2dd-0970d329978d
#   Public:  5.22.209.180
#   Private: 10.5.18.28 (10.5.16.0/22 utility network)
#   Zone:    nl-ams1
#   Plan:    4xCPU-16GB (STARTER)
#   Disk:    50GB
#   OS:      Ubuntu 24.04 LTS (Noble Numbat)

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

variable "region" {
  type        = string
  description = "UpCloud region"
}

variable "server_plan" {
  type        = string
  description = "Server plan (CPU/RAM configuration)"
  default     = "4xCPU-16GB"
}

variable "server_hostname" {
  type        = string
  description = "Server hostname"
  default     = "paperclip-hermes-1"
}

variable "disk_size" {
  type        = number
  description = "Disk size in GB"
  default     = 50
}

variable "ssh_public_key" {
  type        = string
  description = "SSH public key for server access"
  default     = ""
}

variable "common_tags" {
  type        = map(string)
  description = "Common tags for all resources"
  default = {
    Project   = "paperclip"
    ManagedBy = "terraform"
  }
}

# Production server instance
# After import, manage with:
#   terraform import upcloud_server.paperclip 00ba1bf8-0710-4dab-a2dd-0970d329978d
resource "upcloud_server" "paperclip" {
  hostname = var.server_hostname
  zone     = var.region
  plan     = var.server_plan
  metadata = true
  firewall = true

  # Boot from Ubuntu 24.04 LTS template
  template {
    size    = var.disk_size
    storage = "Ubuntu Server 24.04 LTS (Noble Numbat)"
    title   = "${var.server_hostname}-os-disk"

    backup_rule {
      interval  = "daily"
      time      = "0300"
      retention = 7
    }
  }

  # SSH access (only set when public key is provided)
  dynamic "login" {
    for_each = var.ssh_public_key != "" ? [1] : []
    content {
      user = "root"
      keys = [var.ssh_public_key]
    }
  }

  # Public internet interface
  network_interface {
    type = "public"
  }

  # Private utility network (UpCloud account-wide free network)
  network_interface {
    type = "utility"
  }
}

# Firewall rules for the server
resource "upcloud_firewall_rules" "paperclip" {
  server_id = upcloud_server.paperclip.id

  # SSH
  firewall_rule {
    action                 = "accept"
    comment                = "Allow SSH"
    destination_port_end   = "22"
    destination_port_start = "22"
    direction              = "in"
    family                 = "IPv4"
    protocol               = "tcp"
    source_address_start   = "0.0.0.0"
    source_address_end     = "255.255.255.255"
  }

  # HTTP
  firewall_rule {
    action                 = "accept"
    comment                = "Allow HTTP"
    destination_port_end   = "80"
    destination_port_start = "80"
    direction              = "in"
    family                 = "IPv4"
    protocol               = "tcp"
    source_address_start   = "0.0.0.0"
    source_address_end     = "255.255.255.255"
  }

  # HTTPS
  firewall_rule {
    action                 = "accept"
    comment                = "Allow HTTPS"
    destination_port_end   = "443"
    destination_port_start = "443"
    direction              = "in"
    family                 = "IPv4"
    protocol               = "tcp"
    source_address_start   = "0.0.0.0"
    source_address_end     = "255.255.255.255"
  }

  # Deny all other incoming traffic (default rule, must be last)
  firewall_rule {
    action    = "drop"
    comment   = "Drop all other incoming IPv4"
    direction = "in"
    family    = "IPv4"
  }
}

output "server_id" {
  description = "Server instance ID"
  value       = upcloud_server.paperclip.id
}

output "server_public_ip" {
  description = "Server public IP"
  value       = upcloud_server.paperclip.network_interface[0].ip_address
}

output "server_private_ip" {
  description = "Server private (utility network) IP"
  value       = try(
    [for ni in upcloud_server.paperclip.network_interface : ni.ip_address if ni.type == "utility"][0],
    null
  )
}

output "server_hostname" {
  description = "Server hostname"
  value       = upcloud_server.paperclip.hostname
}

output "server_plan" {
  description = "Server plan"
  value       = upcloud_server.paperclip.plan
}

output "server_uuid" {
  description = "Server UUID for import/reference"
  value       = upcloud_server.paperclip.id
}
