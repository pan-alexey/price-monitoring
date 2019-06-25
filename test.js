const path = require('path');
const root_path = path.dirname(require.main.filename || process.mainModule.filename);



const competitor = require(root_path+'/config/competitor');






(async () => {
    // console.log("test comptetitor");
    // name = competitor["220 вольт"];
    crawler = require( root_path+"/crawler/"+ competitor["юлмарт"] );
    let url = await crawler([
        'https://technopoint.ru/product/293c6c667f973330/surupovert-dewalt-dcf610d2-sale/',
        "https://technopoint.ru/product/b5f5893494d73361/drel-surupovert-bosch-gsr-1080-2-li-sale/",
        "https://technopoint.ru/product/6ba48d9dadea8a5a/drel-surupovert-bosch-psr-1800-li-2-sale/"
    ]);
    console.log(url);
})();



/*
IPsec VPN server is now ready for use!

Connect to your new VPN with these details:

Server IP: 188.120.234.7
IPsec PSK: L9NEPVMaEY8332rMzUF8
Username: vpnuser
Password: 3dmHYkWJut4vVrze

Write these down. You'll need them to connect!

Important notes:   https://git.io/vpnnotes
Setup VPN clients: https://git.io/vpnclients

*/