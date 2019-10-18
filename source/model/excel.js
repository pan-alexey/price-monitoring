const path = require('path');
const root_path = path.dirname(require.main.filename || process.mainModule.filename);
const Excel = require('exceljs');
const moment = require('moment');
//------------------------------------------------------//
module.exports = (async function(sheet, name) {



    let date = moment().format("YYYY-MM-DD HH-mm-ss");
    let file = root_path + "/tmp/" + " ["+date+"] " + name + " .xlsx";




    let workbook = new Excel.Workbook();
    workbook.creator = 'Robot';
    workbook.lastModifiedBy = 'robot';
    workbook.created = new Date();
    workbook.modified = new Date();
    let worksheet = workbook.addWorksheet('Мониторинг '+ date );

    //Формируем массив ключей
    let keys = {};
    let index = 12; // столбец с которого начинается конкуренты
    //--------------------------------------------------//
    for (let i = 0; i < sheet[0].length; i++) {
        try {
            let key = sheet[0][i].replace(/\s+/g, " ").replace(/^\s|\s$/g, "").toLowerCase();
            keys[ key ] = i;
            if(sheet[0][i]=="*") { index = i; }   
        } catch (error) {}

    }

    //-----------------------  ЗАГОЛОВОК ----------------------------//
    for (let i = 0; i < sheet[0].length; i++) {
        let defaultWidth = 200;
        let defaultHeight = 70;
        worksheet.getRow(1).getCell(i+1).value  = sheet[0][i];
        worksheet.getRow(1).getCell(i+1).style = {  width: defaultWidth , height: defaultHeight };
        worksheet.getRow(1).getCell(i+1).alignment = { vertical: 'middle', horizontal: 'center', wrapText: true  };
        worksheet.getRow(1).getCell(i+1).font = { color: { argb: 'FFFFFFFF' },};
        worksheet.getRow(1).getCell(i+1).fill = {
            type: 'pattern',
            pattern:'solid',
            fgColor:{argb:'FF2962FF'},
            bgColor:{argb:'FF2962FF'}
        };
    }
    //-----------------------  ЗАГОЛОВОК ----------------------------//


    //--------------------------------------------------------------------------//
    //-----------------------  ПРОХОДИМЯ ПО СТРОКАМ ----------------------------//
    for (let i = 1; i < sheet.length; i++) {
        //------------------------------------------------------------------------//
        for (let j = 0;  j <= keys['*']; j++) {
            //-----------------------------------------//
            if(typeof sheet[i][j] !== "object"){
                worksheet.getRow(i+1).getCell(j+1).value  = sheet[i][j];
                continue;
            }else{
                worksheet.getRow(i+1).getCell(j+1).value  = "object";
            }

            //-----------------------------------------//
            if(keys['актуальная закупка (руб.)'] == j){
                worksheet.getRow(i+1).getCell(j+1).value  = parseInt(sheet[i][j]["value"]);
                if (sheet[i][j]["status"] == "unset" ){
                    worksheet.getRow(i+1).getCell(j+1).fill = {
                        type: 'pattern', pattern:'solid',
                        fgColor:{argb:'FFFF8A65'},
                        bgColor:{argb:'FFСССССС'}
                    };
                }
            }
            //-----------------------------------------//
            if(keys['ррц (руб.)'] == j){
                worksheet.getRow(i+1).getCell(j+1).value  = parseInt(sheet[i][j]["value"]);
                if (sheet[i][j]["status"] == "unset" ){
                    worksheet.getRow(i+1).getCell(j+1).fill = {
                        type: 'pattern', pattern:'solid',
                        fgColor:{argb:'FFFF8A65'},
                        bgColor:{argb:'FFСССССС'}
                    };
                }
            }
            //-----------------------------------------//
            if(keys['название'] == j){
                worksheet.getRow(i+1).getCell(j+1).value  = { 
                    text: sheet[i][j]["name"], 
                    hyperlink:  sheet[i][j]["url"]
                };
            }
            //-----------------------------------------------------------//
        }
        //----------------------------------------------------------------------//
        //----------------------------------------------------------------------//



        for (let j = keys['розница - минимальная актуальная']+1;  j < keys['конкуренты с меньшей ценой (в наличии + избранное)']; j++) {

            let value = isNaN(sheet[i][j]) ? false : parseInt(sheet[i][j]);
            if( !value ) {
                worksheet.getRow(i+1).getCell(j+1).value  = "";
                continue;
            }

            let key;
            try {key = sheet[0][i].replace(/\s+/g, " ").replace(/^\s|\s$/g, "").toLowerCase();} catch (error) {
                key = "";
            }
           
            
            let price = key.indexOf("розница") ? parseInt(sheet[i][keys['цена продажная (*)']]) :  parseInt(sheet[i][keys['цена продажная']]);
            if( !price ) continue;

            worksheet.getRow(i+1).getCell(j+1).value  = value;
            if(value > price ){
                worksheet.getRow(i+1).getCell(j+1).fill = {
                    type: 'pattern', pattern:'solid',
                    fgColor:{argb:'FF4DB6AC'},
                    bgColor:{argb:'FF4DB6AC'}
                };
            }
            //----------------------------------------//
            if(value < price ){
                worksheet.getRow(i+1).getCell(j+1).fill = {
                    type: 'pattern', pattern:'solid',
                    fgColor:{argb:'FFFF8A65'},
                    bgColor:{argb:'FFFF8A65'}
                };
            }

        }



        //Поля для конкурента
        //------------------------------------------------------------------------//
        for (let j = index+1; j < sheet[i].length; j++) {
            if(typeof sheet[i][j] !== "object"){
                worksheet.getRow(i+1).getCell(j+1).value  = sheet[i][j];
                continue;
            }
            if( sheet[i][j]['status'] == "ok" ){
                let price = sheet[i][j]['price'] ? sheet[i][j]['price'] : "####";
                worksheet.getRow(i+1).getCell(j+1).value  = { text: price, hyperlink: sheet[i][j]['url'] };
                //-----------------------------------------------//
                if( sheet[i][j]['avalible'] ){
                    worksheet.getRow(i+1).getCell(j+1).fill = {
                        type: 'pattern', pattern:'solid',
                        fgColor:{argb:'FF4DB6AC'},
                        bgColor:{argb:'FFСССССС'}
                    };
                }else{
                    worksheet.getRow(i+1).getCell(j+1).fill = {
                        type: 'pattern', pattern:'solid',
                        fgColor:{argb:'FFFF8A65'},
                        bgColor:{argb:'FFСССССС'}
                    }; 
                }
                //-----------------------------------------------//
            }else{
                worksheet.getRow(i+1).getCell(j+1).value  = { text: "error", hyperlink: sheet[i][j]['url'] };
            }
        }
        //------------------------------------------------------------------------//



        //------------------------------------------------------------------------//
    }




    //----------------------/  ПРОХОДИМЯ ПО СТРОКАМ ----------------------------//
    //--------------------------------------------------------------------------//


    await workbook.xlsx.writeFile(file);
    return file;
});
//------------------------------------------------------//