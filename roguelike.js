"use strict"

function createRoguelike(params) {
  
  // Rules common things
    
  var gameName = "roguelike"
  var saveName = gameName+"SaveData"

  if (localStorage[saveName] != undefined) {
    window.savedata = JSON.parse(localStorage[saveName])
  } else {
    window.savedata = {
      realTime: new Date().getTime()
    }
  }
  var loadedSave = window.savedata
  console.log("loaded " + gameName + " save: ", window.savedata)
  
  var saveWiped = false
  
  var save = function(timestamp) {
    if (saveWiped) {
      return
    }
    window.savedata = {} 
    Object.values(resources).forEach(function(resource) {
      savedata[resource.id] = resource.save()
    })
    savedata.realTime = timestamp || Date.now()
    localStorage[saveName] = JSON.stringify(savedata)
  } 
  
  window.wipeSave = function() {
    saveWiped = true
    localStorage.removeItem(saveName)
    location.reload()
  }

  window.resources = {}

  resource('time', 0, {formatter: Format.time})
  resources.time.income = () => 1

  var mana = resource('mana')
  store('mana', n => 0)

  var phase = resource('phase')
  var period = () => 1 * Math.pow(2, amplifiers()) * Math.pow(1.0/5, boosters())
  var oneGain = () => Math.pow(3, amplifiers())
  var gain = () => oneGain() * manaCrystals()
  phase.income = () => 1 / period()
  var remainingTime = () => (1-phase()) / phase.income()

  var manaCrystals = resource('manaCrystals', 1)
  store('manaCrystals', n => 10 * Math.pow(1.1, n))

  var amplifiers = resource('amplifiers')
  store('amplifiers', n => 5, manaCrystals)

  var boosters = resource('boosters')
  store('boosters', n => 20, manaCrystals)

  var result = {
    paint: function() {
      debug.profile('paint')
      
      Object.values(resources).each('paint')
      Object.values(stores).each('paint')

      setFormattedText($('.remainingTime'), Format.time(remainingTime()))
      setFormattedText($('.gain'), large(gain()))
      setFormattedText($('.oneGain'), large(oneGain()))
      setFormattedText($('.period'), Format.time(period()))

      debug.unprofile('paint')
    },
    tick: function() {
      debug.profile('tick')
      var currentTime = Date.now()
      var deltaTime = (currentTime - savedata.realTime) / 1000
      
      Object.values(resources).each('tick', deltaTime)

      resources.mana.value += Math.floor(resources.phase()) * gain()
      resources.phase.value %= 1

      save(currentTime)
      debug.unprofile('tick')
    }
  }
  result.paint()
  return result
}