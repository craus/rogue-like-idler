  // var mult = createMultiplier({
  //   costResource: resources.gold, 
  //   baseCost: 3,
  //   incomeMultiplier: 1.05,
  //   costMultiplier: 1.06,
  //   resource: resources.gold,
  // })

var createMultiplier = function(multiplier)
{
  var name = 'Multiplier' + multipliers.length

  var resource = variable(0, name)
  resources[name] = resource

  var panel = instantiate('multiplierSample')
  $('.multipliers').append(panel)

  var atMax = () => resource.value == 1;
  var atMin = () => resource.value == 0;

  panel.find('.more').click(() => {
    resource.value += 1
  })  
  panel.find('.less').click(() => {
    resource.value -= 1
  })

  setFormattedText(panel.find('.value'), multiplier)

  var result = {
    value: function() {
      return Math.pow(multiplier, resource())
    },
    paint: function() {
      setFormattedText(panel.find('.amount'), resource())
      panel.find('.more').toggleClass('disabled', atMax())
      panel.find('.less').toggleClass('disabled', atMin())
    }
  }

  multipliers.push(result)
}