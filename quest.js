
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
    var quality = gaussianRandom(baseQuality, randomQuality)

    var baseManaPower = 0.5 + Math.log(resources.level()+7) / Math.log(1000)
    var randomManaPower = baseManaPower/2

    var manaPower = gaussianRandom(baseManaPower, randomManaPower)

    result.manaCost = Math.pow(10, manaPower)
    var manaQuality = manaPower-baseManaPower
		
    result.difficulty = Math.pow(10, power)    
    result.reward = Math.pow(10, quality + power + manaQuality)
  }
  
  var panel = instantiate('questSample')
  
  if (params.instantiate != false) {
    $('.quests').append(panel)
  }
  
  result = Object.assign(result, {
    deathChance: function() {
      return this.difficulty/(resources.farm()*resources.idle()+this.difficulty)
    },
    available: function() {
      if (resources.idle() < minIdleForQuest) {
        return false
      }
      if (resources.mana() < this.manaCost) {
        return false
      }
      return true
    },
    choose: function() {
      if (!this.available()) {
        return
      }
      resources.mana.value -= this.manaCost
      win = rndEvent(1-this.deathChance())
      if (win) {
        resources.level.value += 1
        if (resources.level() % 10 == 0) {
          resources.life.value += 1
        }
        resources.farm.value += this.reward
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
      panel.find('.choose').toggleClass('disabled', !this.available())
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
  setFormattedText(panel.find('.reward'), large(result.reward))
  setFormattedText(panel.find('.manaCost'), large(result.manaCost))
  panel.find('.choose').click(() => result.choose())
  
  return result
} 