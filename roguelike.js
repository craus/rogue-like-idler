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
    multipliers.forEach(m => m.save())
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

  var workersAmount = () => 
    multipliers.reduce((total, cur) => total * Math.pow(cur.workersAmountMultiplier, cur.amount), 1)

  var workersPrice = () => 
    multipliers.reduce((total, cur) => total * Math.pow(cur.workersPriceMultiplier, cur.amount), 1000)

  var workersCost = () => workersPrice() / resources.idle()

  $('.buyWorkers').click(() => {
    resources.money.value -= workersCost()
    resources.workers.value += workersAmount()
    resources.idle.value = 0
  })

  var multipliers = [
    multiplier(2e3, 3e3),
    multiplier(2e5, 3e5),
    multiplier(2e22, 3e22),
    multiplier(2e97, 3e97),
    multiplier(2e239, 3e239),
  ]

  var result = {
    paint: function() {
      debug.profile('paint')
      
      Object.values(resources).each('paint')

      setFormattedText($('.workersAmount'), large(workersAmount()))
      setFormattedText($('.workersPrice'), large(workersPrice()))
      setFormattedText($('.workersCost'), large(workersCost()))

      $('.buyWorkers').toggleClass('disabled', resources.money() < workersCost())

      debug.unprofile('paint')
    },
    tick: function() {
      debug.profile('tick')
      var currentTime = Date.now()
      var deltaTime = (currentTime - savedata.realTime) / 1000
      
      Object.values(resources).each('tick', deltaTime)
      multipliers.each('paint')
      
      save(currentTime)
      debug.unprofile('tick')
    }
  }
  result.paint()
  return result
}