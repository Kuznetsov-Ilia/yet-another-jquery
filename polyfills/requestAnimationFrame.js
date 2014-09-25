if (!window.requestAnimationFrame) {

    window.requestAnimationFrame = window.msRequestAnimationFrame ||
    window.mozRequestAnimationFrame || window.webkitRequestAnimationFrame ||
    new function () {
        var fps = 60,
            delay = 1000 / fps,
            navigationStart = (new Date).getTime(),
            prevCallTime = navigationStart;
        return function (callback) {
            var curCallTime = (new Date).getTime(),
                timeout = Math.max(0, delay - (curCallTime - prevCallTime)),
                timeToCall = curCallTime + timeout;
            prevCallTime = timeToCall;
            return window.setTimeout(function () {
                callback(timeToCall - navigationStart);
            }, timeout);
        };
    };

    window.cancelAnimationFrame = window.mozCancelAnimationFrame ||
    window.webkitCancelAnimationFrame || window.cancelRequestAnimationFrame ||
    window.msCancelRequestAnimationFrame || window.mozCancelRequestAnimationFrame ||
    window.webkitCancelRequestAnimationFrame || window.clearTimeout;

}

window.rAF = window.requestAnimationFrame;
window.cAF = window.cancelAnimationFrame;
