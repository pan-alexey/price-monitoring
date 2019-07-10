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

	// // -- Отключаем картинки и стили --//
	// await page.setRequestInterception(true);
	// page.on('request', request => {
    //     if ( request.resourceType() === 'image'  ||request.resourceType() == 'stylesheet' )request.abort();
	//     else request.continue();
	// });
    // // --/ Отключаем картинки и стили --//

    try {
        //-----  Блок настройки города на сайте конкурента  --------------//
        await page.goto("https://www.citilink.ru/",{timeout: 300000});
        await page.goto("https://www.citilink.ru/?action=changeCity&space=krd_cl:",{timeout: 300000});
        await page.waitFor(config.delay);
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
                await page.waitFor(300);
                let innerHTML = await page.evaluate(() => {
                    return document.documentElement.innerHTML;
                });
                let $ = cheerio.load(innerHTML);

                //Цена на товар
                let price = $('[itemprop="offers"]').find('[itemprop="price"]').attr('content');
                    price = price.replace(/[^.\d]+/g,"").replace( /^([^\.]*\.)|\./g, '$1' );
                    price = price && !isNaN(price) ? parseInt(price) : false;
                    price = price!==0 ? price : false;

                    
                // Перечеркнутая цена
                let priceAdd =   $('.product-sidebar').find('.old-price').text().replace(/[^0-9]/g, "");
                    priceAdd = priceAdd && !isNaN(priceAdd) ? parseInt(priceAdd) : false;
               
                // Парсинг наличия
                let selector = $(".product-sidebar .add_to_cart").text().toLowerCase();
                let avalible = ( selector.indexOf("купить")>=0  ) ? true : false;

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

                console.log("CATCH ERROR URL : " + array[i]);
                console.log(e);
            }
            //--------------------------------------------//
         }
    }
    browser.close();
    const end = new Date().getTime();
    let elapsed = parseInt( (end - start)/1000 ) ;
    let speed = parseInt(elapsed/array.length);
    // Выводим в консоль среднюю скорость обработки;
    console.log(" [competitors: '"+__filename.slice(__dirname.length + 1, -3)+"'; elapsed time: '"+elapsed+"'; count: "+array.length+"; avg: '"+speed+"';]");

    return result;
});