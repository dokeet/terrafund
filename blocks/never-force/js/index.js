"use strict";
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
			ctx.strokeStyle = `rgb(${Math.round(c * pointer.y / nh)},${Math.round(
				c * 0.5
			)},${Math.round(c * pointer.x / nw)})`;
			ctx.moveTo(this.x1, this.y1);
			ctx.lineTo(this.x2, this.y2);
			ctx.stroke();
		}
	}
	const canvas = {
		init() {
			this.elem = document.querySelector("canvas");
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
			nby = Math.round(nbx * nh / nw);
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
			window.addEventListener("mousedown", e => this.isDown = true, false);
			window.addEventListener("touchstart", e => this.isDown = true, false);
			window.addEventListener("mousemove", e => this.move(e, false), false);
			canvas.elem.addEventListener("touchmove", e => this.move(e, true), false);
			window.addEventListener("mouseup", e => this.isDown = false, false);
			window.addEventListener("touchend", e => this.isDown = false, false);
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
		ctx.fillStyle = "#2a2a2a";
		ctx.fillRect(0, 0, canvas.width, canvas.height * 0.2);
		ctx.clearRect(0, canvas.height * 0.2, canvas.width, canvas.height * 0.6);
		ctx.fillRect(0, canvas.height * 0.8, canvas.width, canvas.height * 0.2);
		// ---- easing mouse ----
		cx += (pointer.x - cx) * 0.1;
		cy += (pointer.y - cy) * 0.1;
		// ---- calculate positions ----
		for (const o of vect) o.points();
		// ---- zIndex sorting ----
		vect.sort(function(p0, p1) {
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