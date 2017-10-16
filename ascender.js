function createAscender(params) {
  
  // Rules common things
    
  var gameName = "spellcaster"
  var saveName = gameName+"SaveData"

  if (localStorage[saveName] != undefined) {
    savedata = JSON.parse(localStorage[saveName])
  } else {
    savedata = {
      realTime: new Date().getTime()
    }
  }
  console.log("loaded " + gameName + " save: ", savedata)
  
  var saveWiped = false
  
  var save = function(timestamp) {
    if (saveWiped) {
      return
    }
    savedata = {}
    allResources.forEach(function(resource) {
      savedata[resource.id] = resource.value
    })
    savedata.idleTime = idleTime.value
    savedata.realTime = timestamp || Date.now()
    localStorage[saveName] = JSON.stringify(savedata)
  } 
  
  wipeSave = function() {
    saveWiped = true
    localStorage.removeItem(saveName)
    location.reload()
  }
  
  var level

  
  incomeMultipliers = []
  var time = variable(0, 'time', 'Time')
  var idleTime = variable(0, 'idleTime', 'Idle time')
  var actionPoints = variable(10, 'actionPoints', 'Action points', {
    formatter: (x) => x.toFixed(2)
  })
  var money = variable(1, 'money')

  resources = [
    money
  ]
  
  for (var i = 1; i < 100; i++) {

    var resource = createAscendResource(i, resources, () => level, idleTime, actionPoints)
    resources.push(resource)
    incomeMultipliers.push(resource)
  }

  allResources = resources.concat([
    idleTime, 
    actionPoints,
    time
  ])

  var idleMultiplier = calculatable(() => Math.floor(Math.pow(idleTime.get(), Math.log(idleTime.get()+1)/5)))
  
  income = calculatable(() => {
    return incomeMultipliers.reduce((acc, im) => acc * im.get(), 1) * 0.5
  })
  
  ascender = {
    paint: function() {
      debug.profile('paint')
      
      allResources.each('paint')
      
      for (var i = resources.length-1; i >= 0; i--) {
        if (resources[i].get() > 1) {
          level = i
          break
        }
      }

      setFormattedText($('.moneyIncome'), large((income.get())))
      setFormattedText($('.idleMultiplier'), large((idleMultiplier.get())))

      debug.unprofile('paint')
    },
    tick: function() {
      debug.profile('tick')
      var currentTime = Date.now()
      var deltaTime = (currentTime - savedata.realTime) / 1000
      
      money.value += income.get() * deltaTime
      idleTime.value += deltaTime
      time.value += deltaTime
      actionPoints.value += deltaTime / 100
      
      save(currentTime)
      debug.unprofile('tick')
    }
  }
  return ascender
}