function items() {
  theftMode = function() {
    return resources.activeTheft() > 0
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
    result.maxValue = 3

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
    resources.idle.reset()
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
  item('shortcut', 'Shortcut', () => {
    resources.level.value += 5
    refreshQuests()
    resources.idle.reset()
  })
  item('backdoor', 'Backdoor', () => {
    resources.level.value -= 5
    refreshQuests()
    resources.idle.reset()
  })
  item('shrink', 'Shrink', () => {
    quests.forEach(q => {
      if (q.reward.type == 'farm') {
        q.reward.amount /= 10
        q.difficulty /= 10
      }
    })
  })
  item('enlarge', 'Enlarge', () => {
    quests.forEach(q => {
      if (q.reward.type == 'farm') {
        q.reward.amount *= 10
        q.difficulty *= 10
      }
    })
  })
  item('theft', 'Theft', () => {
    resources.activeTheft.value = 1
  })
}