"use strict"

var resetters = []

var resources = function() {
  window.farmTypes = []
  var farmResource = function(name) {
    farmTypes.push(name)
    return variable(startFarm, name, {formatter: large, incomeFormatter: x => noZero(signed(large(x)))})
  }
  resources = {
    money: variable(0, 'money', {formatter: large}),
    workers: variable(1, 'workers'),
    time: variable(0, 'time', {formatter: Format.time}),
    idle: variable(0, 'idle', {
      reset: function() {
        this.value = 0
      }
    }),
    lastCommandMoment: variable(-Number.MAX_VALUE, 'lastCommandMoment')
  } 

  resources.money.income = () => resources.workers() * resources.idle()
  resources.time.income = () => 1

  window.resetPower = function() {
    resources.lifetime.value += resources.idle()
    resources.idle.value = 0
  }

  resources.idle.income = () => 1

  window.controlsLocked = () => resources.time() < resources.lastCommandMoment() + 1
  window.onCommand = () => resources.lastCommandMoment.value = resources.time()
}