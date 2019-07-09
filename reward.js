reward = function(type, params) {
  params = params || {}
  params.amount = params.amount || 1
  return Object.assign(rewardByType(type, params), params)
}

rewardByType = function(type, params) {
  params.type = type
  if (type == "farm") {
    return {
      get: function() {
        resources.farm.value += this.value() * farmReward
        resources.farmIncome.value += this.value() * farmIncomeReward
      },
      description: function() {
        return large(this.value()) + " farm" 
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