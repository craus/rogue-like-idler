var price = function(i) {
  var power = 0

  power += 2.0*i/100
  power -= 2*Math.floor(i/100)
  
  power += i/1000
  power -= Math.floor(i/1000)

  return Math.pow(10, power)
}

var prices = []

for (var i = 0; i < 1000; i++) {
  prices.push(price(i)) 
}

var getChangeness = function(a) {
  var changeness = 0
  for (var i = 0; i < a.length; i++) {
    if (i > 0) {
      changeness += Math.abs(Math.log(a[i]/a[i-1], a[i-1]/a[i]))
    }
  }
  return changeness
}

var getSum = function(a) {
  var sum = 0
  for (var i = 0; i < a.length; i++) {
    sum += a[i]
  }
  return sum
}

console.log("prices: ", prices)
console.log("sum: ", getSum(prices))
console.log("changeness: ", getChangeness(prices))

var prefixSums = function(a) {
  var result = [a[0]] 
  for (var i = 1; i < a.length; i++) {
    result.push(result[i-1]+a[i])
  }
  return result
}

var randPoint = function() {
  return Math.random()*2-1
}

var toStars = function(x) {
  if (x > 1) {
    return '*'.repeat(1+10*Math.log(x))
  }
  return 'o'
}

var splitDifficulty = function(n, difficulty, changeness) {
  difficulty *= n
  changeness *= n
	var rand = []
  for (var i = 0; i < n; i++) {
    rand.push(randPoint()+randPoint()+randPoint()+randPoint()+randPoint()+randPoint())
  }
  rand = prefixSums(rand)
  rand = rand.map(x => Math.exp(x/10))
  console.log("rand ps exp: ", rand)
  var currentChangeness = getChangeness(rand)
  var changeMore = changeness / currentChangeness
  var changeRight = [rand[0]]
  for (var i = 1; i < n; i++) {
    changeRight.push(changeRight[i-1] * Math.exp(Math.log(rand[i]/rand[i-1])*changeMore))
  }
  var currentSum = getSum(changeRight)
  var sumMore = difficulty/currentSum
  var result = changeRight.map(x => x * sumMore)
  console.log("result: ", result.map(toStars).join('\n'))
  console.log("result: ", result.join('\n'))
  console.log("sum: ", getSum(result))
  console.log("changeness: ", getChangeness(result))
  return result
}

splitDifficulty(10000, 100, 0.05)
