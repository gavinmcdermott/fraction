'use strict'

// Globals
import React, { Component, PropTypes } from 'react'
import { connect } from 'react-redux'
import { Link } from 'react-router'

// Locals
// import LandingComponent from './../components/LandingComponent'
// import * as actions from './../../../actions/propertyActions'
// import { useCacheFrom } from './../../../utils/api'


function mapStateToProps(state) {
  return {
    properties: state.properties
  }
}

class PropertyCardContainer extends Component {

  componentWillMount() {

  }

  render() {
    const pct = Math.floor(Math.random() * 100)
    return(
      <div className={ this.props.size }>
        <Link to={`/properties/${this.props.property.id}`}>
          <div className="card property-card">
            
            <div className="lead-image"></div>
            <div className="title-container">
              <h4 className="title f--bold">{ this.props.property.location.address1 }</h4>
              <p>{ this.props.property.location.city }</p>
            </div>
            
            <div className="lastGroup size1of1">
              <div className="unit size1of3">
                <div className="data-box">
                  <h5>$24 / year</h5>
                  <p>Estimated Income</p>
                </div>
              </div>
              <div className="unit size1of3">
                <div className="data-box">
                  <h5>4.2%</h5>
                  <p>Estimated Appreciation</p>
                </div>
              </div>
              <div className="lastUnit size1of3">
                <div className="data-box">
                  <h5>$35.00</h5>
                  <p>Fraction Investment</p>
                </div>
              </div>
            </div>

            <div className="lastGroup size1of1">
              <div className="progress-bar-wrap">
                <div className="progress-bar" style={{ width: pct + '%' }}>
                </div>
              </div>
            </div>

          </div>
        </Link>
      </div>
    )
  }
}

PropertyCardContainer.propTypes = {
  property: PropTypes.object.isRequired,
  size: PropTypes.string.isRequired
}

export default connect(mapStateToProps)(PropertyCardContainer)


// <LandingComponent {...this.props}></LandingComponent>