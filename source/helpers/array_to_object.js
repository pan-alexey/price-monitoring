module.exports = function(arr) {
    // convert array to obj (key in )
    let keys = [];
    let object = {};
    //--------------------------------------------//
    arr[0].forEach(function(element,index){
        keys[index] = element;
        object[element] = [];
    });
    //--------------------------------------------//
    for (let i = 1; i < arr.length; i++) {
        for (let j = 0; j < arr[i].length; j++) {
            let key = keys[j];
            object[key][i-1]  = arr[i][j];
        }
    }
    //--------------------------------------------//
    return object;
};