// #################################################################################################
// #################################### criador: Éricky Thierry ####################################
// ########################## github: https://github.com/erickythierry #############################
// #################################################################################################

//const fs = require('fs')
const express = require('express')
const path = require('path')
const db = require("./database")

const app = express()
const porta = process.env.PORT || 3000

app.use(express.static(__dirname + '/web'))
app.listen(porta, '0.0.0.0', function(){
    console.log("Listening on port ", porta)
    if (porta==3000){console.log('http://localhost:3000')}
});


app.get('/', function(req, res){
    res.sendFile(path.join(__dirname, '/web/index.html'))
})

app.get('/status', async function(req, res){
    res.json(await checa())
})

async function checa(){
    var isLogged = await db.redisget('isLogged')
    isLogged = (!isLogged) ? false : (isLogged=='true' || isLogged==true) ? true : false
    var error = await db.redisget('error')
    error = (!error) ? false : (error=='true' || error==true) ? true : false
    var qrcode = await db.redisget('qrcode')
    qrcode = (qrcode=="false") ? null : qrcode
    return {"isLogged": isLogged, "error": error, "qrcode": qrcode}


    //fileJson = JSON.parse(fs.readFileSync(file, 'utf8'));
    //return fileJson
    
}