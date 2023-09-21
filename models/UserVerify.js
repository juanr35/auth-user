import { Schema } from "mongoose"

const userVerifySchema = new Schema({
  hash: String,
  createdAt: { 
    type: Date, 
    expires: 86400, 
    default: Date.now 
  },
  attempts: { type: Number, default: 3 },
})

export default userVerifySchema

/*
{ createdAt: { type: Date, expires: 3600, default: Date.now }}
*/