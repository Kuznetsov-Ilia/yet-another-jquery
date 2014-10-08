if (!W.requestAnimationFrame) {

    W.requestAnimationFrame = W.msRequestAnimationFrame ||
    W.mozRequestAnimationFrame || W.webkitRequestAnimationFrame ||
    new function () {
        var fps = 60,
            delay = 1000 / fps,
            navigationStart = $.now(),
            prevCallTime = navigationStart;
        return function (callback) {
            var curCallTime = $.now(),
                timeout = Math.max(0, delay - (curCallTime - prevCallTime)),
                timeToCall = curCallTime + timeout;
            prevCallTime = timeToCall;
            return W.setTimeout(function () {
                callback(timeToCall - navigationStart);
            }, timeout);
        };
    };

    W.cancelAnimationFrame = W.mozCancelAnimationFrame ||
    W.webkitCancelAnimationFrame || W.cancelRequestAnimationFrame ||
    W.msCancelRequestAnimationFrame || W.mozCancelRequestAnimationFrame ||
    W.webkitCancelRequestAnimationFrame || W.clearTimeout;

}

W.rAF = W.requestAnimationFrame;
W.cAF = W.cancelAnimationFrame;
