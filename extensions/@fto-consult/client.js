const fs = require('fs');
const process = require('process');
const WS = require('websocket').w3cwebsocket;
const { v4: uuidv4 } = require('uuid');
const {JSON:{isJSON}} = require("@fto-consult/electron-gen/src/utils");

// Obtain required params to start a WS connection from stdIn.
const processInput = JSON.parse(fs.readFileSync(process.stdin.fd, 'utf-8'));
const NL_PORT = processInput.nlPort;
const NL_TOKEN = processInput.nlToken;
const NL_EXTID = processInput.nlExtensionId;

const client = new WS(`ws://localhost:${NL_PORT}?extensionId=${NL_EXTID}`);

client.registerCallback = function(cb){
    client.onmessage = function(e) {
        const { event, data } = JSON.parse(e.data);
        if (event === "eventToExtension") {
            cb = typeof cb =="function"? cb : x=>true;
            return cb({
                event : e,
                eventName : event,
                data,
                client,
                sendMessage : (options)=>{
                    options = Object.assign({},options);
                    const {data} = options;
                    return client.send(JSON.stringify({
                        id: uuidv4(),
                        accessToken: NL_TOKEN,
                        ...options,
                        method: typeof options.method =="string" ? options.method : 'app.broadcast',
                        data: {
                            event: 'eventFromExtension',
                            data,
                        }
                    }))
                }
            })   
        }
    };
}

client.onerror = function() {
    log('Connection error!', 'ERROR');
};

client.onopen = function() {
    log('Connected');
};

client.onclose = function() {
    log('Connection closed');
    // Make sure to exit the extension process when WS extension is closed (when Neutralino app exits)
    process.exit();
};

function log(message, type = 'INFO') {
    const prefix = `extension : ${id} `;
    switch(type) {
        case 'WARNING':
            console.log(type,message,prefix);
            break;
        case 'ERROR':
            console.error(type,message,prefix);
            break;
        default :
            console.log('INFO',message,prefix);
            break;
    }
}
log.info = function(message){
    return log(message,'INFO');
}
log.error = function(message){
    return log(message,"ERROR")
}
log.warning = function(message){
    return log(message,"WARNING");
}

module.exports = {
    client,
    port : NL_PORT,
    token : NL_TOKEN,
    id : NL_EXTID,
    log,
}