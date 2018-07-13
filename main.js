(function() {
	const DATA_WIDTH = 8;
	const DATA_HEIGHT = 7;
	const DATA_DEPTH = 3;
	const RAY_DEGREE_INCR = 1; // 0.3
	const RAY_RADIAN_INCR = Math.PI * RAY_DEGREE_INCR / 180;
	const RAY_LENGTH_INCREMENT = 0.01;
	const RAY_SPACING = 1.5;
	const RAY_MAX = 25;
	const HALF_VIEW_ARC = Math.PI * 37 / 180;
	const OBSTACLE_WIDTH = 2;
	const OBSTACLE_HEIGHT = 300;
	const RAY_DOT_SIZE = 3;

	let _canvas;
	let _context;
	let _canvasMidpoint = {x: 0, y: 0};
	let _data = [
		[
			[1, 1, 1, 1, 1, 1, 1, 1],
			[0, 0, 0, 0, 0, 0, 1, 1],
			[0, 0, 0, 0, 0, 0, 0, 0],
			[0, 0, 0, 0, 0, 0, 0, 0],
			[0, 0, 0, 0, 0, 0, 1, 1],
			[1, 0, 1, 0, 0, 0, 1, 1],
			[1, 1, 1, 1, 1, 1, 1, 1],
		],
		[
			[1, 1, 1, 1, 1, 1, 1, 1],
			[1, 0, 0, 0, 0, 0, 1, 1],
			[1, 0, 0, 0, 0, 0, 1, 1],
			[1, 0, 0, 0, 0, 0, 1, 1],
			[1, 0, 0, 0, 0, 0, 1, 1],
			[0, 0, 0, 0, 0, 0, 1, 1],
			[1, 0, 0, 0, 1, 1, 1, 1],
		],
		[
			[1, 1, 1, 1, 1, 1, 1, 1],
			[1, 0, 0, 0, 0, 0, 0, 0],
			[1, 0, 0, 0, 0, 0, 0, 0],
			[1, 0, 0, 0, 0, 0, 1, 1],
			[1, 0, 0, 0, 0, 0, 1, 1],
			[1, 0, 0, 0, 0, 0, 1, 1],
			[1, 1, 1, 1, 1, 1, 1, 1],
		]
	];

	let _viewPosition = {x: 3, y: 3, z: 0};
	let _viewAngle = {h: 0, v: 0.45};

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
						x: _viewPosition.x + 0.08 * Math.cos(_viewAngle.h),
						y: _viewPosition.y + 0.08 * Math.sin(_viewAngle.h),
						z: 0,
					};
					render();
					break;
				case 'ArrowDown':
					_viewPosition = {
						x: _viewPosition.x - 0.08 * Math.cos(_viewAngle.h),
						y: _viewPosition.y - 0.08 * Math.sin(_viewAngle.h),
						z: 0,
					};
					render();
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

		//window.requestAnimationFrame(render);
	}

	function clearCanvas() {
		_context.fillStyle = '#000000';
		_context.fillRect(0, 0, _canvas.width, _canvas.height);
	}

	function drawCanvas(rays) {
		rays.forEach(function(ray) {
			drawRay3D(ray);
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

	function drawRay3D(ray) {
		/*
		let objHeight = OBSTACLE_HEIGHT / ray.length;
		let objCenter = {
			x: (ray.angleDiff * _canvasMidpoint.x) * RAY_SPACING + _canvasMidpoint.x,
			y: _canvasMidpoint.y,
		};
		*/

		//console.log(ray);

		//let objHeight = 150 / ray.length;
		let objCenter = {
			x: (ray.angleDiff.h * _canvasMidpoint.x) * RAY_SPACING + _canvasMidpoint.x,
			y: (-ray.angleDiff.v * _canvasMidpoint.y) * RAY_SPACING + _canvasMidpoint.y,
			//y: _canvasMidpoint.y,
		};
		
		let objWidth = RAY_DOT_SIZE;
		let objHeight = RAY_DOT_SIZE;

		_context.translate(objCenter.x, objCenter.y);
		_context.fillStyle = '#66aad0';
		//_context.globalAlpha = 1; //objHeight / OBSTACLE_HEIGHT;
		_context.globalAlpha = objHeight / ray.length * 1.1; //objHeight / OBSTACLE_HEIGHT;
		_context.fillRect(objWidth / -2, objHeight / -2, objWidth, objHeight);
		_context.translate(-objCenter.x, -objCenter.y);
		_context.globalAlpha = 1;
	}

	function rayCaster(viewPosition, viewAngle) {
		let rays = [];

		/*
		for(let a = viewAngle - HALF_VIEW_ARC, max = viewAngle + HALF_VIEW_ARC; a <= max; a += RAY_RADIAN_INCR) {
			rays.push( measureRay(a, viewAngle, viewPosition) );
		}
		*/
		for(let aV = viewAngle.v - HALF_VIEW_ARC, vMax = viewAngle.v + HALF_VIEW_ARC; aV <= vMax; aV += RAY_RADIAN_INCR) {
			for(let aH = viewAngle.h - HALF_VIEW_ARC, hMax = viewAngle.h + HALF_VIEW_ARC; aH <= hMax; aH += RAY_RADIAN_INCR) {
				let rayAngle = {h: aH, v: aV};
				let ray = measureRay3D(rayAngle, viewAngle, viewPosition);
				
				if( ray.hitObstacle ) {
					rays.push(ray);
				}
			}
		}

		return rays;
	}

	/*
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
	*/

	function measureRay3D(rayAngle, viewAngle, position) {
		let clear = true;
		let testLength = 0;
		let ray = {
			length:			0,
			angleDiff:		{h: rayAngle.h - viewAngle.h, v: rayAngle.v - viewAngle.v},
			hitObstacle:	false,
			origin:			{x: position.x, y: position.y, z: position.z},
			dest:			false,
		};

		while( clear ) {
			var testPoint = {};

			testPoint.z = position.z + testLength * Math.sin(rayAngle.v);

			var flatLength = testLength * Math.cos(rayAngle.v);
			
			//sin X = O / H
			//cos X = A / H

			testPoint.x = position.x + flatLength * Math.cos(rayAngle.h);
			testPoint.y = position.y + flatLength * Math.sin(rayAngle.h);

			clear = isPointFree(testPoint.x, testPoint.y, testPoint.z);

			testLength += RAY_LENGTH_INCREMENT;

			if( testLength > RAY_MAX ) {
				break;
			}
		}

		ray.hitObstacle = !clear;
		ray.length = testLength;
		//ray.length = flatLength * Math.cos(ray.angleDiff.h); // distortion correction

		//console.log(testLength);
		//console.log(testPoint);
		//console.log(clear)

		if( !clear ) {
			ray.dest = testPoint;
		}

		return ray;
	}

	function isPointFree(x, y, z) {
		x = Math.floor(x);
		y = Math.floor(y);
		z = Math.floor(z);

		// Normalize position
		if( x < 0 ) {
			return true;
			x = 0;
		}
		if( y < 0 ) {
			return true;
			y = 0;
		}
		if( z < 0 ) {
			return true;
			z = 0;
		}
		if( x >= DATA_WIDTH ) {
			return true;
			x = DATA_WIDTH - 1;
		}
		if( y >= DATA_HEIGHT ) {
			return true;
			y = DATA_HEIGHT - 1;
		}
		if( z >= DATA_DEPTH ) {
			return true;
			z = DATA_DEPTH - 1;
		}

		return !(_data[z][y][x] === 1);
	}
}());