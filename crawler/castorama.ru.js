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



    const cookie = {
        name: 'login_email',
        value: 'set_by_cookie@domain.com',
        domain: '.paypal.com',

    }



    const browser = await puppeteer.launch(browserPparams);
    const page = await browser.newPage();
    await page.setViewport({ width:  1366, height: 768 });


    //Устанавливаем cookie
    await page.setCookie( {
        name: 'store',
        value: 'krasnodar_ru',
        domain: '.castorama.ru',
        path : "/"
    });

    await page.setCookie( {
        name: 'castorama_current_shop',
        value: '30',
        domain: '.castorama.ru',
        path : "/"
    });
    

    //await page.setGeolocation({latitude: 59.95, longitude: 30.31667});

	// -- Отключаем картинки и стили --//
	await page.setRequestInterception(true);
	page.on('request', request => {
        if ( request.resourceType() === 'image'  ||request.resourceType() == 'stylesheet' )request.abort();
	    else request.continue();
	});
    // --/ Отключаем картинки и стили --//

    try {
        //-----  Блок настройки города на сайте конкурента  --------------//
        await page.goto("https://baucenter.ru/",{timeout: 300000});
        await page.waitFor(3000);
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
                await page.waitFor(1000);

                let innerHTML = await page.evaluate(() => {
                    return document.documentElement.innerHTML;
                });
                let $ = cheerio.load(innerHTML);

                //Цена на товар
                let price = $('.product-view').find('[itemprop="price"]').first().text();

                price = price.replace(/[^.\d]+/g,"").replace( /^([^\.]*\.)|\./g, '$1' );
                    price = price && !isNaN(price) ? parseInt(price) : false;

                // Перечеркнутая цена
                let priceAdd =  false;
               
                // Парсинг наличия
                let selector = $('.product-view').find(".add-to-cart-buttons").text().toLowerCase();
                let avalible = ( selector.indexOf("в корзину")>=0  ) ? true : false;

                //Формируем результат
                result[array[i]] = {
                    status : "ok",
                    price : price,
                    priceAdd : priceAdd,
                    avalible : avalible,
                    time : moment().format("YYYY-MM-DD HH:mm:ss"),
                }
            }catch(e){
                result[array[i]] = {
                    status : "error",
                }
            }
            //--------------------------------------------//
         }
    }
    browser.close();
    const end = new Date().getTime();
    let elapsed = end - start;
    return result;
});