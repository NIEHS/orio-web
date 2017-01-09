// IE 11 polyfills
if (typeof Math.log10 !== 'function') {
    Math.log10 = function (x) {
        return Math.log(x) / Math.LN10;
    };
}
