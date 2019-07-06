quest = function(params = {}) {
  var result = params
  if (!result.difficulty) {
    var power = gaussianRandom(
			0.1 * resources.level(), 
			0.5 * Math.pow(resources.level()+7, 0.25) - 0.1
		)
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
    if (rndEvent(0.5)) {
      result.reward = reward({
        type: "farm", amount: Math.pow(10, quality + power)
      })
    } else {
      result.reward = reward({
        type: "life"
      })
    }
  } else {
    result.reward = reward(result.reward)
  }
  
  var panel = instantiate('questSample')
  
  if (params.instantiate != false) {
    $('.quests').append(panel)
  }
  
  result = Object.assign({
    deathChance: function() {
      return this.difficulty/(resources.farm()*Math.pow(resources.idle(), strengthIdlePower)+this.difficulty)
    },
    locked: function() {
      return resources.idle() < minIdleForQuest
    },
    ready: function() {
      return this.unlocksIn() <= 0
    },
    unlocksIn: function() {
      return 0
    },
    win: function() {
      return rndEvent(1-this.deathChance())
    },
    activate: function() {
      if (this.win()) {
        resources.level.value += 1
        this.reward.get()
      } else {
        resources.life.value -= 1
        resources.activeLife.value -= 1
        resources.lastDeathChance.value = this.deathChance()
      }
    },
    choose: function() {
      if (this.locked()) {
        return
      }
      this.activate()
      resources.idle.value = 0
      refreshQuests()
      game.paint()
    },
    paint: function() {
      panel.find('.deathChanceLine').toggle(this.ready())
      panel.find('.unlocksInLine').toggle(!this.ready())
      setFormattedText(
        panel.find('.deathChance'), 
        Format.percent(this.deathChance(), 2)
      )
      setFormattedText(
        panel.find('.unlocksIn'), 
        Format.time(this.unlocksIn())
      )
      panel.find('.choose').toggleClass('disabled', this.locked())
      panel.find('.choose').toggleClass('btn-primary', this.ready())
      panel.find('.choose').toggleClass('btn-danger', !this.ready())
      setFormattedText(panel.find('.reward'), this.reward.description())
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