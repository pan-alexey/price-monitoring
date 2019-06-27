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
    if( proxy ) { browserPparams.args.push('--proxy-server=' + proxy );}

    
    const browser = await puppeteer.launch(browserPparams);
    const page = await browser.newPage();
    await page.setViewport({ width:  1366, height: 768 });
    //await page.setGeolocation({latitude: 59.95, longitude: 30.31667});


	//-- Отключаем картинки и стили --//
	await page.setRequestInterception(true);
	page.on('request', request => {
        if ( request.resourceType() === 'image'  ||request.resourceType() == 'stylesheet' )request.abort();
	    else request.continue();
	});
    //--/ Отключаем картинки и стили --//

    try {
        //-----  Блок настройки города на сайте конкурента  --------------//
        await page.goto("https://obi.ru/store/change?storeID=030&redirectUrl=https%3A%2F%2Fwww.obi.ru%2Fbasseiny-dlya-dachi%2Fbassein-karkasnyi-kruglyi-bestway-steel-pro-max-305x76-sm%2Fp%2F4037834%23",{timeout: 300000});
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
                await page.waitFor(config.delay);

                let innerHTML = await page.evaluate(() => {
                    return document.documentElement.innerHTML;
                });
                let $ = cheerio.load(innerHTML);

                //Цена на товар
                let price = $('#ProductOverview').find('[itemprop="price"]').text();
                    price = price ? parseInt(price.toString().replace(/\s/g, '')):false;
                    price = price && !isNaN(price) ? parseInt(price) : false; 

                // // Перечеркнутая цена
                let priceAdd =   $('#ProductOverview').find('.optional-hidden del').text().replace(/\,.*/, '').replace(/\s/g, '');
                    priceAdd = priceAdd && !isNaN(priceAdd) ? parseInt(priceAdd) : false;
               

                // Парсинг наличия
                let selector = $(".button-to-card").find(".flag__body")
                               .text().toLowerCase();
                let avalible = ( selector.indexOf("добавить в корзину")>=0  ) ? true : false;

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