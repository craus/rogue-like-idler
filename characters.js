function characters() {
  startFarm = 1
  startFarmIncome = 0
  strengthIdlePower = 1
  farmRewardIdlePower = 0
  farmReward = 1
  farmIncomeReward = 0
  questRewardMultiplier = 1
  questParams = {}
  startIdleValue = () => 0

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
  var noidler = () => {
    startIdleValue = () => 1
  }
  noidler.after = () => {
    resources.idle.income = () => 0
  }
  currentCharacter = noidler
}