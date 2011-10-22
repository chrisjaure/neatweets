var Crypto = require('crypto'),
	Canvas = require('canvas'),
	Color = require('color'),
	canvas = {
		width: 350,
		height: 500,
		padding: 60,
		el: null,
		ctx: null
	};

function renderTweets (tweets) {
	if (!tweets || tweets.length == 0) {
		return;
	}

	var borderColor = getColor(tweets[0].user.screen_name),
		pad = canvas.padding,
		ctx;

	canvas.el = new Canvas(canvas.width,canvas.height);
	ctx = canvas.ctx = canvas.el.getContext('2d');

	ctx.fillStyle = '#ffffff';
	ctx.fillRect(0,0,canvas.width,canvas.height);

	tweets.forEach(function(tweet){

		renderTweet(tweet, canvas.ctx);

	});

	// frame & inset box shadow
	ctx.fillStyle = '#ffffff';

	ctx.shadowOffsetX = 6;
	ctx.shadowOffsetY = 6; 
	ctx.shadowBlur = 8; 
	ctx.shadowColor = "rgba(0, 0, 0, .8)"; 

	ctx.beginPath();

	ctx.moveTo( canvas.width, canvas.height );
	ctx.lineTo( 0, canvas.height );
	ctx.lineTo( 0, 0 );
	ctx.lineTo( canvas.width, 0 );
	ctx.lineTo( canvas.width, canvas.height );

	ctx.moveTo( canvas.width - pad, pad / 2 );
	ctx.lineTo( pad, pad / 2 );
	ctx.lineTo( pad, canvas.height - pad / 2 );
	ctx.lineTo( canvas.width - pad, canvas.height - pad / 2 );
	ctx.lineTo( canvas.width - pad, pad / 2 );
	ctx.closePath();

	ctx.fill();

	// border
	ctx.shadowColor = 'rgba(0,0,0,0)';
	ctx.lineWidth = 10;
	ctx.strokeStyle = '#222222';
	ctx.strokeRect(0,0,canvas.width,canvas.height);

	return canvas.el;
}

function renderTweet (tweet, ctx) {
	var size = Math.max(Math.round(tweet.text.length / 140 * 80, 3)),
		date = new Date(tweet.created_at),
		x,
		y;

	// x = day, y = hour
	x = date.getDay() / 6 * (canvas.width - 80) - size / 2 + 40;
	y = date.getHours() / 23 * (canvas.height - 80) - size / 2 + 40;

	// random
	x = Math.random() * canvas.width - size / 2;
	y = Math.random() * canvas.height - size / 2;

	// random based on time
	var hash = md5(tweet.created_at);
	x = parseInt(hash.substring(0,3), 16) / 4095 * (canvas.width - canvas.padding) - size / 2 + canvas.padding / 2;
	y = parseInt(hash.substring(4,7), 16) / 4095 * (canvas.height - canvas.padding) - size / 2 + canvas.padding / 2;

	drawTriangle({
		height: size,
		width: size,
		x: x,
		y: y,
		color: getColor(tweet.text).clearer(0.5),
		flip: (typeof tweet.retweeted_status != 'undefined')
	});
}

function getColor (text) {
	return new Color('#'+md5(text).substring(0,6));
}

function drawTriangle (options) {
	var ctx = canvas.ctx,
		coords = [],
		height = options.height || 20,
		width = options.width || 20,
		x = options.x || 0,
		y = options.y || 0,
		color = options.color || new Color('#ffffff'),
		fill;

	if (options.flip) {
		coords = [
			{ x: x + width / 2, y: y },
			{ x: x + width, y: y + height},
			{ x: x , y: y + height}
		]; 
	}
	else {
		coords = [
			{ x: x, y: y },
			{ x: x + width, y: y},
			{ x: x + width / 2, y: y + height}
		];
	}

	fill = ctx.createLinearGradient(x, y, x + width, y + height);

	fill.addColorStop(0, color.rgbaString());
	
	if (color.light()) {
		fill.addColorStop(1, color.darken(0.6).rgbaString());
	}
	else {
		fill.addColorStop(1, color.lighten(0.6).rgbaString());
	}

	ctx.fillStyle = fill;
	ctx.beginPath();
	ctx.moveTo(coords[0].x, coords[0].y);
	ctx.lineTo(coords[1].x, coords[1].y);
	ctx.lineTo(coords[2].x, coords[2].y);
	ctx.fill();
}

module.exports.generate = renderTweets;

function md5 (text) {
	return Crypto.createHash('md5').update(text).digest('hex');
}