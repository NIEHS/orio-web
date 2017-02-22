import d3 from 'd3';

let heatmapColorScale = d3.scale.linear()
    .domain([-1, 1])
    .range([0, 1]);

let getMaxContainerHeight = function(el){
    // application-specific
    let height = window.innerHeight,
        elTop = el.getBoundingClientRect().top,
        footerHeight = document.getElementsByClassName('footer')[0].getBoundingClientRect().height;
    return height - elTop - footerHeight;
};

let displayPValue = function(val){
    if (val > 0.99) {
        val = 1;
    }
    var float = parseFloat(val).toPrecision(2);
    return (float < 2.2e-16) ? ('< 2.2e-16') : ('' + float);
};

export {heatmapColorScale};
export {getMaxContainerHeight};
export {displayPValue};
