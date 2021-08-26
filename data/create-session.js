const config = require('../config.json');
const { generateGuid } = require('../utils');

const rakNetGuid = generateGuid(20);

const data = {
    properties: {
        system: {
            joinRestriction: 'followed',
            readRestriction: 'followed',
            closed: false
        },
        custom: {
            Joinability: 'joinable_by_friends',
            hostName: config.server.hostName,
            ownerId: config.xuid,
            rakNetGUID: rakNetGuid,
            version: config.server.version,
            levelId: 'mUUmYap7EQA=',
            worldName: config.server.worldName,
            worldType: config.server.worldType,
            protocol: config.server.protocol,
            MemberCount: 0,
            MaxMemberCount: config.server.maxPlayers,
            BroadcastSetting: 2,
            LanGame: true,
            OnlineCrossPlatformGame: true,
            CrossPlayDisabled: false,
            TitleId: '00000000441cc96b',
            SupportedConnections: [
                {
                    ConnectionType: 2,
                    HostIpAddress: '159.65.207.50', // test.pmmp.io
                    HostPort: 19132,
                    RakNetGUID: ''
                }
            ]
        }
    },
    members: {
        me: {
            constants: {
                system: {
                    xuid: config.xuid,
                    initialize: true
                }
            },
            properties: {
                system: {
                    active: true,
                    connection: 'this-will-be-replaced-by-a-specific-uuid',
                    subscription: {
                        id: '845CC784-7348-4A27-BCDE-C083579DD113',
                        changeTypes: [
                            'everything'
                        ]
                    }
                }
            }
        }
    }
}

module.exports = data;