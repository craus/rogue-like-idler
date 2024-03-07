  // var mult = createMultiplier({
  //   costResource: resources.gold, 
  //   baseCost: 3,
  //   incomeMultiplier: 1.05,
  //   costMultiplier: 1.06,
  //   resource: resources.gold,
  // })

var createMultiplier = function(params)
{
  if (params.resource.multipliers == undefined) {
    params.resource.multipliers = []
    var oldIncome = params.resource.income
    params.resource.income = () => {
      var result = oldIncome()
      for (let i = 0; i < params.resource.multipliers.length; i++) {
        result *= params.resource.multipliers[i].value()
      }
      return result
    }
  }

  var name = params.resource.name + 'Multiplier' + params.resource.multipliers.length

  var resource = variable(0, name)
  resources[name] = resource

  var cost = () => params.baseCost * Math.pow(params.costMultiplier, resource())

  var panel = instantiate('multiplierSample')
  $('.multipliers').append(panel)
  panel.find('.buy').click(() => {
    params.costResource.value -= cost()
    resource.value += 1
  })

  setFormattedText(panel.find('.resourceName'), params.resource.name)
  setFormattedText(panel.find('.value'), params.value)
  setFormattedText(panel.find('.costResource'), params.costResource.id)

  var available = function() {
    return params.costResource() >= cost()
  }

  var result = {
    value: function() {
      return Math.pow(params.incomeMultiplier, resource())
    },
    paint: function() {
      setFormattedText(panel.find('.cost'), large(cost()))
      setFormattedText(panel.find('.value'), params.incomeMultiplier)
      setFormattedText(panel.find('.amount'), resource())
      panel.find('.buy').toggleClass('disabled', !available())
      panel.find('.tillBlock').toggleClass('hidden', available())
      setFormattedText(
        panel.find('.till'), 
        Format.time((cost() - params.costResource()) / params.costResource.income())
      )
    }
  }

  multipliers.push(result)
  params.resource.multipliers.push(result)
}