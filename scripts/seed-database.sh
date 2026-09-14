#!/bin/bash
set -euo pipefail

# Database seeding script for calculator platform
# Usage: scripts/seed-database.sh [dev|staging|production]

ENVIRONMENT=${1:-dev}
SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
SEED_FILE="${SCRIPT_DIR}/../db/seed.sql"

if [ ! -f "$SEED_FILE" ]; then
    echo "Warning: Seed file not found at $SEED_FILE"
    echo "Creating basic seed data..."
    mkdir -p "${SCRIPT_DIR}/../db"
    cat > "$SEED_FILE" << 'SQL'
-- Calculator Platform Seed Data
-- Initial seed data for all environments

-- Insert default calculator categories
INSERT INTO calculator_categories (name, slug, description, icon, sort_order) VALUES
    ('Tax', 'tax', 'Income tax calculators for US and UK', 'calculator', 1),
    ('Mortgage', 'mortgage', 'Mortgage and loan calculators', 'home', 2),
    ('Health', 'health', 'BMI and health calculators', 'heart', 3),
    ('Finance', 'finance', 'General finance calculators', 'dollar', 4),
    ('Math', 'math', 'Basic math calculators', 'function', 5),
    ('Date', 'date', 'Date and time calculators', 'calendar', 6)
ON CONFLICT (slug) DO NOTHING;

-- Insert default calculators
INSERT INTO calculators (category_id, name, slug, description, is_premium, is_active)
SELECT c.id, v.name, v.slug, v.description, v.is_premium, true
FROM (VALUES
    ('US Income Tax Calculator', 'us-income-tax', 'Calculate your US federal income tax', false),
    ('UK Income Tax Calculator', 'uk-income-tax', 'Calculate your UK income tax and NI', false),
    ('Mortgage Calculator', 'mortgage', 'Calculate monthly mortgage payments', false),
    ('BMI Calculator', 'bmi', 'Calculate your Body Mass Index', false),
    ('Loan Calculator', 'loan', 'Calculate loan payments and interest', false),
    ('Percentage Calculator', 'percentage', 'Calculate percentages and percentage change', false),
    ('Salary Calculator', 'salary', 'Convert and compare salary amounts', false),
    ('Retirement Calculator', 'retirement', 'Plan and calculate retirement savings', false),
    ('Currency Converter', 'currency', 'Convert between world currencies', false),
    ('Tip Calculator', 'tip', 'Calculate tips and split bills', false),
    ('Age Calculator', 'age', 'Calculate age between dates', false)
) AS v(name, slug, description, is_premium)
JOIN calculator_categories c ON c.slug = 'tax'
ON CONFLICT (slug) DO NOTHING;

-- Insert subscription plans
INSERT INTO subscription_plans (name, slug, price_monthly, price_yearly, tier, features) VALUES
    ('Free', 'free', 0, 0, 'free', '["3 calculations/day","Basic calculators"]'),
    ('Registered', 'registered', 0, 0, 'registered', '["10 calculations/month","Email support","Save calculations"]'),
    ('Premium', 'premium', 4.99, 49.99, 'premium', '["Unlimited calculations","Ad-free","Priority support","Advanced features"]')
ON CONFLICT (slug) DO NOTHING;
SQL
    echo "Created seed file: $SEED_FILE"
fi

case "$ENVIRONMENT" in
    dev)
        DB_URL="${DATABASE_URL:-postgresql://calculator:password@localhost:5432/calculator_dev}"
        ;;
    staging)
        DB_URL="${STAGING_DATABASE_URL:?STAGING_DATABASE_URL not set}"
        ;;
    production)
        DB_URL="${PRODUCTION_DATABASE_URL:?PRODUCTION_DATABASE_URL not set}"
        ;;
    *)
        echo "Unknown environment: $ENVIRONMENT"
        exit 1
        ;;
esac

echo "Seeding $ENVIRONMENT database..."

# Push schema first
echo "Pushing schema..."
cd "${SCRIPT_DIR}/.."
if command -v pnpm &> /dev/null; then
    pnpm exec drizzle-kit push:pg
else
    npx drizzle-kit push:pg
fi

# Run seed data
echo "Inserting seed data..."
psql "$DB_URL" --file="$SEED_FILE"

echo "Database seeding completed for $ENVIRONMENT"
