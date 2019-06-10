const path = require('path');
const root_path = path.dirname(require.main.filename || process.mainModule.filename);
const Excel = require('exceljs');
const moment = require('moment');
//------------------------------------------------------//
module.exports = (async function(sheet, name) {



    let date = moment().format("YYYYMMDD HH-mm-ss");
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
        let key = sheet[0][i].replace(/\s+/g, " ").replace(/^\s|\s$/g, "").toLowerCase();
        keys[ key ] = i;
        if(sheet[0][i]=="*") { index = i; }
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
            }
            //-----------------------------------------//
            if(keys['актуальная закупка (руб.)'] == j){
                worksheet.getRow(i+1).getCell(j+1).value  = parseInt(sheet[i][j]["value"]);
                if (sheet[i][j]["status"] == "unset" ){
                    worksheet.getRow(i+1).getCell(j+1).fill = {
                        type: 'pattern', pattern:'solid',
                        fgColor:{argb:'FFFF8A65'},
                        bgColor:{argb:'FFFF8A65'}
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
                        bgColor:{argb:'FFFF8A65'}
                    };
                }
            }
            //-----------------------------------------//
            if(keys['название'] == j){
                worksheet.getRow(i+1).getCell(j+1).value  = { 
                    text: sheet[i][j]["name"], 
                    hyperlink: sheet[i][j]["url"]
                };
            }
            //-----------------------------------------------------------//
        }


        //----------------------------------------------------------------------//
        for (let j = keys['цена продажная']+1;  j < keys['минимальная цена конкурента руб. (все)']; j++) {
            let value = parseInt(sheet[i][j]);
            //-----------------------------------------------------------------//
            if( !value ) continue;
            worksheet.getRow(i+1).getCell(j+1).value  = value;

            let price = parseInt(sheet[i][keys['цена продажная']]);
            if( !price ) continue;

            //----------------------------------------//
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
            //----------------------------------------//
        }
        //----------------------------------------------------------------------//




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
                        bgColor:{argb:'FF4DB6AC'}
                    };
                }else{
                    worksheet.getRow(i+1).getCell(j+1).fill = {
                        type: 'pattern', pattern:'solid',
                        fgColor:{argb:'FFFF8A65'},
                        bgColor:{argb:'FFFF8A65'}
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