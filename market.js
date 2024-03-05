market = function(params = {}) {
  var result = params

  if (!result.level) {
    result.level = resources.level()

    var basePower = 0.1 * resources.level()
    var randPower = gaussianRandom(0, 1)
    var power = basePower + randPower

    var baseQuality = -2
    baseQuality -= 2 * Math.log(Math.max(power, 1)) / Math.log(10)
    
    var randomQuality = 0.5
    var quality = gaussianRandom(baseQuality, randomQuality)

    result.price = Math.pow(10, power).round(2)
    result.reward = Math.pow(10, quality + power)
  }
  var panel = instantiate('marketSample')
  
  if (params.instantiate != false) {
    $('.markets').append(panel)
  }
  
  result = Object.assign({
    available: function() {
      return resources.money() >= this.price
    },
    activate: function() {
      if (!this.available()) return
      resources.money.value -= this.price
      resources.moneyIncome.value += this.reward
      resources.idle.reset()
      resources.level.value += 1
      refreshMarkets()
    },
    choose: function() {
      this.activate()
      game.paint()
    },
    discard: function() {
      if (resources.level() > 0) {
        resources.level.value -= 1
      }
      refreshMarkets()
    },
    paint: function() {
      setFormattedText(panel.find('.level'), this.level)
      setFormattedText(panel.find('.price'), large(this.price))
      setFormattedText(panel.find('.reward'), large(this.reward))
      panel.find('.choose').toggleClass('disabled', !this.available())
    },
    save: function() {
      return this
    },
    destroy: function() {
      panel.remove()
    },
  }, result)
  
  result.paint()

  panel.find('.discard').click(() => result.discard())
  panel.find('.choose').click(() => result.choose())
  return result
} 