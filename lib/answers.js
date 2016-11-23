var os = require('os');
var Request = require('superagent');
var _ = require('underscore');

exports.shutdown = shutdown;
exports.hello = hello;
exports.uptime = uptime;
exports.list = list;
exports.didNotUnderstand = didNotUnderstand;

function shutdown(bot, message) {
    bot.startConversation(message,function(err, convo) {
        convo.ask('Are you sure you want me to shutdown?',[
            {
                pattern: bot.utterances.yes,
                callback: function(response, convo) {
                    convo.say('Bye!');
                    convo.next();
                    setTimeout(function() {
                        process.exit();
                    },3000);
                }
            },
        {
            pattern: bot.utterances.no,
            default: true,
            callback: function(response, convo) {
                convo.say('*Phew!*');
                convo.next();
            }
        }
        ]);
    });
}


function hello(bot, message) {
    var msg = ':robot_face: I am a bot named <@' + bot.identity.name + '>. Hello <@' + message.user + '>!'; 
    bot.reply(message, msg);
}

function didNotUnderstand(bot, message) {
    var msg = 'Sorry, I did not understand you. I am a bot and you can ask me about the following topics: ' + "\n";
    msg += format.list();
    bot.reply(message, msg);
}


function uptime(bot, message) {
    var hostname = os.hostname();
    var uptime = format.uptime(process.uptime());
    
    var msg = ':robot_face: I am a bot that has been running for ' + uptime + ' on ' + hostname + ".\n";
    msg += 'I know about:' + "\n";
    msg += format.list();
    bot.reply(message, msg);
}
