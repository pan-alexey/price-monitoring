const path = require('path');
const request = require('async-request');
const csv = require('async-csv');
const root_path = path.dirname(require.main.filename || process.mainModule.filename);
const sheets = require(root_path+'/config/docs.js');

const config = require(root_path+'/config/config');
const array_to_obj = require(root_path+'/source/helpers/array_to_object');
const sub_array = require(root_path+'/source/helpers/sub_array');
const split_array = require(root_path+'/source/helpers/split_array');
const moment = require('moment');


//----------------------------------------------------//
let createArray = function(lenght, def = ""){
    let result = [];
    for (let index = 0; index < lenght; index++) {
        result.push(def);
    }
    return result;
}
//----------------------------------------------------//




module.exports = (async function() {



     // Создаем объект
     let array = [['артикул', "файл", 'дата', 'мин. % наценки (им)' , 'название' ,  'цена на сайте' ,  'цена закупки' ,  'минимальная цена', 'рекомендованная цена', 'минимальная цена конкурента' , 'код поставщика']];
     for (let competitor in config.accumulate_competitor) {
         array[0].push( competitor );
     }
     let result = array_to_obj(array);

    


    for (let sheet in sheets) {
        uri = "https://docs.google.com/spreadsheets/d/"+sheets[sheet]+"/export?format=csv";
        let req = await request(uri, {
                method: 'GET',
                headers: {},
        });
        let data = await csv.parse(req.body);
        data[0].forEach( (element,i) => {
            let name = element.replace(/\s+/g, " ").replace(/^\s|\s$/g, "").toLowerCase();
                name = name.slice(-1) == "*" ? name.substring(0, name.length - 1) : name;
                data[0][i] = name;
        });
        


        data =  array_to_obj( data );


        // Создаем конкуретов если их не существует
        // т.к. столбец "Артикул" существует у всех документов, то ориентируемся не эту длинну
        for (let row in result) {
            if( data[row] == undefined ) {

                let dummy = "";
                if (row == "файл") { dummy = sheet;}
                if (row == "дата") { dummy = moment().format("YYYY-MM-DD HH-mm-ss");}
                data[row] = createArray( data["артикул"].length , dummy);

            }
        }

        for (let row in result) {
            result[row] = result[row].concat(data[row]);
        }
    }


    let sheet = [];
    
    //----------------------------------------------------------//
    let line = [];
    for (let row in result) { line.push(row); }
    sheet.push(line );
    //----------------------------------------------------------//
    for (let index = 0; index < result['артикул'].length; index++) {
        let line = [];
        for (let row in result) { 
            line.push( result[row][index] );
        }
        sheet.push(line );
    }
    return sheet;
});