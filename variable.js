v = function(value) {
  var result = () => {
    return result.value
  }
  Object.defineProperty(result, "name", {value: "getVar", writable: true})
  return Object.assign(result, {
    value: value
  })
}

variable = function(initialValue, id, params) {
  if (params == undefined) {
    params = {}
  }
  params.name = params.name || id
  var income = params.income || (() => 0)
  if (savedata[id] != undefined) {
    initialValue = savedata[id]
  }
  var formatter = params.formatter || Format.integer
  var incomeFormatter = params.incomeFormatter || (function(x) { return noZero(signed(large(Math.floor(x+eps)))) })
  var result = v(initialValue)
  return Object.assign(result, {
    id: id,
    income: income,
    format: function() {
      return formatter(this.value)
    },
    backup: function() {
      this.backupValue = this.value
    },
    restore: function() {
      this.value = this.backupValue
    },
    limited: function() {
      return !!this.maxValue && this.value == this.maxValue
    },
    paint: function() {
      this.check()
      setFormattedText($('.#{0}.value, .#{0} .value'.i(id)), this.format())
      setFormattedText($('.#{0}.maxValue, .#{0} .maxValue'.i(id)), formatter(this.maxValue))
      setFormattedText($('.#{0}.name, .#{0} .name'.i(id)), this.name)
      $('.#{0}.limit, .#{0} .limit'.i(id)).toggleClass('limited', this.limited())
      $('.#{0}.showWhenLimited, .#{0} .showWhenLimited'.i(id)).toggle(this.limited())
      setFormattedText($('.#{0}.income, .#{0} .income'.i(id)), incomeFormatter(this.income()))
      $('.#{0}.hideIfZero, .#{0} .hideIfZero'.i(id)).toggle(this.value > 0)
    },
    tick: function(deltaTime) {
      this.value += this.income() * deltaTime
    },
    check: function() {
      if (!!this.maxValue && this.value > this.maxValue) {
        this.value = this.maxValue;
      }
    },
    save: function() {
      this.check()
      return this.value
    }
  }, params)
}  