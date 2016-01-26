'use strict'

import _ from 'lodash'
import mongoose from 'mongoose'


let investmentInterestSchema = new mongoose.Schema({
  type: { type: String, required: true },
  dateCanSell: { type: Date, required: true },
  total: { type: Number, required: true }
})

investmentInterestSchema.statics = {
  types: {
    freeTrade: 'freeTrade',
    restrictedTrade: 'restrictedTrade',
    newInvestment: 'newInvestment'
  }
}

let investmentSchema = new mongoose.Schema({
  propertyId: { type: mongoose.Schema.Types.ObjectId, ref: 'Property' },
  // ownerId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  total: { type: Number },
  interests: [ investmentInterestSchema ]
})

investmentSchema.statics = {}


investmentSchema.methods = {

  toPublicObject: function() {
    return {
      interests: this.interests,
      ownerId: this.ownerId,
      propertyId: this.propertyId,
      total: this.total
    }
  }

}

// investmentSchema.index({ 'entities.property': 1 })


module.exports.Investment = mongoose.serviceDb.model('Investment', investmentSchema)
module.exports.InvestmentInterest = mongoose.serviceDb.model('InvestmentInterest', investmentInterestSchema)
