const path = require('path');
const request = require('async-request');
const csv = require('async-csv');



const root_path = path.dirname(require.main.filename || process.mainModule.filename);


const sheets = require(root_path+'/config/docs.js');



module.exports = (async function(name) {


    //---------- get url google docs ---------------------------------------------------//
    name = name.replace(/\s+/g, " ").replace(/^\s|\s$/g, "").toLowerCase();
    let uri = false;
    for (let sheet in sheets) {
      if(name == sheet.replace(/\s+/g, " ").replace(/^\s|\s$/g, "").toLowerCase()){
        uri = "https://docs.google.com/spreadsheets/d/"+sheets[sheet]+"/export?format=csv";
        break;
      }
    }
    if( uri== false ) return false;
    //---------/ get url google docs ---------------------------------------------------//

    //---------- get google docs csv ---------------------------------------------------//
    let req = await request(uri, {
            method: 'GET',
            headers: {},
    });
    let sheet = await csv.parse(req.body);
    //---------/ get google docs csv ---------------------------------------------------//
    

    return sheet;
});