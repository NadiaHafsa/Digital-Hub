// server.js
require('dotenv').config();
const express = require('express');
const path = require('path');
const bodyParser = require('body-parser');
const Stripe = require('stripe');
const fs = require('fs');

const app = express();
const stripe = Stripe(process.env.STRIPE_SECRET_KEY);
const DOMAIN = process.env.DOMAIN || 'http://localhost:4242';

// Simple in-memory map: sessionId -> allowed filenames
const paidSessions = new Map();

console.log("Stripe Key Loaded:", !!process.env.STRIPE_SECRET_KEY);


app.use(bodyParser.json());
app.use(express.static('public'));

// Products catalog (id, name, price in INR cents or USD cents depending on Stripe account)
const PRODUCTS = [
  {
    id: 'template-pack',
    name: 'Instagram Template Bundle',
    price_cents: 999, // ₹9.99 if using USD account treat accordingly
    filename: 'template-pack.zip'
  },
  {
    id: 'guide-pdf',
    name: 'Business Growth Guide (PDF)',
    price_cents: 499,
    filename: 'guide.pdf'
  },
  {
    id: 'photo-bundle',
    name: 'Lifestyle Stock Photo Bundle',
    price_cents: 1299,
    filename: 'photo-bundle.zip'
  }
];

// Helper to find product
function findProduct(id) {
  return PRODUCTS.find(p => p.id === id);
}

// Create Checkout Session
app.post('/create-checkout-session', async (req, res) => {
  try {
    const { items } = req.body; // items: [{id, quantity}]
    if (!items || items.length === 0) return res.status(400).json({ error: 'Cart is empty' });

    // Build line items
    const line_items = items.map(item => {
      const p = findProduct(item.id);
      if (!p) throw new Error('Product not found: ' + item.id);
      return {
        price_data: {
          currency: 'usd', // change to 'inr' if your Stripe account supports INR
          product_data: { name: p.name },
          unit_amount: p.price_cents
        },
        quantity: item.quantity || 1
      };
    });

    // Put product ids in metadata to later provision downloads
    const metadata = { product_ids: items.map(i => i.id).join(',') };

    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items,
      mode: 'payment',
      success_url: `${DOMAIN}/success.html?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${DOMAIN}/product.html`,
      metadata
    });

    res.json({ url: session.url });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
});

// Verify session and register allowed downloads
app.get('/verify-session', async (req, res) => {
  try {
    const { session_id } = req.query;
    if (!session_id) return res.status(400).json({ error: 'Missing session_id' });

    const session = await stripe.checkout.sessions.retrieve(session_id);
    if (!session || session.payment_status !== 'paid') {
      return res.status(402).json({ error: 'Payment not found or not completed' });
    }

    // read product_ids (we stored at creation)
    const product_ids = (session.metadata && session.metadata.product_ids) ? session.metadata.product_ids.split(',') : [];

    // Map product ids to filenames
    const files = product_ids.map(id => {
      const p = findProduct(id);
      return p ? p.filename : null;
    }).filter(Boolean);

    // Register session -> files (valid for this runtime)
    paidSessions.set(session_id, files);

    res.json({ files });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
});

// Serve downloads only if session is paid and authorized
app.get('/download', (req, res) => {
  try {
    const { session_id, file } = req.query;
    if (!session_id || !file) return res.status(400).send('Missing parameters');

    const allowedFiles = paidSessions.get(session_id);
    if (!allowedFiles || !allowedFiles.includes(file)) {
      return res.status(403).send('Not authorized to download this file');
    }

    const filePath = path.join(__dirname, 'downloads', file);
    if (!fs.existsSync(filePath)) {
      return res.status(404).send('File not found');
    }

    res.download(filePath, file);
  } catch (err) {
    console.error(err);
    res.status(500).send('Server error');
  }
});

const PORT = process.env.PORT || 4242;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
