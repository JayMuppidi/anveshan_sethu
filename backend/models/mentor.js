import mongoose from "mongoose";
const { Schema } = mongoose;

const mentorSchema = new Schema({
  name: { type: String, required: true },
  affiliation: { type: String, required: true },
  emailAddress: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  researchInterests: { type: String, required: true },
  meetingLink:{type:String,required:true},
  socialHandles: {
    instagram: { type: String },
    linkedin: { type: String },
    facebook: { type: String }
  },
  connections:[{type:Schema.Types.ObjectId,ref:'Connection'}]
});

const mentor = mongoose.model('mentor', mentorSchema);

export default mentor;
