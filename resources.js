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
    level: variable(0, 'level'),
    levelTime: variable(0, 'levelTime', {formatter: large}),
    life: variable(1, 'life'),
    maxLife: variable(1, 'maxLife'),
    time: variable(0, 'time', {formatter: Format.time}),
    idle: variable(0, 'idle', {
      reset: function() {
        this.value = 0
      },
      formatter: large
    }),
    lastCommandMoment: variable(-Number.MAX_VALUE, 'lastCommandMoment')
  } 

  resources.time.income = () => 1

  resources.idle.income = () => 1

  window.controlsLocked = () => resources.time() < resources.lastCommandMoment() + 1
  window.onCommand = () => resources.lastCommandMoment.value = resources.time()
}