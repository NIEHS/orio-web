"use strict";
var page = require('webpage').create(),
    system = require('system'),
    address = system.args[1],
    output = system.args[2],
    width = parseInt(system.args[3]),
    height = parseInt(system.args[4]),
    renderTimeout = 3000,
    renderAndExit = function(){
        // Wait for animations, after viewport size change
        window.setTimeout(function(){
            page.render(output);
            phantom.exit();
        }, renderTimeout);
    },
    getPdf = function(){
        renderAndExit();
    },
    getRasterization = function(){
        page.zoomFactor = 1;
        renderAndExit();
    };

var func = (output.substr(-4) === '.pdf') ? getPdf : getRasterization,
    onPageReady = function(){
        window.setTimeout(func, renderTimeout);
    },
    checkReadyState = function() {
        // continue to check until ready-state is complete
        setTimeout(function () {
            var readyState = page.evaluate(function () {
                return document.readyState;
            });
            if (readyState === 'complete') {
                onPageReady();
            } else {
                checkReadyState();
            }
        });
    },
    onLoadFinished = function (status) {
        // page loaded but other resources may not be complete
        if (status === 'success') {
            checkReadyState();
        } else {
            console.log('Unable to load the address!');
            phantom.exit(1);
        }
    };

page.viewportSize = {
    width: width,
    height: height,
};

page.open(address, onLoadFinished);
