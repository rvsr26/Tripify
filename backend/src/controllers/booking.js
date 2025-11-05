import Booking from '../models/Booking.js';
import Stripe from 'stripe';
const stripe = new Stripe(process.env.STRIPE_SECRET || '', { apiVersion: '2022-11-15' });

export async function createBooking(req, res){
  try {
    const { mode, legs, price } = req.body;
    const userId = req.userId;
    const booking = await Booking.create({ userId, mode, legs, price, status:'pending' });
    const session = await stripe.checkout.sessions.create({
      payment_method_types:['card'],
      mode:'payment',
      line_items:[{
        price_data:{currency:'usd', product_data:{name:`${mode} booking`}, unit_amount: Math.round((price||1)*100)},
        quantity:1
      }],
      success_url:`${process.env.FRONTEND_URL}/payment-success?booking=${booking._id}`,
      cancel_url:`${process.env.FRONTEND_URL}/payment-cancel?booking=${booking._id}`,
      metadata: { bookingId: booking._id.toString() }
    });
    // Save session id to booking.providerRef for demo
    booking.providerRef = session.id;
    await booking.save();
    res.json({ url: session.url, sessionId: session.id });
  } catch(e){ console.error(e); res.status(500).json({error:e.message}); }
}

export async function getBooking(req, res){
  const id = req.params.id;
  const b = await Booking.findById(id);
  if(!b) return res.status(404).json({error:'not found'});
  res.json({ booking: b });
}
