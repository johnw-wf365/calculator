# Production Environment
# WorkForce365.ai - UpCloud Infrastructure
#
# Existing production server:
#   Hostname: paperclip-hermes-1
#   UUID:    00ba1bf8-0710-4dab-a2dd-0970d329978d
#   Public:  5.22.209.180
#   Private: 10.5.18.28 (utility network)
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

  backend "pg" {}
}

# UpCloud Provider Configuration
provider "upcloud" {
  # Credentials should be provided via environment variables:
  #   UPCLOUD_USERNAME
  #   UPCLOUD_PASSWORD
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

variable "ssh_public_key" {
  description = "SSH public key for server access"
  type        = string
  default     = ""
}

variable "server_hostname" {
  description = "Server hostname"
  type        = string
  default     = "paperclip-hermes-1"
}

variable "disk_size" {
  description = "Disk size in GB"
  type        = number
  default     = 50
}

module "networking" {
  source = "../../modules/networking"

  environment           = "prod"
  region                = var.region
  create_private_network = false  # Using UpCloud utility network (free)
  router_enabled        = false
}

module "compute" {
  source = "../../modules/compute"

  environment    = "prod"
  region         = var.region
  server_plan    = var.server_plan
  server_hostname = var.server_hostname
  disk_size      = var.disk_size
  ssh_public_key = var.ssh_public_key
}

module "dns" {
  source = "../../modules/dns"

  environment = "prod"
  server_ip   = module.compute.server_public_ip
  domain      = "workforce365.ai"
  subdomain   = "wf365"
}

module "database" {
  source = "../../modules/database"

  environment = "prod"
  server_id   = module.compute.server_id
}
