var Http = require('http'),
	Fs = require('fs'),
	Tweetpic = require('./twitterpic');

getLocalTweets();

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

function getTweets() {
	Http.get({
		host:'api.twitter.com',
		path: '/1/statuses/user_timeline.json?include_entities=true&include_rts=true&screen_name=chrisjaure&count=200'
	}, function(res){
		var body = '';
		res.on('data', function(chunk){

			body += chunk.toString('utf8');

		}).on('end', function(){
			var tweets = JSON.parse(body);

			writeImage(tweets);
		});

	}).on('error', function(){
		console.log('error');
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