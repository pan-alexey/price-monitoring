const path = require('path');
const root_path = path.dirname(require.main.filename || process.mainModule.filename);


const config = require(root_path+'/config/config');
let favorite_competitor = config.favorite_competitor;


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
        if( 
            parseInt(min) > parseInt(competitor["price"])
            && competitor['name'].slice(-1) !== "*"
        ){
           competotorsMin.push(competitor['name']);
        }
    });
    return competotorsMin.sort().join('|');
}
//----------------------------------------------------------//
filter["все"] = function(competitors, min){
    let competotorsMin = [];
    competitors.forEach(function(competitor){
        if( 
            parseInt(min) > parseInt(competitor["price"])
        ){
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
        if (
            competitor['name'].slice(-1) !== "*"
            && (competitor['avalible'] == true)
        ) {
            min =  min  == false ?  competitor['price'] : Math.min( parseInt(min) , parseInt(competitor['price']) );
        }
    });
    return min;
}
//--------------------------------//
minPrice["в наличии и под заказ"] = function (competitors) {
    let min = '';
    competitors.forEach(function (competitor) {
        if (
            competitor['name'].slice(-1) !== "*"
        ) {
            min =  min  == false ?  competitor['price'] : Math.min( parseInt(min) , parseInt(competitor['price']) );
        }
    });
    return min;
}
//--------------------------------//
minPrice["все"] = function (competitors) {
    let min = false;
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


    //Проходим по строкам
    for (var i = 1; i < sheet.length; i++) {
        result[i] = [];

        let calc = {};
        let line = sheet[i];
        let value = line[keys["артикул"]];

        // №
        result[i][keys["№"]] = line[keys["№"]];

        // артикул
        result[i][keys["артикул"]] = value["id"];

        // производитель
        result[i][keys["производитель"]] = line[keys["производитель"]];

        // Актуальная закупка
        let actual_purchase_price = value["actual_purchase_price"];
        actual_purchase_price = line[keys["актуальная закупка (руб.)"]] ? line[keys["актуальная закупка (руб.)"]] : actual_purchase_price;
        actual_purchase_price = actual_purchase_price ? actual_purchase_price: value["purchase_price"]; // Если не заполненна Актуальная закупка и в 1с и таблице, берем "цена закупки";
        result[i][keys["актуальная закупка (руб.)"]] = {value: actual_purchase_price, status: value["actual_purchase_price"]  ? "set" : "unset"};
        calc["актуальная закупка"] = parseInt( actual_purchase_price );

        
        // Актуальная закупка
        let recomendation_price = value["recomendation_price"];
        recomendation_price = line[keys["ррц (руб.)"]] ? line[keys["ррц (руб.)"]] : recomendation_price;
        recomendation_price =  recomendation_price ?  recomendation_price : value["price"];

        
        result[i][keys["ррц (руб.)"]] = {value: recomendation_price, status: value["recomendation_price"]  ? "set" : "unset"};
        calc["ррц"] = parseInt( recomendation_price );


        //мин. % наценки
        min_percent = line[keys["мин. % наценки"]] ? line[keys["мин. % наценки"]] : config["min_percent"];
        result[i][keys["мин. % наценки"]] = min_percent;
        calc["%"] = parseInt(min_percent);

        //название
        result[i][keys["название"]] = line[keys["название"]];



        // код поставщика
        result[i][keys["код поставщика"]] = line[keys["код поставщика"]];

        // остаток
        result[i][keys["остаток"]] = value["quantity"] ? value["quantity"] : "";

        // дата
        result[i][keys["дата"]] = "";

        // цена закупки
        result[i][keys["цена закупки"]] = value["purchase_price"] ? parseInt(value["purchase_price"]) : "";
        calc["закупка"] = result[i][keys["цена закупки"]];

        // цена продажная
        result[i][keys["цена продажная"]] = value["price"] ? parseInt(value["price"]) : "";
        calc["продажная"] = result[i][keys["цена продажная"]];


        //Создаем массив конкурентов
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
        result[i][keys["минимальная цена конкурента руб. (в наличии)"]] = minPrice["в наличии"](competitors);
        result[i][keys["минимальная цена конкурента руб. (в наличии и под заказ)"]] = minPrice["в наличии и под заказ"](competitors);
        result[i][keys["минимальная цена конкурента руб. (все)"]] = minPrice["все"](competitors);

        result[i][keys["конкуренты с меншьей ценой (в наличии + избранное)"]] = filter["в наличии + избранное"](competitors, calc["продажная"]  );
        result[i][keys["конкуренты с меншьей ценой (в наличии)"]] = filter["в наличии"](competitors, calc["продажная"] );
        result[i][keys["конкуренты с меншьей ценой (в наличии + под заказ)"]] = filter["в наличии + под заказ"](competitors, calc["продажная"]  );
        result[i][keys["конкуренты с меншьей ценой (все)"]] = filter["все"](competitors, calc["продажная"]  );

        result[i][keys["конкуренты с меншьей ценой ррц (в наличии + избранное)"]] = filter["в наличии + избранное"](competitors, calc["ррц"] );
        result[i][keys["конкуренты с меншьей ценой ррц (в наличии)"]] = filter["в наличии"](competitors, calc["ррц"] );
        result[i][keys["конкуренты с меншьей ценой ррц (в наличии + под заказ)"]] = filter["в наличии + под заказ"](competitors, calc["ррц"] );
        result[i][keys["конкуренты с меншьей ценой ррц (все)"]] = filter["все"](competitors, calc["ррц"] );


        let recomendation = {}
        // Самая минимальная цена
        let limPrice = calc["закупка"] * (100 + calc["%"] )/100 ;
        let limActualPrice = calc["актуальная закупка"] * (100 + calc["%"] )/100 ;
        
        //-----------------------------------------------------------------------//
        result[i][keys["рекомендованная цена руб. (в наличии + избранное)"]] = result[i][keys["минимальная цена конкурента (в наличии + избранное)"]] =='' ? calc["продажная"] :
                                                                               result[i][keys["минимальная цена конкурента (в наличии + избранное)"]] < limPrice ? limPrice : result[i][keys["минимальная цена конкурента (в наличии + избранное)"]];
        //-----------------------------------------------------------------------//
        result[i][keys["рекомендованная цена руб. (в наличии)"]] =  result[i][keys["минимальная цена конкурента руб. (в наличии)"]]=='' ? calc["продажная"] :
                                                                    result[i][keys["рекомендованная цена руб. (в наличии)"]] < limPrice ? limPrice : result[i][keys["рекомендованная цена руб. (в наличии)"]];
        //-----------------------------------------------------------------------//
        result[i][keys["рекомендованная цена руб. (в наличии + под заказ)"]] =  result[i][keys["минимальная цена конкурента руб. (в наличии и под заказ)"]] =='' ? calc["продажная"] :
                                                                                result[i][keys["минимальная цена конкурента руб. (в наличии и под заказ)"]] < limPrice ? limPrice : result[i][keys["минимальная цена конкурента руб. (в наличии и под заказ)"]];
        //-----------------------------------------------------------------------//
        result[i][keys["рекомендованная цена руб. (по всем конкурентам)"]] =  result[i][keys["минимальная цена конкурента руб. (все)"]] =='' ? calc["продажная"] :
                                                                              result[i][keys["минимальная цена конкурента руб. (все)"]] < limPrice ? limPrice : result[i][keys["минимальная цена конкурента руб. (все)"]];
        //-----------------------------------------------------------------------//


        //-----------------------------------------------------------------------//
        result[i][keys["актуальная - рекомендованная цена руб. (в наличии + избранное)"]] = result[i][keys["минимальная цена конкурента (в наличии + избранное)"]] =='' ? calc["продажная"] :
                                                                               result[i][keys["минимальная цена конкурента (в наличии + избранное)"]] < limActualPrice ? limActualPrice : result[i][keys["минимальная цена конкурента (в наличии + избранное)"]];
        //-----------------------------------------------------------------------//
        result[i][keys["актуальная - рекомендованная цена руб. (в наличии)"]] =  result[i][keys["минимальная цена конкурента руб. (в наличии)"]]=='' ? calc["продажная"] :
                                                                                 result[i][keys["рекомендованная цена руб. (в наличии)"]] < limActualPrice ? limActualPrice : result[i][keys["рекомендованная цена руб. (в наличии)"]];
        //-----------------------------------------------------------------------//
        result[i][keys["актуальная - рекомендованная цена руб. (в наличии + под заказ)"]] =  result[i][keys["минимальная цена конкурента руб. (в наличии и под заказ)"]] =='' ? calc["продажная"] :
                                                                                             result[i][keys["минимальная цена конкурента руб. (в наличии и под заказ)"]] < limActualPrice ? limActualPrice : result[i][keys["минимальная цена конкурента руб. (в наличии и под заказ)"]];
        //-----------------------------------------------------------------------//
        result[i][keys["актуальная - рекомендованная цена руб. (по всем конкурентам)"]] =  result[i][keys["минимальная цена конкурента руб. (все)"]] =='' ? calc["продажная"] :
                                                                                           result[i][keys["минимальная цена конкурента руб. (все)"]] < limActualPrice ? limActualPrice : result[i][keys["минимальная цена конкурента руб. (все)"]];
        //-----------------------------------------------------------------------//



       //Заполняем конурентов
       result[i][keys["*"]] = "";
       for (let n = keys["*"]; n < line.length; n++) {
        result[i][n] = line[n];
       }
    }


    return result;
});
//------------------------------------------------------//