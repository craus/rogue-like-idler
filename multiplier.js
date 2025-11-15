multiplier = function(params = {}) {
  var result = params

  var panel = instantiate('multiplierSample')
  
  if (params.instantiate != false) {
    $('.multipliers').append(panel)
  }

  if (result.amount == undefined) {
    result.amount = 0
  }
  
  result = Object.assign({
    paint: function() {
      setFormattedText(panel.find('.workersAmountMultiplier'), large(this.workersAmountMultiplier))
      setFormattedText(panel.find('.workersPriceMultiplier'), large(this.workersPriceMultiplier))
      setFormattedText(panel.find('.amount'), large(this.amount))
      panel.find('.more').toggleClass('disabled', false)
      panel.find('.less').toggleClass('disabled', this.amount == 0)
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