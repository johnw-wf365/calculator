# Networking Module
# Manages UpCloud networking resources
#
# Current production networking:
#   Public:    5.22.209.180/22 on eth0 (UpCloud public network)
#   Private:   10.5.18.28/22 on eth1 (UpCloud utility network)
#   Gateway:   5.22.208.1 (public), 10.5.16.1 (utility)
#
# UpCloud provides a free account-wide "utility" network that is automatically
# connected to all servers in the account. Additional private SDN networks
# can be created for isolation (free of charge).

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

variable "network_cidr" {
  type        = string
  description = "CIDR block for the private network"
  default     = "10.10.0.0/24"
}

variable "router_enabled" {
  type        = bool
  description = "Enable router for network NAT/routing"
  default     = false
}

variable "create_private_network" {
  type        = bool
  description = "Create an additional private SDN network (uses UpCloud utility network if false)"
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

# Additional private SDN network (optional)
# UpCloud utility network is used by default (free, account-wide).
# This resource creates an extra isolated network when needed.
resource "upcloud_network" "paperclip_net" {
  count = var.create_private_network ? 1 : 0

  name   = "paperclip-${var.environment}-net"
  zone   = var.region
  router = var.router_enabled ? upcloud_router.paperclip_router[0].id : null

  ip_network {
    address            = var.network_cidr
    dhcp               = true
    dhcp_default_route = false
    dhcp_dns           = ["1.1.1.1", "8.8.8.8"]
    family             = "IPv4"
    gateway            = cidrhost(var.network_cidr, 1)
  }
}

# Router for NAT/egress (optional)
resource "upcloud_router" "paperclip_router" {
  count = var.router_enabled ? 1 : 0
  name  = "paperclip-${var.environment}-router"
}

output "network_id" {
  description = "Network ID (empty if using UpCloud utility network)"
  value       = var.create_private_network ? upcloud_network.paperclip_net[0].id : null
}

output "network_name" {
  description = "Network name"
  value       = var.create_private_network ? upcloud_network.paperclip_net[0].name : "upcloud-utility-network"
}

output "network_cidr" {
  description = "Network CIDR block"
  value       = var.create_private_network ? var.network_cidr : "upcloud-utility"
}

output "router_id" {
  description = "Router ID (if enabled)"
  value       = var.router_enabled ? upcloud_router.paperclip_router[0].id : null
}

output "gateway_ip" {
  description = "Gateway IP address"
  value       = var.create_private_network ? cidrhost(var.network_cidr, 1) : null
}

output "utility_network_note" {
  description = "Note about utility network usage"
  value       = "Using UpCloud account-wide utility network (free). Set create_private_network=true for isolated SDN."
}
