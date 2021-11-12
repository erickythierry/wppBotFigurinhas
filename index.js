// #################################################################################################
// #################################### criador: Éricky Thierry ####################################
// ########################## github: https://github.com/erickythierry #############################
// #################################################################################################

const venom = require('venom-bot');
const fs = require('fs');
const mime = require('mime-types');
const ffmpeg = require('fluent-ffmpeg')
const db = require("./database")


db.redisset('isLogged', false)
.then(async () =>{
        await db.redisset('error', false)
        await db.redisset('qrcode', false)
})


const getRandom = (ext) => {return `${Math.floor(Math.random() * 1000000)}${ext}`}

outputOptions = [
    `-vcodec`,`libwebp`,`-vf`,
    `scale=500:500:force_original_aspect_ratio=decrease,setsar=1,fps=15, pad=500:500:-1:-1:color=white@0.0, split [a][b]; [a] palettegen=reserve_transparent=on:transparency_color=ffffff [p]; [b][p] paletteuse`,
    `-loop`,`0`,`-ss`, `00:00:00.0`,`-t`,`00:00:10.0`,`-preset`,`default`,`-an`,`-vsync`,`0` 
];

venom
  .create({
    session: 'jubiscleison-bot', //name of session
    multidevice: true, // for version not multidevice use false.(default: true)
    browserArgs: ['--no-sandbox', '--disable-setuid-sandbox'],
    headless: true
  },
  (base64Qrimg) => {
    console.log('qrcode base64 gerado');
    db.redisset('qrcode', base64Qrimg)
    // fileJson = JSON.parse(fs.readFileSync("status.json", 'utf8'))
    // fileJson.qrcode = base64Qrimg
    // fs.writeFileSync("status.json", (JSON.stringify(fileJson, null, 2)))
  },
  (statusSession) => {
    console.log('Status Session: ', statusSession); //return isLogged || notLogged || browserClose || qrReadSuccess || qrReadFail || autocloseCalled || desconnectedMobile || deleteToken || chatsAvailable || deviceNotConnected || serverWssNotConnected || noOpenBrowser
    if(statusSession=='browserClose' || statusSession=='autocloseCalled' || statusSession=='qrReadFail' || statusSession=='noOpenBrowser'){
        db.redisset('error', true)
        db.redisset('qrcode', false)
        // fileJson = JSON.parse(fs.readFileSync("status.json", 'utf8'))
        // fileJson.error = true
        // fileJson.qrcode = null
        // fs.writeFileSync("status.json", (JSON.stringify(fileJson, null, 2)))

    }else if(statusSession=='isLogged' || statusSession=='qrReadSuccess' || statusSession=='chatsAvailable'){
        db.redisset('isLogged', true)
        db.redisset('error', false)
        db.redisset('qrcode', false)
        // fileJson = JSON.parse(fs.readFileSync("status.json", 'utf8'))
        // fileJson.error = false
        // fileJson.qrcode = null
        // fileJson.isLogged = true
        // fs.writeFileSync("status.json", (JSON.stringify(fileJson, null, 2)))
    }
  })
  .then((client) => start(client))
  .catch((erro) => {
    console.log(erro);
    db.redisset('error', true)
    db.redisset('qrcode', false)
    // fileJson = JSON.parse(fs.readFileSync("status.json", 'utf8'))
    // fileJson.error = true
    // fileJson.qrcode = null
    // fs.writeFileSync("status.json", (JSON.stringify(fileJson, null, 2)))
  });

function start(client) {
  client.onMessage(async (message) => {
    console.log(message)
    if (message.body === '/status') {
      client
        .sendText(message.from, 'bot on!')
        .then((result) => {
          console.log('Result: ', result); //return object success
        })
        .catch((erro) => {
          console.error('Error when sending: ', erro); //return object error
        });
    }
    if((message.isMedia === true || message.isMMS === true) && message?.caption=='/sticker'){
        const buffer = await client.decryptFile(message);
        // At this point you can do whatever you want with the buffer
        // Most likely you want to write it into a file
        const fileName = `download_${getRandom('')}.${mime.extension(message.mimetype)}`;
        fs.writeFileSync(fileName, buffer);
        
        if(fileName.endsWith('.jpeg')){
            webpfilename = (fileName.replace('.jpeg', ''))+'.webp'
            ffmpeg(`./${fileName}`)
            .input(fileName)
            .on('error', function (err) {
                console.log('ffmpeg:', err)
                
                
                fs.unlinkSync(`./${fileName}`)
            })
            .on('end', async function () {
                await client
                .sendImageAsSticker(message.from, `./${webpfilename}`)
                .then((result) => {
                    console.log('sticker enviado: ', result); //return object success
                })
                .catch((erro) => {
                    console.error('Error when sending sticker: ', erro); //return object error
                });
            })
            .addOutputOptions(outputOptions)
            .toFormat('webp')
            .save(webpfilename)
        }

        if(fileName.endsWith('.mp4')){
            webpfilename = (fileName.replace('.mp4', ''))+'.webp'
            ffmpeg(`./${fileName}`)
            .inputFormat(fileName.split('.')[1])
            .on('error', function (err) {
                console.log('ffmpeg:', err)
                
            })
            .on('end', async function () {
                await client
                .sendImageAsStickerGif(message.from, `./${webpfilename}`)
                .then((result) => {
                    console.log('sticker enviado: ', result); //return object success
                })
                .catch((erro) => {
                    console.error('Error when sending sticker: ', erro); //return object error
                });
                
            })
            .addOutputOptions(outputOptions)
            .toFormat('webp')
            .save(webpfilename)
        }


    }
  });
}