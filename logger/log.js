const logger = require('../logger/index')
const email = require("nodemailer")
const url = require('url')
// function to generate file and send mail for error 
function errorlog(err,req){
    var parsedUrl = url.parse(req.url,true)
    const errObj = {
        ipAddres:req.ip,
        message:err.message,
        errStatus:err.status || 500,
        originalUrl:req.originalUrl,
        parameters:parsedUrl.query,
        reqMethod:req.method,
        search:parsedUrl.search,
      log: console.log(err)
    }
    // creating log files of error
    logger.info(errObj);

}

module.exports = errorlog