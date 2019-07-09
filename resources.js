resources = function() {
  resources = {
    farm: variable(startFarm, 'farm', {formatter: large, incomeFormatter: x => noZero(signed(large(x)))}),
    farmIncome: variable(startFarmIncome, 'farmIncome', {formatter: large}),
    farmMultiplier: variable(1, 'farmMultiplier', {formatter: large}),
    time: variable(0, 'time', {formatter: Format.time}),
    level: variable(0, 'level', {formatter: large}),
    life: variable(3, 'life', {formatter: large, maxValue: 10, name: 'extra life'}),
    activeLife: variable(1, 'activeLife'),
    activeTheft: variable(0, 'activeTheft'),
    idle: variable(startIdleValue(), 'idle', {
      reset: function() {
        this.value = startIdleValue()
      }
    }),
    energy: variable(100, 'energy'),
    lastDeathChance: variable(1, 'lastDeathChance', {formatter: x => Format.percent(x, 2)}),
    lastCommandMoment: variable(-Number.MAX_VALUE, 'lastCommandMoment')
  } 
  resources.time.income = () => 1
  resources.farm.income = resources.farmIncome
  resources.idle.income = () => 1
  controlsLocked = () => resources.time() < resources.lastCommandMoment() + 1
  onCommand = () => resources.lastCommandMoment.value = resources.time()
}