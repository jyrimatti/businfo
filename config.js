var config = function() {
    return {
        tkl: {
            url: 'http://lahteenmaki.net/xdm?http://api.publictransport.tampere.fi/1_0_2/',
            username: 'businfo',
            password: 'businfo'
        },
        hsl: {
            url: 'http://lahteenmaki.net/xdm?http://api.reittiopas.fi/hsl/prod/',
            username: 'businfo',
            password: 'businfo'
        },
        siri: {
            application_id: 'businfo',
            url: 'http://lahteenmaki.net/xdm?https://siri.ij2010.tampere.fi/ws',
            username: 'its_factory_temp',
            password: 'ITS4devN'
        },
        siriRT: {
            url: 'http://lahteenmaki.net/xdm?http://data.itsfactory.fi/siriaccess/vm/json'
        },
        tampereCoordinates: {latitude: 61.4981, longitude: 23.760},
        helsinkiCoordinates: {latitude: 60.1675763, longitude: 24.9417421},

        messageUpdateIntervalMs: 1000*60*5,
        busUpdateIntervalMs: 1000*5,
        stopUpdateIntervalMs: 1000*30,

        bingCredentials: 'Aji7Whwv3vWGwS2X4HAqZTWJjF0z159P1yOBHxzXqa7Ri6zOG_NefNXuQLCKPhHj'
    };
};