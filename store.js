window.stores = []

var store = function(name, costFunction, costResource)
{
  var targetResource = resources[name]
  var purchases = resource(name + 'Purchases')

  var cost = () => costFunction(purchases())

  if (costResource == undefined) {
    costResource = resources.mana
  }
  
  var panel = $('.#{0}'.i(name))

  panel.find('.buy').click(() => {
    costResource.value -= cost()
    targetResource.value += 1
    purchases.value += 1
  })

  setFormattedText(panel.find('.costResource'), costResource.id)

  var available = function() {
    return costResource() >= cost()
  }

  var result = {
    cost: cost,
    
    paint: function() {

      setFormattedText(panel.find('.cost'), large(cost()))
      panel.find('.buy').toggleClass('disabled', !available())
      panel.find('.tillBlock').toggleClass('hidden', available())
      setFormattedText(
        panel.find('.till'), 
        Format.time((cost() - costResource()) / costResource.income())
      )
    }
  }

  stores.push(result)
}