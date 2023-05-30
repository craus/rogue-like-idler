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

  var character = function(params) {
    var result = params
    result = Object.assign({
      paint: function() {

      }
    }, params)
    return result
  }

  Characters = {
    warrior: character({
      name: "Warrior",
      load: () => {}
    }),
    trader: character({
      name: "Trader",
      load: () => {
        startFarm = 10
        strengthIdlePower = 0
        farmRewardIdlePower = 1
      }
    }),
    builder: character({
      name: "Builder",
      load: () => {
        strengthIdlePower = 0
        farmReward = 0
        farmIncomeReward = 1
        startFarmIncome = 1
      }      
    }),
    assassin: character({
      name: "Assassin",
      load: () => {
        questParams = {
          unlocksIn: function() {
            return 9 * this.farmCheck.difficulty / resources.farm() - resources.idle()
          },
          deathChance: function() {
            return this.ready() ? 0 : 1
          }
        }        
      }
    }),
    rogue: character({
      name: "Rogue",
      load: () => {
        questParams = {
          activate: function() {
            resources.life.value -= this.damage * this.deathChance()
            this.lastDamage = this.damage * this.deathChance()
            resources.lastDeathChance.value = this.deathChance()

            resources.level.change(x => x+1)

            if (resources.life.value <= 0) {
              resources.activeLife.value = 0
            }

            this.reward.get(1-this.deathChance())

            resources.idle.reset()
            refreshQuests()
          }
        }        
      }
    }),
    reverter: character({
      name: "Reverter",
      levelLostWhenDead: 1,
      load: () => {
        questParams = {
          lose: function() {
            resources.activeLife.value -= 1
            resources.lastDeathChance.value = this.deathChance()
            lastFailedQuest = this
          }
        }
        window.revive = function() {
          resources.activeLife.value += 1
          loadCheckpoint(resources.level()-Characters.reverter.levelLostWhenDead)
        }        
      },
      paint: function() {
        $('.panel-life').toggle(false)
        $('.panel-level').toggleClass('col-sm-2', false)
        $('.panel-level').toggleClass('col-sm-4', true)
      }
    }),
    noidler: character({
      name: "Noidler",
      after: () => {
        resources.idle.income = () => 0
        onLevelGot.listeners.push(level => {
          if (level % 1 == 0) {
            resources.energy.change(x => x + 6)
          }
        })    
      },
      load: () => {
        startIdleValue = () => 1
        startEnergy = 100   
      }
    }),
  }

  currentCharacter = Characters.builder
}