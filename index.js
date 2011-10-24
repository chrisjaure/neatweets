var Http = require('http'),
	Fs = require('fs'),
	Tweetpic = require('./twitterpic'),
	Connect = require('connect');

Connect(
	Connect.vhost('cleverchris.com', Connect(
		Connect.router(routes)
	)),
	Connect.router(routes)
).listen(8000);

function routes (app) {
	app.get('/neatweets/:username', function(req, res){
		getTweets(req.params.username, function(err, tweets){
			if (err) {
				res.statusCode = 500;
				res.end(err.message || err);
				return;
			}

			var canvas = Tweetpic.generate(tweets);

			res.statusCode = 200;
			res.setHeader('Content-Type', 'image/png');
			res.end(canvas.toBuffer(), 'utf-8');
		});
	});
}

function getLocalTweets() {
	Fs.readFile('./tweets.json', 'utf8', function(err, data){
		if (err) {
			console.log(err);
			return;
		}

		var tweets = JSON.parse(data);
		
		writeImage(tweets);
	});
}

function getTweets(username, callback) {
	Http.get({
		host:'api.twitter.com',
		path: '/1/statuses/user_timeline.json?include_entities=true&include_rts=true&screen_name='+ username +'&count=190'
	}, function(res){
		var body = '';
		res.on('data', function(chunk){

			body += chunk.toString('utf8');

		}).on('end', function(){
			var tweets;

			try {
				tweets = JSON.parse(body);
			}
			catch(e) {
				if (typeof callback == 'function') {
					callback(e);
				}
				return;
			}

			if (typeof callback == 'function') {
				if (tweets.error) {
					callback(tweets.error);
				}
				else {
					callback(null, tweets);				
				}

			}
		});

	}).on('error', function(err){
		if (typeof callback == 'function') {
			callback(err);
		}
	});
}

function writeImage(tweets) {
	var canvas = Tweetpic.generate(tweets);
	Fs.writeFile('tweetpic.png', canvas.toBuffer(), 'utf-8', function(err){
		if (err) {
			console.log(err);
		}
		else {
			console.log('Wrote image.');
		}
	});
}