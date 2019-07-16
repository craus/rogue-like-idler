"use strict"

var resetters = []

var resources = function() {
  window.farmTypes = []
  var farmResource = function(name) {
    farmTypes.push(name)
    return variable(startFarm, name, {formatter: large, incomeFormatter: x => noZero(signed(large(x)))})
  }
  resources = {
    farm: farmResource('farm'),
    //nearm: farmResource('nearm'),
    farmIncome: variable(startFarmIncome, 'farmIncome', {formatter: large}),
    farmMultiplier: variable(1, 'farmMultiplier', {formatter: large}),
    time: variable(0, 'time', {formatter: Format.time}),
    lifetime: variable(30, 'lifetime', {name: 'time', formatter: Format.time}),
    level: variable(0, 'level', {formatter: large}),
    maxLevel: variable(0, 'maxLevel'),
    life: variable(5, 'life', {formatter: large, maxValue: 20, name: 'extra life'}),
    activeLife: variable(1, 'activeLife'),
    activeTheft: variable(0, 'activeTheft'),
    idle: variable(startIdleValue(), 'idle', {
      reset: function() {
        this.value = startIdleValue()
      }
    }),
    energy: variable(startEnergy, 'energy'),
    lastDeathChance: variable(1, 'lastDeathChance', {formatter: x => Format.percent(x, 2)}),
    lastCommandMoment: variable(-Number.MAX_VALUE, 'lastCommandMoment')
  } 

  resources.time.income = () => 1
  resources.lifetime.income = () => -1

  // var oldTick = resources.lifetime.tick
  // resources.lifetime.tick = function(deltaTime) {
  //   oldTick.call(this, deltaTime)
  //   if (this.value <= 0) {
  //     resources.life.value = resources.activeLife.value = 0
  //   }
  // }

  window.resetPower = function() {
    resources.lifetime.value += resources.idle()
    resources.idle.value = 0
  }

  resources.lifetime.inherit('tick', function(sup, deltaTime) {
    sup(deltaTime)
    if (this.value <= 0) {
      resetPower()
    }
  })

  resources.farm.income = resources.farmIncome
  resources.idle.income = () => 1
  window.controlsLocked = () => resources.time() < resources.lastCommandMoment() + 1
  window.onCommand = () => resources.lastCommandMoment.value = resources.time()

  resources.level.change.after.push((from, to) => {
    resources.maxLevel.change(x => Math.max(x, to))
  })

  window.onLevelGot = Object.assign(function(level) {
    onLevelGot.listeners.forEach(l => l(level))
  }, {
    listeners: []
  })

  onLevelGot.listeners.push(level => {
    if (level % 10 == 0) {
      resources.life.change(x => x + 1)
    }
  })

  onLevelGot.listeners.push(level => {
    if (level % 1 == 0) {
      resources.lifetime.change(x => x + 6)
    }
  })

  resetter({
    id: 'lifeReset',
    resource: 'life',
    value: 5,
    every: 71
  })

  resources.maxLevel.change.after.push((from, to) => {
    for (var i = from+1; i <= to; i++) {
      onLevelGot(i)
    }
  })
}