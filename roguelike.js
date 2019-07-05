function createRoguelike(params) {
  
  // Rules common things
    
  var gameName = "roguelike"
  var saveName = gameName+"SaveData"

  if (localStorage[saveName] != undefined) {
    savedata = JSON.parse(localStorage[saveName])
  } else {
    savedata = {
      realTime: new Date().getTime()
    }
  }
  loadedSave = savedata
  console.log("loaded " + gameName + " save: ", savedata)
  
  var saveWiped = false
  
  var save = function(timestamp) {
    if (saveWiped) {
      return
    }
    savedata = {} 
    Object.values(resources).forEach(function(resource) {
      savedata[resource.id] = resource.value
    })
    savedata.quests = []
    quests.each('save')
    savedata.realTime = timestamp || Date.now()
    localStorage[saveName] = JSON.stringify(savedata)
  } 
  
  wipeSave = function() {
    saveWiped = true
    localStorage.removeItem(saveName)
    location.reload()
  }
  
  minIdleForQuest = 1
  strengthIdlePower = 1
  farmRewardIdlePower = 0
  farmReward = 1
  farmIncomeReward = 0
  questRewardMultiplier = 1
  
  resources = {
    farm: variable(1, 'farm', {formatter: large, incomeFormatter: x => noZero(signed(large(x)))}),
    farmIncome: variable(0, 'farmIncome', {formatter: large}),
    farmMultiplier: variable(1, 'farmMultiplier', {formatter: large}),
    time: variable(0, 'time', {formatter: Format.time}),
    level: variable(0, 'level'),
    life: variable(3, 'life'),
    activeLife: variable(1, 'activeLife'),
    idle: variable(1, 'idle'),
    lastDeathChance: variable(1, 'lastDeathChance', {formatter: x => Format.percent(x, 2)})
  }
  quests = []

  resources.farm.income = resources.farmIncome
  
  revive = function() {
    resources.activeLife.value += 1
  }
  
  refreshQuests = function() {
    if (!!quests) {
      quests.each('destroy')
    }
    quests = []
    for (var i = 0; i < 3; i++) {
      console.log("quest", i)
      quests.push(quest())
    }
  }
  
  if (!!savedata.quests) {
    quests = savedata.quests.map(q => quest(q))
  } else {
    refreshQuests()
  }
  
  result = {
    paint: function() {
      debug.profile('paint')
      
      Object.values(resources).each('paint')
      $('.alive').toggle(resources.activeLife() > 0)
      $('.dead').toggle(resources.activeLife() <= 0)
      $('.lifePositive').toggle(resources.life() > 0)
      $('.lifeNonPositive').toggle(resources.life() <= 0)
      
      $('.idle').toggle(farmIncomeReward == 0)
      $('.idle2').toggle(farmIncomeReward != 0)
      
      setFormattedText($('.idle2'), Math.round(resources.farm() / resources.farmIncome()))
      
      $('.panel-life').toggleClass('panel-danger', resources.life() <= 1)
      $('.panel-life').toggleClass('panel-primary', resources.life() > 1)
      
      $('.panel-idle').toggleClass('panel-warning', resources.idle() <= minIdleForQuest)
      $('.panel-idle').toggleClass('panel-primary', resources.idle() > minIdleForQuest)
      
      var showFarmMultiplier = resources.farmMultiplier() > 1
      
      $('.farmColumn').toggleClass('col-sm-3', showFarmMultiplier)
      $('.farmColumn').toggleClass('col-sm-4', !showFarmMultiplier)
      $('.farmMultiplierColumn').toggle(showFarmMultiplier)
      $('.idleColumn').toggleClass('col-sm-2', showFarmMultiplier)
      $('.idleColumn').toggleClass('col-sm-4', !showFarmMultiplier)
      
      quests.each('paint')

      debug.unprofile('paint')
    },
    tick: function() {
      debug.profile('tick')
      var currentTime = Date.now()
      var deltaTime = (currentTime - savedata.realTime) / 1000
      
      resources.idle.value += deltaTime
      if (resources.activeLife() < 1) {
        resources.idle.value = 0
      }
      resources.time.value += deltaTime

      Object.values(resources).each('tick', deltaTime)
      
      save(currentTime)
      debug.unprofile('tick')
    }
  }
  return result
}