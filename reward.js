"use strict"

var reward = function(type, params) {
  params = params || {}
  params.amount = params.amount || 1
  return Object.assign(rewardByType(type, params), params)
}

var rewardByType = function(type, params) {
  params.type = type
  if (type == "farm") {
    params.farmType = params.farmType || 'farm'
    var farmResource = resources[params.farmType]
    return {
      get: function() {
        farmResource.value += this.value() * farmReward
        farmResource.income.value += this.value() * farmIncomeReward
      },
      description: function() {
        return "{0} {1}".i(large(this.value(), 2, 4, true), farmResource.name) 
      }, 
      baseValue: function() {
        return this.amount
      },
      value: function() {
        return this.amount * 
          Math.pow(
            resources.idle(), 
            farmRewardIdlePower
          ) * 
          questRewardMultiplier
      }
    }
  } 
  if (type == "empty") {
    return {
      get: function() {
      },
      value: v(0),
      description: function() {
        return "nothing" 
      }, 
    }
  }
  if (type == "item") {
    return {
      get: function() {
        resources[this.itemType].value += this.value()
      },
      value: function() {
        return this.amount
      },
      description: function() {
        return "#{0}#{1}".i(
          this.amount == 1 ? "" : "#{0} ".i(Format.integer(this.amount)),
          resources[this.itemType].name.toLowerCase()
        )
      }, 
    }
  }
  if (type == "farmMultiplier") {
    return {
      get: function() {
        resources.farmMultiplier.value *= this.value()
      },
      value: function() {
        return this.multiplier
      },
      description: function() {
        return "x#{0} farm multiplier".i(large(this.value()))
      }, 
    }
  }
  return null
}