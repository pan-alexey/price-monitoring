const path = require('path');
const request = require('async-request');



const root_path = path.dirname(require.main.filename || process.mainModule.filename);
const config = require(root_path+'/config/config');


module.exports = (async function(sheet) {
    if(sheet===false) return false;
    //---------------------------------------------------//
    //Находим колонку артикул
    let index = 1;  
    sheet[0].forEach(function(element,i){
        if (element === "артикул") index = i;
    });
    //---------------------------------------------------//
    let sku = [];
    for (let i = 1; i < sheet.length; i++) {
        sku.push({id : sheet[i][index]});
    }
    //---------------------------------------------------//
    let result = await request('https://www.kubaninstrument.ru/_api/test.php', {
        method: 'POST',
        data: {sku: sku},
        headers: {
            auth: config.auth
        },
    });
    result = JSON.parse(result.body);

    //---------------------------------------------------//
    for (let i = 1; i < sheet.length; i++) {
        sheet[i][index] = result[i-1];
    }
    return sheet;
});