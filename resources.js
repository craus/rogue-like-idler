"use strict"

var resetters = []

var resources = function() {
  window.farmTypes = []
  var farmResource = function(name) {
    farmTypes.push(name)
    return variable(startFarm, name, {formatter: large, incomeFormatter: x => noZero(signed(large(x)))})
  }

  resources = {
    gold: variable(0, 'gold'),
    workers: variable(1, 'workers'),
    time: variable(0, 'time', {formatter: Format.time}),
    lifetime: variable(30, 'lifetime', {name: 'time', formatter: Format.time}),
    idle: variable(0, 'idle', {
      reset: function() {
        this.value = 0
      }
    }),
    lastCommandMoment: variable(-Number.MAX_VALUE, 'lastCommandMoment')
  } 

  window.efficiency = () => 
    Math.pow(3, Math.floor(Math.log(resources.workers()) / Math.log(10)))

  resources.gold.income = () => 
    10 *
    Math.pow(resources.workers(), 0.5) * 
    efficiency()
    resources.idle()

  resources.time.income = () => 1

  $('.buy').click(() => {
    resources.workers.value += resources.gold()
    resources.gold.value = 0
    resources.idle.value = 0
  })

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