var os = require('os');
var Request = require('superagent');
var _ = require('underscore');

exports.shutdown = shutdown;
exports.hello = hello;
exports.recipe = recipe;
exports.uptime = uptime;
exports.didNotUnderstand = didNotUnderstand;

function answer(bot, message, answer) {
    console.log(message.ts, answer);
    bot.reply(message, answer);
}

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
    var re = new RegExp("recipes?( with)? (.*)", "i");
    var matches = re.exec(message.text);

    if (!matches || matches.length <= 2) {
        return didNotUnderstand(bot, message);
    }

    var splitter = ['or', 'and', ','];
    var ingredientsText = matches[2];

    var ingredients = ingredientsText.split(/or|and|,/);
    ingredients = _.map(ingredients, function(i) { return i.trim(); });

    Request
     .get('http://www.recipepuppy.com/api/?i=' + encodeURIComponent(ingredients.join(',')))
     .end(function(err, res){
          var result = parseApiResult(err, res, bot, message);
          if (!result) {
              return;
          }
          var recipe = result.results[_.random(0, result.results.length-1)];
          answer(
              bot,
              message, 
              {
                  "attachments": [
                      {
                          "fallback": "Recipe for " + recipe.title,
                          "title": recipe.title,
                          "title_link": recipe.href,
                          "text": "Ingredients: " + recipe.ingredients,
                          "thumb_url": recipe.thumbnail,
                          "footer": "Powered By Recipe Puppy",
                      }
                 ]
              }
          ); 
    });
}

function parseApiResult(err, res, bot, message) {
    if (err || !res.ok) {
        answer(bot, message, 'Error: ' + err);
        return false;
    } 
    var result = null;
    try {
        result = JSON.parse(res.text);
    } catch (e) {
        answer(bot, message, 'Error: invalid response by Recipe API (JSON parse error)');
        return false;
    }
    if (!result || !result.results || result.results.length === 0) {
        answer(bot, message, 'No recipe found for ' + ingredientsText);
        return false;
    }
    return result;
}

function hello(bot, message) {
    var msg = ':robot_face: I am a bot named <@' + bot.identity.name + '>. Hello <@' + message.user + '>!'; 
    answer(bot, message, msg);
}

function didNotUnderstand(bot, message) {
    var msg = 'Sorry, I did not understand you. I am a bot and you can ask me about recipes!' + "\n";
    answer(bot, message, msg);
}

function uptime(bot, message) {
    var hostname = os.hostname();
    var uptime = formatUptime(process.uptime());
    var msg = ':robot_face: I am a bot that has been running for ' + uptime + ' on ' + hostname + ".\n";
    answer(bot, message, msg);
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

