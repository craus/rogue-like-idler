hero = function(params = {}) {
  var result = params
  if (!result.farm) {
    result = Object.assign(result, {
      farm: 1,
      idle: 0,
      level: 0,
      life: 3,
      activeLife: 1
    })
  }
  
  var panel = instantiate('heroSample')
  
  if (params.instantiate != false) {
    $('.heroes').append(panel)
  }
  
  result = Object.assign(result, {
    deathChance: function() {
      return this.difficulty/(resources.farm()*resources.idle()+this.difficulty)
    },
    choose: function() {
      if (resources.idle() < 3) {
        return
      }
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
      }
      resources.idle.value = 0
      refreshQuests()
      game.paint()
    },
    paint: function() {
      setFormattedText(panel.find('.deathChance'), Format.percent(result.deathChance(), 2))
      panel.find('.choose').toggleClass('disabled', resources.idle() < minIdleForQuest)
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
  panel.find('.choose').click(() => result.choose())
  
  return result
} 