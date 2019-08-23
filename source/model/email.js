const path = require('path');

module.exports = function(name, excel){

    return new Promise(function(resolve, reject) {
        let nodemailer = require('nodemailer');
        let mail_text = "РЕЗУЛЬТАТ РАБОТЫ РОБОТА" + name ;
    
        var transporter = nodemailer.createTransport({
            host: 'smtp.yandex.ru',
            port: 465,
            secure: true, // true for 465, false for other ports
            auth: {
                user: 'kubaninstrument@yandex.ru', // generated ethereal user
                pass: 'kubaninstrument_online060' // generated ethereal password
            }
        });
        var mailOptions = {
            from: 'kubaninstrument@yandex.ru',
            to: 'pan@kubaninstrument.ru',
            cc: 'fomenko@kubaninstrument.ru',
            cc: 'samvel@kubaninstrument.ru',
            subject: 'Результат работы для: '+name,
            text: mail_text,
            attachments: [
                {
                    filename: name+'.xlsx',
                    path: excel
                }
            ]
        };
    
        transporter.sendMail(mailOptions, function(error, info){
             if (error) { reject(error);} else { resolve(); }
        });
    
    
    }).catch(function(error){
            console.log( error );
    });
}


