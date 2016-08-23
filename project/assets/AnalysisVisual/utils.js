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


export {heatmapColorScale};
export {getMaxContainerHeight};
