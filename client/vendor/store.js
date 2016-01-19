/*!
Copyright (c) 2013 Derek Petersen https://github.com/tuxracer/simple-storage
 */
var e, nativeStorage, storageMethod, storageSrc, tmp;

try {
  window.localStorage.setItem('simple-storage-test', true);
  window.localStorage.removeItem('simple-storage-test');
  nativeStorage = true;
} catch (_error) {
  e = _error;
  nativeStorage = false;
}

if (nativeStorage) {
  storageSrc = window;
} else {
  tmp = {
    local: {},
    session: {}
  };
  storageSrc = {
    localStorage: {
      setItem: function(key, val) {
        return tmp.local[key] = val;
      },
      getItem: function(key) {
        return tmp.local[key];
      },
      removeItem: function(key) {
        return delete tmp.local[key];
      },
      clear: function() {
        return tmp.local = {};
      }
    },
    sessionStorage: {
      setItem: function(key, val) {
        return tmp.session[key] = val;
      },
      getItem: function(key) {
        return tmp.session[key];
      },
      removeItem: function(key) {
        return delete tmp.session[key];
      },
      clear: function() {
        return tmp.session = {};
      }
    }
  };
}

storageMethod = function(type) {
  if (type !== 'session') {
    type = 'local';
  }
  return storageSrc[type + 'Storage'];
};

module.exports = {
  nativeStorage: nativeStorage,
  set: function(key, val, type) {
    if (typeof val === 'function') {
      throw new TypeError('Cannot store functions');
    }
    if (typeof val === 'object') {
      val = JSON.stringify(val);
    }
    return storageMethod(type).setItem(key, val);
  },
  get: function(key, type) {
    var val;
    if (key != null) {
      val = storageMethod(type).getItem(key);
      try {
        return JSON.parse(val);
      } catch (_error) {
        e = _error;
        return val;
      }
    } else {
      return null;
    }
  },
  remove: function(key, type) {
    if (key == null) {
      throw new Error('Not enough arguments');
    }
    return storageMethod(type).removeItem(key);
  },
  clear: function(type) {
    return storageMethod(type).clear();
  }
};
