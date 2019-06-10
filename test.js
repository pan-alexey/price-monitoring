const path = require('path');
const root_path = path.dirname(require.main.filename || process.mainModule.filename);



const competitor = require(root_path+'/config/competitor');






(async () => {
    // console.log("test comptetitor");
    // name = competitor["220 вольт"];
    crawler = require( root_path+"/crawler/"+ competitor["все инструменты"] );
    let url = await crawler([
        'https://krasnodar.vseinstrumenti.ru/instrument/shurupoverty/akkumulyatornye-dreli/bezudarnye/dewalt/dcd-710-d2/',
        "https://krasnodar.vseinstrumenti.ru/sadovaya-tehnika/vozduhoduvki/akkumulyatornye/dewalt/akk-xr-18-v-brushless-bez-akk-i-zu-dcm562pb/"
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