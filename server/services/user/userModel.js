'use strict';

import _ from 'lodash';
import mongoose from 'mongoose';

let userSchema = new mongoose.Schema({
  
  name: {
    first: { type: String, default: '' },
    last: { type: String, default: '' },
    full: { type: String, default: '' }
  },
  
  email: {
    email: { type: String, default: '' },
    verified: { type: Boolean, default: false },
    verifyCode: { type: String },
    verifySentAt: { type: Date },
    verifyFailures: { type: Number, default: 0 }
  },
  
  local: {
    id: { type: String }, // user's email
    password: { type: String },
    verifyCode: { type: String },
    verifySentAt: { type: Date }
  },

  isActive: Boolean,
  
  fractionEmployee: Boolean,
  
  lastLogin: { type: Date },

  notifications: {
    // How to receive notifications
    viaEmail: { type: Boolean, default: true }
    // Other means of communications?
  }
});


userSchema.methods = {

};

userSchema.index({ 'email.email': 1 }, { unique: true });
userSchema.index({ 'local.id': 1 }, { unique: true });

let User = mongoose.serviceDb.model('User', userSchema);

module.exports = User;
