document
	.querySelector(".play-button-bg")
	.addEventListener("click", function () {
		console.log("clicked")
		this.classList.add("clicked");
		loadYT();
	});

function loadYT() {
	// 2. This code loads the IFrame Player API code asynchronously.
	var tag = document.createElement("script");

	tag.src = "https://www.youtube.com/iframe_api";
	var firstScriptTag = document.getElementsByTagName("script")[0];
	firstScriptTag.parentNode.insertBefore(tag, firstScriptTag);
}
// 3. This function creates an <iframe> (and YouTube player)
//    after the API code downloads.
var player;

function onYouTubeIframeAPIReady() {
	player = new YT.Player("player", {
		height: "25em",
		width: "10em",
		videoId: "xIBiJ_SzJTA",
		events: {
			onReady: onPlayerReady,
			onStateChange: onPlayerStateChange
		}
	});
}

// 4. The API will call this function when the video player is ready.
function onPlayerReady(event) {
	console.log(event.target);
	event.target.playVideo();
}

// 5. The API calls this function when the player's state changes.
//    The function indicates that when playing a video (state=1),
//    the player should play for six seconds and then stop.
var done = false;

function onPlayerStateChange(event) {
	if (event.data == YT.PlayerState.PLAYING && !done) {
		// setTimeout(stopVideo, 6000);
		// done = true;
	}
}

function stopVideo() {
	player.stopVideo();
}

!(function () {
	"use strict";

	// branch constructor

	function Branch(parent, level, x, y) {
		this.parent = parent;
		this.branches = [];
		this.p0 = parent ? parent.p1 : new Point(x, y);
		this.p1 = new Point(x, y);
		this.level = level;
		this.life = 20;
		this.angle = 0;
		this.vx = 0;
		this.vy = 0;
	}

	// grow branch

	Branch.prototype.grow = function () {
		// recursively grow children branches

		for (var i = 0; i < this.branches.length; i++) {
			this.branches[i].grow();
		}

		// grow branch

		if (this.life > 1) {
			this.p1.x += this.vx;
			this.p1.y += this.vy;

			ctx.beginPath();
			ctx.lineCap = "round";

			if (this.level) {
				// draw branch

				ctx.lineWidth = this.level * 6 - 5;
				ctx.strokeStyle = "#000";

				if (this.parent) {
					ctx.moveTo(this.parent.p0.x, this.parent.p0.y);
					ctx.quadraticCurveTo(this.p0.x, this.p0.y, this.p1.x, this.p1.y);
				}

				ctx.stroke();
			} else {
				// draw leaf

				ctx.lineWidth = 10;
				ctx.strokeStyle = "#f40";
				ctx.moveTo(this.p0.x, this.p0.y);
				ctx.lineTo(this.p1.x, this.p1.y);
				ctx.stroke();
			}
		}

		// create sub branches

		if (this.life === 1 && this.level > 0 && this.level < maxLevels) {
			this.branches.push(newBranch(this));
			this.branches.push(newBranch(this));
		}

		// decrement branch life

		this.life--;
	};

	// point 2D constructor

	function Point(x, y) {
		this.x = x;
		this.y = y;
	}

	// new branch factory

	function newBranch(parent) {
		var branch = new Branch(parent, parent.level - 1, parent.p1.x, parent.p1.y);

		branch.angle =
			autorun && parent.level === maxLevels ?
			Math.random() * 2 * Math.PI :
			Math.atan2(parent.p1.y - parent.p0.y, parent.p1.x - parent.p0.x) +
			(Math.random() * 1.4 - 0.7);

		branch.vx = Math.cos(branch.angle) * 12;
		branch.vy = Math.sin(branch.angle) * 12;

		branch.life =
			branch.level === 1 ?
			5 :
			Math.round(Math.random() * (branch.level * 2)) + 2;

		return branch;
	}

	// main animation loop

	function run() {
		// request next frame

		requestAnimationFrame(run);

		// clear screen (with a bit of magic)

		if (++frame % 2) {
			ctx.globalCompositeOperation = "lighter";
			ctx.fillStyle = "rgba(255,255,255,0.01)";
			ctx.fillRect(0, 0, canvas.width, canvas.height);
			ctx.globalCompositeOperation = "source-over";
		}

		// follow the pointer

		current.p1.x = pointer.x;
		current.p1.y = pointer.y;

		// grow tree

		root.grow();

		// create trunk branches

		if ((autorun && Math.random() > 0.8) || pointer.moveDistance > 20) {
			pointer.moveDistance = 0;
			var branch = new Branch(
				current,
				current.level,
				current.p1.x,
				current.p1.y
			);
			current.branches.push(branch);

			if (Math.random() > 0.8) current.branches.push(newBranch(current));

			current = branch;
			nBranches++;
		}

		// cut the tree

		if (nBranches > maxBranches) {
			root = root.branches[0];
			nBranches--;
		}
	}

	// prepare the canvas

	var canvas = {
		elem: document.getElementById("canvas1"),
		width: 0,
		height: 0,
		resize: function () {
			this.width = this.elem.width = this.elem.offsetWidth;
			this.height = this.elem.height = this.elem.offsetHeight;
		}
	};

	var ctx = canvas.elem.getContext("2d");
	canvas.elem.onselectstart = function () {
		return false;
	};
	canvas.elem.ondragstart = function () {
		return false;
	};
	window.addEventListener("resize", canvas.resize.bind(canvas), false);
	canvas.resize();

	// pointer events
	var pointer = {
		x: canvas.width * 0.5,
		y: canvas.height * 0.5,
		px: 0,
		py: 0,
		moveDistance: 0,

		move: function (e) {
			e.preventDefault();
			var pointer = e.targetTouches ? e.targetTouches[0] : e;

			this.x = pointer.clientX;
			this.y = pointer.clientY;

			var dx = this.x - this.px;
			var dy = this.y - this.py;

			this.moveDistance += Math.sqrt(dx * dx + dy * dy);

			// speed limit

			if (this.moveDistance > 40) {
				this.x = this.px + dx * 0.1;
				this.y = this.py + dy * 0.1;
			}

			// cancel autorun

			if (autorun) {
				this.x = pointer.clientX;
				this.y = pointer.clientY;
				root = new Branch(false, maxLevels, this.x, this.y);
				current = root;
				autorun = false;
			}

			this.px = this.x;
			this.py = this.y;
		}
	};

	window.addEventListener("mousemove", pointer.move.bind(pointer), false);
	canvas.elem.addEventListener("touchmove", pointer.move.bind(pointer), false);

	// variables

	var maxLevels = 7;
	var nBranches = 0;
	var maxBranches = 200;
	var autorun = true;
	var frame = 0;
	var root = new Branch(false, maxLevels, pointer.x, pointer.y);
	var current = root;

	// start

	run();
})();

(() => {
	{
		class Vector {
			constructor(x, y) {
				this.x = x;
				this.y = y;
				this.x1 = 0;
				this.y1 = 0;
				this.x2 = 0;
				this.y2 = 0;
				this.zIndex = 0;
			}
			points() {
				this.x1 = this.x * ws;
				this.y1 = py + this.y * hs + sw * 0.5;
				const dx = cx - this.x1;
				const dy = cy - this.y1;
				const dist = Math.sqrt(dx * dx + dy * dy);
				const rad = pointer.isDown ? nw / 6 : nw / 4;
				const len = pointer.isDown ? 5 : 1;
				if (dist < rad) {
					const k = Math.PI * Math.abs(dist / rad);
					const M = Math.sin(k) * len;
					this.zIndex = 1 + 3 * (1 - Math.sin(k * 0.5));
					this.x2 = 1 + this.x1 - dx * M;
					this.y2 = 1 + this.y1 - dy * M;
				} else {
					this.zIndex = 1000;
				}
			}
			draw(i) {
				ctx.beginPath();
				ctx.moveTo(this.x1 + sw * 0.35, this.y1);
				ctx.lineTo(this.x2 + sw * 0.35, this.y2);
				ctx.strokeStyle = "rgba(0,0,0,0.3)";
				ctx.stroke();
				ctx.beginPath();
				const c = Math.round(-196 + this.zIndex * 255);
				ctx.strokeStyle = `rgb(${Math.round((c * pointer.y) / nh)},${Math.round(
					c * 0.5
				)},${Math.round((c * pointer.x) / nw)})`;
				ctx.moveTo(this.x1, this.y1);
				ctx.lineTo(this.x2, this.y2);
				ctx.stroke();
			}
		}
		const canvas = {
			init() {
				this.elem = document.querySelector("#canvas2");
				this.resize();
				window.addEventListener("resize", () => this.resize(), false);
				return this.elem.getContext("2d");
			},
			resize() {
				this.width = this.elem.width = this.elem.offsetWidth;
				this.height = this.elem.height = this.elem.offsetHeight;
				nw = Math.max(this.width, this.height);
				nh = this.height * 0.6 - 6;
				py = this.height * 0.2 + 2;
				sw = Math.round(nw / 20);
				ws = nw / nbx;
				nby = Math.round((nbx * nh) / nw);
				hs = (nh - sw) / nby;
				// ---- reset ----
				vect.length = 0;
				for (let j = 0; j <= nby; j++) {
					for (let i = 0; i <= nbx; i++) {
						vect.push(new Vector(i, j));
					}
				}
			}
		};
		const pointer = {
			isDown: false,
			move(e, touch) {
				const pointer = touch ? e.targetTouches[0] : e;
				this.x = pointer.clientX;
				this.y = pointer.clientY;
			},
			init() {
				window.addEventListener("mousedown", e => (this.isDown = true), false);
				window.addEventListener("touchstart", e => (this.isDown = true), false);
				window.addEventListener("mousemove", e => this.move(e, false), false);
				canvas.elem.addEventListener(
					"touchmove",
					e => this.move(e, true),
					false
				);
				window.addEventListener("mouseup", e => (this.isDown = false), false);
				window.addEventListener("touchend", e => (this.isDown = false), false);
				this.x = canvas.width / 2;
				this.y = canvas.height / 2;
			}
		};
		const vect = [];
		let sw = 0,
			nw = 0,
			nh = 0,
			py = 0,
			nbx = 15,
			nby = 0,
			cx = 0,
			cy = 0,
			ws = 0,
			hs = 0;
		const ctx = canvas.init();
		pointer.init();
		const run = () => {
			requestAnimationFrame(run);
			// ---- clear background ----
			ctx.fillStyle = "#c7c7c7";
			ctx.fillRect(0, 0, canvas.width, canvas.height * 0.2);
			ctx.clearRect(0, canvas.height * 0.2, canvas.width, canvas.height * 0.6);
			ctx.fillRect(0, canvas.height * 0.8, canvas.width, canvas.height * 0.2);
			// ---- easing mouse ----
			cx += (pointer.x - cx) * 0.1;
			cy += (pointer.y - cy) * 0.1;
			// ---- calculate positions ----
			for (const o of vect) o.points();
			// ---- zIndex sorting ----
			vect.sort(function (p0, p1) {
				return p0.zIndex - p1.zIndex;
			});
			// ---- draw ----
			ctx.lineCap = "round";
			ctx.lineWidth = sw;
			for (const o of vect) {
				if (o.zIndex < 1000) {
					o.draw();
				}
			}
		};
		run();
	}
})();

(function () {
	var App = {};

	jQuery(document).ready(function () {
		// Setup canvas and app
		App.setup();
		// Launch animation loop
		App.frame = function () {
			App.update();
			window.requestAnimationFrame(App.frame);
		};
		App.frame();

		jQuery("canvas#ourCanvas").on("click", function (event) {
			App.hasUserClicked = !App.hasUserClicked;
		});

		jQuery("canvas#ourCanvas").on("mousemove", function (event) {
			App.target.x = event.pageX;
			App.target.y = event.pageY;
		});
	});

	App.setup = function () {
		// Setup canvas and get canvas context
		var canvas = document.createElement("canvas");
		canvas.height = window.innerHeight;
		canvas.width = window.innerWidth;
		canvas.id = "ourCanvas";
		var e = document.querySelector(".fish");
		e.appendChild(canvas);
		console.log(e);
		this.ctx = canvas.getContext("2d");
		this.width = canvas.width;
		this.height = canvas.height;

		// Define a few useful elements
		this.stepCount = 0;
		this.hasUserClicked = false;
		this.xC = canvas.width / 2;
		this.yC = canvas.height / 2;
		this.target = {
			x: this.xC,
			y: this.yC,
			radius: 20
		};
		this.armsPop = 20;
		//this.particlesPerArm = 15;

		// Create initial targets and arms
		this.arms = [];
		for (var i = 0; i < this.armsPop; i++) {
			this.arms.push([]);
		}
		// Fill initial arms
		this.initialBirth();

		// Some forces
		this.gravity = -1;
		this.springStiffness = 0.5;
		this.viscosity = 0.1;
		this.isElastic = false;
	};
	App.initialBirth = function () {
		for (var armIndex = 0; armIndex < this.arms.length; armIndex++) {
			var arm = this.arms[armIndex];
			// Random arm length! Sorta.
			var particlesNb = 20 + Math.ceil(20 * Math.random());
			for (var i = 0; i < particlesNb; i++) {
				var x = this.width * Math.random();
				var y = this.height * Math.random();
				var particle = {
					x: x,
					y: y,
					xLast: x,
					yLast: y,
					xSpeed: 0,
					ySpeed: 0,
					stickLength: 10,
					name: "seed" + this.stepCount
				};

				arm.push(particle);
			}
		}
	};
	App.update = function () {
		// Evolve system
		this.evolve();
		// Move particles
		this.move();
		// Draw particles
		this.draw();
	};
	App.evolve = function () {
		this.stepCount++;
		this.target.radius = 50 + 30 * Math.sin(this.stepCount / 10);
	};
	App.move = function () {
		// This is inverse kinematics, the particles form an arm with N joints, and its shape adapts with a target contraint
		// Move target point
		if (!this.hasUserClicked) {
			this.target.x = this.xC + 150 * Math.cos(this.stepCount / 50);
			this.target.y = this.yC + 150 * Math.sin(this.stepCount / 20);
		}

		// Move particles accordingly (on each arm)
		for (var armIndex = 0; armIndex < this.arms.length; armIndex++) {
			var arm = this.arms[armIndex];
			var ownTargetAngle = (2 * Math.PI * armIndex) / this.arms.length;
			var ownTarget = {
				x: this.target.x + this.target.radius * Math.cos(ownTargetAngle),
				y: this.target.y + this.target.radius * Math.sin(ownTargetAngle)
			};
			for (var i = 0; i < arm.length; i++) {
				var p = arm[i];
				// Leading particle (particle bound to head at first, then the preceding particle)
				var pLead = i == 0 ? ownTarget : arm[i - 1];
				var angle = segmentAngleRad(p.x, p.y, pLead.x, pLead.y, false);
				var dist = Math.sqrt(
					Math.pow(p.x - pLead.x, 2) + Math.pow(p.y - pLead.y, 2)
				);
				var translationDist = dist - p.stickLength;
				if (translationDist < 0) {
					angle += Math.PI;
					translationDist = Math.abs(translationDist);
				}
				/* Kinetic binding */
				// Rotation, then translation for each particle/stick from head to tail
				var dx = translationDist * Math.cos(angle);
				var dy = translationDist * Math.sin(angle);
				if (!this.isElastic) {
					p.x += dx;
					p.y -= dy;
				}
				/* Forces */
				var xAcc = this.springStiffness * dx - this.viscosity * p.xSpeed;
				var yAcc =
					this.springStiffness * dy + this.gravity - this.viscosity * p.ySpeed;
				p.xSpeed += xAcc;
				p.ySpeed += yAcc;
				p.x += 0.1 * p.xSpeed;
				p.y -= 0.1 * p.ySpeed;
			}
		}
	};
	App.draw = function () {
		// Add transparent layer for trace effect
		this.ctx.beginPath();
		this.ctx.rect(0, 0, this.width, this.height);
		this.ctx.fillStyle = "rgba(0, 0, 0, 0.3)";
		this.ctx.fill();

		// Draw target
		this.ctx.beginPath();
		this.ctx.arc(this.target.x, this.target.y, 15, 0, 2 * Math.PI, false);
		this.ctx.fillStyle = "rgba(255, 255, 255, 0.1)";
		this.ctx.fill();

		// Draw particles
		for (var armIndex = 0; armIndex < this.arms.length; armIndex++) {
			var arm = this.arms[armIndex];
			for (var i = 0; i < arm.length; i++) {
				var particle = arm[i];
				if (i != 0) {
					var particleLead = arm[i - 1];
				}

				// Draw particle
				this.ctx.beginPath();
				this.ctx.arc(
					particle.x,
					particle.y,
					0.3 * (arm.length - i),
					0,
					2 * Math.PI,
					false
				);
				this.ctx.strokeStyle = "hsla(" + (200 + i * 4) + ", 90%, 50%, 0.7)";
				this.ctx.stroke();
				// Draw its stick
				this.ctx.beginPath();
				this.ctx.lineWidth = 1;
				this.ctx.strokeStyle = "hsla(" + (180 + i * 4) + ", 80%, 50%, 0.7)";
				if (i == 0) this.ctx.moveTo(this.target.x, this.target.y);
				else this.ctx.moveTo(particleLead.x, particleLead.y);
				this.ctx.lineTo(particle.x, particle.y);
				this.ctx.stroke();
			}
		}
	};

	/**
	 * @param {Number} Xstart X value of the segment starting point
	 * @param {Number} Ystart Y value of the segment starting point
	 * @param {Number} Xtarget X value of the segment target point
	 * @param {Number} Ytarget Y value of the segment target point
	 * @param {Boolean} realOrWeb true if Real (Y towards top), false if Web (Y towards bottom)
	 * @returns {Number} Angle between 0 and 2PI
	 */
	segmentAngleRad = function (Xstart, Ystart, Xtarget, Ytarget, realOrWeb) {
		var result; // Will range between 0 and 2PI
		if (Xstart == Xtarget) {
			if (Ystart == Ytarget) {
				result = 0;
			} else if (Ystart < Ytarget) {
				result = Math.PI / 2;
			} else if (Ystart > Ytarget) {
				result = (3 * Math.PI) / 2;
			} else {}
		} else if (Xstart < Xtarget) {
			result = Math.atan((Ytarget - Ystart) / (Xtarget - Xstart));
		} else if (Xstart > Xtarget) {
			result = Math.PI + Math.atan((Ytarget - Ystart) / (Xtarget - Xstart));
		}

		result = (result + 2 * Math.PI) % (2 * Math.PI);

		if (!realOrWeb) {
			result = 2 * Math.PI - result;
		}

		return result;
	};
})();

(function () {
	var ge1doot = ge1doot || {
		/*
                 \|||/
                 (o o)
        +~~~~ooO~~(_)~~~~~~~~+
        | Please             |
        | don't feed the     |
        | TROLLS !           |
        +~~~~~~~~~~~~~~Ooo~~~+
                |__|__|
                 || ||
                ooO Ooo
        */

		screen: {
			elem: null,
			callback: null,
			ctx: null,
			width: 0,
			height: 0,
			left: 0,
			top: 0,
			init: function (id, callback, initRes) {
				this.elem = document.getElementById(id);
				this.callback = callback || null;
				if (this.elem.tagName == "CANVAS")
					this.ctx = this.elem.getContext("2d");
				window.addEventListener(
					"resize",
					function () {
						this.resize();
					}.bind(this),
					false
				);
				this.elem.onselectstart = function () {
					return false;
				};
				this.elem.ondrag = function () {
					return false;
				};
				initRes && this.resize();
				return this;
			},
			resize: function () {
				var o = this.elem;
				this.width = o.offsetWidth;
				this.height = o.offsetHeight;
				for (this.left = 0, this.top = 0; o != null; o = o.offsetParent) {
					this.left += o.offsetLeft;
					this.top += o.offsetTop;
				}
				if (this.ctx) {
					this.elem.width = this.width;
					this.elem.height = this.height;
				}
				this.callback && this.callback();
			},
			pointer: {
				screen: null,
				elem: null,
				callback: null,
				pos: {
					x: 0,
					y: 0
				},
				mov: {
					x: 0,
					y: 0
				},
				drag: {
					x: 0,
					y: 0
				},
				start: {
					x: 0,
					y: 0
				},
				end: {
					x: 0,
					y: 0
				},
				active: false,
				touch: false,
				down: function (e, touch) {
					this.touch = touch;
					e.preventDefault();
					var pointer = touch ? e.touches[0] : e;
					!touch && document.setCapture && document.setCapture();
					this.pos.x = this.start.x = pointer.clientX - this.screen.left;
					this.pos.y = this.start.y = pointer.clientY - this.screen.top;
					this.active = true;
					this.callback.down && this.callback.down();
				},
				up: function (e, touch) {
					this.touch = touch;
					e.preventDefault();
					!touch && document.releaseCapture && document.releaseCapture();
					this.end.x = this.drag.x;
					this.end.y = this.drag.y;
					this.active = false;
					this.callback.up && this.callback.up();
				},
				move: function (e, touch) {
					this.touch = touch;
					e.preventDefault();
					var pointer = touch ? e.touches[0] : e;
					this.mov.x = pointer.clientX - this.screen.left;
					this.mov.y = pointer.clientY - this.screen.top;
					if (this.active) {
						this.pos.x = this.mov.x;
						this.pos.y = this.mov.y;
						this.drag.x = this.end.x - (this.pos.x - this.start.x);
						this.drag.y = this.end.y - (this.pos.y - this.start.y);
						this.callback.move && this.callback.move();
					}
				},
				init: function (callback) {
					this.screen = ge1doot.screen;
					this.elem = this.screen.elem;
					this.callback = callback || {};
					if ("ontouchstart" in window) {
						// touch
						this.elem.ontouchstart = function (e) {
							this.down(e, true);
						}.bind(this);
						this.elem.ontouchmove = function (e) {
							this.move(e, true);
						}.bind(this);
						this.elem.ontouchend = function (e) {
							this.up(e, true);
						}.bind(this);
						this.elem.ontouchcancel = function (e) {
							this.up(e, true);
						}.bind(this);
					}
					// mouse
					document.addEventListener(
						"mousedown",
						function (e) {
							this.down(e, false);
						}.bind(this),
						true
					);
					document.addEventListener(
						"mousemove",
						function (e) {
							this.move(e, false);
						}.bind(this),
						true
					);
					document.addEventListener(
						"mouseup",
						function (e) {
							this.up(e, false);
						}.bind(this),
						true
					);
					return this;
				}
			},
			loadImages: function (container) {
				var elem = document.getElementById(container),
					canvas = document.createElement("canvas"),
					ctx,
					init = false,
					complete = false,
					n = document.images.length;

				function arc(color, val, r) {
					ctx.beginPath();
					ctx.moveTo(50, 50);
					ctx.arc(50, 50, r, 0, val);
					ctx.fillStyle = color;
					ctx.fill();
					ctx.closePath();
				}

				function load() {
					if (complete) {
						canvas.style.display = "none";
						return;
					}
					var m = 0,
						timer = 32;
					for (var i = 0; i < n; i++) m += document.images[i].complete ? 1 : 0;
					if (m < n) {
						if (!init) {
							init = true;
							canvas.style.width = canvas.style.height = "100px";
							canvas.width = canvas.height = 100;
							canvas.style.position = "fixed";
							canvas.style.left = canvas.style.top = "50%";
							canvas.style.marginTop = canvas.style.marginLeft = "-50px";
							canvas.style.zIndex = 10000;
							ctx = canvas.getContext("2d");
							arc("rgb(64,64,64)", Math.PI * 2, 48);
							elem.appendChild(canvas);
						}
						arc("rgb(255,255,255)", (m / n) * 2 * Math.PI, 50);
					} else {
						if (init) {
							arc("rgb(255,255,255)", 2 * Math.PI, 50);
							timer = 300;
						}
						complete = true;
					}
					setTimeout(load, timer);
				}
				setTimeout(load, 32);
			}
		}
	};

	!(function () {
		"use strict";

		var screen = ge1doot.screen.init(
			"screen",
			function () {
				PHY2D.deleteStatic();
				PHY2D.rectangle(
					screen.width / 2,
					screen.height + 10,
					screen.width,
					30,
					0,
					0
				);
			},
			false
		);
		var ctx = screen.ctx,
			rec;
		var pointer = screen.pointer.init({
			down: function () {
				rec = {
					x0: pointer.pos.x,
					y0: pointer.pos.y,
					x1: pointer.pos.x,
					y1: pointer.pos.y
				};
			},
			move: function () {
				if (rec) {
					rec.x1 = pointer.pos.x;
					rec.y1 = pointer.pos.y;
				}
			},
			up: function () {
				PHY2D.up();
				if (rec) {
					var w = Math.abs(rec.x1 - rec.x0);
					var h = Math.abs(rec.y1 - rec.y0);
					if (w > 0 && h > 0) {
						PHY2D.rectangle(
							Math.min(rec.x0, rec.x1) + w / 2,
							Math.min(rec.y0, rec.y1) + h / 2,
							w,
							h,
							Math.sqrt(w * h) / 10,
							0
						);
						rec = null;
					}
				}
			}
		});

		// vectors 2D prototype (does not create/return new objects at runtime)

		function Vector(x, y) {
			this.x = x || 0.0;
			this.y = y || 0.0;
		}

		Vector.prototype = {
			set: function (x, y) {
				this.x = x;
				this.y = y;
				return this;
			},

			dot: function (v) {
				return this.x * v.x + this.y * v.y;
			},

			lenSqr: function () {
				return this.x * this.x + this.y * this.y;
			},

			transform: function (v, m) {
				this.x = m.cos * v.x - m.sin * v.y + m.pos.x;
				this.y = m.sin * v.x + m.cos * v.y + m.pos.y;
				return this;
			},

			rotate: function (v, m) {
				this.x = m.cos * v.x - m.sin * v.y;
				this.y = m.sin * v.x + m.cos * v.y;
				return this;
			},

			normal: function (a, b) {
				var x = a.x - b.x,
					y = a.y - b.y,
					len = Math.sqrt(x * x + y * y);
				this.x = -y / len;
				this.y = x / len;
				return this;
			},

			project: function (a, b, n) {
				var x = a.x - b.x,
					y = a.y - b.y,
					len = Math.sqrt(x * x + y * y);
				return (-y / len) * n.x + (x / len) * n.y;
			},

			addScale: function (v1, v2, s) {
				this.x = v1.x + v2.x * s;
				this.y = v1.y + v2.y * s;
				return this;
			},

			subScale: function (v1, v2, s) {
				this.x = v1.x - v2.x * s;
				this.y = v1.y - v2.y * s;
				return this;
			},

			add: function (v1, v2) {
				this.x = v1.x + v2.x;
				this.y = v1.y + v2.y;
				return this;
			},

			sub: function (v1, v2) {
				this.x = v1.x - v2.x;
				this.y = v1.y - v2.y;
				return this;
			},

			scale: function (v1, s) {
				this.x = v1.x * s;
				this.y = v1.y * s;
				return this;
			},

			perp: function () {
				var x = this.x;
				this.x = -this.y;
				this.y = x;
				return this;
			},

			inv: function (v1) {
				this.x = -v1.x;
				this.y = -v1.y;
				return this;
			},

			clamp: function (v, min, max) {
				if (v > max) v = max;
				else if (v < min) v = min;
				return v;
			},

			rotateIntoSpaceOf: function (a, m) {
				var dx = -a.x,
					dy = -a.y;
				this.x = dx * m.cos + dy * m.sin;
				this.y = dx * -m.sin + dy * m.cos;
				return this;
			},

			// SIMD array vectors

			array: function (n, values) {
				var array = new Array(n);
				array.min = new Vector();
				array.max = new Vector();

				for (var i = 0; i < n; i++) {
					array[i] = new Vector(
						values ? values[i * 2 + 0] : 0.0,
						values ? values[i * 2 + 1] : 0.0
					);
				}

				array.transform = function (v, m) {
					for (var i = 0, len = this.length; i < len; i++) {
						var vi = v[i],
							elem = this[i];
						var x = m.cos * vi.x - m.sin * vi.y + m.pos.x;
						var y = m.sin * vi.x + m.cos * vi.y + m.pos.y;

						if (x < this.min.x) this.min.x = x;
						if (y < this.min.y) this.min.y = y;
						if (x > this.max.x) this.max.x = x;
						if (y > this.max.y) this.max.y = y;

						elem.x = x;
						elem.y = y;
					}

					return this;
				};

				array.rotate = function (v, m) {
					for (var i = 0, len = this.length; i < len; i++) {
						var vi = v[i],
							elem = this[i];
						elem.x = m.cos * vi.x - m.sin * vi.y;
						elem.y = m.sin * vi.x + m.cos * vi.y;
					}

					return this;
				};

				array.resetMinmax = function () {
					this.min.x = 100000.0;
					this.min.y = 100000.0;
					this.max.x = -100000.0;
					this.max.y = -100000.0;
				};

				array.normal = function (points) {
					for (var i = 0; i < this.length; i++) {
						this[i].normal(points[(i + 1) % this.length], points[i]);
					}

					return this;
				};

				return array;
			}
		};

		// Matrix container

		function Matrix() {
			this.cos = 0.0;
			this.sin = 0.0;
			this.pos = new Vector();
			this.ang = 0.0;
		}

		Matrix.prototype = {
			set: function (a, x, y) {
				this.cos = Math.cos(a);
				this.sin = Math.sin(a);
				this.ang = a;
				this.pos.x = x;
				this.pos.y = y;
				return this;
			},

			copy: function (matrix) {
				this.cos = matrix.cos;
				this.sin = matrix.sin;
				this.ang = matrix.ang;
				this.pos.x = matrix.pos.x;
				this.pos.y = matrix.pos.y;
				return this;
			},

			integrate: function (va, vx, vy, kTimeStep) {
				this.pos.x += vx * kTimeStep;
				this.pos.y += vy * kTimeStep;
				this.ang += va * kTimeStep;
				this.cos = Math.cos(this.ang);
				this.sin = Math.sin(this.ang);
				return this;
			}
		};

		// Main PHY2D code

		var PHY2D = (function (ctx, pointer, Vector, Matrix) {
			var kGravity = 5;
			var kTimeStep = 1 / 60;
			var kFriction = 0.3;

			var objects = [];
			var drag = false;

			// temporary working vectors (TODO: need to get this managed by the vector module)
			var v0 = new Vector();
			var v1 = new Vector();
			var v2 = new Vector();
			var v3 = new Vector();
			var v4 = new Vector();
			var v5 = new Vector();

			// contacts list
			var contacts = [];
			contacts.index = 0;
			contacts.create = function (A, B, pa, pb, nx, ny) {
				if (!this[this.index]) this[this.index] = new Contact();
				this[this.index++].set(A, B, pa, pb, nx, ny);
			};

			// AABB container constructor
			function AABB() {
				this.x = 0.0;
				this.y = 0.0;
				this.w = 0.0;
				this.h = 0.0;
			}

			// Polygon constructor
			function Polygon(x, y, w, h, vertices, invMass, angle) {
				this.vel = new Vector();
				this.angularVel = 0.0;
				this.invMass = invMass;
				this.matrix = new Matrix().set(angle, x, y);
				this.matrixNextFrame = new Matrix();
				this.aabb = new AABB();
				this.drag = false;
				this.static = false;
				this.length = (vertices.length / 2) | 0;

				// vertices
				this.localSpacePoints = new Vector().array(this.length, vertices);
				this.localSpaceNormals = new Vector()
					.array(this.length)
					.normal(this.localSpacePoints);
				this.worldSpaceNormals = new Vector().array(this.length);
				this.worldSpacePoints = new Vector().array(this.length);

				// calculate inverse inertia tensor
				this.invI =
					invMass > 0 ? 1 / (((1 / invMass) * (w * w + h * h)) / 3) : 0;

				// contact points
				this.c1 = new Vector();
				this.c0 = new Vector();

				// add rigid body
				objects.push(this);
			}

			Polygon.prototype = {
				// aabb motion box

				motionAABB: function () {
					this.worldSpacePoints.resetMinmax();
					this.worldSpacePoints.transform(
						this.localSpacePoints,
						this.matrixNextFrame
					);
					this.worldSpacePoints.transform(this.localSpacePoints, this.matrix);
					this.worldSpaceNormals.rotate(this.localSpaceNormals, this.matrix);
					var min = this.worldSpacePoints.min;
					var max = this.worldSpacePoints.max;
					this.aabb.x = (min.x + max.x) * 0.5;
					this.aabb.y = (min.y + max.y) * 0.5;
					this.aabb.w = (max.x - min.x) * 0.5;
					this.aabb.h = (max.y - min.y) * 0.5;
				},

				// contact points

				contact: function (that) {
					var face,
						vertex,
						vertexRect,
						faceRect,
						fp,
						va,
						vb,
						vc,
						nx,
						ny,
						wsN,
						wdV0,
						wdV1,
						wsV0,
						wsV1;

					// generate contacts for this pair
					mostSeparated.set(100000, -1, -1, 0, 100000);
					mostPenetrating.set(-100000, -1, -1, 0, 100000);

					// face of A, vertices of B
					this.featurePairJudgement(that, 2);

					// faces of B, vertices of A
					that.featurePairJudgement(this, 1);

					if (mostSeparated.dist > 0 && mostSeparated.fpc !== 0) {
						// objects are separated
						face = mostSeparated.edge;
						vertex = mostSeparated.closestI;
						fp = mostSeparated.fpc;
					} else if (mostPenetrating.dist <= 0) {
						// objects are penetrating
						face = mostPenetrating.edge;
						vertex = mostPenetrating.closestI;
						fp = mostPenetrating.fpc;
					}

					if (fp === 1)(vertexRect = this), (faceRect = that);
					else(vertexRect = that), (faceRect = this);

					// world space vertex
					wsN = faceRect.worldSpaceNormals[face];

					// other vertex adjacent which makes most parallel normal with the collision normal
					va =
						vertexRect.worldSpacePoints[
							(vertex - 1 + vertexRect.length) % vertexRect.length
						];
					vb = vertexRect.worldSpacePoints[vertex];
					vc = vertexRect.worldSpacePoints[(vertex + 1) % vertexRect.length];

					if (v0.project(vb, va, wsN) < v1.project(vc, vb, wsN)) {
						wdV0 = va;
						wdV1 = vb;
					} else {
						wdV0 = vb;
						wdV1 = vc;
					}

					// world space edge
					wsV0 = faceRect.worldSpacePoints[face];
					wsV1 = faceRect.worldSpacePoints[(face + 1) % faceRect.length];

					// form contact
					if (fp === 1) {
						// project vertex onto edge
						this.projectPointOntoEdge(wsV0, wsV1, wdV0, wdV1);
						that.projectPointOntoEdge(wdV1, wdV0, wsV0, wsV1);
						// normal is negated because it always needs to point from A->B
						nx = -wsN.x;
						ny = -wsN.y;
					} else {
						this.projectPointOntoEdge(wdV1, wdV0, wsV0, wsV1);
						that.projectPointOntoEdge(wsV0, wsV1, wdV0, wdV1);
						nx = wsN.x;
						ny = wsN.y;
					}

					// create contacts
					contacts.create(this, that, this.c0, that.c0, nx, ny);
					contacts.create(this, that, this.c1, that.c1, nx, ny);
				},

				featurePairJudgement: function (that, fpc) {
					var wsN, closestI, closest, dist;

					for (var edge = 0; edge < this.length; edge++) {
						// get support vertices
						wsN = this.worldSpaceNormals[edge];

						// rotate into RigidBody space
						v5.rotateIntoSpaceOf(wsN, that.matrix);

						var closestI = -1,
							closestD = -100000;

						// Get the vertex most in the direction of the given vector
						for (var i = 0; i < that.length; i++) {
							var d = v5.dot(that.localSpacePoints[i]);

							if (d > closestD) {
								closestD = d;
								closestI = i;
							}
						}

						var closest = that.worldSpacePoints[closestI];
						v0.sub(closest, this.worldSpacePoints[edge]);

						// distance from origin to face
						var dist = v0.dot(wsN);

						if (dist > 0) {
							// recompute distance to clamped edge
							v1.sub(closest, this.worldSpacePoints[(edge + 1) % this.length]);

							// project onto minkowski edge
							dist = this.projectPointOntoEdgeZero(v0, v1).lenSqr();

							// track separation
							if (dist < mostSeparated.dist) {
								mostSeparated.set(dist, closestI, edge, fpc);
							}
						} else {
							// track penetration
							if (dist > mostPenetrating.dist) {
								mostPenetrating.set(dist, closestI, edge, fpc);
							}
						}
					}

					return true;
				},

				projectPointOntoEdge: function (p0, p1, e0, e1) {
					var l = v2.sub(e1, e0).lenSqr() + 0.0000001;
					this.c0.addScale(e0, v2, v3.clamp(v3.sub(p0, e0).dot(v2) / l, 0, 1));
					this.c1.addScale(e0, v2, v3.clamp(v3.sub(p1, e0).dot(v2) / l, 0, 1));
				},

				projectPointOntoEdgeZero: function (e0, e1) {
					var l = v2.sub(e1, e0).lenSqr() + 0.0000001;
					return this.c0.addScale(
						e0,
						v2,
						v3.clamp(v3.inv(e0).dot(v2) / l, 0, 1)
					);
				},

				// integration

				integrate: function () {
					if (this.drag) {
						// dragging object
						this.vel.x = (pointer.pos.x - this.matrix.pos.x) * 10;
						this.vel.y = (pointer.pos.y - this.matrix.pos.y) * 10;
					} else {
						// gravity
						if (this.invMass > 0) this.vel.y += kGravity;
					}

					// update position
					this.matrix.integrate(
						this.angularVel,
						this.vel.x,
						this.vel.y,
						kTimeStep
					);
					this.matrixNextFrame
						.copy(this.matrix)
						.integrate(this.angularVel, this.vel.x, this.vel.y, kTimeStep);

					// compute motion AABB
					if (!this.static) this.motionAABB();
					else {
						if (this.invMass === 0) {
							this.static = true;
							this.motionAABB();
						}
					}
				},

				draw: function () {
					ctx.beginPath();
					for (var j = 0; j < this.length; j++) {
						var a = this.worldSpacePoints[j];
						ctx.lineTo(a.x, a.y);
					}
					ctx.closePath();
					//#a0c808 #02a4e1 #ee7205 #e52a12

					ctx.fillStyle = "#ee7205";
					ctx.fill();

					/*if (pointer.active && !drag && this.invMass) {
                          if (ctx.isPointInPath(pointer.pos.x, pointer.pos.y)) {
                              this.drag = true;
                              drag = true;
                          }
                      }*/
				}
			};

			// feature pair container

			function FeaturePair() {
				this.dist = 0;
				this.closestI = 0;
				this.edge = 0;
				this.fpc = 0;
			}
			FeaturePair.prototype.set = function (dist, closestI, edge, fpc) {
				this.dist = dist;
				this.closestI = closestI;
				this.edge = edge;
				this.fpc = fpc;
			};
			var mostSeparated = new FeaturePair();
			var mostPenetrating = new FeaturePair();

			// contacts constructor

			function Contact() {
				this.a = null;
				this.b = null;
				this.normal = new Vector();
				this.normalPerp = new Vector();
				this.ra = new Vector();
				this.rb = new Vector();
				this.dist = 0;
				this.impulseN = 0;
				this.impulseT = 0;
				this.invDenom = 0;
				this.invDenomTan = 0;
			}
			Contact.prototype = {
				// reusing existing contact objects

				set: function (A, B, pa, pb, nx, ny) {
					var ran, rbn;

					this.a = A;
					this.b = B;
					this.normal.set(nx, ny);
					this.normalPerp.set(-ny, nx);
					this.dist = v1.sub(pb, pa).dot(this.normal);
					this.impulseN = 0;
					this.impulseT = 0;

					// calculate radius arms
					this.ra.sub(pa, A.matrix.pos).perp();
					this.rb.sub(pb, B.matrix.pos).perp();

					// compute denominator in impulse equation
					ran = this.ra.dot(this.normal);
					rbn = this.rb.dot(this.normal);
					this.invDenom =
						1 /
						(A.invMass + B.invMass + ran * ran * A.invI + rbn * rbn * B.invI);
					ran = this.ra.dot(this.normalPerp);
					rbn = this.rb.dot(this.normalPerp);
					this.invDenomTan =
						1 /
						(A.invMass + B.invMass + ran * ran * A.invI + rbn * rbn * B.invI);
				},

				applyImpulse: function (imp) {
					// linear
					this.a.vel.addScale(this.a.vel, imp, this.a.invMass);
					this.b.vel.subScale(this.b.vel, imp, this.b.invMass);
					// angular
					this.a.angularVel += imp.dot(this.ra) * this.a.invI;
					this.b.angularVel -= imp.dot(this.rb) * this.b.invI;
				},

				// speculative contact solver

				solve: function () {
					var newImpulse,
						absMag,
						dv = v1;

					// get all of relative normal velocity
					dv.sub(
						v2.addScale(this.b.vel, this.rb, this.b.angularVel),
						v3.addScale(this.a.vel, this.ra, this.a.angularVel)
					);

					// accumulated impulse
					newImpulse =
						(dv.dot(this.normal) + this.dist / kTimeStep) * this.invDenom +
						this.impulseN;

					// push only
					if (newImpulse > 0) newImpulse = 0;

					// apply impulse
					this.applyImpulse(v2.scale(this.normal, newImpulse - this.impulseN));
					this.impulseN = newImpulse;

					// friction
					absMag = Math.abs(this.impulseN) * kFriction;
					newImpulse = v2.clamp(
						dv.dot(this.normalPerp) * this.invDenomTan + this.impulseT,
						-absMag,
						absMag
					);

					// apply friction impulse
					this.applyImpulse(
						v3.scale(this.normalPerp, newImpulse - this.impulseT)
					);
					this.impulseT = newImpulse;
				}
			};

			// main render loop

			function render() {
				// brute force aabb broadphase
				contacts.index = 0;
				for (var i = 0, len = objects.length; i < len - 1; i++) {
					var A = objects[i];

					for (var j = i + 1; j < len; j++) {
						var B = objects[j];

						if (A.invMass || B.invMass) {
							var a = A.aabb,
								b = B.aabb;
							if (
								Math.abs(b.x - a.x) - (a.w + b.w) < 0 &&
								Math.abs(b.y - a.y) - (a.h + b.h) < 0
							)
								A.contact(B);
						}
					}
				}

				// solver loop
				var len = contacts.index;
				for (var j = 0; j < 5; j++) {
					for (var i = 0; i < len; i++) {
						contacts[i].solve();
					}
				}

				// integration loop
				for (var i = 0, len = objects.length; i < len; i++) {
					objects[i].integrate();
				}

				// draw
				for (var i = 0; i < len; i++) {
					var rb = objects[i];
					rb.draw();
					// delete lost bodies
					if (rb.matrix.pos.y > screen.height * 2) {
						objects.splice(i, 1);
						len--;
						i--;
					}
				}
			}

			return {
				// public interface

				render: render,

				up: function () {
					for (var i = 0; i < objects.length; i++) objects[i].drag = false;
					drag = false;
				},

				// create new rectangles

				rectangle: function (x, y, w, h, mass, angle) {
					var vertices = [
						w / 2,
						-h / 2,
						-w / 2,
						-h / 2,
						-w / 2,
						h / 2,
						w / 2,
						h / 2
					];
					var invMass = mass ? 1 / mass : 0;
					return new Polygon(x, y, w, h, vertices, invMass, angle);
				},

				// delete static objects

				deleteStatic: function () {
					var k = objects.length;
					while (k--) {
						var p = objects[k];
						if (!p.invMass) {
							objects.splice(k, 1);
						}
					}
				}
			};
		})(ctx, pointer, Vector, Matrix); // injection

		// create the pile 'O boxes
		screen.resize();
		var w = screen.width / 20;
		for (var i = 0; i < 10; i++) {
			for (var j = 0; j < 10; j++) {
				PHY2D.rectangle(
					0.5 * w + w * 5 + i * w,
					j * w,
					w * 0.75,
					w * 0.75,
					1,
					0
				);
			}
		}

		// ==== main loop ====
		function run() {
			requestAnimationFrame(run);
			ctx.clearRect(0, 0, screen.width, screen.height);
			if (rec) {
				ctx.beginPath();
				ctx.moveTo(rec.x0, rec.y0);
				ctx.lineTo(rec.x1, rec.y0);
				ctx.lineTo(rec.x1, rec.y1);
				ctx.lineTo(rec.x0, rec.y1);
				ctx.closePath();
				ctx.fillStyle = "rgb(128,128,128)";
				ctx.fill();
			}

			PHY2D.render();
		}

		// ==== start animation ====
		requestAnimationFrame(run);
	})();
})();