(function() {
	const DATA_WIDTH = 8;
	const DATA_HEIGHT = 7;
	const RAY_DEGREE_INCR = 0.3;
	const RAY_RADIAN_INCR = Math.PI * RAY_DEGREE_INCR / 180;
	const RAY_LENGTH_INCREMENT = 0.01;
	const RAY_SPACING = 1.6;
	const RAY_MAX = 15;
	const HALF_VIEW_ARC = Math.PI * 35 / 180;
	const OBSTACLE_WIDTH = 2;
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
		[1, 0, 1, 0, 0, 0, 0, 1],
		[1, 0, 1, 0, 0, 0, 1, 1],
		[1, 1, 1, 1, 1, 1, 1, 1],
	];
	let _viewPosition = {x: 3, y: 3};
	let _viewAngle = 0;

	document.addEventListener('DOMContentLoaded', function() {
		_canvas = document.getElementById('canvas');
		_context = _canvas.getContext('2d');

		_canvasMidpoint.x = _canvas.width / 2;
		_canvasMidpoint.y = _canvas.height / 2;

		render();

		document.addEventListener('keypress', function(e) {
			switch(e.key) {
				case 'ArrowLeft':
					_viewAngle += -0.05;
					break;
				case 'ArrowRight':
					_viewAngle += 0.05;
					break;
				case 'ArrowUp':
					_viewPosition = {
						x: _viewPosition.x + 0.08 * Math.cos(_viewAngle),
						y: _viewPosition.y + 0.08 * Math.sin(_viewAngle),
					};
					break;
				case 'ArrowDown':
					_viewPosition = {
						x: _viewPosition.x - 0.08 * Math.cos(_viewAngle),
						y: _viewPosition.y - 0.08 * Math.sin(_viewAngle),
					};
					break;
				default:
					break;
			}
		});
	});

	function render() {
		let rays = rayCaster(_viewPosition, _viewAngle);

		clearCanvas();
		drawCanvas(rays);

		window.requestAnimationFrame(render);
	}

	function clearCanvas() {
		_context.fillStyle = '#000000';
		_context.fillRect(0, 0, _canvas.width, _canvas.height);
	}

	function drawCanvas(rays) {
		rays.forEach(function(ray) {
			drawRay(ray);
		});
	}

	function drawRay(ray) {
		let objHeight = OBSTACLE_HEIGHT / ray.length;
		let objCenter = {x: (ray.angleDiff * _canvasMidpoint.x) * RAY_SPACING + _canvasMidpoint.x, y: _canvasMidpoint.y};

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
			rays.push( measureRay(a, angle, position) );
		}

		return rays;
	}

	function measureRay(angle, relativeAngle, position) {
		let clear = true;
		let testLength = 0;
		let ray = {
			length:			0,
			//angle:			radians,
			//relativeAngle:	relativeAngle,
			angleDiff:		angle - relativeAngle,
			hitObstacle:	false,
			origin:			{x: position.x, y: position.y},
		};

		while( clear ) {
			let testPoint = {
				x: position.x + testLength * Math.cos(angle),
				y: position.y + testLength * Math.sin(angle),
			};

			clear = isPointFree(testPoint.x, testPoint.y);

			testLength += RAY_LENGTH_INCREMENT;

			if( testLength > RAY_MAX ) {
				break;
			}
		}

		ray.hitObstacle = !clear;
		ray.length = testLength * Math.cos(ray.angleDiff);

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