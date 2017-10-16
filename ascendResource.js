var createAscendResource = function(i, resources, getLevel, idleTime, actionPoints) {
  var previous = resources[i-1]
  var name
  if (i == 0) {
    name = "Money"
  } else if (i == 1) {
    name = "Income"
  } else if (i == 2) {
    name = "Income multiplier"
  } else {
    name = "Income multiplier #" + (i-1)
  }
  var id = "resource" + i
  
  var result = variable(1, id, name)
  
  var panel = instantiate("resourcePanelSample")
  panel.find('.value').addClass(id)
  panel.find('.name').text(name)
  $('.resources').append(panel)

  panel.find('.income').remove()

  var ascendValue = () => Math.floor(Math.pow(Math.floor(previous.get()) * (i == 1 ? 1 : 1), i == 1 ? 0.5 : 0.5))

  var actionCost = 0

  var available = () => actionPoints.get() >= actionCost

  var basePaint = result.paint
  result.paint = function() {
    panel.toggle(i <= getLevel()+1)
    panel.find('.ascend').prop('disabled', ascendValue() <= result.value && available())
    setFormattedText(panel.find('.newValue'), large(ascendValue()))
    
    basePaint.apply(this)
  }
  
  panel.find('.ascend').click(() => {
    if (!available()) {
      return
    }
    actionPoints.value -= actionCost
    result.value = ascendValue()
    for (var j = 0; j < i; j++) {
      resources[j].value = 1
    }
    idleTime.value = 0
  })
  
  return result
}