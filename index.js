var Http = require('http'),
	Fs = require('fs'),
	Tweetpic = require('./twitterpic'),
	Connect = require('connect'),
	max_tries = 3,
	cache = 'cache/';

Connect(
	//Connect.vhost('*.cleverchris.com', Connect(
		Connect.router(routes)
	//))
).listen(8001);

function routes(app) {
	app.get('/neatweets/user/:username', function(req, res){
		if (hasCache(req.params.username)) {
			sendImage(getCache(req.params.username), res);
			return;
		}
		
		var tries = 0;
		
		getTweets(req.params.username, tries, function(err, tweets){
			if (err) {
				res.statusCode = 500;
				res.end(err.message || err);
				return;
			}
			
			var canvas = Tweetpic.generate(tweets),
				imageBuffer = canvas.toBuffer();

			sendImage(imageBuffer, res);

			writeCache(req.params.username, imageBuffer);
		});
	});
}

function getTweets(username, tries, callback) {
	tries++;
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
				if (tries <= max_tries) {
					getTweets(username, tries, callback);
				}
				else {
					
					if (typeof callback == 'function') {
						callback(e);
					}
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

function sendImage (image, res) {
	res.statusCode = 200;
	res.setHeader('Content-Type', 'image/png');
	res.end(image, 'utf-8');
}

function writeCache(username, image) {
	Fs.writeFile(getFilename(username), image);
}

function hasCache (username) {
	var filename = getFilename(username),
		stat;
		
	try {
		stat = Fs.statSync(filename);
	}
	catch (e) {
		return false;
	}

	if (stat && stat.isFile()) {
		var now = Date.now(),
			then = new Date(stat.mtime);
		
		if (then.getTime() + 3600000 > now) { // expires in 1 hour
			return true;
		}
		else {
			Fs.unlink(filename);
		}
	}

	return false;
}

function getCache (username) {
	return Fs.readFileSync(getFilename(username));
}

function getFilename (username) {
	return cache + username + '.png';
}