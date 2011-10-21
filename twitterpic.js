var Crypto = require('crypto'),
	Canvas = require('canvas'),
	Color = require('color'),
	canvas = {
		width: 400,
		height: 200,
		el: null,
		ctx: null
	};

function renderTweets (tweets) {
	canvas.el = new Canvas(canvas.width,canvas.height);
	canvas.ctx = canvas.el.getContext('2d');

	canvas.ctx.fillStyle = '#ffffff';
	canvas.ctx.fillRect(0,0,canvas.width,canvas.height);

	tweets.forEach(function(tweet){

		renderTweet(tweet, canvas.ctx);

	});

	return canvas.el;
}

function renderTweet (tweet, ctx) {
	var size = Math.max(Math.round(tweet.text.length * 0.5, 3)),
		date = new Date(tweet.created_at);

	drawTriangle({
		height: size,
		width: size,
		x: Math.random() * canvas.width - size / 2,
		y: Math.random() * canvas.height - size / 2,
		color: getColor(tweet.text).clearer(0.5),
		flip: (tweet.text.length % 2 == 0)
	});
}

function getColor (text) {
	var hash = Crypto.createHash('md5').update(text).digest('hex');
	return new Color('#'+hash.substring(0,6));
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