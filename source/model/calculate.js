const path = require('path');
const moment = require('moment');
const root_path = path.dirname(require.main.filename || process.mainModule.filename);


const config = require(root_path+'/config/config');
let favorite_competitor = config.favorite_competitor;



let limitMax = function(value, limit, def = ''){

    if(!value || !limit) return def;
    return value < limit ? limit : value;
}









//--------------------------------//
let filter = {};
//--------------------------------//
filter["в наличии + избранное"] = function(competitors, min){
    let competotorsMin = [];
    competitors.forEach(function(competitor){
        if( 
            parseInt(min) > parseInt(competitor["price"])
            && competitor['name'].slice(-1) !== "*"
            && (competitor['avalible']==true || favorite_competitor.indexOf(competitor['name'])>-1)
        ){
           competotorsMin.push(competitor['name']);
        }
    });
    return competotorsMin.sort().join('|');
}
//--------------------------------//
filter["в наличии"] = function(competitors, min){
    let competotorsMin = [];
    competitors.forEach(function(competitor){
        if( 
            parseInt(min) > parseInt(competitor["price"])
            && competitor['name'].slice(-1) !== "*"
            && (competitor['avalible']==true)
        ){
           competotorsMin.push(competitor['name']);
        }
    });
    return competotorsMin.sort().join('|');
}
//----------------------------------------------------------//
filter["в наличии + под заказ"] = function(competitors, min){
    let competotorsMin = [];
    competitors.forEach(function(competitor){
        if(  parseInt(min) > parseInt(competitor["price"]) && competitor['name'].slice(-1) !== "*" ){
           competotorsMin.push(competitor['name']);
        }
    });
    return competotorsMin.sort().join('|');
}
//----------------------------------------------------------//
filter["все"] = function(competitors, min){
    let competotorsMin = [];
    competitors.forEach(function(competitor){
        if(  parseInt(min) > parseInt(competitor["price"]) ){
           competotorsMin.push(competitor['name']);
        }
    });
    return competotorsMin.sort().join(';');
}
//--------------------------------//



let minPrice = {}
minPrice["в наличии + избранное"] = function (competitors) {
    let min = '';
    competitors.forEach(function (competitor) {
        if (
            competitor['name'].slice(-1) !== "*"
            && (competitor['avalible'] == true || favorite_competitor.indexOf(competitor['name']) > -1)
        ) {
            min =  min  == false ?  competitor['price'] : Math.min( parseInt(min) , parseInt(competitor['price']) );
        }
    });
    return min;
}
//--------------------------------//
minPrice["в наличии"] = function (competitors) {
    let min = '';
    competitors.forEach(function (competitor) {
        if ( competitor['name'].slice(-1) !== "*" && (competitor['avalible'] == true) ) {
            min =  min  == false ?  competitor['price'] : Math.min( parseInt(min) , parseInt(competitor['price']) );
        }
    });
    return min;
}
//--------------------------------//
minPrice["в наличии и под заказ"] = function (competitors) {
    let min = '';
    competitors.forEach(function (competitor) {
        if ( competitor['name'].slice(-1) !== "*" ) {
            min =  min  == false ?  competitor['price'] : Math.min( parseInt(min) , parseInt(competitor['price']) );
        }
    });
    return min;
}
//--------------------------------//
minPrice["все"] = function (competitors) {
    let min = '';
    competitors.forEach(function (competitor) {
        min =  min  == false ?  competitor['price'] : Math.min( parseInt(min) , parseInt(competitor['price']) );
    });
    return min;
}
//--------------------------------//



//------------------------------------------------------//
module.exports = (async function(sheet) {
    


    let result = [];
    result[0] = sheet[0];


    //Формируем массив ключей
    let keys = {};
    let index = 12; // столбец с которого начинается конкуренты
    //--------------------------------------------------//
    for (let i = 0; i < sheet[0].length; i++) {
        let key = sheet[0][i].replace(/\s+/g, " ").replace(/^\s|\s$/g, "").toLowerCase();
        keys[ key ] = i;
        if(sheet[0][i]=="*") { index = i; }
        
    }
    console.log( keys );

    //Проходим по строкам
    for (var i = 1; i < sheet.length; i++) {
        result[i] = [];



        let calc = {};
        let line = sheet[i];
        let value = line[keys["артикул"]];

        //по умолчанию заполняем поля пустыми значениями
        for (let j = 0; j < line.length; j++) {
            result[i][j] = JSON.stringify(line[j]);
        }

        // Simple data
        result[i][keys["№"]] = line[keys["№"]];
        result[i][keys["артикул"]] = value["id"];
        result[i][keys["производитель"]] = line[keys["производитель"]];
        
        result[i][keys["название"]] = {
            "name":value["name"],
            "url":value["url"]
        };
        result[i][keys["код поставщика"]] = line[keys["код поставщика"]];
        result[i][keys["остаток"]] = value["quantity"] ? value["quantity"] : "";
        result[i][keys["дата"]] = moment().format("YYYY-MM-DD");;


        // Актуальная закупка
        let actual_purchase_price = value["actual_purchase_price"];
        actual_purchase_price = line[keys["актуальная закупка (руб.)"]] ? line[keys["актуальная закупка (руб.)"]] : actual_purchase_price;
        actual_purchase_price = actual_purchase_price ? actual_purchase_price: value["purchase_price"]; // Если не заполненна Актуальная закупка и в 1с и таблице, берем "цена закупки";
        result[i][keys["актуальная закупка (руб.)"]] = {value: actual_purchase_price, status: value["actual_purchase_price"]  ? "set" : "unset"};

        // РРЦ
        let recomendation_price = value["recomendation_price"];
        recomendation_price = line[keys["ррц (руб.)"]] ? line[keys["ррц (руб.)"]] : recomendation_price;
        recomendation_price =  recomendation_price ?  recomendation_price : value["price"];
        result[i][keys["ррц (руб.)"]] = {value: recomendation_price, status: value["recomendation_price"]  ? "set" : "unset"};

        //Мин. % наценки (ИМ)
        min_percent_internet = line[keys["мин. % наценки (им)"]] ? line[keys["мин. % наценки (им)"]] : config["min_percent_internet"];
        result[i][keys["мин. % наценки (им)"]] = parseInt(min_percent_internet);
        min_percent_internet = parseInt(min_percent_internet);

        //Мин. % наценки (Розница)
        min_percent_retail = line[keys["мин. % наценки (розница)"]] ? line[keys["мин. % наценки (розница)"]] : config["min_percent_retail"];
        result[i][keys["мин. % наценки (розница)"]] =  parseInt(min_percent_retail);
        min_percent_retail = parseInt(min_percent_retail);

        result[i][keys["цена закупки"]] = value["purchase_price"] ? parseInt(value["purchase_price"]) : "";
        result[i][keys["цена продажная"]] = value["price"] ? parseInt(value["price"]) : "";
        result[i][keys["цена продажная (*)"]] = value["price_retail"] ? parseInt(value["price_retail"]) : "";


        let priceInternet = {
            "min" :  parseInt( result[i][keys["цена закупки"]]  * ( 100 + min_percent_internet )/100 ),
            "actual" : parseInt( result[i][keys["цена закупки"]]  * ( 100 + min_percent_internet )/100 ),
        };
        let priceRetail = {
            "min" :  parseInt( result[i][keys["цена закупки"]]  * ( 100 + min_percent_retail )/100 ),
            "actual" : parseInt( result[i][keys["цена закупки"]]  * ( 100 + min_percent_retail )/100 ),
        };

        result[i][keys["им - минимальная"]] = priceInternet["min"];
        result[i][keys["им - минимальная актуальная"]] = priceInternet["actual"];

        result[i][keys["розница - минимальная"]] = priceRetail["min"];
        result[i][keys["розница - минимальная актуальная"]] = priceRetail["actual"];


        //Создаем массив конкурентов (чтобы была цена)
        let competitors = [];
        for (let n = keys["*"]; n < line.length; n++) {
            try {
                if ( line[n]["status"] == "ok"  && line[n]["price"] !== false  ){
                    let competitor = line[n];
                    competitor["name"] = sheet[0][n].replace(/\s+/g, " ").replace(/^\s|\s$/g, "").toLowerCase();
                    competitors.push(competitor);
                }
            } catch (e) {}
        }






        result[i][keys["минимальная цена конкурента (в наличии + избранное)"]] = minPrice["в наличии + избранное"](competitors);
        result[i][keys["минимальная цена конкурента (в наличии)"]] = minPrice["в наличии"](competitors);
        result[i][keys["минимальная цена конкурента (в наличии и под заказ)"]] = minPrice["в наличии и под заказ"](competitors);
        result[i][keys["минимальная цена конкурента (все)"]] = minPrice["все"](competitors);

        result[i][keys["конкуренты с меньшей ценой (в наличии + избранное)"]] = filter["в наличии + избранное"](competitors, result[i][keys["цена продажная"]] );
        result[i][keys["конкуренты с меньшей ценой (в наличии)"]] = filter["в наличии"](competitors, result[i][keys["цена продажная"]] );
        result[i][keys["конкуренты с меньшей ценой (в наличии + под заказ)"]] = filter["в наличии + под заказ"](competitors, result[i][keys["цена продажная"]] );
        result[i][keys["конкуренты с меньшей ценой (все)"]] = filter["все"](competitors, result[i][keys["цена продажная"]] );
        
        result[i][keys["конкуренты с меньшей ценой ррц (в наличии + избранное)"]] = filter["в наличии + избранное"](competitors, recomendation_price );
        result[i][keys["конкуренты с меньшей ценой ррц (в наличии)"]] = filter["в наличии"](competitors, recomendation_price );
        result[i][keys["конкуренты с меньшей ценой ррц (в наличии + под заказ)"]] = filter["в наличии + под заказ"](competitors, recomendation_price );
        result[i][keys["конкуренты с меньшей ценой ррц (все)"]] = filter["все"](competitors, recomendation_price );


        result[i][keys["им - рекомендованная (в наличии + избранное)"]] = limitMax( result[i][keys["минимальная цена конкурента (в наличии + избранное)"]]  , result[i][keys["им - минимальная"]] , result[i][keys["цена продажная"]]);
        result[i][keys["им - актуальная рекомендованная (в наличии + избранное)"]] = limitMax( result[i][keys["минимальная цена конкурента (в наличии + избранное)"]]  , result[i][keys["им - минимальная актуальная"]] , result[i][keys["цена продажная"]]);
        result[i][keys["розница - рекомендованная (в наличии + избранное)"]] = limitMax( result[i][keys["минимальная цена конкурента (в наличии + избранное)"]]  , result[i][keys["розница - минимальная"]] , result[i][keys["цена продажная"]]);
        result[i][keys["розница - рекомендованная актуальная (в наличии + избранное)"]] = limitMax( result[i][keys["минимальная цена конкурента (в наличии + избранное)"]]  , result[i][keys["розница - минимальная актуальная"]] , result[i][keys["цена продажная"]]);

        result[i][keys["им - рекомендованная (в наличии)"]] = limitMax( result[i][keys["минимальная цена конкурента (в наличии)"]]  , result[i][keys["им - минимальная"]] , result[i][keys["цена продажная"]]);
        result[i][keys["им - актуальная рекомендованная (в наличии)"]] = limitMax( result[i][keys["минимальная цена конкурента (в наличии)"]]  , result[i][keys["им - минимальная актуальная"]] , result[i][keys["цена продажная"]]);
        result[i][keys["розница - рекомендованная (в наличии)"]] = limitMax( result[i][keys["минимальная цена конкурента (в наличии)"]]  , result[i][keys["розница - минимальная"]] , result[i][keys["цена продажная"]]);
        result[i][keys["розница - рекомендованная актуальная (в наличии)"]] = limitMax( result[i][keys["минимальная цена конкурента (в наличии)"]]  , result[i][keys["розница - минимальная актуальная"]] , result[i][keys["цена продажная"]]);

        result[i][keys["им - рекомендованная (в наличии + избранное)"]] = limitMax( result[i][keys["минимальная цена конкурента (в наличии + избранное)"]]  , result[i][keys["им - минимальная"]] , result[i][keys["цена продажная"]]);
        result[i][keys["им - актуальная рекомендованная (в наличии + избранное)"]] = limitMax( result[i][keys["минимальная цена конкурента (в наличии + избранное)"]]  , result[i][keys["им - минимальная актуальная"]] , result[i][keys["цена продажная"]]);
        result[i][keys["розница - рекомендованная (в наличии + избранное)"]] = limitMax( result[i][keys["минимальная цена конкурента (в наличии + избранное)"]]  , result[i][keys["розница - минимальная"]] , result[i][keys["цена продажная"]]);
        result[i][keys["розница - рекомендованная актуальная (в наличии + избранное)"]] = limitMax( result[i][keys["минимальная цена конкурента (в наличии + избранное)"]]  , result[i][keys["розница - минимальная актуальная"]] , result[i][keys["цена продажная"]]);

        result[i][keys["им - рекомендованная (в наличии и под заказ)"]] = limitMax( result[i][keys["минимальная цена конкурента (в наличии и под заказ)"]]  , result[i][keys["им - минимальная"]] , result[i][keys["цена продажная"]]);
        result[i][keys["им - актуальная рекомендованная (в наличии и под заказ)"]] = limitMax( result[i][keys["минимальная цена конкурента (в наличии и под заказ)"]]  , result[i][keys["им - минимальная актуальная"]] , result[i][keys["цена продажная"]]);
        result[i][keys["розница - рекомендованная (в наличии и под заказ)"]] = limitMax( result[i][keys["минимальная цена конкурента (в наличии и под заказ)"]]  , result[i][keys["розница - минимальная"]] , result[i][keys["цена продажная"]]);
        result[i][keys["розница - рекомендованная актуальная (в наличии и под заказ)"]] = limitMax( result[i][keys["минимальная цена конкурента (в наличии и под заказ)"]]  , result[i][keys["розница - минимальная актуальная"]] , result[i][keys["цена продажная"]]);

        result[i][keys["им - рекомендованная (все)"]] = limitMax( result[i][keys["минимальная цена конкурента (все)"]]  , result[i][keys["им - минимальная"]] , result[i][keys["цена продажная"]]);
        result[i][keys["им - актуальная рекомендованная (все)"]] = limitMax( result[i][keys["минимальная цена конкурента (все)"]]  , result[i][keys["им - минимальная актуальная"]] , result[i][keys["цена продажная"]]);
        result[i][keys["розница - рекомендованная (все)"]] = limitMax( result[i][keys["минимальная цена конкурента (все)"]]  , result[i][keys["розница - минимальная"]] , result[i][keys["цена продажная"]]);
        result[i][keys["розница - рекомендованная актуальная (все)"]] = limitMax( result[i][keys["минимальная цена конкурента (все)"]]  , result[i][keys["розница - минимальная актуальная"]] , result[i][keys["цена продажная"]]);


       //Заполняем конурентов
       result[i][keys["*"]] = "";
       for (let n = keys["*"]; n < line.length; n++) {
        result[i][n] = line[n];
       }



    }


    return result;
});
//------------------------------------------------------//
/*
{ '№': 0,
  'артикул': 1,
  'производитель': 2,
  'актуальная закупка (руб.)': 3,
  'ррц (руб.)': 4,
  'мин. % наценки (им)': 5,
  'мин. % наценки (розница)': 6,
  'название': 7,
  'код поставщика': 8,
  'остаток': 9,
  'дата': 10,
  'цена закупки': 11,
  'цена продажная': 12,
  'цена продажная (*)': 13,
  'им - минимальная': 14,
  'им - минимальная актуальная': 15,
  'розница - минимальная': 16,
  'розница - минимальная актуальная': 17,
  'им - рекомендованная (в наличии + избранное)': 18,
  'им - актуальная рекомендованная (в наличии + избранное)': 19,
  'розница - рекомендованная (в наличии + избранное)': 20,
  'розница - рекомендованная актуальная (в наличии + избранное)': 21,
  'им - рекомендованная (в наличии)': 22,
  'им - актуальная рекомендованная (в наличии)': 23,
  'розница - рекомендованная (в наличии)': 24,
  'розница - рекомендованная актуальная (в наличии)': 25,
  'им - рекомендованная (в наличии и под заказ)': 26,
  'им - актуальная рекомендованная (в наличии и под заказ)': 27,
  'розница - рекомендованная (в наличии и под заказ)': 28,
  'розница - рекомендованная актуальная (в наличии и под заказ)': 29,
  'им - рекомендованная (все)': 30,
  'им - актуальная рекомендованная (все)': 31,
  'розница - рекомендованная (все)': 32,
  'розница - рекомендованная актуальная (все)': 33,
  'минимальная цена конкурента (в наличии + избранное)': 34,
  'минимальная цена конкурента руб. (в наличии)': 35,
  'минимальная цена конкурента руб. (в наличии и под заказ)': 36,
  'минимальная цена конкурента руб. (все)': 37,
  'конкуренты с меньшей ценой (в наличии + избранное)': 38,
  'конкуренты с меньшей ценой (в наличии)': 39,
  'конкуренты с меньшей ценой (в наличии + под заказ)': 40,
  'конкуренты с меньшей ценой (все)': 41,
  'конкуренты с меньшей ценой ррц (в наличии + избранное)': 42,
  'конкуренты с меньшей ценой ррц (в наличии)': 43,
  'конкуренты с меньшей ценой ррц (в наличии + под заказ)': 44,
  'конкуренты с меньшей ценой ррц (все)': 45,
  '*': 46,
  ...
}
  */