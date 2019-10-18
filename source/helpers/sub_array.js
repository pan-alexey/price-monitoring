module.exports = function(arr,size) {
    const array =  arr.filter(function (el) {
        return el != null && el!="" ;
    });




    const array_size = size ? Math.ceil(array.length/size) : 1; 
    const sliced_array = [];
    for (let i = 0; i <array.length; i += array_size) {
        sliced_array.push(array.slice(i, i + array_size));
    }
    return sliced_array;
};