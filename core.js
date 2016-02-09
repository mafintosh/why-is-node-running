// lifted from node core, https://github.com/nodejs/node/blob/88307974e60346bc98c4e9f70a2b6918ccb6844f/src/node.js
// needed to instrument timers

exports.NativeModule = NativeModule
exports.globalTimeouts = globalTimeouts

var ContextifyScript = process.binding('contextify').ContextifyScript;
function runInThisContext(code, options) {
  var script = new ContextifyScript(code, options);
  return script.runInThisContext();
}

function globalTimeouts () {
  const timers = NativeModule.require('timers');
  global.clearImmediate = timers.clearImmediate;
  global.clearInterval = timers.clearInterval;
  global.clearTimeout = timers.clearTimeout;
  global.setImmediate = timers.setImmediate;
  global.setInterval = timers.setInterval;
  global.setTimeout = timers.setTimeout;
};

function NativeModule(id) {
  this.filename = id + '.js';
  this.id = id;
  this.exports = {};
  this.loaded = false;
}

NativeModule._source = process.binding('natives');
NativeModule._cache = {};

NativeModule.require = function(id) {
  if (id == 'native_module') {
    return NativeModule;
  }

  var cached = NativeModule.getCached(id);
  if (cached) {
    return cached.exports;
  }

  if (!NativeModule.exists(id)) {
    throw new Error('No such native module ' + id);
  }

  process.moduleLoadList.push('NativeModule ' + id);

  var nativeModule = new NativeModule(id);

  nativeModule.cache();
  nativeModule.compile();

  return nativeModule.exports;
};

NativeModule.getCached = function(id) {
  return NativeModule._cache[id];
};

NativeModule.exists = function(id) {
  return NativeModule._source.hasOwnProperty(id);
};

const EXPOSE_INTERNALS = process.execArgv.some(function(arg) {
  return arg.match(/^--expose[-_]internals$/);
});

if (EXPOSE_INTERNALS) {
  NativeModule.nonInternalExists = NativeModule.exists;

  NativeModule.isInternal = function(id) {
    return false;
  };
} else {
  NativeModule.nonInternalExists = function(id) {
    return NativeModule.exists(id) && !NativeModule.isInternal(id);
  };

  NativeModule.isInternal = function(id) {
    return id.startsWith('internal/');
  };
}


NativeModule.getSource = function(id) {
  return NativeModule._source[id];
};

NativeModule.wrap = function(script) {
  return NativeModule.wrapper[0] + script + NativeModule.wrapper[1];
};

NativeModule.wrapper = [
  '(function (exports, require, module, __filename, __dirname) { ',
  '\n});'
];

NativeModule.prototype.compile = function() {
  var source = NativeModule.getSource(this.id);
  source = NativeModule.wrap(source);

  var fn = runInThisContext(source, {
    filename: this.filename,
    lineOffset: 0,
    displayErrors: true
  });
  fn(this.exports, NativeModule.require, this, this.filename);

  this.loaded = true;
};

NativeModule.prototype.cache = function() {
  NativeModule._cache[this.id] = this;
};
