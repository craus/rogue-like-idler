
quest = function(params = {}) {
  var result = params
  if (!result.difficulty) {
    var power = gaussianRandom(
			0.1 * resources.level(), 
			0.5 * Math.pow(resources.level()+7, 0.25) - 0.1
		)
    //console.log("power", power)
    var baseQuality = 0
    
    baseQuality -= 2*power/10
    baseQuality += 2*Math.floor(resources.level()/100)
    
    baseQuality -= power/100
    baseQuality += Math.floor(resources.level()/1000)
    
    baseQuality -= power/1000
    baseQuality += Math.floor(resources.level()/10000)
    
    var randomQuality = 0.6+0.2*Math.sin(power/14.19)
    //console.log("base quality", baseQuality)
    // console.log("random quality", randomQuality)
    var quality = gaussianRandom(baseQuality, randomQuality)

    //console.log("quality", quality)
    result.difficulty = Math.pow(10, power)   
    result.rewards = {
      farm: Math.pow(10, quality + power) * 
        resources.farmMultiplier()
    }
  }
  
  var panel = instantiate('questSample')
  
  if (params.instantiate != false) {
    $('.quests').append(panel)
  }
  
  result = Object.assign({
    deathChance: function() {
      return this.difficulty/(resources.farm()*Math.pow(resources.idle(), strengthIdlePower)+this.difficulty)
    },
    reward: function() {
      return {
        farm: this.rewards.farm * Math.pow(
          resources.idle(), 
          farmRewardIdlePower
        ) * questRewardMultiplier,
        farmMultiplier: this.rewards.farmMultiplier
      }
    },
    locked: function() {
      return resources.idle() < minIdleForQuest
    },
    ready: function() {
      return resources.idle() * resources.farm() >= this.difficulty
    },
    unlocksIn: function() {
      return this.difficulty / resources.farm() - resources.idle()
    },
    win: function() {
      return rndEvent(1-this.deathChance())
    },
    choose: function() {
      if (this.locked()) {
        return
      }
      console.log("Choose", this.difficulty)
      if (this.win()) {
        resources.level.value += 1
        if (resources.level() % 10 == 0) {
          resources.life.value += 1
        }
        resources.farm.value += this.reward().farm * farmReward
        resources.farmIncome.value += this.reward().farm * farmIncomeReward
      } else {
        resources.life.value -= 1
        resources.activeLife.value -= 1
        resources.lastDeathChance.value = this.deathChance()
      }
      resources.idle.value = 0
      refreshQuests()
      game.paint()
    },
    paint: function() {
      setFormattedText(panel.find('.deathChance'), Format.percent(result.deathChance(), 2))
      panel.find('.choose').toggleClass('disabled', this.locked())
      setFormattedText(panel.find('.reward'), large(this.reward().farm))
    },
    save: function() {
      savedata.quests.push(Object.assign({
      }, _.omit(this)))
    },
    destroy: function() {
      panel.remove()
    },
  }, result)
  
  setFormattedText(panel.find('.danger'), large(result.difficulty))
  setFormattedText(panel.find('.deathChance'), Format.percent(result.deathChance(), 2))
  panel.find('.choose').click(() => result.choose())

  return result
} 