"use strict"

var checkpointsModule = function() {
  window.checkpoints = savedata.checkpoints

  window.saveLevelCheckpoint = function() {
    checkpoints[resources.level()] = {
      level: resources.level(),
      farm: resources.farm()
    }
  }
  window.loadCheckpoint = function(key) {
    if (checkpoints[key] == undefined) {
      if (key == 0) {
        return
      }
      loadCheckpoint(0)
      return
    }
    var checkpoint = checkpoints[key]
    resources.level.value = checkpoint.level
    resources.farm.value = checkpoint.farm
  }  
  
  if (checkpoints == undefined) {
    checkpoints = {}
    saveLevelCheckpoint()
  }
}