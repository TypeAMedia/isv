function map(mapContainer, geojson, data) {
  const container = d3.select(mapContainer)
  console.log(container.node())
  const params = {
    width: container.node().getBoundingClientRect().width,
    height: window.innerWidth > 724 ? 500 : 350,
    marginTop: 10,
    marginBottom: 10,
    marginLeft: 10,
    marginRight: 10,
  }

  const svg = container
    .append('svg')
    .attr('height', params.height)
    .attr('width', params.width)
    .style('cursor', 'pointer')


  // create projection
  const projection = d3.geoMercator()
    .fitSize([params.width, params.height], geojson)

  // create path
  const path = d3.geoPath().projection(projection)
  // Create a group for the map features
  const features = svg.append("g")

  features.selectAll("path")
    .data(geojson.features)
    .enter()
    .append("path")
    .attr("d", path)
    .style("fill", "#f0d6c1")
    .attr('stroke', '#fff')
    .attr('stroke-width', 0.7)

  // Reset buttons click
  d3.select('.plus').on('click', () => {
    svg.transition().duration(750).call(zoom.scaleTo, 2)
  })

  d3.select('.minus').on('click', () => {
    svg.transition().duration(750).call(zoom.scaleTo, 0)
  })

  // Add zoom functionality to the map
  const zoom = d3.zoom()
    .scaleExtent([1, 8]) // Set zoom scale limits
    .on("zoom", (event) => {
      features.attr("transform", event.transform)
    })

  svg.call(zoom) // Enable zoom on the SVG element

  // Calculate the count of cities per country
  const countryCounts = d3.rollup(data, v => v.length, d => d.COUNTRY)

  // Add countrySum property to each city
  data.forEach(city => {
    city.countrySum = countryCounts.get(city.COUNTRY) || 0
  })

  console.log(data)

  // Add countrySum property to each city
  data.forEach(city => {
    city.countrySum = countryCounts.get(city.COUNTRY) || 0
  })

  // Define a scale for the circle radius
  const circleScale = d3.scaleSqrt()
    .domain([0, d3.max(data, d => d.countrySum)])
    .range([5, 15]) // Minimum and maximum radius

  // Draw Circles
  function drawCircles(data, centroid) {
    if (data) {
      features.append("circle")
        .datum(data) // Bind data to the circle
        .attr("cx", centroid[0])
        .attr("cy", centroid[1])
        .attr("r", circleScale(data?.countrySum))
        .attr("fill", data.countrySum !== 1 ? "#B29480" : data.COLOR)
        .attr("stroke", "#fff")
        .attr("stroke-width", 0.5)

      // Append text labels for the number of cities in each country
      features.append("text")
        .attr("x", centroid[0])
        .attr("y", centroid[1])
        .attr('class', 'circle-text')
        .attr("dy", "0.35em") // Center the text vertically
        .attr("text-anchor", "middle") // Center the text horizontally
        .attr('font-family', 'Roboto')
        .attr("font-weight", "light")
        .style("pointer-events", 'none')
        .text(data?.countrySum === 1 ? '' : data?.countrySum)
        .attr("fill", "#fff") // Text color
        .attr("font-size", "14px") // Font size
    }
  }

  // Append circles for each country
  geojson.features.forEach(feature => {
    const countryName = feature.properties.name
    const countryData = data.find(city => city.COUNTRY === countryName)
    const centroid = d3.geoPath().projection(projection).centroid(feature)
    if (countryData) {
      drawCircles(countryData, centroid)
    }
  })

  features.selectAll("circle")
    .on("click", function (event, d) {
      svg.selectAll('circle').remove()
      svg.selectAll('.circle-text').remove()

      const x = d3.select(this).attr("cx") // Retrieve cx attribute
      const y = d3.select(this).attr("cy") // Retrieve cy attribute
      const scale = 4 // Zoom scale

      svg.transition()
        .duration(750)
        .call(
          zoom.transform,
          d3.zoomIdentity.translate(params.width / 2 - x * scale, params.height / 2 - y * scale).scale(scale)
        )

      // Filter cities in the clicked country
      const citiesInCountry = data.filter(city => city.COUNTRY === d.COUNTRY)

      // Redraw circles for each city in the clicked country
      citiesInCountry.forEach(city => {
        const cityCentroid = projection([city.LONGITUDE, city.LATITUDE])
        features.append("circle")
          .datum(city)
          .attr("cx", cityCentroid[0])
          .attr("cy", cityCentroid[1])
          .attr("r", 5) // Adjust radius for city circles
          .attr("fill", city.COLOR) // Adjust color for city circles
          .attr("stroke", "#fff")
          .attr("stroke-width", 0.5)

        // Optionally, add labels for cities
        features.append("text")
          .attr("x", cityCentroid[0])
          .attr("y", cityCentroid[1])
          .attr('class', 'city-text')
          .attr("dy", "-0.5em") // Position text above the circle
          .attr("text-anchor", "middle")
          .attr('font-family', 'Roboto')
          .attr("font-weight", "light")
          .style("pointer-events", 'none')
          .text(city.NAME) // Assuming city.NAME contains the city name
          .attr("fill", "#000") // Text color
          .attr("font-size", "10px") // Font size
      })
    })
}