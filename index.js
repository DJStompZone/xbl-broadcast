const axiosPackage = require('axios');
const WebSocket = require('ws');
const uuid = require('uuid').v4;
const { Authflow } = require('prismarine-auth');
const fs = require('fs');
const config = require('./config.json');

// Delete the prismarine-auth cache directory
// fs.rmdirSync('./cache', { recursive: true });

// Create an axios instance with defaults
const axios = axiosPackage.create({
    validateStatus: code => true,
    headers: {
        'User-Agent': 'XboxServicesAPI/2020.11.20210204.1 c',
        'Content-Type': 'application/json',
        'x-xbl-contract-version': 107
    }
});

// Generate a random UUID to identify the session
const sessionId = uuid();

/**
 * This is the first function to be called.
 */
async function initialize() {
    const token = await oauthFlow();
    axios.defaults.headers.Authorization = token;

    await connectToWebSocket(token);
}

/**
 * OAuth Authentication.
 * 
 * @returns The authoriation header format
 */
async function oauthFlow() {
    const flow = new Authflow(config.gamertag, './cache', {
        authTitle: '00000000441cc96b',
        relyingParty: 'http://xboxlive.com'
    });
    
    const token = await flow.getXboxToken()
    const headerString = 'XBL3.0 x=' + token.userHash + ';' + token.XSTSToken;

    return headerString;
}

/**
 * Connect to the real time activity websocket.
 * 
 * We use this to create a `ConnectionId` to use in the request in 
 * {@link showWorldOnline}. The connection id is just a v4 UUID.
 * 
 * @param {string} token The auth token
 */
async function connectToWebSocket(token) {
    const socket = await new WebSocket('wss://rta.xboxlive.com/connect', { headers: { Authorization: token } });

    socket.on('open', () => {
        socket.send('[1,1,"https://sessiondirectory.xboxlive.com/connections/"]');
    });

    socket.on('message', (message) => {
        if (message.toString().includes('ConnectionId')) {
            const connectionId = JSON.parse(message)[4].ConnectionId;
            showWorldOnline(connectionId);
        }
    });

    socket.on('error', (e) => {
        console.error('WebSocket error', e);
    });
}

/**
 * Create a session with the world information.
 * 
 * @param {string} connectionId The connection id from the websocket
 */
async function showWorldOnline(connectionId) {
    let json = require('./data/create-session');
    json.members.me.properties.system.connection = connectionId;

    const createSessionResponse = await axios.put(`https://sessiondirectory.xboxlive.com/serviceconfigs/4fc10100-5f7a-4470-899b-280835760c07/sessionTemplates/MinecraftLobby/sessions/${sessionId}`, json);

    if (createSessionResponse.status !== 200 && createSessionResponse.status !== 201) {
        console.log('Error creating session, status: ' + createSessionResponse.status);
        console.log(createSessionResponse.data);
        return;
    }

    const createHandleResponse = await axios.post('https://sessiondirectory.xboxlive.com/handles', {
        version: 1,
        type: 'activity',
        sessionRef: {
            scid: '4fc10100-5f7a-4470-899b-280835760c07',
            templateName: 'MinecraftLobby',
            name: sessionId
        }
    });

    if (createHandleResponse.status !== 200 && createHandleResponse.status !== 201) {
        console.log('Error creating handle, status: ' + createHandleResponse.status);
        console.log(createHandleResponse.data);
        return;
    }

    console.log('Done');
}

initialize();