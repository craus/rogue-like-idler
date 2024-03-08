"use strict"

var resource = function(id, startValue, params) {
  if (startValue == undefined) {
    startValue = 0
  }
  resources[id] = variable(startValue, id, params)
  return resources[id]
}