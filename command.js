runChange = function(change, multiplier = 1) {
  Object.entries(change).forEach(c => resources[c[0]].value += c[1] * multiplier)
}

function command(id, change)
{
  var buttonGroup = $('.'+id)
  var less = buttonGroup.find('.less')
  var more = buttonGroup.find('.more')
  var buy = buttonGroup.find('.buy')



  var result = $.extend({
    zoom: 0,
    onZoomChanged: function(){},
    alwaysTop: false,
    run: function(zoom) {
      runChange(change(zoom))
    },
    check: function(zoom){
      var c = change(zoom)
      runChange(c)
      var result = Object.keys(c).every(r => resources[r].value >= 0)
      runChange(c, -1)
      return result
    },
    use: function() {
      if (!this.canUse()) {
        return
      }
      this.run(this.zoom)
    },
    canUse: function() {
      return this.check(this.zoom)
    },
    canZoomUp: function() {
      return true//this.check(this.zoom+1)
    },
    canZoomDown: function() {
      return this.zoom > 0
    },
    zoomUp: function() {
      if (this.canZoomUp()) {
        this.zoom += 1
        this.onZoomChanged()
      }
    },
    zoomDown: function() {
      if (this.canZoomDown()) {
        this.zoom -= 1
        this.onZoomChanged()
      }
    },
    adjust: function() {
      this.onZoomChanged()
      while (this.canZoomDown() && !this.canUse()) {
        this.zoom -= 1
      }
      if (this.alwaysTop) {
        while (this.canZoomUp()) {
          this.zoom += 1
        }
      }
    },
    switchAlwaysTop: function() {
      this.alwaysTop = !this.alwaysTop
    },
    cost: function(resource) {
      return -change(this.zoom)[resource]
    },
    reward: function() {
      return Object.values(change(this.zoom)).find(x => x > 0)
    },
    paint: function() {
      enable(less, this.canZoomDown())
      enable(more, this.canZoomUp())
      enable(buy, this.canUse())
      Object.entries(change(this.zoom)).forEach(c => {
        setFormattedText(buttonGroup.find('.#{0}'.i(c[0])), large(Math.abs(c[1])))
      })
    },
    save: function() {
      savedata[id] = {
        zoom: this.zoom
      }
    }
  }, {})
  
  buy.click(function() { result.use() })
  more.click(function() { result.zoomUp() })
  less.click(function() { result.zoomDown() })
  
  if (savedata[id] != undefined) {
    result.zoom = savedata[id].zoom
  }
  
  return result
}