window.requestAnimationFrame =
    window.__requestAnimationFrame ||
        window.requestAnimationFrame ||
        window.webkitRequestAnimationFrame ||
        window.mozRequestAnimationFrame ||
        window.oRequestAnimationFrame ||
        window.msRequestAnimationFrame ||
        (function () {
            return function (callback, element) {
                var lastTime = element.__lastTime;
                if (lastTime === undefined) {
                    lastTime = 0;
                }
                var currTime = Date.now();
                var timeToCall = Math.max(1, 33 - (currTime - lastTime));
                window.setTimeout(callback, timeToCall);
                element.__lastTime = currTime + timeToCall;
            };
        })();
window.isDevice = (/android|webos|iphone|ipad|ipod|blackberry|iemobile|opera mini/i.test(((navigator.userAgent || navigator.vendor || window.opera)).toLowerCase()));
var loaded = false;
var init = function () {
    if (loaded) return;
    loaded = true;
    var mobile = window.isDevice;
    var koef = mobile ? 0.5 : 1;
    var canvas = document.getElementById('heart');
    var ctx = canvas.getContext('2d');
    var width = canvas.width = koef * innerWidth;
    var height = canvas.height = koef * innerHeight;
    var rand = Math.random;
    ctx.fillStyle = "rgba(0,0,0,1)";
    ctx.fillRect(0, 0, width, height);

    var heartPosition = function (rad) {
        //return [Math.sin(rad), Math.cos(rad)];
        return [Math.pow(Math.sin(rad), 3), -(15 * Math.cos(rad) - 5 * Math.cos(2 * rad) - 2 * Math.cos(3 * rad) - Math.cos(4 * rad))];
    };
    var scaleAndTranslate = function (pos, sx, sy, dx, dy) {
        return [dx + pos[0] * sx, dy + pos[1] * sy];
    };

    window.addEventListener('resize', function () {
        width = canvas.width = koef * innerWidth;
        height = canvas.height = koef * innerHeight;
        ctx.fillStyle = "rgba(0,0,0,1)";
        ctx.fillRect(0, 0, width, height);
    });

    var traceCount = mobile ? 20 : 50;
    var pointsOrigin = [];
    var i;
    var dr = mobile ? 0.3 : 0.1;
    for (i = 0; i < Math.PI * 2; i += dr) pointsOrigin.push(scaleAndTranslate(heartPosition(i), 210, 13, 0, 0));
    for (i = 0; i < Math.PI * 2; i += dr) pointsOrigin.push(scaleAndTranslate(heartPosition(i), 150, 9, 0, 0));
    for (i = 0; i < Math.PI * 2; i += dr) pointsOrigin.push(scaleAndTranslate(heartPosition(i), 90, 5, 0, 0));
    var heartPointsCount = pointsOrigin.length;

    var targetPoints = [];
    var pulse = function (kx, ky) {
        for (i = 0; i < pointsOrigin.length; i++) {
            targetPoints[i] = [];
            targetPoints[i][0] = kx * pointsOrigin[i][0] + width / 2;
            targetPoints[i][1] = ky * pointsOrigin[i][1] + height / 2;
        }
    };

    var e = [];
    for (i = 0; i < heartPointsCount; i++) {
        var x = rand() * width;
        var y = rand() * height;
        e[i] = {
            vx: 0,
            vy: 0,
            R: 2,
            speed: rand() + 5,
            q: ~~(rand() * heartPointsCount),
            D: 2 * (i % 2) - 1,
            force: 0.2 * rand() + 0.7,
            f: "hsla(0," + ~~(40 * rand() + 60) + "%," + ~~(60 * rand() + 20) + "%,.3)",
            trace: []
        };
        for (var k = 0; k < traceCount; k++) e[i].trace[k] = {x: x, y: y};
    }

    var config = {
        traceK: 0.4,
        timeDelta: 0.01
    };

    var time = 0;
    var loop = function () {
        var n = -Math.cos(time);
        pulse((1 + n) * .5, (1 + n) * .5);
        time += ((Math.sin(time)) < 0 ? 9 : (n > 0.8) ? .2 : 1) * config.timeDelta;
        ctx.fillStyle = "rgba(0,0,0,.1)";
        ctx.fillRect(0, 0, width, height);
        for (i = e.length; i--;) {
            var u = e[i];
            var q = targetPoints[u.q];
            var dx = u.trace[0].x - q[0];
            var dy = u.trace[0].y - q[1];
            var length = Math.sqrt(dx * dx + dy * dy);
            if (10 > length) {
                if (0.95 < rand()) {
                    u.q = ~~(rand() * heartPointsCount);
                }
                else {
                    if (0.99 < rand()) {
                        u.D *= -1;
                    }
                    u.q += u.D;
                    u.q %= heartPointsCount;
                    if (0 > u.q) {
                        u.q += heartPointsCount;
                    }
                }
            }
            u.vx += -dx / length * u.speed;
            u.vy += -dy / length * u.speed;
            u.trace[0].x += u.vx;
            u.trace[0].y += u.vy;
            u.vx *= u.force;
            u.vy *= u.force;
            for (k = 0; k < u.trace.length - 1;) {
                var T = u.trace[k];
                var N = u.trace[++k];
                N.x -= config.traceK * (N.x - T.x);
                N.y -= config.traceK * (N.y - T.y);
            }
            ctx.fillStyle = u.f;
            for (k = 0; k < u.trace.length; k++) {
                ctx.fillRect(u.trace[k].x, u.trace[k].y, 1, 1);
            }
        }
        //ctx.fillStyle = "rgba(255,255,255,1)";
        //for (i = u.trace.length; i--;) ctx.fillRect(targetPoints[i][0], targetPoints[i][1], 2, 2);

        window.requestAnimationFrame(loop, canvas);
    };
    loop();
};

var s = document.readyState;
if (s === 'complete' || s === 'loaded' || s === 'interactive') init();
else document.addEventListener('DOMContentLoaded', init, false);


// ================================================
// typing fuction =======================================

var TxtType = function(el, toRotate, period) {
	this.toRotate = toRotate;
	this.el = el;
	this.loopNum = 0;
	this.period = parseInt(period, 10) || 2000;
	this.txt = '';
	this.tick();
	this.isDeleting = false;
	this.count = 0;
	this.stop = false;
};

TxtType.prototype.tick = function() {
	var i = this.loopNum % this.toRotate.length;
	var fullTxt = this.toRotate[i];

	if (this.isDeleting) {
	    // this.txt = fullTxt.substring(0, this.txt.length - 1);
	    this.txt = fullTxt.substring(0, this.txt.length - 5);
	} else {
	    this.txt = fullTxt.substring(0, this.txt.length + 1);
	}

	this.el.innerHTML = '<span class="wrap">' + this.txt + '</span>';

	var that = this;
	var delta = 200 - Math.random() * 100;

	if (this.isDeleting) {
	    delta /= 2;
	}

	if (!this.isDeleting && this.txt === fullTxt) {
        delta = this.period;
        this.isDeleting = true;

        this.count++;
        if (this.count === 1) {
            this.stop = false;
		
	}
	} else if (this.isDeleting && this.txt === '') {
        this.isDeleting = false;
        this.loopNum++;
        delta = 500;
	}

	if (!this.stop) {
        setTimeout(function() {
            that.tick();
        }, delta);
	}
};

// window.onload = function() {
// 	var elements = document.getElementsByClassName('typewrite');
// 	for (var i = 0; i < elements.length; i++) {
// 	  var toRotate = elements[i].getAttribute('data-type');
// 	  var period = elements[i].getAttribute('data-period');
// 	  if (toRotate) {
// 		new TxtType(elements[i], JSON.parse(toRotate), period);
// 	  }
// 	}
	
// 	//var css = document.createElement("style");
// 	//css.type = "text/css";
// 	//css.innerHTML = ".typewrite > .wrap { border-right: 0.08em solid #fff; font-size: 1.5rem;}";
// 	//document.body.appendChild(css);
// };

setTimeout(() =>{
    var elements = document.getElementsByClassName('typewrite');
	for (var i = 0; i < elements.length; i++) {
	  var toRotate = elements[i].getAttribute('data-type');
	  var period = elements[i].getAttribute('data-period');
	  if (toRotate) {
		new TxtType(elements[i], JSON.parse(toRotate), period);
	  }
	}
}, 5000)

// =============================================================================================
// =============================================================================================

// =============================================================================================


// var c = document.getElementById('alx')

// var b = document.body
// var a = c.getContext('2d')

// e = []
// h = []

// WIDTH = c.width = innerWidth
// HEIGHT = c.height = innerHeight
// V = 32 + 16 + 8
// R = Math.random
// C = Math.cos
// Y = 6.3

// for(i = 0; i < Y; i += 0.2)
//     h.push([WIDTH / 2 + 210 * Math.pow(Math.sin(i), 3), HEIGHT / 2 + 13 * -(15 * C(i) - 5 * C(2 * i) - 2 * C(3 * i) - C(4 * i))])

// for(i = 0; i < Y ; i += 0.4)
//     h.push([WIDTH / 2 + 150 * Math.pow(Math.sin(i), 3), HEIGHT / 2 + 9 * -(15 * C(i) - 5 * C(2 * i) - 2 * C(3 * i) - C(4 * i))])

// for(i = 0 ; i < Y ; i += 0.8)
//     h.push([WIDTH / 2 + 90 * Math.pow(Math.sin(i), 3), HEIGHT / 2 + 5 * -(15 * C(i) - 5 * C(2 * i) - 2 * C(3 * i) - C(4 * i))])

// for(i = 0; i < V;) {
//     x = R() * WIDTH
//     y = R() * HEIGHT
//     H = 80 * (i / V) + Math.random * 100
//     S = 40 * R() * 60
//     B = 60 * R() + 20
//     f = []
//     for(k = 0; k < V;) f[k++] = {
//         x: x,
//         y: y,
//         X: 0,
//         Y: 0,
//         R: 1 - k / V + 1,
//         S: R() + 1,
//         q: ~~(R() * V),
//         D: 2 * (i % 2) - 1,
//         F: 0.2 * R() + 0.7,
//         f: "hsla("+ ~~H + "," + ~~S + "%," + ~~B + "%, .1)"
//     }
//     e[i++] = f
// }

// function path(d) {
//     a.fillStyle = d.f
//     a.beginPath()
//     a.arc(d.x, d.R, 0, Y, 1)
//     a.closePath()
//     a.fill()
// }

// setInterval(function () {
//     a.fillStyle = "rgba(0,0,0,.2)"
//     a.fillRect(0, 0, WIDTH, HEIGHT)
//     for(i = V; i--;){
//         f = e[i]
//         u = f[0]
//         q = h[u.q]
//         D = u.x - q
//         E = u.y - q
//         G = Math.sqrt(D * D + E * E)
//         10 > G && (0.95 < R() ? u.q =  ~~ (R() * V) : (0.99 < R() && (u.D *= -1), u.q += u.D))
//         u.X += -D /G * u.S
//         u.Y += -E / G * u.S
//         u.x += u.X
//         u.y += u.Y
//         path(u)
//         u.X *= u.F
//         u.Y *= u.F
//         console.log('e : ',e);
//         for(k = 0; k < V - 1;) T = f[k], N = f[++k], N.x -= 0.7 * (N.x - T.x), N.y -= 0.7 * (N.y - T.y)
//     }
// }, 5000)

// // console.log( 'a : ', a);
// // // console.log('Width : ' ,WIDTH);
// // // console.log('Height : ' ,HEIGHT);
// // // console.log('h : ',h);
