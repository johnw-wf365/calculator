# PostgreSQL Backend Configuration
# Uses existing PostgreSQL 17 instance for state storage (zero cost)
# State locking is built-in via PostgreSQL advisory locks

# Note: The actual connection string is passed via -backend-config
# or environment variable TF_VAR_backend_conn_str
# Example:
#   terraform init -backend-config="conn_str=postgres://user:***@host:5432/dbname?sslmode=disable"

# Connection string format:
#   postgres://paperclip:***@<host>:5432/terraform_state?sslmode=disable
#
# For local development (via SSH tunnel or direct Docker access):
#   postgres://paperclip:***@localhost:5432/terraform_state?sslmode=disable
#
# For CI/CD (GitHub Actions), set TF_BACKEND_CONN_STR secret to:
#   postgres://paperclip:***@<host>:5432/terraform_state?sslmode=disable
