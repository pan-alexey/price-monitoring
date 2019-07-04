const path = require('path');
const root_path = path.dirname(require.main.filename || process.mainModule.filename);



const competitor = require(root_path+'/config/competitor');






(async () => {
    // console.log("test comptetitor");
    // name = competitor["220 вольт"];
    crawler = require( root_path+"/crawler/"+ competitor["metabo.su"] );
    let url = await crawler([
        'https://metabo.su/tools/akkumulyatornye-instrumenty/zaryadnye-ustroystva/basic-set-40-2-akk-40ach-18vzu-asc-30-36-685050000/',
        'https://metabo.su/tools/sverlenie-zavinchivanie-dolblenie-peremeshivanie/akkumulyatornye-dreli/akkumulyatornyy-vintovert-bs-18-ltx-impuls-18-volt-60219165/',
        'https://metabo.su/tools/sverlenie-zavinchivanie-dolblenie-peremeshivanie/akkumulyatornye-dreli/akkumulyatornyj-vintovert-powermaxx-bs-quick-pro-10-8-vol-t-600157700/',
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