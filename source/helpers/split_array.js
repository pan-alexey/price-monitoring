module.exports = function(arr) {
   let split_array = {};
    arr.forEach(element => {
        for (const key in element) {
            split_array[key] = element[key];
        }
    });
    return split_array;
};