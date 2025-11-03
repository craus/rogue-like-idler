market = function(params = {}) {
  var result = params

  if (result.level == undefined) {

    result.level = resources.level()

    var basePower = 0.1 * resources.level()
    var randPower = gaussianRandom(0, 1)
    var power = basePower + randPower

    var duration = Math.floor(1 / Math.random())

    var chance = Math.random()

    var baseQuality = -2

    var randomQuality = 0.5
    var quality = gaussianRandom(baseQuality, randomQuality)

    result.price = Math.pow(10, power).round(2)
    result.chance = chance
    result.duration = duration
    result.reward = result.price * Math.pow(10, quality) 
      * Math.pow(1.1, result.duration) / result.chance
  }

  var panel = instantiate('marketSample')
  
  if (params.instantiate != false) {
    $('.markets').append(panel)
  }
  
  result = Object.assign({
    available: function() {
      return resources.money() >= this.price && resources.idle() >= this.duration
    },
    roll: function() {
      if (Math.random() < this.chance) {
        resources.money.value += this.reward
      }
    },
    activate: function() {
      if (!this.available()) return
      resources.money.value -= this.price
      resources.idle.reset()
      roll()
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
      setFormattedText(panel.find('.duration'), large(this.duration))
      setFormattedText(panel.find('.chance'), large(this.chance))
      setFormattedText(panel.find('.reward'), large(this.reward))
      panel.find('.choose').toggleClass('disabled', !this.available())
      panel.find('.discard').toggleClass('disabled', resources.level() == 0)
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