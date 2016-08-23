import d3 from 'd3';

let heatmapColorScale = d3.scale.linear()
    .domain([-1, 1])
    .range([0, 1]);

export {heatmapColorScale};
