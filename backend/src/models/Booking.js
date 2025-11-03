import mongoose from 'mongoose';
const Schema = new mongoose.Schema({
  userId: {type: mongoose.Types.ObjectId, ref: 'User'},
  mode: {type:String, enum:['train','air','bus','auto','bike']},
  legs: {type:Array, default:[]},
  price: Number,
  status: {type:String, enum:['pending','paid','confirmed','cancelled'], default:'pending'},
  providerRef: String,
  createdAt: {type:Date, default:Date.now}
});
export default mongoose.model('Booking', Schema);
