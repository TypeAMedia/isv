function map(mapContainer, geojson, data) {
  const container = d3.select(mapContainer)

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
    .attr('width', params.width)
    .attr('height', params.height)
    .style('cursor', 'pointer')

  /* ================= PROJECTION ================= */

  const projection = d3.geoMercator()
    .fitSize([params.width, params.height], geojson)

  const path = d3.geoPath().projection(projection)

  const features = svg.append("g")

  /* ================= MAP PATHS ================= */

  features.selectAll("path")
    .data(geojson.features)
    .enter()
    .append("path")
    .attr("d", path)
    .attr("fill", "#f0d6c1")
    .attr("stroke", "#fff")
    .attr("stroke-width", 0.7)

  /* ================= ZOOM ================= */

  const zoom = d3.zoom()
    .scaleExtent([1, 8])
    .on("zoom", (event) => {
      features.attr("transform", event.transform)
    })

  svg.call(zoom)

  /* ================= DATA PREP ================= */

  const countryCounts = d3.rollup(data, v => v.length, d => d.COUNTRY)

  data.forEach(city => {
    city.countrySum = countryCounts.get(city.COUNTRY) || 0
  })

  const circleScale = d3.scaleSqrt()
    .domain([0, d3.max(data, d => d.countrySum)])
    .range([5, 15])

  /* ================= DRAW COUNTRY CIRCLES ================= */

  function drawCountryCircles() {
    features.selectAll("circle").remove()
    features.selectAll(".circle-text").remove()

    geojson.features.forEach(feature => {
      const countryName = feature.properties.name
      const countryData = data.find(d => d.COUNTRY === countryName)
      if (!countryData) return

      const centroid = path.centroid(feature)

      features.append("circle")
        .datum(countryData)
        .attr("cx", centroid[0])
        .attr("cy", centroid[1])
        .attr("r", circleScale(countryData.countrySum))
        .attr("fill", countryData.countrySum !== 1 ? "#B29480" : countryData.COLOR)
        .attr("stroke", "#fff")
        .attr("stroke-width", 0.5)

      features.append("text")
        .attr("class", "circle-text")
        .attr("x", centroid[0])
        .attr("y", centroid[1])
        .attr("dy", "0.35em")
        .attr("text-anchor", "middle")
        .attr("font-family", "Roboto")
        .attr("font-size", "14px")
        .attr("fill", "#fff")
        .style("pointer-events", "none")
        .text(countryData.countrySum === 1 ? "" : countryData.countrySum)
    })

    attachCircleClick()
    addCityTooltips()
  }

  /* ================= CLICK HANDLER ================= */

  function attachCircleClick() {
    features.selectAll("circle")
      .on("click", function (event, d) {

        features.selectAll("circle").remove()
        features.selectAll(".circle-text").remove()

        const x = +d3.select(this).attr("cx")
        const y = +d3.select(this).attr("cy")
        const scale = 4

        svg.transition()
          .duration(750)
          .call(
            zoom.transform,
            d3.zoomIdentity
              .translate(params.width / 2 - x * scale, params.height / 2 - y * scale)
              .scale(scale)
          )

        const citiesInCountry = data.filter(city => city.COUNTRY === d.COUNTRY)

        citiesInCountry.forEach(city => {
          const [cx, cy] = projection([city.LONGITUDE, city.LATITUDE])

          features.append("circle")
            .datum(city)
            .attr("cx", cx)
            .attr("cy", cy)
            .attr("r", 5)
            .attr("fill", city.COLOR)
            .attr("stroke", "#fff")
            .attr("stroke-width", 0.5)
        })

        addCityTooltips()
      })
  }

  /* ================= RESET / ZOOM BUTTONS ================= */

  d3.select('.plus').on('click', () => {
    svg.transition().duration(750).call(zoom.scaleTo, 2)
  })

  d3.select('.minus').on('click', () => {
    svg.transition()
      .duration(750)
      .call(zoom.transform, d3.zoomIdentity)

    drawCountryCircles()
  })

  /* ================= INIT ================= */

  drawCountryCircles()
}


/* ================= TOOLTIP ================= */

function addCityTooltips() {
  d3.selectAll("circle")
    .each(function (d) {
      if (!d) return

      const tooltipContent = `
        <div class='tooltip'>
          <div class='rank' style='background-color:${d.COLOR}'>
            ${Math.floor(d["OVERALL RANK"]) || "N/A"}
          </div>
          <div class='fi fi-${d.CODE}'></div>
          <div>${d.CITY},</div>
          <div>${d.COUNTRY}</div>
        </div>
      `

      tippy(this, {
        content: tooltipContent,
        allowHTML: true,
        theme: 'light'
      })
    })
}
