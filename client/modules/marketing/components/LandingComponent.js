'use strict'

// Globals
import _ from 'lodash'
import validator from 'validator'
import React, { Component, PropTypes } from 'react'
import { Link } from 'react-router'

import PropertyCardContainer from './../../common/containers/PropertyCardContainer'


class LandingComponent extends Component {
  render() {
    return(
      <div>
        <div className="hero"></div>
        <div className="page-wrap">
          
          <div className="section">
            <div className="lastUnit size1of1">
              <h2 className="align--center">Real estate, real returns.</h2>
              <h4 className="align--center">Fractions are small equity stakes in top airbnb rental properties.</h4>
            </div>
          </div>

          <div className="section">

            <div className="lastGroup size1of1">
              <div className="unit size1of3 callout-wrap">
                <span className="circle--med center--horiz"></span>
                <h4 className="align--center">Invest in top markets</h4>
                <p className="align--center">
                  With investments starting around $50, you can easily own your piece of 
                  professionally-managed properties in top rental markets.
                </p>
              </div>
              <div className="unit size1of3 callout-wrap">
                <span className="circle--med center--horiz"></span>
                <h4 className="align--center">Earn monthly rent</h4>
                <p className="align--center">
                  We handle the rental, management, and upkeep so you don't have to. 
                  Just sit back and collect your airbnb profits every month.
                </p>
              </div>
              <div className="lastUnit size1of3 callout-wrap">
                <span className="circle--med center--horiz"></span>
                <h4 className="align--center">Invest in top markets</h4>
                <p className="align--center">
                  Sell your Fractions to anyone in an open market after a one year 
                  holding period. Or, in 5 years, an exit at market value is guaranteed.
                </p>
              </div>
            </div>

            <div className="lastUnit size1of1">
              <div className="button-group align--center">
                <button>Browse Fractions</button>
              </div>
            </div>

          </div>


          <div className="section">
            <div className="lastUnit size1of1">
              <h2 className="align--center">What do Fraction returns look like?</h2>
            </div>
          </div>

          <div className="section">
            
            <div className="lastUnit size1of1">
              <div className="box"></div>
            </div>

            <div className="lastGroup size1of1">
              <div className="unit size1of3 callout-wrap">
                <h4 className="align--center">$23 / year</h4>
                <p className="align--center">Airbnb Earnings per Fraction</p>
              </div>
              <div className="unit size1of3 callout-wrap">
                <h4 className="align--center">+3.6%</h4>
                <p className="align--center">Historical Appreciation</p>
              </div>
              <div className="lastUnit size1of3 callout-wrap">
                <h4 className="align--center">+10%</h4>
                <p className="align--center">
                  Expected 5-year Return (IRR)
                </p>
              </div>
            </div>

            <div className="lastUnit size1of1">
              <div className="button-group align--center">
                <button>Learn how Fractions work</button>
              </div>
            </div>
          
          </div>


          <div className="section">
            <div className="lastGroup size1of1">
              {_.map(this.props.properties.propertiesList, (prop) => {
                return (
                  <PropertyCardContainer key={prop.id} property={prop} size="unit size1of3"></PropertyCardContainer>
                )
              })}
            </div>
          </div>




        </div>
      </div>
    )
  }
}

LandingComponent.propTypes = {
  properties: PropTypes.object.isRequired,
}

export default LandingComponent




// <h3 key={p.id}><Link to={`/properties/${p.id}`}>Go to {p.location.address1}</Link></h3>
