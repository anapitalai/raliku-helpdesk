const mongoose = require('mongoose')

const userVerificationSchema = mongoose.Schema(
  {
    userId: {
      type: String,
      type: String,
      unique: true,

    },
    uniqueString: {
      type: String,
      unique: true,
    },
    createdAt: {
      type: Date,
    },
    expiresAt: {
      type: Date,
    },
  }

)

module.exports = mongoose.model('UserVerification', userVerificationSchema)
