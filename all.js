require('events').EventEmitter.prototype._maxListeners = 0;
require('events').EventEmitter.prototype._maxListeners = 0;
require('events').EventEmitter.defaultMaxListeners = 0

const createCsvWriter = require('csv-writer').createArrayCsvWriter;
const moment = require('moment');
const path = require('path');
const root_path = path.dirname(require.main.filename || process.mainModule.filename);
const config = require(root_path+'/config/config');


//const array_to_obj = require('/source/helpers/array_to_object');

function arrayMin(arr) {
    return arr.reduce(function (p, v) {
      return ( p < v ? p : v );
    });
}

let limitMax = function(value, limit, def = ''){
    if(!value || !limit) return def;
    return value < limit ? limit : value;
}



//минимальный процент наценки в интернете
const minPercent = config["min_percent_internet"];;

(async () => {

    const start= new Date().getTime();
    let sheet = await require("./source/model/accumulate_sheets")();
        sheet = await require("./source/model/own_price")(sheet);
        sheet = await require("./source/model/competitor_price")(sheet, true);
    
    //Расчет оптимальной цены производиться тут
    //Добавляем колонку рекомендованной цены


    //Формируем массив ключей
    let result = [];
    let keys = {};
    let index = 9; // столбец с которого начинается конкуренты
    //--------------------------------------------------//
    for (let i = 0; i < sheet[0].length; i++) {
        let key = sheet[0][i].replace(/\s+/g, " ").replace(/^\s|\s$/g, "").toLowerCase();
        keys[ key ] = i;
        if(sheet[0][i]=="код поставщика") { index = i; }
    }


   
    result[0] = sheet[0];
    for (let i = 1; i < sheet.length; i++) {
        let line = sheet[i];
        result[i] = [];

        let prices = [];
        for (let j = 0; j < line.length; j++) {
           // Цена конкурентов
           if(j > index){
                let price = ( sheet[i][j]['status'] == "ok" && sheet[i][j]['price'] && sheet[i][j]['avalible']) ? sheet[i][j]['price'] : '';
                if( price) prices.push(price);
                result[i][j] = price;
           }else{
            result[i][j] = line[j];
           }
        }

        // result[i][ keys["код поставщика"] ]  = sheet[i][keys["код поставщика"]]  ;
        // result[i][ keys["артикул"] ]  = sheet[i][keys["артикул"]]["id"]  ;
        // result[i][ keys["файл"] ]  = sheet[i][keys["файл"]]  ;
        // result[i][ keys["дата"] ]  = sheet[i][keys["дата"]]  ;
        // result[i][ keys["мин. % наценки"] ]  = sheet[i][keys["мин. % наценки"]] ? sheet[i][keys["мин. % наценки"]] : minPercent ;
        // result[i][ keys["название"] ]  = sheet[i][keys["артикул"]]["name"] ? sheet[i][keys["артикул"]]["name"] : '' ;

        result[i][ keys["артикул"] ]  = sheet[i][keys["артикул"]]["id"]  ;
        result[i][ keys["цена на сайте"] ]  = sheet[i][keys["артикул"]]["price"] ? parseInt( sheet[i][keys["артикул"]]["price"] ) : '';
        result[i][ keys["цена закупки"] ]  = sheet[i][keys["артикул"]]["purchase_price"] ? parseInt( sheet[i][keys["артикул"]]["purchase_price"] ) : '';
        result[i][ keys["мин. % наценки (им)"] ]  = sheet[i][keys["мин. % наценки (им)"]] ? sheet[i][keys["мин. % наценки (им)"]] : minPercent ;

       //result[i][ keys["цена закупки"] ]
        let minPrice = parseInt(  result[i][ keys["цена закупки"] ]*( (sheet[i][keys["мин. % наценки (им)"]] + 100 )/100) );
        result[i][ keys["минимальная цена"] ]  =  minPrice ? minPrice : '';
        result[i][ keys["минимальная цена конкурента"] ]  = prices.length > 0 ? arrayMin(prices)-1 :'';
        result[i][ keys["рекомендованная цена"] ] = limitMax( result[i][ keys["минимальная цена конкурента"] ] ,result[i][ keys["минимальная цена"] ], result[i][ keys["цена на сайте"] ]  );
    }




    //Сохрнаяем файл в CSV
    const csvWriter = createCsvWriter({
        path: root_path+'/all/ecommerce' + moment().format("YYYYMMDD HH-mm-ss") + '.csv'
    });
    await csvWriter.writeRecords(result)       // returns a promise



    const end = new Date().getTime();
    let elapsed = parseInt( (end - start)/1000 ) ;
    console.log( elapsed );
    
})();