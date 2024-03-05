// costResource, cost, rewardResource, reward, resourceName, value
var createMultiplier = function(params)
{
  var cost = () => params.baseCost * Math.pow(params.costMultiplier, params.rewardResource())

  var panel = instantiate('multiplierSample')
  $('.multipliers').append(panel)
  panel.find('.buy').click(() => {
    params.costResource.value -= cost()
    params.rewardResource.value += params.reward()
  })

  setFormattedText(panel.find('.resourceName'), params.resourceName)
  setFormattedText(panel.find('.value'), params.value)
  setFormattedText(panel.find('.costResource'), params.costResource.id)

  var available = function() {
    return params.costResource() >= cost()
  }

  multipliers.push({
    paint: function() {
      setFormattedText(panel.find('.cost'), large(cost()))
      setFormattedText(panel.find('.value'), params.value)
      setFormattedText(panel.find('.amount'), params.rewardResource())
      panel.find('.buy').toggleClass('disabled', !available())
      panel.find('.tillBlock').toggleClass('hidden', available())
      setFormattedText(
        panel.find('.till'), 
        Format.time((cost() - params.costResource()) / params.costResource.income())
      )
    }
  })
}