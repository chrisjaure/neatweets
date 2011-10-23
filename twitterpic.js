var Crypto = require('crypto'),
	Canvas = require('canvas'),
	Color = require('color'),
	canvas = {
		width: 400,
		height: 550,
		padding: 40,
		grid: 20,
		max_size: 80,
		min_size: 5,
		transparency: 0.6,
		title: 'Twart',
		el: null,
		ctx: null
	};

function renderTweets (tweets, options) {

	if (!tweets || tweets.length == 0) {

		return;

	}

	canvas = Object.create(canvas, options || {}); 

	var pad = canvas.padding,
		ctx;

	canvas.el = new Canvas(canvas.width,canvas.height);
	ctx = canvas.ctx = canvas.el.getContext('2d');

	// white background
	ctx.fillStyle = '#fff';
	ctx.fillRect(0,0,canvas.width,canvas.height);

	tweets.forEach(function(tweet){

		renderTweet(tweet, canvas.ctx);

	});

	// frame & inset box shadow
	ctx.fillStyle = '#fff';

	ctx.shadowOffsetX = 6;
	ctx.shadowOffsetY = 6; 
	ctx.shadowBlur = 8; 
	ctx.shadowColor = "rgba(0, 0, 0, 0.8)"; 

	ctx.beginPath();

	ctx.moveTo( canvas.width, canvas.height );
	ctx.lineTo( 0, canvas.height );
	ctx.lineTo( 0, 0 );
	ctx.lineTo( canvas.width, 0 );
	ctx.lineTo( canvas.width, canvas.height );

	ctx.moveTo( canvas.width - pad, pad );
	ctx.lineTo( pad, pad );
	ctx.lineTo( pad, canvas.height - pad );
	ctx.lineTo( canvas.width - pad, canvas.height - pad );
	ctx.lineTo( canvas.width - pad, pad );
	ctx.closePath();

	ctx.fill();

	// border
	ctx.shadowColor = 'rgba(0,0,0,0)';
	ctx.lineWidth = 10;
	ctx.strokeStyle = '#222';
	ctx.strokeRect(0,0,canvas.width,canvas.height);

	// add credit
	ctx.fillStyle = '#666';
	ctx.font = '10px sans-serif';
	ctx.textAlign = 'center';
	ctx.fillText('cleverchris.com/twart/' + tweets[0].user.screen_name, canvas.width / 2, canvas.height - canvas.padding  / 2);

	// add title
	ctx.fillStyle = '#222';
	ctx.font = 'bold 16px serif';
	ctx.fillText(canvas.title, canvas.width / 2, canvas.padding / 2 + 8);

	return canvas.el;
}

function renderTweet (tweet, ctx) {

	var size = Math.max(Math.round(tweet.text.length / 140 * canvas.max_size, canvas.min_size)),
		date = new Date(tweet.created_at), 
		hash,
		x,
		y;

	if (canvas.grid) {

		size = alignToGrid(size);

	}

	// random position based on time
	hash = md5(tweet.created_at);
	x = getCoord(hash.substring(0,3), size, canvas.width);
	y = getCoord(hash.substring(4,7), size, canvas.height);

	if (canvas.grid) {
		
		x = alignToGrid(x);
		y = alignToGrid(y);
		
	}

	drawTriangle({
		height: size,
		width: size,
		x: x,
		y: y,
		color: getColor(tweet.text).clearer(canvas.transparency).saturate(0.4),
		flip: (tweet.text.substring(0,3) == 'RT ')
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
		color = options.color || new Color('#fff'),
		fill;

	if (options.flip) {

		coords = [
			{ x: x, y: y },
			{ x: x + width, y: y},
			{ x: x + width / 2, y: y + height}
		];

	}
	else {

		x = x - width / 2;

		coords = [
			{ x: x + width / 2, y: y },
			{ x: x + width, y: y + height},
			{ x: x , y: y + height}
		];

	}

	fill = ctx.createLinearGradient(x, y, x + width, y + height);

	fill.addColorStop(0, color.rgbaString());
	
	if (color.light()) {

		color.darken(0.7);

	}
	else {

		color.lighten(0.7);

	}

	fill.addColorStop(1, color.rgbaString());

	ctx.fillStyle = fill;
	ctx.beginPath();
	ctx.moveTo(coords[0].x, coords[0].y);
	ctx.lineTo(coords[1].x, coords[1].y);
	ctx.lineTo(coords[2].x, coords[2].y);
	ctx.fill();
}

function md5 (text) {

	return Crypto.createHash('md5').update(text).digest('hex');
	
}

function alignToGrid (value) {
	return Math.round(value / canvas.grid) * canvas.grid;
}

function getCoord (hex, size, max) {
	
	return parseInt(hex, 16) / 4095 * (max - canvas.padding * 2) + canvas.padding / 2;

}

module.exports.generate = renderTweets;