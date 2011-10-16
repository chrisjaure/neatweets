var Crypto = require('crypto'),
	Canvas = require('canvas'),
	Http = require('http'),
	Fs = require('fs'),
	Color = require('color'),
	html = '<html><head><title>test</title></head><style>{style}</style><body></body></html>',
	canvas = {
		width: 400,
		height: 200,
		el: null,
		ctx: null
	};

Http.createServer(function(req, res){
	res.writeHead(200, {'Content-Type': 'text/html'});
	res.end(html);
}).listen(8000);

getLocalTweets();

function getLocalTweets() {
	Fs.readFile('./tweets.json', 'utf8', function(err, data){
		if (err) {
			console.log(err);
			return;
		}

		var tweets = JSON.parse(data);
		html = html.replace('{style}', renderTweets(tweets));
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
			var tweets = JSON.parse(body),

			html = html.replace('{style}', renderTweets(tweets));
		});

	}).on('error', function(){
		console.log('error');
	});
}

function renderTweets (tweets) {
	canvas.el = new Canvas(canvas.width,canvas.height);
	canvas.ctx = canvas.el.getContext('2d');

	tweets.forEach(function(tweet){

		renderTweet(tweet, canvas.ctx);

	});

	return 'html { background: url(' + canvas.el.toDataURL() + ');}';
}

function renderTweet (tweet, ctx) {
	if (!this.coords) {
		this.coords = [0,0];
		this.layer = 0;
		this.row = 0;
		this.width = 100;
		this.height = 100;
	}

	var color = getColor(tweet.text).clearer(0.5),
		fill = ctx.createLinearGradient(this.coords[0],this.coords[1],this.coords[0] + this.width,this.coords[1] + this.height);

	fill.addColorStop(0, color.rgbaString());
	
	if (color.light()) {
		fill.addColorStop(1, color.darken(0.6).rgbaString());
	}
	else {
		fill.addColorStop(1, color.lighten(0.6).rgbaString());
	}

	ctx.fillStyle = fill;
	ctx.beginPath();
	drawTriangle();
	ctx.fill();

	this.coords[0] += this.width;

	if (this.coords[0] >= canvas.width) {
		this.row++;
		this.coords[0] = (this.row % 2 ? this.width / 2 : 0);
		this.coords[1] += this.height;
	}

	if (this.coords[1] >= canvas.height) {
		this.width = this.width / 2;
		this.height = this.height / 2;
		this.layer++;
		this.coords[1] = this.layer * this.height / 2;
	}

	function drawTriangle () {
		ctx.moveTo(this.coords[0], this.coords[1]);
		ctx.lineTo(this.coords[0] + this.width, this.coords[1]);
		ctx.lineTo(this.coords[0] + this.width / 2, this.coords[1] + this.height);
	}
}

function getColor (text) {
	var hash = Crypto.createHash('md5').update(text).digest('hex');
	return new Color('#'+hash.substring(0,6));
}