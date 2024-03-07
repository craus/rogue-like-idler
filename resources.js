"use strict"

var resource = function(id, startValue, params) {
  if (startValue == undefined) {
    startValue = 0
  }
  resources[id] = variable(startValue, id, params)
  return resources[id]
}

var resources = function() {

  resource('time', 0, {formatter: Format.time})
  resources.time.income = () => 1

  var mana = resource('mana', 15)
  store('mana', n => 0)

  var manaCrystals = resource('manaCrystals', 0)
  store('manaCrystals', n => 10 * Math.pow(1.1, n))

  var amplifiers = resource('amplifiers', 0)
  resources.mana.income = () => manaCrystals() * Math.pow(2, amplifiers())
  store('amplifiers', n => 10, manaCrystals)
}