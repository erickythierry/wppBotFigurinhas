// #################################################################################################
// #################################### criador: Éricky Thierry ####################################
// ########################## github: https://github.com/erickythierry #############################
// #################################################################################################

const redis = require("async-redis");
var url = require('url');
var redisURL = new url.URL(process.env.REDISCLOUD_URL);

const client = redis.createClient({
    host: redisURL.hostname,
    port: redisURL.port,
    password: redisURL.password
});



client.on('error', err => {
    console.log('Error ' + err);
});

async function set(key, value, expire){
    if(!isNaN(expire)){
        return await client.set(key, value, 'EX', expire);
        
    }else if(expire=='keep'){
        return await client.set(key, value, 'KEEPTTL');
    }else{
        return await client.set(key, value);
        
    }
    
}

async function mset(listkey, listvalue){
    arr = []
    for (var i = 0; i < listkey.length; i++) {
        arr.push(listkey[i]);
        arr.push(listvalue[i]);
    }

    return await client.mset(arr);
}

async function get(key){
    return await client.get(key);
}

async function incr(key){
    return await client.incr(key);
}

async function timetoexpire(key){
    return await client.ttl(key)
}

module.exports = {
    
    client,
    redisget: (key) => get(key),
    redisset: (key, value, expire) => set(key, value, expire),
    redismset: (listkey, listvalue) => mset(listkey, listvalue),
    redisincr: (key) => incr(key),
    redisttl: (key) => timetoexpire(key)
}