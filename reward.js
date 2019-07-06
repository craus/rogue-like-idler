reward = function(type, params) {
  params = params || {}
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
  if (type == "life") {
    return {
      get: function() {
        resources.life.value += this.value()
      },
      value: v(1),
      description: function() {
        return "extra life" 
      }, 
    }
  }
  if (type == "item") {
    return {
      get: function() {
        resources[this.itemType].value += this.value()
      },
      value: v(1),
      description: function() {
        return this.itemType
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