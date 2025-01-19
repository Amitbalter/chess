let time = 3
let k = 0
console.log('start')
const intervalID = setInterval(() => {
    time --
    console.log(time)
    if (k === 0){
        clearInterval(intervalID)
    }
    k--
},1000)

