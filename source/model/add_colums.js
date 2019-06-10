const path = require('path');
const root_path = path.dirname(require.main.filename || process.mainModule.filename);


//------------------------------------------------------//
module.exports = (async function(sheet) {

    let position = 8;
    sheet[0].forEach(function(element,index){
        if (element.toLowerCase() === "Код поставщика") {position = index+1;}
    });

    let result = [];
    for (let i = 0; i < sheet.length; i++) {
        let index = 0;
        result[i] = [];

        for (let j = 0; j < position; j++) {
            result[i][index] = sheet[i][j];
            result[i][index] = sheet[i][j];
            index++;
        }

        result[i][index++] = i!=0 ? '' : "Остаток";
        result[i][index++] = i!=0 ? '' : "Дата";
        result[i][index++] = i!=0 ? '' : "Цена закупки";
        result[i][index++] = i!=0 ? '' : "Цена продажная";


        result[i][index++] = i!=0 ? '' : "Рекомендованная цена руб. (В наличии + избранное)";
        result[i][index++] = i!=0 ? '' : "Рекомендованная цена руб. (В наличии)";
        result[i][index++] = i!=0 ? '' : "Рекомендованная цена руб. (В наличии + под заказ)";
        result[i][index++] = i!=0 ? '' : "Рекомендованная цена руб. (По всем конкурентам)";

        result[i][index++] = i!=0 ? '' : "Актуальная - Рекомендованная цена руб. (В наличии + избранное)";
        result[i][index++] = i!=0 ? '' : "Актуальная - Рекомендованная цена руб. (В наличии)";
        result[i][index++] = i!=0 ? '' : "Актуальная - Рекомендованная цена руб. (В наличии + под заказ)";
        result[i][index++] = i!=0 ? '' : "Актуальная - Рекомендованная цена руб. (По всем конкурентам)";




        result[i][index++] = i!=0 ? '' : "Минимальная цена конкурента (В наличии + избранное)";
        result[i][index++] = i!=0 ? '' : "Минимальная цена конкурента руб. (В наличии)";
        result[i][index++] = i!=0 ? '' : "Минимальная цена конкурента руб. (В наличии и под заказ)";
        result[i][index++] = i!=0 ? '' : "Минимальная цена конкурента руб. (Все)";

        result[i][index++] = i!=0 ? '' : "Конкуренты с меншьей ценой (В наличии + избранное)";
        result[i][index++] = i!=0 ? '' : "Конкуренты с меншьей ценой (В наличии)";
        result[i][index++] = i!=0 ? '' : "Конкуренты с меншьей ценой (В наличии + под заказ)";
        result[i][index++] = i!=0 ? '' : "Конкуренты с меншьей ценой (Все)";

        result[i][index++] = i!=0 ? '' : "Конкуренты с меншьей ценой РРЦ (В наличии + избранное)";
        result[i][index++] = i!=0 ? '' : "Конкуренты с меншьей ценой РРЦ (В наличии)";
        result[i][index++] = i!=0 ? '' : "Конкуренты с меншьей ценой РРЦ (В наличии + под заказ)";
        result[i][index++] = i!=0 ? '' : "Конкуренты с меншьей ценой РРЦ (Все)";


        result[i][index++] = i!=0 ? '' : "*"; 

        for (let j = position; j < sheet[i].length; j++) {
            result[i][index] = sheet[i][j];
            result[i][index] = sheet[i][j];
            index++;
        }
    }
    return result;
});
//------------------------------------------------------//