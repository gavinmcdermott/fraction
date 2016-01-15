'use strict';

import _ from 'lodash';
import mongoose from 'mongoose';


// Add these to the model itself!
// Add these to the model itself!
const STATES = {
  draft: 'draft',
  needSign: 'needSign',
  done: 'done'
}

const TYPES = {
  deed: 'deed',
  info: 'info',
  tax: 'tax',
  llcOperatingAgreement: 'llcOperatingAgreement'
}

const ROLES = {
  fractionAdmin: 'fractionAdmin',
  admin: 'admin',
  signer: 'signer',
  auditor: 'auditor',
  uploader: 'uploader'
}

const DESCRIPTIONS = {
  deed: 'this is a sample description for a DEED doc',
  info: 'this is a sample description for an INFO doc',
  tax: 'this is a sample description for a doc',
  llcOperatingAgreement: 'this is a sample description for a doc'
}



let documentSchema = new mongoose.Schema({
  
  type: { type: String, default: '' },

  dateUploaded: { type: Date },

  dateModified: { type: Date },

  document: { type: String, required: true },

  users: [{
    id: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    role: { type: String },
    signature: {
      signed: { type: Boolean, default: false },
      dateSigned: { type: Date }
    }
  }],
  
  description: { type: String },

  state: { type: String, default: STATES.done }

})



documentSchema.statics.getDescriptions = () => {
  return DESCRIPTIONS
}

documentSchema.statics.getRoles = () => {
  return ROLES
}

documentSchema.statics.hasType = (type) => {
  return _.has(TYPES, type)
}

documentSchema.methods = {

  toPublicObject: function() {
    return {
      type: this.type,
      dateUploaded: this.dateUploaded,
      dateModified: this.dateModified,
      entities: this.entities,
      description: this.description,
      document: this.document,
      state: this.state
    }
  }

}

documentSchema.index({ 'entities.property': 1 })


let Document = mongoose.serviceDb.model('Document', documentSchema)

module.exports = Document
