const cheerio = require('cheerio')
const puppeteer = require('puppeteer');
const path = require('path');
const delay = require('delay');
const moment = require('moment');

const root_path = path.dirname(require.main.filename || process.mainModule.filename);
const config = require(root_path+'/config/puppeteer.js');




//--------------------------------------------------------------------------------------//
module.exports = (async function(array) {
    const start= new Date().getTime();
    

    let browserPparams = {};
    browserPparams.headless = false;//true;
    browserPparams.ignoreHTTPSErrors = true;


    let proxy = config.proxy;
    browserPparams.args = ['--ignore-certificate-errors'];
    if( proxy ) { browserPparams.args.push('--proxy-server=' + proxy );}// Настройка для прокси
    

    
    const browser = await puppeteer.launch(browserPparams);
    const page = await browser.newPage();
    await page.setViewport({ width:  1366, height: 768 });
    //await page.setGeolocation({latitude: 59.95, longitude: 30.31667});


	// //-- Отключаем картинки и стили --//
	// await page.setRequestInterception(true);
	// page.on('request', request => {
    //     if ( request.resourceType() === 'image'  ||request.resourceType() == 'stylesheet' )request.abort();
	//     else request.continue();
	// });
    // //--/ Отключаем картинки и стили --//

    try {
        //-----  Блок настройки города на сайте конкурента  --------------//
        await page.goto("https://www.udarnik74.ru/?CityCode=1404",{timeout: 300000});
        await page.waitFor(100);
        //----/  Блок настройки города на сайте конкурента  --------------//
    }catch(e){}



    let result = {};
    for (let i = 0; i < array.length; i++) {
        //--------------------------------------------//
        if (array[i] != "") {
            //--------------------------------------------//
            try {

                let pureUrl = array[i].split('?')[0];

                await page.goto(pureUrl,{timeout: 300000});
                await page.waitFor(100);
                
                let innerHTML = await page.evaluate(() => {
                    return document.documentElement.innerHTML;
                });
                let $ = cheerio.load(innerHTML);

                //Цена на товар
                let price = $('.catalog-detail__main').find('.catalog-item__price-buy').text().replace(/[^.\d]+/g,"").replace( /^([^\.]*\.)|\./g, '$1' ) ;
                    price = price ? parseInt(price.replace(/\s/g, '')):false;

                // Перечеркнутая цена
                let priceAdd =  $('.catalog-detail__main').find('.catalog-detail__price-old').text().replace(/[^.\d]+/g,"").replace( /^([^\.]*\.)|\./g, '$1' ) ;
                    priceAdd = priceAdd && !isNaN(priceAdd) ? parseInt(priceAdd) : false;
                


                // Парсинг наличия
                let selector = $('.catalog-detail__main').find('.js__add2basket')
                               .text().toLowerCase();
                let avalible = (  selector.indexOf("в корзину")>=0  ) ? true : false;

                //Формируем результат
                result[array[i]] = {
                    status : "ok",
                    price : price,
                    priceAdd : priceAdd,
                    avalible : avalible,
                    time : moment().format("YYYY-MM-DD HH:mm:ss")
                }
            }catch(e){
                result[array[i]] = {
                    status : "error",
                    price : '',
                    
                }
            }
            //--------------------------------------------//
         }
    }
    browser.close();
    const end = new Date().getTime();
    let elapsed = end - start;
    let speed = elapsed/array.length;
    // Выводим в консоль среднюю скорость обработки;
    console.log("+++ Средняя скорость обработки 220-вольт "+speed+"ms +++");
    


    return result;
});