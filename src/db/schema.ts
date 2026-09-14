import { pgTable, serial, text, boolean, integer, timestamp } from 'drizzle-orm/pg-core'

export const calculatorCategories = pgTable('calculator_categories', {
  id: serial('id').primaryKey(),
  name: text('name').notNull(),
  slug: text('slug').notNull().unique(),
  description: text('description'),
  icon: text('icon'),
  sortOrder: integer('sort_order').default(0),
})

export const calculators = pgTable('calculators', {
  id: serial('id').primaryKey(),
  categoryId: integer('category_id').references(() => calculatorCategories.id),
  name: text('name').notNull(),
  slug: text('slug').notNull().unique(),
  description: text('description'),
  isPremium: boolean('is_premium').default(false),
  isActive: boolean('is_active').default(true),
})

export const subscriptionPlans = pgTable('subscription_plans', {
  id: serial('id').primaryKey(),
  name: text('name').notNull(),
  slug: text('slug').notNull().unique(),
  priceMonthly: integer('price_monthly').notNull(),
  priceYearly: integer('price_yearly'),
  tier: text('tier').notNull(),
  features: text('features'),
})
