import mongoose from "mongoose";
const { Schema } = mongoose;

const connectionSchema = new Schema({
  menteeId:{type:Schema.Types.ObjectId,ref:'mentee'},
  mentorId:{type:Schema.Types.ObjectId,ref:'mentor'},
  status: { type: String, enum: ['met', 'scheduled', 'applied', 'rejected'], required: true },
});

const connection = mongoose.model('connection', connectionSchema);

export default connection;