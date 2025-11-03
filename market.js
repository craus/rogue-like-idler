market = function(params = {}) {
  var result = params

  if (result.level == undefined) {

    result.level = resources.level()

    var basePower = 0.1 * resources.level()
    var randPower = gaussianRandom(0, 1)
    var power = basePower + randPower

    var randomDuration = () => Math.floor(1 / Math.pow(Math.random(), 1.2))

    var duration = randomDuration()
    while (result.level == 0 && duration > 10) {
      duration = randomDuration()
    }

    var chance = Math.random()

    var baseQuality = 0

    var randomQuality = 0
    var quality = gaussianRandom(baseQuality, randomQuality)

    var freePrice = 1

    result.price = Math.pow(10, power).round(2)
    if (result.level == 0) result.price = 0
    result.chance = chance
    result.duration = duration

    var reward = (freePrice + result.price) * Math.pow(1.1, result.duration) / result.chance
    result.reward = (reward - result.price) * Math.pow(10, quality) + result.price
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
      this.roll()
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
      resources.idle.reset()
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