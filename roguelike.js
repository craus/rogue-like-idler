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
  
  $("body").keydown(e => {
    if (e.key == "ArrowLeft") {
      markets[0].discard();
    } else if (e.key == "ArrowRight") {
      markets[0].choose();
    }
    if (e.originalEvent.code == "KeyR" && e.shiftKey) {
      wipeSave()
    }
  })

  const x = new Decimal(123.4567)
  console.log(x)

  var levelDuration = () => 3 * Math.pow(1.1, resources.level())
  var winrate = () => 0.5 + 0.5 * (Math.sin(resources.level()) * 100 % 1)
  var reward = () => 10 * Math.pow(1.2, resources.level())

  var completeLevel = () => {
    resources.levelTime.value -= levelDuration()
    if (Math.random() < winrate()) {
      resources.money.value += reward()
      resources.level.value += 1
    } else {
      resources.life.value -= 1
      if (resources.life() <= 0) {
        resources.life.value = resources.maxLife()
        resources.level.value = 0
      }
    }
  }

  var result = {
    paint: function() {
      debug.profile('paint')
      
      Object.values(resources).each('paint')

      setFormattedText($('.levelDuration'), large(levelDuration()))
      setFormattedText($('.reward'), large(reward()))
      setFormattedText($('.winrate'), large(winrate() * 100) + '%')

      debug.unprofile('paint')
    },
    tick: function() {
      debug.profile('tick')
      var currentTime = Date.now()
      var deltaTime = (currentTime - savedata.realTime) / 1000
      
      Object.values(resources).each('tick', deltaTime)

      console.log(deltaTime)

      resources.levelTime.value += deltaTime
      while (resources.levelTime() >= levelDuration()) completeLevel()
      
      save(currentTime)
      debug.unprofile('tick')
    }
  }
  result.paint()
  return result
}