# Neatweets

Generate art from your tweets.

## Usage

	var Fs = require('fs'),
		Neatweets = require('neatweets'),
		tweets,
		canvas;

	tweets = JSON.parse(/* json from Twitter */);

	canvas = Neatweets.generate(tweets, {
		width: 300,
		height: 300
	});

	canvas.toBuffer();

	Fs.writeFile('neatweets.png', canvas.toBuffer());

## Options

`width`: width of canvas, default `400`

`height`: height of canvas, default `550`

`padding`: width/height of white frame, default `40`

`grid`: grid size to align triangles to, default `20`

`max_size`: maximum size of triangles, default `80`

`min_size`: minimum size of triangles, default `20`

`transparency`: transparency of triangles, default `0.4`

`title`: title text, default `'Neatweets'`

`credit`: credit text, `{username}` will be replaced with twitter username, default `'http://cleverchris.com/neatweets#{username}'`

`el`: existing canvas instance, one will be created if you don't provide one.

## Server Example

	var Neatweets = require('neatweets'),
		Http = require('http'),
		Fs = require('fs');

	Http.get({
		host:'api.twitter.com',
		path: '/1/statuses/user_timeline.json?include_entities=true&include_rts=true&screen_name=chrisjaure&count=190'
	}, function(res){
		var body = '';
		res.on('data', function(chunk){

			body += chunk.toString('utf8');

		}).on('end', function(){
			var tweets,
				canvas;

			tweets = JSON.parse(body);
			
			canvas = Neatweets.generate(tweets);

			Fs.writeFile('neatweets.png', canvas.toBuffer());
		});

	});

