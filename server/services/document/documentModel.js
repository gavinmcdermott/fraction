'use strict';

import _ from 'lodash';
import mongoose from 'mongoose';

const STATES = {
  DRAFT: 'draft',
  NEED_SIGN: 'needSign',
  DONE: 'done'
}

const TYPES = {
  DEED: 'deed',
  INFO: 'info',
  TAX: 'tax',
  LLC_OPERATING_AGREEMENT: 'llcOperatingAgreement'
}

const ROLES = {
  FRACTION_ADMIN: 'fractionAdmin',
  ADMIN: 'admin',
  SIGNER: 'signer',
  AUDITOR: 'auditor',
  UPLOADER: 'uploader'
}


let documentSchema = new mongoose.Schema({
  
  type: { type: String, default: '' },

  dateUploaded: { type: Date },

  dateModified: { type: Date },

  document: { type: String, required: true },

  entities: {
    property: { type: mongoose.Schema.Types.ObjectId, ref: 'Property' },
    users: [{
      id: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
      role: { type: String },
      signature: {
        signed: { type: Boolean },
        dateSigned: { type: Date }
      }
    }]
  },
  
  description: { type: String },

  state: { type: String, default: STATES.DONE } // draft, needSign, done 

});



documentSchema.statics.getRoles = () => {
  return ROLES
}


documentSchema.statics.hasType = (type) => {
  let constantType = _.snakeCase(type).toUpperCase()
  return _.has(TYPES, constantType)
}

documentSchema.methods = {

  toPublicObject: () => {
    return {
      type: this.type,
      dateUploaded: this.dateUploaded,
      dateModified: this.dateModified,
      entities: this.entities,
      description: this.description,
      state: this.state
    }
  }

};

documentSchema.index({ 'entities.property': 1 });


let Document = mongoose.serviceDb.model('Document', documentSchema);

module.exports = Document;
