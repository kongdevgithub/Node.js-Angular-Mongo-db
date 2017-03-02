/*
    logger.js
    WD Timer

    Created by Behnam Farrokhi, behnam.f.wiredelta@gmail.com, in April, 2015.
    Copyright Wiredelta 2015. All rights reserved.
*/

var winston = require('winston');
winston.emitErrs = true;


//  var logger = new (winston.Logger)({
//    transports: [
//      new (winston.transports.Console)(),
//      new (winston.transports.File)({ filename: '././log/wdtimer-info.log' })
//    ]
//  });



var logger = new(winston.Logger)({
    transports: [
        new(winston.transports.Console)(),
        new(winston.transports.File)({
            name: 'info-file',
            level: 'info',
            filename: './logs/worldofcrew-info.log',
            handleExceptions: true,
            json: true,
            maxsize: 5242880, //5MB
            maxFiles: 5,
            colorize: true
        }),
        new(winston.transports.File)({
            name: 'error-file',
            level: 'error',
            filename: './logs/worldofcrew-error.log',
            handleExceptions: true,
            json: true,
            maxsize: 5242880, //5MB
            maxFiles: 5,
            colorize: true
        })
    ],
    exitOnError: false
});

module.exports = logger;
