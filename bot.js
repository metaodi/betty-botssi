var http = require('http');
var Botkit = require('botkit');
var _ = require('underscore');
var controller = Botkit.slackbot();
var answers = require('./lib/answers');

var betty = controller.spawn({
  token: process.env.token
});
betty.startRTM(function(err,bot,payload) {
  if (err) {
    throw new Error('Could not connect to Slack');
  }
});

function matcher(text) {
    return function(pattern) {
        var re = new RegExp(pattern, 'i');
        return re.test(text);
    };
}

var requestConfig = [
    {
        'pattern': ['shutdown', 'get lost', 'self.*destruct', 'destroy', 'shut.*up', 'go away'],
        'answerFn': answers.shutdown
    },
    {
        'pattern': ['hi', 'hello', 'hey'],
        'answerFn': answers.hello
    },
    {
        'pattern': ['uptime', 'identify yourself', 'who are you', 'what is your name', 'what.*do', 'can you help me'],
        'answerFn': answers.uptime
    },
];


controller.hears(['.*'], ['direct_message,direct_mention'], function(bot, message) {
    var noAnswer = _.every(requestConfig, function(request) {
        var matched = _.any(request.pattern, matcher(message.text));
        if (matched) {
            request.answerFn(bot, message);
            return false; //break out of every()
        }
        return true; // continue with next requestConfig
    });
    if (noAnswer) {
        answers.didNotUnderstand(bot, message);
    }
});


// To keep Heroku's free dyno awake
http.createServer(function(request, response) {
    response.writeHead(200, {'Content-Type': 'text/plain'});
    response.end('Ok, dyno is awake.');
}).listen(process.env.PORT || 5000);
