'use strict';

import _ from 'lodash';
import mongoose from 'mongoose';


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

  state: { type: String, default: 'done' }

})


documentSchema.statics = {
  constants: {
    states: {
      draft: 'draft',
      needSign: 'needSign',
      done: 'done'
    },
    types: {
      deed: 'deed',
      info: 'info',
      tax: 'tax',
      llcOperatingAgreement: 'llcOperatingAgreement'
    },
    roles: {
      fractionAdmin: 'fractionAdmin',
      admin: 'admin',
      signer: 'signer',
      auditor: 'auditor',
      uploader: 'uploader'
    },
    descriptions: {
      deed: 'this is a sample description for a DEED doc',
      info: 'this is a sample description for an INFO doc',
      tax: 'this is a sample description for a doc',
      llcOperatingAgreement: 'this is a sample description for a doc'
    } 
  }
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
