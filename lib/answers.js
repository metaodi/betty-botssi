var os = require('os');
var Request = require('superagent');
var _ = require('underscore');

exports.shutdown = shutdown;
exports.hello = hello;
exports.uptime = uptime;
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

function recipe(bot, message) {
    var matches = new RegExp("re");

    var ingredients = ['tomato'];
    var apiKey = process.env.api_key;
    Request
    .get('http://food2fork.com/api/search?key=' + apiKey + '&q=' + encodeURIComponent(ingredients.join(',')))
    .end(function(err, res){
        if (err || res['count'] === 0) {
            bot.repy(message, 'No recipe found for ' + ingredients);
        } else {
            var recipe = res.recipes[0];
            bot.reply(
            	message, 
                {
    				"attachments": [
        				{
							"fallback": "Recipe for " + ingredients.join(','),
							"author_name": recipe.publisher,
							"author_link": recipe.publisher_url,
							"title": recipe.title,
							"title_link": recipe.source_url,
							"image_url": recipe.image_url
						}
				   ]
                }
            ); 
        }
    });
}


function hello(bot, message) {
    var msg = ':robot_face: I am a bot named <@' + bot.identity.name + '>. Hello <@' + message.user + '>!'; 
    bot.reply(message, msg);
}

function didNotUnderstand(bot, message) {
    var msg = 'Sorry, I did not understand you. I am a bot and you can ask me about recipes!' + "\n";
    bot.reply(message, msg);
}

function uptime(bot, message) {
    var hostname = os.hostname();
    var uptime = formatUptime(process.uptime());
    var msg = ':robot_face: I am a bot that has been running for ' + uptime + ' on ' + hostname + ".\n";
}

function formatUptime(uptime) {
    var unit = 'second';
    if (uptime > 60) {
        uptime = uptime / 60;
        unit = 'minute';
    }
    if (uptime > 60) {
        uptime = uptime / 60;
        unit = 'hour';
    }
    if (uptime !== 1) {
        unit = unit + 's';
    }

    uptime = uptime + ' ' + unit;
    return uptime;
}

