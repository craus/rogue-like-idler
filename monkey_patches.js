Array.prototype.last = function() {
  return this[this.length-1]
}

Array.prototype.remove = function(element) {
  var i = this.indexOf(element);
  if(i != -1) {
    this.splice(i, 1);
  }
}

Array.prototype.each = function(method) {
  var args = Array.prototype.slice.call(arguments,1)
  for (var i = 0; i < this.length; i++) {
    this[i][method].apply(this[i],args)
  }
}

Array.prototype.repeat = function(n) {
  var len = this.length
  var res = []
  for (var i = 0; i < n; i++) {
    for (var j = 0; j < len; j++) {
      res.push(this[j])
    }
  }
  return res
}

Array.prototype.contains = function(x) {
  return this.indexOf(x) != -1
}

Array.prototype.rnd = function(x, w) {
  w = w || ((el) => 1)
  var result = null
  var totalWeight = 0
  for (var i = 0; i < this.length; i++) {
    if (rndEvent(w(this[i]), totalWeight)) {
      result = this[i]
    }
    totalWeight += w(this[i])
  }
  return result
}

Array.prototype.remove = function(x) {
  var ind = this.indexOf(x)
  if (ind != -1) {
    this.splice(ind, 1)
  }
  return this
}

Array.prototype.find = function(criteria) {
  for (var i = 0; i < this.length; i++) {
    if (criteria(this[i])) {
      return this[i]
    }
  }
  return null
}

String.prototype.replaceAll = function(search, replacement) {
    var target = this;
    return target.split(search).join(replacement);
};

String.prototype.i = function() {
  var args = Array.prototype.slice.call(arguments,0)
  return Object.entries(args).reduce((s, entry) => s.replaceAll('#{'+entry[0]+'}', entry[1]).replaceAll('{'+entry[0]+'}', entry[1]), this.toString())
}

String.prototype.capitalize = function() {
  return this.charAt(0).toUpperCase() + this.slice(1)
}

Math.sign = function(x) {
  if (x > 0) {
    return 1
  } else if (x < 0) {
    return -1
  } else {
    return 0
  }
}

Function.prototype.withCallbacks = function() {
  var f = this
  var callbacked = Object.assign(function() {
    callbacked.listBefore.each('call')
    var result = f.call(this, ...arguments)
    callbacked.listAfter.each('call')
    return result
  }, {
    listBefore: [],
    listAfter: [],
    after: function(f) {
      this.listAfter.push(f)
    },
    before: function(f) {
      this.listBefore.push(f)
    }
  })
  return callbacked
}

Function.prototype.extend = function(newVariant) {
  var sup = this
  return function() {
    var obj = this
    newVariant.call(obj, function() {
      sup.call(obj, ...arguments)
    }, ...arguments)
  }
}

Object.defineProperty(Object.prototype, "inherit", { 
    value: function(field, newVariant) {
      this[field] = this[field].extend(newVariant)
    },
    enumerable : false
});

Number.prototype.clamp = function(min, max) {
  return Math.min(Math.max(this, min), max);
};