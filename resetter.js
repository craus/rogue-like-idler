"use strict"

var resetter = function(params) {
  params = Object.assign({
    id: "anyResetter",
    resource: 'life',
    every: 100,
  }, params)

  onLevelGot.listeners.push(level => {
    if (level % params.every == 0) {
      resources[params.resource].change(x => params.value)
    }
  })

  var result = Object.assign({
    remains: function() {
      return this.every - resources.level() % this.every
    },
    nextTrigger: function() {
      return resources.level() + this.remains()
    },
    paint: function() {
      setFormattedText($('.#{0}.value, .#{0} .value'.i(this.id)), this.value)
      setFormattedText($('.#{0}.resource, .#{0} .resource'.i(this.id)), this.resource)
      setFormattedText($('.#{0}.remains, .#{0} .remains'.i(this.id)), this.remains())
      setFormattedText($('.#{0}.nextTrigger, .#{0} .nextTrigger'.i(this.id)), this.nextTrigger())
    }
  }, params)

  resetters.push(result)
  return result
}