var config = function() {
    return {
        tkl: {
            url: '/bus-tre/',
            username: 'businfo',
            password: 'businfo'
        },
        hsl: {
            url: '/bus-hsl/',
            username: 'businfo',
            password: 'businfo'
        },
        siri: {
            application_id: 'businfo',
            url: '/bus-siri/',
            username: 'its_factory_temp',
            password: 'ITS4devN'
        },
        siriRT: {
            url: '/bus-json/'
        },
        tampereCoordinates: {latitude: 61.4981, longitude: 23.760},
        helsinkiCoordinates: {latitude: 60.1675763, longitude: 24.9417421},

        messageUpdateIntervalMs: 1000*60*5,
        busUpdateIntervalMs: 1000*5,
        stopUpdateIntervalMs: 1000*30,

        bingCredentials: 'Aji7Whwv3vWGwS2X4HAqZTWJjF0z159P1yOBHxzXqa7Ri6zOG_NefNXuQLCKPhHj'
    };
};
