import mongoose from 'mongoose';
const Schema = new mongoose.Schema({
  name: String,
  vehicleType: {type:String, enum:['auto','bike']},
  location: {lat:Number, lng:Number},
  status: {type:String, enum:['available','ontrip'], default:'available'},
  createdAt: {type:Date, default:Date.now}
});
export default mongoose.model('Driver', Schema);
