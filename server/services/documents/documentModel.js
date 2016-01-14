'use strict';

import _ from 'lodash';
import mongoose from 'mongoose';


let documentSchema = new mongoose.Schema({
  
  type: { type: String, default: '' },

  dateUploaded: { type: Date },

  dateModified: { type: Date },

  entities: {
    uploader: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    property: { type: mongoose.Schema.Types.ObjectId, ref: 'Property' },
    users: [{
      id: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
      permissions: { type: String, default: 'read' },   // read, write
      signature: {
        needed: { type: Boolean, required: true },
        signed: { type: Boolean },
        dateSigned: { type: Date },
      }
    }],
  },
  
  description: { type: String },

  state: { type: String, default: 'done' } // draft, needSign, done 

});


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
