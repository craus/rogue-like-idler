function createCivilization(params) {
  
  // Rules common things
    
  var gameName = "civilization"
  var saveName = gameName+"SaveData"

  if (localStorage[saveName] != undefined) {
    savedata = JSON.parse(localStorage[saveName])
  } else {
    savedata = {
      realTime: new Date().getTime()
    }
  }
  console.log("loaded " + gameName + " save: ", savedata)
  
  var saveWiped = false
  
  var save = function(timestamp) {
    if (saveWiped) {
      return
    }
    savedata = {} 
    Object.values(resources).forEach(function(resource) {
      savedata[resource.id] = resource.value
    })
    Object.values(techs).forEach(function(resource) {
      savedata[resource.id] = resource.value
    })
    Object.values(commands).each('save')
    savedata.activeTab = $('.sections>.active>a').attr('href')
    savedata.activeTechTab = $('.techs>.active>a').attr('href')
    savedata.activeTechTab = $('.areas>.active>a').attr('href')
    savedata.realTime = timestamp || Date.now()
    localStorage[saveName] = JSON.stringify(savedata)
  } 
  
  wipeSave = function() {
    saveWiped = true
    localStorage.removeItem(saveName)
    location.reload()
  }
  resources = {
    time: variable(0, 'time', {formatter: Format.time}),
    money: variable(0, 'money'),
    population: variable(1, 'population'),
    science: variable(0, 'science'),
    totalTech: variable(0, 'totalTech'),
    tech: variable(0, 'tech'),
    minerals: variable(0, 'minerals'),
    farms: variable(0, 'farms'),
    mines: variable(0, 'mines'),
    marketplaces: variable(0, 'marketplaces'),
    labs: variable(0, 'labs'),
    scientists: variable(0, 'scientists'),
    cranes: variable(0, 'cranes'),
    cranesFarms: variable(0, 'cranesFarms'),
    cranesMines: variable(0, 'cranesMines'),
    cranesMarketplaces: variable(0, 'cranesMarketplaces'),
    cranesLabs: variable(0, 'cranesLabs'),
    cranesUniversities: variable(0, 'cranesUniversities'),
    cranesBarracks: variable(0, 'cranesBarracks'),
    cranesFactories: variable(0, 'cranesFactories'),
    cranesCircuses: variable(0, 'cranesCircuses'),
    tractors: variable(0, 'tractors'),
    excavators: variable(0, 'excavators'),
    cashMachines: variable(0, 'cashMachines'),
    panzers: variable(0, 'panzers'),
    soldiers: variable(0, 'soldiers'),
    warpower: variable(0, 'warpower'),
    conquests: variable(0, 'conquests'),
    conquestCost: variable(100, 'conquestCost'),
    planes: variable(0, 'planes'),
    swamps: variable(0, 'swamps'),
    mountains: variable(0, 'mountains'),
    forests: variable(0, 'forests'),
    islands: variable(0, 'islands'),
    happiness: variable(0, 'happiness'),
    circuses: variable(0, 'circuses'),
    universities: variable(0, 'universities'),
    barracks: variable(0, 'barracks'),
    factories: variable(0, 'factories'),
    factoriesCranes: variable(0, 'factoriesCranes'),
    factoriesTractors: variable(0, 'factoriesTractors'),
    factoriesExcavators: variable(0, 'factoriesExcavators'),
    factoriesCashMachines: variable(0, 'factoriesCashMachines'),
    factoriesPanzers: variable(0, 'factoriesPanzers'),
    commands: variable(10, 'commands', {formatter: x => x.toFixed(2)})
  }
  areas = {
    planes: resources.planes,
    swamps: resources.swamps,
    mountains: resources.mountains,
    forests: resources.forests,
    islands: resources.islands,
  }
  techs = {
    minerals: tech(0, 'mineralsTech'),
    farms: tech(0, 'farmsTech'),
    mines: tech(0, 'minesTech'),
    marketplaces: tech(0, 'marketplacesTech'),
    labs: tech(0, 'labsTech'),
    military: tech(0, 'militaryTech'),
    happiness: tech(0, 'happinessTech'),
    circuses: tech(0, 'circusesTech'),
    barracks: tech(0, 'barracksTech'),
  }
  techs.farms.require(techs.minerals)
  techs.mines.require(techs.minerals)
  techs.marketplaces.require(techs.minerals)
  techs.labs.require(techs.minerals)
  techs.circuses.require(techs.happiness)
  techs.circuses.require(techs.minerals)
  resources.science.income = (() => 
    resources.scientists() *
    (1+resources.labs()) *
    (1+resources.happiness()) *
    (Math.pow(10, resources.islands()))
  ) 
  resources.warpower.income = (() => 
    resources.soldiers() *
    (1+resources.panzers())
  )
  resources.money.income = (() => 
    resources.population() *
    (1+resources.marketplaces()) *
    (1+resources.happiness()) *
    (Math.pow(10, resources.forests()))
  )
  resources.minerals.income = (() => 
    techs.minerals() * 
    resources.population() *
    (1+resources.mines()) *
    (1+resources.happiness()) *
    (Math.pow(10, resources.mountains()))
  )  
  resources.happiness.income = (() => 
    resources.circuses()
  )
  resources.warpower.income = (() => 
    resources.soldiers() *
    (1+resources.panzers())
  )
  resources.population.income = (() => 
    resources.farms() *
    (1+resources.tractors()) *
    (Math.pow(10, resources.planes()))
  )
  resources.time.income = (() => 1)
  
  techCost = (() => Math.pow(100, resources.totalTech()+1))
  conquestPenalty = (() => 100*Math.pow(0.5, resources.swamps()) + 2 - Math.pow(2, 1-resources.swamps()))

  array = ((a, k, z) => a[Math.min(z,a.length-1)]*Math.pow(k,Math.max(0, z-a.length+1)))
  var prod = ((a) => {
    for (var i = 1; i < a.length; i++) {
      a[i] *= a[i-1]
    }
    return a
  })
  var div = ((a) => {
    var b = []
    for (var i = 1; i < a.length; i++) {
      b.push(a[i]/a[i-1])
    }
    return b
  })
  
  var powerSlopes = [
    [],
    div([1,10]),
    div([1,3,10]),
    div([1,2,5,10]),
    div([1,2,3,5,10]),
    div([1,2,3,5,7,10]),
    div([10,15,20,30,50,70,100]),
  ]
  
  var frac = ((x,y) => {
    var res = [1]
    var cur = 1
    var index = 0
    for (var i = 0; i < y; i++) {
      for (var j = 0; j < x; j++) {
        cur *= powerSlopes[y][index]
        index = (index+1)%y
      }
      res.push(cur)
    }
    return div(res)
  })
  
  var arc = function(p) {
    return Math.floor(round(Math.pow(10, p), 2))
  }
  
  commands = {
    hireScientists: command('hireScientists', z => ({
      commands: -1,
      money: -Math.pow(10, z),
      scientists: +arc(0.813*Math.pow(z, 0.9))
    })),
    hireSoldiers: command('hireSoldiers', z => ({
      commands: -1,
      money: -Math.pow(10, z),
      soldiers: +arc(2*Math.pow(z, 0.5))
    })),
    buildHouses: command('buildHouses', z => ({
      commands: -1,
      minerals: -10*Math.pow(10, z),
      population: +arc(0.774*Math.pow(z, 0.8))
    })),
    buildFarms: command('buildFarms', z => ({
      commands: -1,
      minerals: -1e4*Math.pow(10, z),
      farms: +arc(0.87*Math.pow(z, 0.6))
    })),
    organizeCelebrations: command('organizeCelebrations', z => ({
      commands: -1,
      money: -100*Math.pow(10, z),
      happiness: +arc(0.421*Math.pow(z, 0.7))
    })),
    buildCircuses: command('buildCircuses', z => ({
      commands: -1,
      minerals: -10*Math.pow(10, z),
      circuses: +Math.floor(arc(0.583*Math.pow(z, 0.6)))
    })),
    buildMines: command('buildMines', z => ({
      commands: -1,
      minerals: -10*Math.pow(10, z),
      mines: +arc(0.574*Math.pow(z, 0.7))
    })),
    buildMarketplaces: command('buildMarketplaces', z => ({
      commands: -1,
      minerals: -10*Math.pow(10, z),
      marketplaces: +arc(0.574*Math.pow(z, 0.75))
    })),
    buildLabs: command('buildLabs', z => ({
      commands: -1,
      minerals: -10*Math.pow(10, z),
      labs: +arc(0.574*Math.pow(z, 0.6))
    }))
  }
  
  Object.values(techs).forEach(function(t) {
    $('.#{0} .pick'.i(t.id)).click(() => {
      if (t.value != 1 && resources.tech.value >= 1) {
        t.value = 1
        resources.tech.value -= 1
      }
    })
  })
  Object.values(areas).forEach(function(area) {
    $('.#{0}Conquest .conquest'.i(area.id)).click(() => {
      if (resources.conquests.value >= 1) {
        area.value += 1
        resources.conquests.value -= 1
      }
    })
  })
  
  savedata.activeTab = savedata.activeTab || '#population'
  
  $('a[href="' + savedata.activeTab + '"]').tab('show')
  $('a[href="' + savedata.activeTechTab + '"]').tab('show')
  $('a[href="' + savedata.activeAreaTab + '"]').tab('show')
  
  civilization = {
    paint: function() {
      debug.profile('paint')
      
      Object.values(resources).each('paint')
      Object.values(techs).each('paint')
      Object.values(commands).each('paint')
      setFormattedText($('.populationIncome'), noZero(signed(0)))
      setFormattedText($('.techCost'), large(techCost()))
      setFormattedText($('.conquestPenalty'), large(conquestPenalty()))
      setFormattedText($('.sciencePercent'), '#{0}%'.i((resources.science() / techCost()*100).toFixed(2)))      
      setFormattedText($('.conquestPercent'), '#{0}%'.i((resources.warpower() / resources.conquestCost()*100).toFixed(2)))
      $('.populationTab').toggle(techs.minerals()>0)
      $('.happinessTab').toggle(techs.happiness()>0)
      $('.industryTab').toggle(techs.mines()>0)
      $('.economyTab').toggle(techs.marketplaces()>0)
      $('.militaryTab').toggle(techs.military()>0)
      $('.conquestsTab').toggle(techs.military()>0)
      $('.techTab').toggle(resources.totalTech()>0)

      debug.unprofile('paint')
    },
    tick: function() {
      if (resources.conquestCost.value < 100) resources.conquestCost.value = 100
      debug.profile('tick')
      var currentTime = Date.now()
      var deltaTime = (currentTime - savedata.realTime) / 1000

      if (input.contains('f')) {
        deltaTime *= 10   
        if (input.contains('Shift')) {
          deltaTime *= 10
        }
      }
      
      Object.values(resources).each('tick', deltaTime)
      resources.commands.value += deltaTime * 0.1
      //resources.commands.value = Math.min(10, resources.commands.value)
      
      while (resources.science() > techCost()) {
        resources.science.value -= techCost()
        resources.totalTech.value += 1
        resources.tech.value += 1
      }
      while (resources.warpower() > resources.conquestCost()) {
        resources.warpower.value -= resources.conquestCost()
        resources.conquestCost.value *= conquestPenalty()
        resources.conquests.value += 1
      }
      
      save(currentTime)
      debug.unprofile('tick')
    }
  }
  return civilization
}