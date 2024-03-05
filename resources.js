"use strict"

var resetters = []

var resources = function() {
  window.farmTypes = []
  var farmResource = function(name) {
    farmTypes.push(name)
    return variable(startFarm, name, {formatter: large, incomeFormatter: x => noZero(signed(large(x)))})
  }

  var n = 3

  var incomeMultipliers = [
    [[2, 30, 100], [3, 400, 1], [5, 50, 100]],
    [[3, 20, 100], [5, 60, 100], [2, 80, 1]],
    [[4, 75, 1], [6, 25, 100], [3, 120, 100]],
  ]

  var m = [[], [], []]

  for (let i = 0; i < n; i++) {
    for (let j = 0; j < n; j++) {
      m[i][j] = incomeMultipliers[i][j]
      m[i][j] = Math.log(m[i][j][0]) / Math.log(m[i][j][1])
    }
  }
  console.log(m)


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
        baseCost: incomeMultipliers[i][j][2],
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