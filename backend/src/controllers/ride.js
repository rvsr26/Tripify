import { v4 as uuidv4 } from 'uuid';
import Driver from '../models/Driver.js';
import Booking from '../models/Booking.js';

// For enterprise we simulate driver assignment and emit via socket
export async function requestRide(req, res){
  const { pickup, dropoff, vehicle='auto' } = req.body;
  // find nearest available driver (simple)
  const driver = await Driver.findOne({ vehicleType: vehicle, status: 'available' });
  if(!driver){
    return res.status(503).json({error:'no drivers'});
  }
  driver.status = 'ontrip';
  await driver.save();
  const booking = await Booking.create({ userId: req.userId, mode: vehicle, legs:[{pickup,dropoff}], price: Math.random()*3 + 1, status:'confirmed', providerRef: driver._id.toString() });
  // In a real app we'd push socket update. For now return booking and driver stub
  res.json({ booking, driver });
}

export async function getRide(req, res){
  const id = req.params.id;
  const b = await Booking.findById(id);
  if(!b) return res.status(404).json({error:'not found'});
  res.json({ booking: b });
}

// Build verification patch on 11/24/2025, 9:33:00 AM

// Build verification patch on 11/25/2025, 12:33:00 PM
