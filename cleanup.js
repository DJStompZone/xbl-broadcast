const axiosPackage = require('axios');
const { Authflow } = require('prismarine-auth');
const config = require('./config.json');

const axios = axiosPackage.create({
    validateStatus: code => true,
    headers: {
        'User-Agent': 'XboxServicesAPI/2020.11.20210204.1 c',
        'Content-Type': 'application/json',
        'x-xbl-contract-version': 107
    }
});

/**
 * This is the first function to be called.
 */
async function initialize() {
    const token = await oauthFlow();
    axios.defaults.headers.Authorization = token;

    const list = await axios.get('https://sessiondirectory.xboxlive.com/serviceconfigs/4fc10100-5f7a-4470-899b-280835760c07/sessionTemplates/MinecraftLobby/sessions?private=true&xuid=' + config.xuid);

    for (let session of list.data.results) {
        let name = session.sessionRef.name;
        console.log('Deleting session with name: ' + name);

        const del = await axios.delete(`https://sessiondirectory.xboxlive.com/serviceconfigs/4fc10100-5f7a-4470-899b-280835760c07/sessionTemplates/MinecraftLobby/sessions/${name}/members/me`);

        console.log(del.status);
    }

    console.log('Done');
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

initialize();