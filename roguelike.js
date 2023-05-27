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
    savedata.quests = quests.map(q => q.save())
    savedata.checkpoints = checkpoints
    if (!!lastFailedQuest) {
      savedata.lastFailedQuest = lastFailedQuest.save()
    }
    savedata.realTime = timestamp || Date.now()
    localStorage[saveName] = JSON.stringify(savedata)
  } 
  
  window.wipeSave = function() {
    saveWiped = true
    localStorage.removeItem(saveName)
    location.reload()
  }
  
  window.refreshQuests = function() {
    if (!!quests) {
      quests.each('destroy')
    }
    quests = []
    for (var i = 0; i < 3; i++) {
      quests.push(quest(Object.assign({}, questParams)))
    }
    quests.each('paint')  
  }

  window.revive = function() {
    if (resources.life() < 1) {
      return
    }
    resources.activeLife.value += 1
  }
  
  characters()
  currentCharacter()
  resources()
  items()
  checkpointsModule()
  
  if (!!currentCharacter.after) {
    currentCharacter.after()
  }
  
  window.quests = []
  window.lastFailedQuest = null
  
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
    if (e.key == "ArrowDown") {
      resetPower()
    }
    if (e.originalEvent.code == "KeyR" && e.shiftKey) {
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

  $('.power').each(function() {
    $(this).click(() => {
      var value = $(this).data('value')
      if (resources.energy() < value) {
        return
      }
      resources.energy.value -= value
      resources.idle.value += value
    })
  })

  var result = {
    paint: function() {
      debug.profile('paint')
      
      Object.values(resources).each('paint')
      resetters.each('paint')

      $('.alive').toggle(resources.activeLife() > 0)
      $('.dead').toggle(resources.activeLife() <= 0)
      $('.lifePositive').toggle(resources.life() > 0)
      $('.lifeNonPositive').toggle(resources.life() <= 0)
      
      $('.idle').toggle(farmIncomeReward == 0)
      $('.idle2').toggle(farmIncomeReward != 0)
      
      setFormattedText($('.idle2'), Math.round(resources.farm() / resources.farmIncome()))
      
      $('.panel-life').toggleClass('panel-danger', resources.life() <= 1)
      $('.panel-life').toggleClass('panel-primary', resources.life() > 1)
      
      $('.lockWarn').toggleClass('panel-warning', controlsLocked())
      $('.lockWarn').toggleClass('panel-primary', !controlsLocked())
      
      var showFarmMultiplier = resources.farmMultiplier() > 1
      var showEnergy = resources.energy() > 0
      var showLifetime = resources.lifetime.income() != 0
      
      $('.farmColumn').toggleClass('col-sm-3', showFarmMultiplier)
      $('.farmColumn').toggleClass('col-sm-4', !showFarmMultiplier)
      $('.farmMultiplierColumn').toggle(showFarmMultiplier)

      $('.lifetimeColumn').toggle(showLifetime)
      $('.energyColumn').toggle(showEnergy)
      var shortIdleColumn = showFarmMultiplier || showEnergy || showLifetime
      $('.idleColumn').toggleClass('col-sm-2', shortIdleColumn)
      $('.idleColumn').toggleClass('col-sm-4', !shortIdleColumn)

      $('.reverterOnly').toggle(currentCharacter == Characters.reverter)
      $('.nonReverterOnly').toggle(currentCharacter != Characters.reverter)
      
      setFormattedText($('.idle2'), Math.round(resources.farm() / resources.farmIncome()))
      
      setFormattedText($('.revertLevelsOnFail'), Characters.reverter.levelLostWhenDead)

      $('.row.energy').toggle(resources.energy() > 0)
      $('.power').each(function() {
        $(this).toggleClass('disabled', resources.energy() < $(this).data('value'))
        setFormattedText($(".value", this), $(this).data('value'))
      })
      
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
      
      if (resources.activeLife() < 1) {
        resources.idle.reset()
      }

      Object.values(resources).each('tick', deltaTime)
      
      save(currentTime)
      debug.unprofile('tick')
    }
  }
  result.paint()
  return result
}