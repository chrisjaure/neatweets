var crypto = require('crypto'),
	http = require('http'),
	fs = require('fs'),
	html = '<html><head><title>test</title></head><body>{body}</body></html>';

http.createServer(function(req, res){
	res.writeHead(200, {'Content-Type': 'text/html'});
	res.end(html);
}).listen(8000);

getLocalTweets();

function getLocalTweets() {
	fs.readFile('./tweets.json', 'utf8', function(err, data){
		if (err) {
			console.log(err);
			return;
		}

		var tweets = JSON.parse(data);
		html = html.replace('{body}', renderTweets(tweets));
	});
}

function getTweets() {
	http.get({
		host:'api.twitter.com',
		path: '/1/statuses/user_timeline.json?include_entities=true&include_rts=true&screen_name=chrisjaure'
	}, function(res){
		var body = '';
		res.on('data', function(chunk){

			body += chunk.toString('utf8');

		}).on('end', function(){
			var tweets = JSON.parse(body),

			html = html.replace('{body}', renderTweets(tweets));
		});

	}).on('error', function(){
		console.log('error');
	});
}

function renderTweets (tweets) {
	var tweet_html = '';

	tweets.forEach(function(tweet){
		
		var color = getColor(tweet.text);

		tweet_html += '<p style="background:#'+color+';width:20px;height:20px;display:inline-block;overflow:hidden;">'+tweet.text+'</p>';

	});

	return tweet_html;
}

function getColor (text) {
	var hash = crypto.createHash('md5').update(text).digest('hex');
	return hash.substring(0,6);
}