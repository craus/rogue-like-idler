
quest = function(params = {}) {
  var result = params
  if (!result.difficulty) {
    var power = gaussianRandom(0.1 * resources.level(), 0.5 * Math.pow(resources.level()+7, 0.25) - 0.1)
    console.log("power", power)
    var baseQuality = 0
    
    baseQuality -= 2*power/10
    baseQuality += 2*Math.floor(resources.level()/100)
    
    baseQuality -= power/100
    baseQuality += Math.floor(resources.level()/1000)
    
    baseQuality -= power/1000
    baseQuality += Math.floor(resources.level()/10000)
    
    var randomQuality = 0.6+0.2*Math.sin(power/14.19)
    console.log("base quality", baseQuality)
    console.log("random quality", randomQuality)
    var quality = gaussianRandom(baseQuality, randomQuality)
    console.log("quality", quality)
    result.difficulty = Math.pow(10, power)    
    result.baseReward = Math.pow(10, quality + power)
  }
  
  var panel = instantiate('questSample')
  
  if (params.instantiate != false) {
    $('.quests').append(panel)
  }
  
  result = Object.assign(result, {
    deathChance: function() {
      return this.difficulty/(resources.farm()*Math.pow(resources.idle(), strengthIdlePower)+this.difficulty)
    },
    reward: function() {
      return this.baseReward * Math.pow(resources.idle(), farmRewardIdlePower)
    },
    choose: function() {
      if (resources.idle() < minIdleForQuest) {
        return
      }
      win = rndEvent(1-this.deathChance())
      if (win) {
        resources.level.value += 1
        if (resources.level() % 10 == 0) {
          resources.life.value += 1
        }
        resources.farm.value += this.reward() * farmReward
        resources.farmIncome.value += this.reward() * farmIncomeReward
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
      panel.find('.choose').toggleClass('disabled', resources.idle() < minIdleForQuest)
      setFormattedText(panel.find('.reward'), large(this.reward()))
    },
    save: function() {
      savedata.quests.push(Object.assign({
      }, _.omit(this)))
    },
    destroy: function() {
      panel.remove()
    },
  })
  
  setFormattedText(panel.find('.danger'), large(result.difficulty))
  setFormattedText(panel.find('.deathChance'), Format.percent(result.deathChance(), 2))
  panel.find('.choose').click(() => result.choose())
  
  return result
} 