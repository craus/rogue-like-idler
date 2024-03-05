"use strict"

var resetters = []

var resources = function() {
  window.farmTypes = []
  var farmResource = function(name) {
    farmTypes.push(name)
    return variable(startFarm, name, {formatter: large, incomeFormatter: x => noZero(signed(large(x)))})
  }
  var incomeMultipliers = [
    [[2, 30], [3, 40], [5, 50]],
    [[3, 20], [5, 60], [10, 80]],
    [[4, 7], [6, 25], [12, 120]],
  ]
  var resourceNames = [
    'gold',
    'energy',
    'gems'
  ]
  resources = {
    gold: variable(0, 'gold'),
    energy: variable(0, 'energy'),
    gems: variable(0, 'gems'),
    time: variable(0, 'time', {formatter: Format.time}),
    lifetime: variable(30, 'lifetime', {name: 'time', formatter: Format.time}),
    idle: variable(0, 'idle', {
      reset: function() {
        this.value = 0
      }
    }),
    lastCommandMoment: variable(-Number.MAX_VALUE, 'lastCommandMoment')
  } 
  var id = (i,j) => resourceNames[i].capitalize() + "Into" + resourceNames[j].capitalize()

  window.multipliers = []

  for (var i = 0; i < resourceNames.length; i++) {
    for (var j = 0; j < resourceNames.length; j++) {
      resources[id(i,j)] = variable(0, id(i,j))

      createMultiplier({
        costResource: resources[resourceNames[i]], 
        costMultiplier: incomeMultipliers[i][j][1],
        rewardResource: resources[id(i,j)], 
        reward: () => 1, 
        resourceName: resourceNames[j],
        value: incomeMultipliers[i][j][0],
      })
    }
  }

  for (let j = 0; j < resourceNames.length; j++) {
    resources[resourceNames[j]].income = () => {
      var result = 1
      for (var i = 0; i < resourceNames.length; i++) {
        result *= Math.pow(incomeMultipliers[i][j][0], resources[id(i,j)]())
      }
      return result
    }
  }

  resources.time.income = () => 1

  window.resetPower = function() {
    resources.lifetime.value += resources.idle()
    resources.idle.value = 0
  }

  resources.lifetime.inherit('tick', function(sup, deltaTime) {
    sup(deltaTime)
    if (this.value <= 0) {
      resetPower()
    }
  })

  resources.idle.income = () => 1

  window.controlsLocked = () => resources.time() < resources.lastCommandMoment() + 1
  window.onCommand = () => resources.lastCommandMoment.value = resources.time()
}