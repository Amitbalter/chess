function equalArrangments(arr1, arr2){
    if(JSON.stringify(arr1.enPassant) === JSON.stringify(arr2.enPassant)){
        if (stringifyArray(arr1.array) === stringifyArray(arr2.array)){
            return true
        }
    }
    return false
}

function stringifyArray(array){
    let string = ''
    for (let i = 0;i < 8;i++){
        for (let j = 0;j < 8;j++){
            string += array[i][j].piece.label
            string += array[i][j].piece.color
            string += array[i][j].piece.castle
        }   
    }
    return string
}

export{equalArrangments, stringifyArray}
