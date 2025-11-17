multiplier = function(workersAmountMultiplier, workersPriceMultiplier) {
  var id = 'multiplier_' + workersAmountMultiplier + '_' + workersPriceMultiplier

  var result = {
    workersAmountMultiplier: workersAmountMultiplier,
    workersPriceMultiplier: workersPriceMultiplier
  }

  var panel = instantiate('multiplierSample')
  
  $('.multipliers').append(panel)

  result.amount = savedata[id]
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
      savedata[id] = this.amount
    },
    destroy: function() {
      panel.remove()
    },
    more: function() {
      this.amount += 1
    },
    less: function() {
      this.amount -= 1
    }
  }, result)
  
  result.paint()

  panel.find('.more').click(() => result.more())
  panel.find('.less').click(() => result.less())

  return result
} 