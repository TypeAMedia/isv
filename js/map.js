// Create an SVG element and append it to the #map div
const width = 960;
const height = 500;

const svg = d3.select("#map")
  .append("svg")
  .attr("width", width)
  .attr("height", height);

// Define a projection and path generator
const projection = d3.geoMercator()
  .scale(150)
  .translate([width / 2, height / 1.5]);

const path = d3.geoPath().projection(projection);

// Load GeoJSON data and draw the map
d3.json("data/countries.geo.json").then(geojsonData => {
  svg.selectAll("path")
    .data(geojsonData.features)
    .enter()
    .append("path")
    .attr("d", path)
    .attr("fill", "#ccc")
    .attr("stroke", "#333");
}).catch(error => console.error("Error loading GeoJSON data:", error));