import mongoose from "mongoose";
const { Schema } = mongoose;

const menteeSchema = new Schema({
  name: { type: String, required: true },
  affiliation: { type: String, required: true },
  phoneNumber: { type: String, required: true },
  emailAddress: { type: String, required: true, unique: true },
  gender: { type: String, enum: ['Male', 'Female', 'Prefer not to say', 'Other'], required: true },
  phdRegistration: { type: String, enum: ['Full-time', 'Part-time', 'Sponsored', 'N/A'], required: true },
  password: { type: String, required: true },
  acmMembership: { type: Boolean, default: false },
  socialHandles: {
    instagram: { type: String },
    linkedin: { type: String },
    facebook: { type: String }
  },
  researchProblem: { type: String },
  feedback: { type: String},
  connections:[{type:Schema.Types.ObjectId,ref:'Connection'}]
});

const mentee = mongoose.model('mentee', menteeSchema);

export default mentee;
