const fs = require('fs');
const { TextEncoder } = require('text-encoding');

const storage = require('./static-fs-data.json');

const self = {
  _storage: storage,
  readFile: function(name, encoding) {
    if (self._storage[name] !== undefined) {
      encoding = encoding || self._storage[name].encoding;
      const buf = Buffer.from(self._storage[name].data, self._storage[name].encoding);
      if (encoding === 'binary') {
        if (typeof buf === 'string') {
          buf = new TextEncoder().encode(buf);
        }
        return Promise.resolve(buf);
      } else {
        return Promise.resolve(buf.toString(encoding));
      }
    } else {
      return Promise.reject(new Error('File ' + name + ' not found!'));
    }
  }
};

module.exports = self;
