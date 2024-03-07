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

  resources()

  var result = {
    paint: function() {
      debug.profile('paint')
      
      Object.values(resources).each('paint')
      Object.values(stores).each('paint')

      debug.unprofile('paint')
    },
    tick: function() {
      debug.profile('tick')
      var currentTime = Date.now()
      var deltaTime = (currentTime - savedata.realTime) / 1000
      
      Object.values(resources).each('tick', deltaTime)
      
      save(currentTime)
      debug.unprofile('tick')
    }
  }
  result.paint()
  return result
}