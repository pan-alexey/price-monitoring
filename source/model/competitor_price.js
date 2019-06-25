const path = require('path');
const root_path = path.dirname(require.main.filename || process.mainModule.filename);



//------------------------------------------------------//
const competitor = require(root_path+'/config/competitor');


const config = require(root_path+'/config/config');
const array_to_obj = require(root_path+'/source/helpers/array_to_object');
const sub_array = require(root_path+'/source/helpers/sub_array');
const split_array = require(root_path+'/source/helpers/split_array');
//------------------------------------------------------//



//------------------------------------------------------//
module.exports = (async function(sheet) {
    if(sheet===false) return false;

    //console.log(sheet);
    //---------------------------------------------------//
    //Находим колонку "код поставщика"
    let index = 8;  
    sheet[0].forEach(function(element,i){
        if (element === "Код поставщика") index = i+1;
    });
    //---------------------------------------------------//

    //===================================================//
    //-------  Формируем правила конкурентов ------------//
    let crawler = {};
    for (const key in competitor) {
        crawler[ competitor[key] ] = require( root_path+"/crawler/"+competitor[key] );
    }

    //===================================================//
    //------  Нормализуем названия конкурентов ----------//
    let table = JSON.parse(JSON.stringify(sheet)); // Клоируем
    table[0].forEach(function(element,i){
       table[0][i] = element.replace(/\s+/g, " ").replace(/^\s|\s$/g, "").toLowerCase();
    });


    //-------- Преобразовываем таблицу в объект  --------//
    let data = array_to_obj(sheet);
    let promises = [];


    //------  Содаем список конкурентов -----------------//
    for (let i = index; i < table[0].length; i++) {
        // Удаляем звездочки в названии конкурента
        let raw_name = sheet[0][i];

        let name = raw_name.slice(-1) == "*" ? raw_name.substring(0, raw_name.length - 1) : raw_name;
            name = name.replace(/\s+/g, " ").replace(/^\s|\s$/g, "").toLowerCase();

        if ( typeof competitor[name] == "undefined") {
            console.log(`ОШИБКА, не надено правило для <<${name}>>`);
            continue;
        }





        



        
        /***********************************************************************************************************/
        /* Тут можно задать значение на количество потоков */
        // Разбиваем url на части (с целью распаралелить процесс)
        let threads = config.threads;
        if (typeof config.threads_competitor[name] !== 'undefined') {
            threads = config.threads_competitor[name];
        }

//threads_competitor

            //threads = name == "все инструменты" ? parseInt( threads * 2 ) : threads;


        let parts = sub_array(data[raw_name], threads);

        // Создаем массив промисов;
        name = competitor[name];
        parts.forEach(part => {
            promises.push( crawler[name](part));
        });
    }
    //------  Содаем список конкурентов -----------------//

    //---- Вытаскиваем паралельно цены у конкуретов -----//
    let urls = await Promise.all(promises);
        urls = split_array(urls);// Формируем список ключей;
    //---/ Вытаскиваем паралельно цены у конкуретов -----//

    //------ Заполняем таблицу ценами конкурентов -------//
    for (let i = 1; i < sheet.length; i++) {
       for (let j = index; j < sheet[i].length; j++) {
            //-------------------------------------------//
            if( sheet[i][j]!="" ){
                url = sheet[i][j];
                sheet[i][j] = (urls[ sheet[i][j] ] != undefined) ? urls[ sheet[i][j] ]  : { status : "no competitor"};
                sheet[i][j]["url"] = url;
            }
            //-------------------------------------------//
       }
    }
    //-----/ Заполняем таблицу ценами конкурентов -------//

    return sheet;
});
//------------------------------------------------------//