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
    savedata.quests = quests.map(q => q.save())
    if (!!lastFailedQuest) {
      savedata.lastFailedQuest = lastFailedQuest.save()
    }
    savedata.realTime = timestamp || Date.now()
    localStorage[saveName] = JSON.stringify(savedata)
  } 
  
  wipeSave = function() {
    saveWiped = true
    localStorage.removeItem(saveName)
    location.reload()
  }
  
  startFarm = 1
  startFarmIncome = 0
  minIdleForQuest = 1
  strengthIdlePower = 1
  farmRewardIdlePower = 0
  farmReward = 1
  farmIncomeReward = 0
  questRewardMultiplier = 1
  questParams = {}

  var warrior = () => {}
  var trader = () => {
    startFarm = 10
    strengthIdlePower = 0
    farmRewardIdlePower = 1
  }
  var builder = () => {
    strengthIdlePower = 0
    farmReward = 0
    farmIncomeReward = 1
    startFarmIncome = 1
  }
  var assassin = () => {
    questParams = {
      unlocksIn: function() {
        return this.difficulty / resources.farm() - resources.idle()
      },
      deathChance: function() {
        return this.ready() ? 0 : 1
      }
    }
  }
  var rogue = () => {
    questParams = {
      activate: function() {
        resources.life.value -= this.deathChance()
        resources.level.value += 1
        if (resources.level() % 10 == 0) {
          resources.life.value += 1
        }
        if (resources.life.value <= 0) {
          resources.activeLife.value = 0
        }
        var farm = (1-this.deathChance()) * this.reward().farm
        resources.farm.value += farm * farmReward
        resources.farmIncome.value += farm * farmIncomeReward
      }
    }
  }

  warrior()

  refreshQuests = function() {
    if (!!quests) {
      quests.each('destroy')
    }
    quests = []
    for (var i = 0; i < 3; i++) {
      quests.push(quest(Object.assign({}, questParams)))
    }
    quests.each('paint')  
  }
  
  resources = {
    farm: variable(startFarm, 'farm', {formatter: large, incomeFormatter: x => noZero(signed(large(x)))}),
    farmIncome: variable(startFarmIncome, 'farmIncome', {formatter: large}),
    farmMultiplier: variable(1, 'farmMultiplier', {formatter: large}),
    time: variable(0, 'time', {formatter: Format.time}),
    level: variable(0, 'level', {formatter: large}),
    life: variable(3, 'life', {formatter: large}),
    activeLife: variable(1, 'activeLife'),
    idle: variable(1, 'idle'),
    lastDeathChance: variable(1, 'lastDeathChance', {formatter: x => Format.percent(x, 2)})
  }
  var resource = function(id, startValue) {
    resources[id] = variable(startValue, id)
    return resources[id]
  }
  itemTypes = []
  var item = function(id, name, action) {
    itemTypes.push(id)
    var result = resource(id, 0)
    result.name = name

    var button = instantiate('itemButtonSample')
    $('.items').append(button).append(' ')
    button.addClass(id)
    $('.btn.#{0}'.i(id)).click(() => {
      if (result() < 1) {
        return
      }
      result.value -= 1
      action()
    })
    return result
  }

  item('reroll', 'Reroll', () => {
    refreshQuests()
    resources.idle.value = 0
  })
  item('bubble', 'Bubble', () => {
    quests.forEach(q => {
      q.damage = 0
    })
  })
  item('doubleIdle', 'Charge', () => {
    resources.idle.value *= 2
  })
  item('doubleFarm', 'Training', () => {
    resources.farm.value *= 2
  })
  item('doubleRewards', 'Midas', () => {    
    quests.forEach(q => {
      if (q.reward.type == 'farm') {
        q.reward.amount *= 2
      }
    })
  })

  quests = []
  lastFailedQuest = null

  resources.farm.income = resources.farmIncome
  
  revive = function() {
    if (resources.life() < 1) {
      return
    }
    resources.activeLife.value += 1
  }
  
  $("body").keydown(e => {
    if (resources.activeLife() == 1) {
      if (e.key == "ArrowLeft") {
        quests[0].choose();
      } else if (e.key == "ArrowUp") {
        quests[1].choose();
      } else if (e.key == "ArrowRight") {
        quests[2].choose();
      }
    } else {
      if (e.key == "ArrowUp") {
        revive()
      }
    }
    if (e.key == "R") {
      wipeSave()
    }
  })
  
  if (!!savedata.quests) {
    quests = savedata.quests.map(q => quest(Object.assign({}, q, questParams)))
  } else {
    refreshQuests()
  }
  if (!!savedata.lastFailedQuest) {
    lastFailedQuest = quest(Object.assign({}, savedata.lastFailedQuest, questParams, {instantiate: false}))
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
      if (!!lastFailedQuest) {
        setFormattedText($('.fail'), lastFailedQuest.failText())
        setFormattedText($('.failed'), lastFailedQuest.failedText())
        setFormattedText($('.continue'), lastFailedQuest.continueText())
      }

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
  result.paint()
  return result
}