'use strict';

import _ from 'lodash';
import mongoose from 'mongoose';

let userSchema = new mongoose.Schema({
  
  name: {
    first: { type: String, default: '' },
    last: { type: String, default: '' }
  },
  
  email: {
    email: { type: String, default: '', unique: true, lowercase: true, trim: true },
    verified: { type: Boolean, default: false },
    verifyCode: { type: String },
    verifySentAt: { type: Date },
    verifyFailures: { type: Number, default: 0 }
  },
  
  local: {
    id: { type: String, unique: true, lowercase: true, trim: true }, // user's email
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
  
  toPublicObject: function() {
    return {
      name: { 
        first: this.name.first, 
        last: this.name.last
      },
      email: {
        email: this.email.email,
        verified: this.email.verified
      },
      local: {
        id: this.local.id
      },
      notifications: {
        viaEmail: this.notifications.viaEmail
      }
    }
  }

};

userSchema.index({ 'email.email': 1 }, { unique: true });
userSchema.index({ 'local.id': 1 }, { unique: true });

let User = mongoose.serviceDb.model('User', userSchema);

module.exports = User;
