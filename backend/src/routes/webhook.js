import express from 'express';
const router = express.Router();
import rawBody from 'raw-body';
import Stripe from 'stripe';
const stripe = new Stripe(process.env.STRIPE_SECRET || '', { apiVersion: '2022-11-15' });
import Booking from '../models/Booking.js';

router.post('/stripe', express.raw({type: 'application/json'}), async (req, res) => {
  const sig = req.headers['stripe-signature'];
  let event;
  try {
    // If you set STRIPE_WEBHOOK_SECRET, verify signature here; skipping for demo.
    event = req.body;
  } catch (err) {
    console.error(err);
    return res.status(400).send(`Webhook Error: ${err.message}`);
  }
  if(event.type === 'checkout.session.completed'){
    const session = event.data.object;
    const bookingId = session.metadata?.bookingId;
    if(bookingId){
      await Booking.findByIdAndUpdate(bookingId, { status:'paid', providerRef: session.id });
      console.log('Booking marked paid', bookingId);
    }
  }
  res.json({received:true});
});

export default router;
