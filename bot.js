let Discord = require('discord.io');
let logger = require('winston');
let auth = require('./auth.json');
let db = require('./lib/db');
let utils = require('./lib/utils');
const http = require("http");


// Configure logger settings
logger.remove(logger.transports.Console);
logger.add(new logger.transports.Console, {
    colorize: true
});
logger.level = 'debug';

// Initialize Discord Bot
let bot = new Discord.Client({
    token: auth.token,
    autorun: true
});
let templateMessage = {
    "title": "Nouvelle Strip Détectée :D !",
    "description": "",
    "color": 11877296,
    "thumbnail": {
        "url": "https://cdn.discordapp.com/app-icons/616259187789398016/500f1922e7cae293a92287d95020ae30.png?size=256"
    },
    "author": {
        "name": "CommitStrip",
        "url": "http://www.commitstrip.com/",
        "icon_url": "https://cdn.discordapp.com/app-icons/616259187789398016/500f1922e7cae293a92287d95020ae30.png?size=256"
    },
    "fields": [
    ]
};
let id;
let strips = [];
let subscriber = [];

bot.setPresence({
    game: {
        name: "stalking CommitStrip"
    }
});
bot.on('ready', function (evt) {
    logger.info('Connected');
    logger.info('Logged in as: ');
    logger.info(bot.username + ' - (' + bot.id + ')');
    db.retrieveAllChannels(function () {}, subscriber);
    db.retrieveAllStrips(function () {
        setInterval(function () {
            console.log("Refreshing ...");
            updateStrips();
        },1800000);
    }, strips);

    setTimeout(function () {
        console.log("Refreshing ...");
        updateStrips();
    },3000);
});
bot.on('message', function (user, userID, channelID, message, evt) {

    if (message.substring(0, 7) === 'commit?') {
        var args = message.substring(7).split(' ');
        var cmd = args[0];

        args = args.splice(1);
        switch (cmd) {
            case 'test':
                console.log(strips);
                console.log(subscriber);
                break;
            case 'last':
                retrieveLastTwoStrips(channelID);
                break;
            case 'subscribe':
                let present = false;
                subscriber.forEach(function (sub) {
                    if (sub === channelID) {
                        present = true;
                    }
                });
                if (present === true) {
                    bot.sendMessage({
                        to: channelID,
                        message: 'This channel is already subscribed to CommitStrip Updates !'
                    });
                } else {
                    subscriber.push(channelID);
                    db.insertChannel(channelID);
                    bot.sendMessage({
                        to: channelID,
                        message: 'Successfully subscribed to CommitStrip Updates !'
                    });
                }
                break;
            case 'unsubscribe':
                for( var i = 0; i < subscriber.length; i++){
                    if ( subscriber[i] === channelID) {
                        subscriber.splice(i, 1);
                        console.log("Asking to remove : " + channelID);
                        db.removeChannel(channelID);
                        i--;
                    }
                }
                bot.sendMessage({
                    to: channelID,
                    message: 'Successfully unsubscribed to CommitStrip Updates !'
                });
                break;
        }
    }
});

function updateStrips(channelID) {
    const options = {
        host: 'www.commitstrip.com',
        port: 80,
        path: '/fr/?'
    };

    let content = "";
    const regex = /\"http.+\/....\/..\/..\/.+\/\"/g;

    http.get(options, function (res) {
        console.log("Got response: " + res.statusCode);
        res.setEncoding('utf8');
        res.on('data', function (chunk) {
            content += chunk;
        });
        res.on('end', function () {
            let tab = content.split("\n");
            let ref = [];
            tab.forEach(function (line) {
                if (line.includes("href") && !line.includes("<!--")) {
                    let m;
                    while ((m = regex.exec(line)) !== null) {
                        // This is necessary to avoid infinite loops with zero-width matches
                        if (m.index === regex.lastIndex) {
                            regex.lastIndex++;
                        }

                        // The result can be accessed through the `m`-variable.
                        m.forEach((match, groupIndex) => {
                            ref.push(match)
                        });
                    }
                }
            });
            ref.sort(function (a, b) {
                return b - a
            });

            let newItems = utils.compareTabs(strips, ref);
            console.log("New Items : " + newItems);
            let copyMessageTemplate = JSON.parse(JSON.stringify(templateMessage));

            newItems.forEach(function (item) {
                console.log("Inserting : " + item);
                db.insertStrips(item);
                strips.push(item);
                copyMessageTemplate.fields.push({
                    "name": ":point_right: Lien vers le nouveau WebComic :",
                    "value": item
                });
            });
            if (newItems.length !== 0) {
                subscriber.forEach(function (sub) {
                    bot.sendMessage({
                        to: sub,
                        embed: copyMessageTemplate
                    });
                })
            }
        })
    }).on('error', function (e) {
        console.log("Got error: " + e.message);
        bot.sendMessage({
            to: channelID,
            message: "Something went wrong with the strip retrieval ..."
        })
    });
}

function retrieveLastTwoStrips(channelID) {
    strips = strips.sort();
    bot.sendMessage({
        to: channelID,
        message: "Last 2 Strip : \n" + strips[strips.length - 2] + "\n" + strips[strips.length - 1]
    });
}
