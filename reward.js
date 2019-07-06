reward = function(params) {
  return Object.assign(rewardByType(params), params)
}

rewardByType = function(params) {
  if (params.type == "farm") {
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
          resources.farmMultiplier() *
          Math.pow(
            resources.idle(), 
            farmRewardIdlePower
          ) * 
          questRewardMultiplier
      }
    }
  } 
  if (params.type == "life") {
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
  return null
}