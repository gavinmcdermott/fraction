
import _ from 'lodash'
import assert from 'assert'

const FRACTION_ADMIN_SCOPE = 'fraction:admin'

module.exports = {
  isFractionAdmin:(user) => {
    assert(_.isObject(user))
    const scopes = user.data.scopes
    return scopes && _.includes(scopes, FRACTION_ADMIN_SCOPE)
  }
}
