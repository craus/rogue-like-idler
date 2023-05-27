function characters() {
  startFarm = 1
  startNearm = 1
  startEnergy = 0
  startFarmIncome = 0
  strengthIdlePower = 1
  farmRewardIdlePower = 0
  farmReward = 1
  farmIncomeReward = 0
  questRewardMultiplier = 1
  questParams = {}
  startIdleValue = () => 0

  Characters = {}

  Characters.warrior = () => {}
  Characters.trader = () => {
    startFarm = 10
    strengthIdlePower = 0
    farmRewardIdlePower = 1
  }
  Characters.builder = () => {
    strengthIdlePower = 0
    farmReward = 0
    farmIncomeReward = 1
    startFarmIncome = 1
  }
  Characters.assassin = () => {
    questParams = {
      unlocksIn: function() {
        return this.farmCheck.difficulty / resources.farm() - resources.idle()
      },
      deathChance: function() {
        return this.ready() ? 0 : 1
      }
    }
  }
  Characters.rogue = () => {
    questParams = {
      activate: function() {
        resources.life.value -= this.damage * this.deathChance()
        this.lastDamage = this.damage * this.deathChance()
        resources.lastDeathChance.value = this.deathChance()

        resources.level.change(x => x+1)

        if (resources.level() % 10 == 0) {
          resources.life.value += 1
        }
        if (resources.life.value <= 0) {
          resources.activeLife.value = 0
        }
        var farm = (1-this.deathChance()) * this.reward().farm
        resources.farm.value += farm * farmReward
        resources.farmIncome.value += farm * farmIncomeReward

        resources.idle.reset()
        refreshQuests()
      }
    }
  }
  Characters.reverter = () => {
    questParams = {
      activate: function() {
        if (this.win()) {
          resources.level.change(x => x+1)
          this.reward.get()
        } else {
          resources.activeLife.value -= 1
          resources.lastDeathChance.value = this.deathChance()
          lastFailedQuest = this
        }
        resources.idle.reset()
        refreshQuests()
      }
    }
  }
  Characters.noidler = () => {
    startIdleValue = () => 1
    startEnergy = 100
  }
  Characters.noidler.after = () => {
    resources.idle.income = () => 0
    onLevelGot.listeners.push(level => {
      if (level % 1 == 0) {
        resources.energy.change(x => x + 6)
      }
    })    
  }
  currentCharacter = Characters.trader

}