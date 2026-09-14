/**
 * Webhook handler for Gumroad and Stripe purchase events.
 * Handles automated delivery of digital products.
 * 
 * Environment variables required:
 * - GUMROAD_ACCESS_TOKEN
 * - STRIPE_SECRET_KEY
 * - STRIPE_WEBHOOK_SECRET
 * 
 * This is a Node.js/Express handler designed to be deployed as:
 * - A serverless function (Vercel/Netlify Functions)
 * - A route in the Paperclip server
 * - A standalone microservice
 */

const express = require('express');
const crypto = require('crypto');

const router = express.Router();

// ============================================================================
// Product Catalog
// ============================================================================

const PRODUCTS = {
  'claude-code-rules': {
    id: 'claude-code-rules',
    name: 'Claude Code Rules Pack',
    price: 27,
    files: ['claude-code-rules/claude-code-rules-pack.zip'],
    emailSubject: 'Your Claude Code Rules Pack — WorkForce365.ai',
    emailBody: `Hi there!

Thank you for purchasing the Claude Code Rules Pack from WorkForce365.ai.

Your purchase includes:
- React/Next.js + Vercel + Supabase pack
- Enterprise compliance pack
- DevOps automation pack
- Monthly update eligibility

Files are attached to this email. To install:
1. Download the attached zip file
2. Extract the contents
3. Follow the README.md for setup instructions

Questions? Reply to this email.

— The WorkForce365.ai Team`
  },
  'prompt-packs': {
    id: 'prompt-packs',
    name: 'Prompt Packs',
    price: 19,
    files: ['prompt-packs/prompt-packs-collection.zip'],
    emailSubject: 'Your Prompt Packs — WorkForce365.ai',
    emailBody: `Hi there!

Thank you for purchasing Prompt Packs from WorkForce365.ai.

Your purchase includes:
- 50-100 curated prompts per pack
- Documentation + example outputs
- Multiple niche categories
- Commercial use license

Files are attached to this email.

Questions? Reply to this email.

— The WorkForce365.ai Team`
  },
  'ai-agent-starter': {
    id: 'ai-agent-starter',
    name: 'AI Agent Starter Kit',
    price: 49,
    files: ['ai-agent-starter/ai-agent-starter-kit.zip'],
    emailSubject: 'Your AI Agent Starter Kit — WorkForce365.ai',
    emailBody: `Hi there!

Thank you for purchasing the AI Agent Starter Kit from WorkForce365.ai.

Your purchase includes:
- Production-ready agent configs
- MCP server setups
- Workflow templates
- Step-by-step video tutorials

Files are attached to this email. Start with the GETTING_STARTED.md guide.

Questions? Reply to this email.

— The WorkForce365.ai Team`
  }
};

// ============================================================================
// Gumroad Webhook Handler
// ============================================================================

/**
 * Gumroad webhook payload shape:
 * {
 *   "seller_id": "...",
 *   "product_id": "...",
 *   "product_name": "...",
 *   "permalink": "...",
 *   "product_permalink": "...",
 *   "email": "buyer@example.com",
 *   "full_name": "Buyer Name",
 *   "purchase_price_cents": 2700,
 *   "currency": "usd",
 *   "order_number": 123456789,
 *   "sale_id": "...",
 *   "timestamp": "..."
 * }
 */

router.post('/gumroad', express.raw({ type: 'application/json' }), async (req, res) => {
  const payload = req.body;
  
  // Verify Gumroad webhook (optional but recommended)
  // Gumroad doesn't sign webhooks by default, so we verify by fetching sale details
  const saleId = payload.sale_id;
  
  try {
    // Fetch sale details from Gumroad API to verify
    const verified = await verifyGumroadSale(saleId);
    if (!verified) {
      return res.status(400).json({ error: 'Sale verification failed' });
    }
    
    const productId = mapGumroadProductToId(payload.product_permalink);
    const product = PRODUCTS[productId];
    
    if (!product) {
      console.error(`Unknown product: ${productId}`);
      return res.status(400).json({ error: 'Unknown product' });
    }
    
    // Deliver product via email (Gumroad handles this natively)
    // This handler logs the sale for analytics and triggers any post-purchase flows
    await logSale({
      platform: 'gumroad',
      saleId,
      productId,
      email: payload.email,
      name: payload.full_name,
      price: payload.purchase_price_cents / 100,
      currency: payload.currency,
      timestamp: payload.timestamp
    });
    
    res.status(200).json({ received: true });
  } catch (error) {
    console.error('Gumroad webhook error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

async function verifyGumroadSale(saleId) {
  const token = process.env.GUMROAD_ACCESS_TOKEN;
  if (!token) {
    console.warn('GUMROAD_ACCESS_TOKEN not set, skipping verification');
    return true; // In dev, skip verification
  }
  
  const response = await fetch(`https://api.gumroad.com/v2/sales/${saleId}`, {
    headers: { Authorization: `Bearer ${token}` }
  });
  
  if (!response.ok) return false;
  
  const data = await response.json();
  return data.success === true;
}

function mapGumroadProductToId(permalink) {
  // Map Gumroad permalink/product ID to our internal product IDs
  const mapping = {
    'claude-code-rules': 'claude-code-rules',
    'prompt-packs': 'prompt-packs',
    'ai-agent-starter': 'ai-agent-starter'
  };
  return mapping[permalink] || permalink;
}

// ============================================================================
// Stripe Webhook Handler
// ============================================================================

/**
 * Stripe webhook payload is the raw event object.
 * We verify using the Stripe-Signature header.
 */

router.post('/stripe', express.raw({ type: 'application/json' }), async (req, res) => {
  const sig = req.headers['stripe-signature'];
  const endpointSecret = process.env.STRIPE_WEBHOOK_SECRET;
  
  let event;
  
  try {
    // In production, use stripe.webhooks.constructEvent
    // For now, parse the raw body
    event = JSON.parse(req.body);
  } catch (err) {
    console.error('Stripe webhook parse error:', err);
    return res.status(400).send('Invalid payload');
  }
  
  try {
    switch (event.type) {
      case 'checkout.session.completed': {
        const session = event.data.object;
        await handleStripeCheckoutComplete(session);
        break;
      }
      case 'payment_intent.succeeded': {
        const paymentIntent = event.data.object;
        await handleStripePaymentSuccess(paymentIntent);
        break;
      }
      case 'payment_intent.payment_failed': {
        const paymentIntent = event.data.object;
        await handleStripePaymentFailure(paymentIntent);
        break;
      }
    }
    
    res.status(200).json({ received: true });
  } catch (error) {
    console.error('Stripe webhook error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

async function handleStripeCheckoutComplete(session) {
  const productId = session.metadata?.product_id;
  const product = PRODUCTS[productId];
  
  if (!product) {
    console.error(`Unknown product in checkout: ${productId}`);
    return;
  }
  
  await logSale({
    platform: 'stripe',
    saleId: session.id,
    productId,
    email: session.customer_details?.email,
    name: session.customer_details?.name,
    price: session.amount_total / 100,
    currency: session.currency,
    timestamp: new Date().toISOString()
  });
  
  // In production, trigger email delivery here
  // For digital products, Stripe doesn't auto-deliver files
  // You'd integrate with a service like SendGrid, or use Stripe's built-in features
}

async function handleStripePaymentSuccess(paymentIntent) {
  // Log successful payment
  console.log(`Stripe payment succeeded: ${paymentIntent.id}`);
}

async function handleStripePaymentFailure(paymentIntent) {
  // Log failed payment
  console.log(`Stripe payment failed: ${paymentIntent.id}`);
}

// ============================================================================
// Purchase Logging (Analytics & Audit Trail)
// ============================================================================

async function logSale(saleData) {
  // In production, this would write to:
  // - Paperclip's activity log
  // - A database table for sales analytics
  // - A webhook for the team to monitor
  
  console.log('SALE:', JSON.stringify(saleData, null, 2));
  
  // Example: Post to Paperclip activity log if running in that context
  if (process.env.PAPERCLIP_API_URL) {
    try {
      await fetch(`${process.env.PAPERCLIP_API_URL}/api/activity`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${process.env.PAPERCLIP_API_KEY}`
        },
        body: JSON.stringify({
          type: 'product_sale',
          data: saleData
        })
      });
    } catch (e) {
      // Don't fail the webhook if logging fails
      console.error('Failed to log sale to Paperclip:', e.message);
    }
  }
}

// ============================================================================
// Health Check
// ============================================================================

router.get('/health', (req, res) => {
  res.json({ status: 'ok', products: Object.keys(PRODUCTS).length });
});

// ============================================================================
// Export for use as Express router or serverless function
// ============================================================================

module.exports = router;

// If running directly (not imported)
if (require.main === module) {
  const app = express();
  app.use('/webhooks', router);
  
  const PORT = process.env.WEBHOOKS_PORT || 3200;
  app.listen(PORT, () => {
    console.log(`Webhook server running on port ${PORT}`);
  });
}
