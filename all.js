require('events').EventEmitter.prototype._maxListeners = 0;
require('events').EventEmitter.prototype._maxListeners = 0;
require('events').EventEmitter.defaultMaxListeners = 0

const createCsvWriter = require('csv-writer').createArrayCsvWriter;
const moment = require('moment');
//const array_to_obj = require('/source/helpers/array_to_object');

function arrayMin(arr) {
    return arr.reduce(function (p, v) {
      return ( p < v ? p : v );
    });
}



const minPercent = 5;

(async () => {


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

        let linePrice = [];
        for (let j = 0; j < line.length; j++) {
           result[i][j] = '';
           // Цена конкурентов
           if(j > index){
                let price = ( sheet[i][j]['status'] == "ok" && sheet[i][j]['price'] ) ? sheet[i][j]['price'] : '';
                if( price) linePrice.push(price);
                result[i][j] = price;
           }
        }

        result[i][ keys["код поставщика"] ]  = sheet[i][keys["код поставщика"]]  ;
        result[i][ keys["артикул"] ]  = sheet[i][keys["артикул"]]["id"]  ;
        result[i][ keys["файл"] ]  = sheet[i][keys["файл"]]  ;
        result[i][ keys["дата"] ]  = sheet[i][keys["дата"]]  ;
        result[i][ keys["мин. % наценки"] ]  = sheet[i][keys["мин. % наценки"]] ? sheet[i][keys["мин. % наценки"]] : minPercent ;
        result[i][ keys["название"] ]  = sheet[i][keys["артикул"]]["name"] ? sheet[i][keys["артикул"]]["name"] : '' ;


        result[i][ keys["цена на сайте"] ]  = sheet[i][keys["артикул"]]["id"] ? parseInt( sheet[i][keys["артикул"]]["price"] ) : '';
        result[i][ keys["цена закупки"] ]  = sheet[i][keys["артикул"]]["id"] ? parseInt( sheet[i][keys["артикул"]]["purchase_price"] ) : '';

        result[i][ keys["минимальная цена конкурента"] ]  = linePrice.length > 0 ? arrayMin(linePrice) :'';

        result[i][ keys["рекомендованная цена"] ] = result[i][ keys["цена на сайте"] ];
        if( result[i][ keys["минимальная цена конкурента"] ] ){
            let minPrice = result[i][ keys["цена закупки"] ] *  ( (result[i][ keys["мин. % наценки"] ] + 100)/100 ) ;
                minPrice = parseInt(minPrice);
                minPrice = minPrice > result[i][ keys["минимальная цена конкурента"] ] ? minPrice :  result[i][ keys["минимальная цена конкурента"] ];
                minPrice = result[i][ keys["цена на сайте"] ] > minPrice ? minPrice : result[i][ keys["цена на сайте"] ];
                result[i][ keys["рекомендованная цена"] ] = minPrice;
        }
    }


    //Сохрнаяем файл в CSV
    const csvWriter = createCsvWriter({
        path: 'price-ecommerce.csv'
    });
    await csvWriter.writeRecords(result)       // returns a promise




    
})();