quest = function(params = {}) {
  var result = params
  var powerRandom = function() {
    return gaussianRandom(
      0, 
      0.5 * Math.pow(0*resources.level()+7, 0.25) - 0.1
    )
  }
  if (!result.farmCheck) {
    var basePower = 0.1 * resources.level()
    var randPower = powerRandom()
    var power = basePower + randPower

    var baseQuality = 0
    
    baseQuality -= 2*power/10
    baseQuality += 2*Math.floor(resources.level()/100)
    
    baseQuality -= power/100
    baseQuality += Math.floor(resources.level()/1000)
    
    baseQuality -= power/1000
    baseQuality += Math.floor(resources.level()/10000)
    
    var randomQuality = 0.6+0.2*Math.sin(0*power/14.19)
    //console.log("base quality", baseQuality)
    // console.log("random quality", randomQuality)
    var quality = gaussianRandom(baseQuality, randomQuality)

    var energyAmount = () => 6 * Math.pow(10, resources.level()/1000) * Math.pow(4, randPower)
    var rewards = {
      items: false,
      energy: false,
      life: true
    }

    //console.log("quality", quality)
    result.farmCheck = {
      difficulty: Math.pow(10, power).round(2),
      farmType: farmTypes.rnd()
    }
    if (rewards.life && randPower > powerRandom() && rndEvent(0.1)) {
      result.reward = reward('item', {
        itemType: 'life'
      })
    } else if (rndEvent(0.0)) {
      result.reward = reward('farmMultiplier', {
        multiplier: Math.pow(10, randPower/100)
      })
    } else if (rewards.items && randPower > powerRandom() && rndEvent(0.3)) {
      result.reward = reward('item', {
        itemType: itemTypes.rnd()
      })
    } else if (rewards.energy && energyAmount() > 3 && rndEvent(0.4)) {
      result.reward = reward('item', {
        itemType: 'energy',
        amount: energyAmount()
      })
    } else {
      result.reward = reward('farm', {
        farmType: farmTypes.rnd(),
        amount: (Math.pow(10, quality + power) * 
          resources.farmMultiplier()).round(2)
      })
    }
  } else {
    result.reward = reward(result.reward.type, result.reward)
  }
  
  var panel = instantiate('questSample')
  
  if (params.instantiate != false) {
    $('.quests').append(panel)
  }
  
  result = Object.assign({
    damage: 1, 
    lastDamage: 1,
    deathChance: function() {
      var d = this.farmCheck.difficulty
      var f = resources[this.farmCheck.farmType]()
      var p = f * Math.pow(resources.idle(), strengthIdlePower)
      return d / (p + d)
    },
    failText: function() {
      return this.lastDamage > 0 ? "death" : "fail"
    },
    failedText: function() {
      return this.lastDamage > 0 ? "DEAD" : "FAILED"
    },
    continueText: function() {
      return this.lastDamage > 0 ? "Revive" : "Continue"
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
        resources.level.change(x => x+1)
        this.reward.get()
      } else {
        resources.life.value -= this.damage
        resources.activeLife.value -= 1
        this.lastDamage = this.damage
        resources.lastDeathChance.value = this.deathChance()
        lastFailedQuest = this
      }
      resources.idle.reset()
      refreshQuests()
    },
    steal: function() {
      if (this.win()) {
        this.reward.get()
        this.reward = reward('empty')
      } else {
        resources.activeLife.value -= 1
        this.lastDamage = 0
        resources.lastDeathChance.value = this.deathChance()
        lastFailedQuest = this
      }
      resources.activeTheft.value = 0
      resources.idle.reset()
    },
    choose: function() {
      if (controlsLocked()) {
        return
      }
      onCommand()
      if (resources.activeTheft() == 0) {
        this.activate()
      } else {
        this.steal()
      }
      game.paint()
    },
    paint: function() {
      panel.find('.deathChanceLine').toggle(this.ready())
      panel.find('.unlocksInLine').toggle(!this.ready())
      setFormattedText(panel.find('.farmCheckType'), result.farmCheck.farmType.capitalize())
      setFormattedText(panel.find('.danger'), large(result.farmCheck.difficulty, 2))
      setFormattedText(
        panel.find('.deathChance'), 
        Format.percent(this.deathChance(), 2)
      )
      setFormattedText(
        panel.find('.failName'), 
        this.damage == 1 ? 'Death' : 'Fail'
      )
      setFormattedText(
        panel.find('.unlocksIn'), 
        Format.time(this.unlocksIn())
      )
      panel.find('.choose').toggleClass('btn-warning', theftMode())
      panel.find('.choose').toggleClass('disabled', controlsLocked())
      panel.find('.choose').toggleClass('btn-primary', !theftMode() && this.ready())
      panel.find('.choose').toggleClass('btn-danger', !theftMode() && !this.ready())
      setFormattedText(panel.find('.choose'), resources.activeTheft() == 0 ? 'Choose' : 'Steal')
      setFormattedText(panel.find('.reward'), this.reward.description())

    },
    save: function() {
      return this
    },
    destroy: function() {
      panel.remove()
    },
  }, result)
  
  result.paint()

  panel.find('.choose').click(() => result.choose())
  if (!!result.reward.itemType) {
    panel.find('.itemType').addClass(result.reward.itemType)
  } else {
    panel.find('.itemType').hide()
  }
  return result
} 