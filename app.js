require('events').EventEmitter.prototype._maxListeners = 0;
require('events').EventEmitter.prototype._maxListeners = 0;
require('events').EventEmitter.defaultMaxListeners = 0


const createCsvWriter = require('csv-writer').createArrayCsvWriter;



let name = process.argv[2];
//name = "dewalt";



(async () => {


    const start= new Date().getTime();

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




    const createCsvWriter = require('csv-writer').createArrayCsvWriter;
    const end = new Date().getTime();
    let elapsed = parseInt( (end - start)/1000 ) ;
    const endTime = new Date().getTime();
    const csvWriter = createCsvWriter({
        path: 'tmp/'+name+"-"+endTime+'.csv'
    });
    await csvWriter.writeRecords(sheet)       // returns a promise

    //Create EXCEL
    excel = await require("./source/model/excel")(sheet, name);
    
    file = await require("./source/model/email")(name, excel);
    
})();