const path = require('path');
const root_path = path.dirname(require.main.filename || process.mainModule.filename);



const competitor = require(root_path+'/config/competitor');






(async () => {
    // console.log("test comptetitor");
    // name = competitor["220 вольт"];
    crawler = require( root_path+"/crawler/"+ competitor["озон"] );
    let url = await crawler([
        'https://www.ozon.ru/context/detail/id/3853950/',
        'https://www.ozon.ru/context/detail/id/19761409/',
        'https://www.ozon.ru/context/detail/id/26058375/',
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