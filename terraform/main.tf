# UpCloud Provider Configuration for Calculator Platform
# Requires: UpCloud API credentials in env or terraform.tfvars

terraform {
  required_version = ">= 1.5.0"

  required_providers {
    upcloud = {
      source  = "UpCloudLtd/upcloud"
      version = "~> 5.0"
    }
  }

  # State storage — S3-compatible (UpCloud Object Storage or similar)
  backend "s3" {
    bucket   = "wf365-terraform-state"
    key      = "calculator/terraform.tfstate"
    region   = "us-east-1"
    endpoint = "# TODO: Set endpoint"

    skip_credentials_validation = true
    skip_metadata_api_check     = true
    skip_region_validation      = true
    force_path_style            = true
  }
}

provider "upcloud" {
  # Credentials from environment:
  # UPCLOUD_USERNAME
  # UPCLOUD_PASSWORD
}

# Variables
variable "prefix" {
  description = "Resource prefix"
  type        = string
  default     = "calc"
}

variable "domain" {
  description = "Primary domain"
  type        = string
  default     = "example.com" # TODO: Update
}

variable "staging_domain" {
  description = "Staging subdomain"
  type        = string
  default     = "dev.example.com"
}

variable "environment" {
  description = "Environment tag"
  type        = string
  default     = "production"
}

variable "ssh_public_key" {
  description = "SSH public key for server access"
  type        = string
  sensitive   = true
}

# Zones — closest to target markets (US/UK first)
variable "server_zone" {
  description = "UpCloud zone"
  type        = string
  default     = "us-chi1" # Chicago for US East Coast proximity
}

# Common tags
locals {
  common_tags = {
    project     = "calculator"
    environment = var.environment
    managed_by  = "terraform"
  }
}

# ============================================================
# NETWORKING
# ============================================================

resource "upcloud_network" "calc_network" {
  name = "${var.prefix}-net-${var.environment}"
  zone = var.server_zone

  ip_network {
    address = "10.0.0.0/24"
    family  = "IPv4"
    dhcp    = true
  }

  tags = local.common_tags
}

resource "upcloud_firewall_rules" "calc_firewall" {
  server_group_id = null

  # SSH — restricted to known IPs if possible
  rule {
    action                 = "accept"
    comment                = "SSH"
    destination_port_start = "22"
    destination_port_end   = "22"
    family                 = "IPv4"
    protocol               = "tcp"
    source_address_start   = "0.0.0.0/0"
    source_address_end     = "255.255.255.255"
    direction              = "in"
    position               = 1
  }

  # HTTP
  rule {
    action                 = "accept"
    comment                = "HTTP"
    destination_port_start = "80"
    destination_port_end   = "80"
    family                 = "IPv4"
    protocol               = "tcp"
    source_address_start   = "0.0.0.0/0"
    source_address_end     = "255.255.255.255"
    direction              = "in"
    position               = 2
  }

  # HTTPS
  rule {
    action                 = "accept"
    comment                = "HTTPS"
    destination_port_start = "443"
    destination_port_end   = "443"
    family                 = "IPv4"
    protocol               = "tcp"
    source_address_start   = "0.0.0.0/0"
    source_address_end     = "255.255.255.255"
    direction              = "in"
    position               = 3
  }

  # Default deny
  rule {
    action   = "drop"
    comment  = "Drop all other inbound"
    family   = "IPv4"
    protocol = "tcp"
    direction = "in"
    position = 4
  }
}

# ============================================================
# SERVERS
# ============================================================

resource "upcloud_server" "calc_production" {
  hostname = "${var.prefix}-prod-${var.environment}"
  zone     = var.server_zone
  plan     = "2xCPU-4GB" # ~£18/mo

  template {
    size    = 50 # GB
    storage = "Ubuntu Server 24.04 LTS (Noble Numbat)"
  }

  network_interface {
    type = "public"
  }

  network_interface {
    type = "private"
    network = upcloud_network.calc_network.id
  }

  login {
    user = "deploy"
    keys = [var.ssh_public_key]
    create_password = false
  }

  user_data = base64encode(templatefile("${path.module}/cloud-init.yml", {
    environment = var.environment"
    hostname    = "${var.prefix}-prod"
  }))

  tags = local.common_tags
}

# ============================================================
# DATABASE (PostgreSQL)
# ============================================================

# Self-hosted on the production server for cost savings
# Migrate to managed DB in Phase 2

resource "upcloud_storage" "db_storage" {
  size  = 25 # GB
  tier  = "maxiops"
  title = "${var.prefix}-db-${var.environment}"
  zone  = var.server_zone

  backup_rule {
    interval  = "daily"
    time      = "0400"
    retention = 7
  }

  tags = local.common_tags
}

# ============================================================
# DNS RECORDS (if managing DNS via UpCloud or external)
# ============================================================

# Cloudflare will handle DNS — records created manually or via Cloudflare provider
# These are references for the Cloudflare setup:

# A     @        → <server_public_ip>    (proxied via CF)
# A     www      → <server_public_ip>    (proxied via CF)
# A     dev      → <staging_public_ip>   (proxied via CF)
# CAA   @        → issue letsencrypt.org
# TXT   @        → v=spf1 ... (if email needed)

# ============================================================
# OUTPUTS
# ============================================================

output "production_server_ip" {
  description = "Public IP of production server"
  value       = upcloud_server.calc_production.network_interface[0].ip_address
}

output "private_network_id" {
  description = "Private network ID"
  value       = upcloud_network.calc_network.id
}

output "db_storage_id" {
  description = "Database storage ID"
  value       = upcloud_storage.db_storage.id
}
