require('events').EventEmitter.prototype._maxListeners = 0;
require('events').EventEmitter.prototype._maxListeners = 0;
require('events').EventEmitter.defaultMaxListeners = 0


const createCsvWriter = require('csv-writer').createArrayCsvWriter;




const name = "dewalt";



(async () => {
    let sheet = await require("./source/model/google_sheet")(name);

    // muttable array (add own price)
    sheet = await require("./source/model/own_price")(sheet);

    // muttable array (add competitor price)
    sheet = await require("./source/model/competitor_price")(sheet);

    // muttable (add addition columns)
    sheet = await require("./source/model/add_colums")(sheet);
    //console.log( sheet );
    //calc value
    sheet = await require("./source/model/calculate")(sheet);

    //Create EXCEL
    excel = await require("./source/model/excel")(sheet, name);


    
})();