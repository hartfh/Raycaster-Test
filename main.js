(function() {
	const DATA_WIDTH = 8;
	const DATA_HEIGHT = 7;
	//const TILE_SIZE = 90;
	const RAY_DEGREE_INCR = 1;
	const RAY_RADIAN_INCR = Math.PI * RAY_DEGREE_INCR / 180;
	const RAY_LENGTH_INCREMENT = 0.1;
	const RAY_SPACING = 1.4;
	const RAY_MAX = 15;
	const HALF_VIEW_ARC = Math.PI * 40 / 180;
	const OBSTACLE_WIDTH = 7;
	const OBSTACLE_HEIGHT = 300;
	const HEIGHT_SCALING = 30;

	let _canvas;
	let _context;
	let _canvasMidpoint = {x: 0, y: 0};
	let _data = [
		[1, 1, 1, 1, 1, 1, 1, 1],
		[1, 0, 0, 0, 0, 0, 0, 1],
		[1, 0, 0, 9, 0, 0, 0, 1],
		[1, 0, 0, 0, 0, 0, 0, 1],
		[1, 0, 0, 0, 0, 0, 0, 1],
		[1, 0, 1, 0, 0, 0, 1, 1],
		[1, 1, 1, 1, 1, 1, 1, 1],
	];
	let _viewPosition = {x: 3, y: 2};
	let _viewAngle = -0.15;

	document.addEventListener('DOMContentLoaded', function() {
		_canvas = document.getElementById('canvas');
		_context = _canvas.getContext('2d');

		_canvasMidpoint.x = _canvas.width / 2;
		_canvasMidpoint.y = _canvas.height / 2;

		render(); console.log('rendering started');

		document.addEventListener('keypress', function(e) {
			console.log(e);
		});
	});

	function render() {
		let rays = rayCaster(_viewPosition, _viewAngle);

		clearCanvas();
		drawCanvas(rays);

		//window.requestAnimationFrame(render);
	}

	function clearCanvas() {
		_context.fillStyle = '#000000';
		_context.fillRect(0, 0, _canvas.width, _canvas.height);
	}

	function drawCanvas(rays) {
		rays.forEach(function(ray) {
			drawRay(ray);
		});
		console.log('drew rays');
	}

	function drawRay(ray) {
		let objAngle = ray.angle - ray.relativeAngle; // relative to viewer
		let objHeight = OBSTACLE_HEIGHT - ray.length * HEIGHT_SCALING;
		//let objHeight = (OBSTACLE_HEIGHT - Math.cos(objAngle) * ray.length * HEIGHT_SCALING);
		let objCenter = {x: (objAngle * _canvasMidpoint.x) * RAY_SPACING + _canvasMidpoint.x, y: _canvasMidpoint.y};

		_context.translate(objCenter.x, objCenter.y);
		_context.fillStyle = '#66aad0';
		_context.globalAlpha = objHeight / OBSTACLE_HEIGHT;
		_context.fillRect(OBSTACLE_WIDTH / -2, objHeight / -2, OBSTACLE_WIDTH, objHeight);
		_context.translate(-objCenter.x, -objCenter.y);

		_context.globalAlpha = 1;
	}

	function rayCaster(position, angle) {
		let rays = [];

		for(let a = angle - HALF_VIEW_ARC, max = angle + HALF_VIEW_ARC; a <= max; a += RAY_RADIAN_INCR) {
			rays.push( measureRay(a, position, angle) );
		}

		return rays;
	}

	function measureRay(radians, position, relativeAngle) {
		let clear = true;
		let testLength = 0;
		let ray = {
			length:			0,
			angle:			radians,
			relativeAngle:	relativeAngle,
			hitObstacle:	false,
			origin:			{x: position.x, y: position.y},
		};

		while( clear ) {
			let testPoint = {
				x: position.x + testLength * Math.cos(radians),
				y: position.y + testLength * Math.sin(radians)
			};

			clear = isPointFree(testPoint.x, testPoint.y);

			testLength += RAY_LENGTH_INCREMENT;

			if( testLength > RAY_MAX ) {
				break;
			}
		}

		ray.hitObstacle = !clear;
		ray.length = testLength;

		return ray;
	}

	function isPointFree(x, y) {
		// Normalize position
		if( x < 0 ) {
			x = 0;
		}
		if( y < 0 ) {
			y = 0;
		}
		if( x >= DATA_WIDTH ) {
			x = DATA_WIDTH - 1;
		}
		if( y >= DATA_HEIGHT ) {
			y = DATA_HEIGHT - 1;
		}

		y = Math.floor(y);
		x = Math.floor(x);

		return !(_data[y][x] === 1);
	}
}());