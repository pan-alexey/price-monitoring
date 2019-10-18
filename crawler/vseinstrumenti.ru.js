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
    browserPparams.args = ['--ignore-certificate-errors'];

    // let proxy = config.proxy;
    // if( proxy ) { browserPparams.args.push('--proxy-server=' + proxy );}// Настройка для прокси

    const browser = await puppeteer.launch(browserPparams);
    const page = await browser.newPage();
    await page.setViewport({ width:  1366, height: 768 });
    await page.setGeolocation({latitude: 45.043396, longitude: 38.981116});





	// // -- Отключаем картинки и стили --//
	// await page.setRequestInterception(true);
	// page.on('request', request => {
    //     if ( request.resourceType() === 'image'  ||request.resourceType() == 'stylesheet' )request.abort();
	//     else request.continue();
	// });
    // // --/ Отключаем картинки и стили --//

    try {
        //-----  Блок настройки города на сайте конкурента  --------------//
        await page.goto("https://krasnodar.vseinstrumenti.ru/",{timeout: 300000});
        await page.waitFor(config.delay);

        // await page.evaluate(()=>{
        //     const nodeList = document.querySelectorAll('[data-behaviour="choseRepresent"]');
        //     for(let i = 0; i < nodeList.length; ++i) {
        //         regionButton[i].click();
        //     }
        // }); 

        //----/  Блок настройки города на сайте конкурента  --------------//
    }catch(e){}



    let result = {};
    for (let i = 0; i < array.length; i++) {
        //--------------------------------------------//
        if (array[i] != "") {
            //--------------------------------------------//
            try {

                let pureUrl = array[i];

                await page.goto(pureUrl,{timeout: 300000});
                await page.waitFor(1000);

                let innerHTML = await page.evaluate(() => {
                    return document.documentElement.innerHTML;
                });
                let $ = cheerio.load(innerHTML);

                //Цена на товар
                let price = $('[itemprop="offers"]').find('[itemprop="price"]').attr('content');
                    price = price && !isNaN(price) ? parseInt(price) : false;

                if( $('[itemprop="offers"]').find('[data-behaviour="get-analog"]').text() ){
                    price = false;
                }


                // Перечеркнутая цена
                let priceAdd =  (  $('[itemprop="offers"]').find('.saled-price-value').text()  ).toString().replace(/[^.\d]+/g,"").replace( /^([^\.]*\.)|\./g, '$1' );
                    priceAdd = priceAdd && !isNaN(priceAdd) ? parseInt(priceAdd) : false;
               

                    



                // Парсинг наличия
                let selector = $('[itemprop="offers"]').find('[data-behavior="add-to-cart"]').text().toLowerCase();
                let avalible = ( selector.indexOf("в корзину")>=0  ) ? true : false;

                //Формируем результат
                result[array[i]] = {
                    status : "ok",
                    price : price,
                    priceAdd : priceAdd,
                    avalible : avalible,
                    //time : moment().format("YYYY-MM-DD HH:mm:ss"),
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