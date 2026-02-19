let clicked = false
let expandedCountry = null

function map(mapContainer, geojson, data) {

  const container = d3.select(mapContainer)

  const width = container.node().getBoundingClientRect().width
  const height = window.innerWidth > 724 ? 500 : 350

  const svg = container.append("svg")
    .attr("width", width)
    .attr("height", height)

  const projection = d3.geoMercator()
    .fitSize([width, height], geojson)

  const path = d3.geoPath().projection(projection)

  const features = svg.append("g")

  features.selectAll("path")
    .data(geojson.features)
    .enter()
    .append("path")
    .attr("d", path)
    .attr("fill", "#f0d6c1")
    .attr("stroke", "#fff")

  const zoom = d3.zoom()
    .scaleExtent([1, 8])
    .on("zoom", (event) => {

      features.attr("transform", event.transform)

      const k = event.transform.k

      features.selectAll("circle")
        .attr("r", d => (d.originalR / k) + 0.8)

      features.selectAll(".circle-text")
        .attr("font-size", 14 / k + "px")
    })

  svg.call(zoom)
    .on("wheel.zoom", null)
    .on("dblclick.zoom", null)

  const countryCounts = d3.rollup(
    data,
    v => v.length,
    d => d.COUNTRY
  )

  data.forEach(city => {
    city.countrySum = countryCounts.get(city.COUNTRY) || 0
  })

  const circleScale = d3.scaleSqrt()
    .domain([0, d3.max(data, d => d.countrySum)])
    .range([5, 15])

  function drawCountryCircles() {

    features.selectAll("circle").remove()
    features.selectAll(".circle-text").remove()

    geojson.features.forEach(feature => {

      const countryName = feature.properties.name
      const countryData = data.find(d => d.COUNTRY === countryName)
      if (!countryData) return

      const centroid = path.centroid(feature)
      const radius = circleScale(countryData.countrySum)

      features.append("circle")
        .datum(countryData)
        .attr("cx", centroid[0])
        .attr("cy", centroid[1])
        .attr("r", radius)
        .each(d => d.originalR = radius)
        .attr("fill", countryData.countrySum !== 1 ? "#B29480" : countryData.COLOR)
        .attr("data-city", countryData.CITY)
        .attr("data-country", countryName)
        .style('cursor', 'pointer')

      features.append("text")
        .attr("class", "circle-text")
        .attr("x", centroid[0])
        .attr("y", centroid[1])
        .style('fill', '#fff')
        .attr("text-anchor", "middle")
        .attr("dy", "0.35em")
        .style('cursor', 'pointer')
        .style("pointer-events", "none")
        .text(countryData.countrySum > 1 ? countryData.countrySum : "")
    })

    attachCircleClick()
    addCityTooltips()
  }

  function attachCircleClick() {

    features.selectAll("circle")
      .on("click", function (event, d) {

          clicked = true
          expandedCountry = d.COUNTRY

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
                .translate(width / 2 - x * scale, height / 2 - y * scale)
                .scale(scale)
            )

          const cities = data.filter(city => city.COUNTRY === d.COUNTRY)

          cities.forEach(city => {

            const [cx, cy] = projection([city.LONGITUDE, city.LATITUDE])

            features.append("circle")
              .datum(city)
              .attr("cx", cx)
              .attr("cy", cy)
              .attr("r", 4)
              .each(d => d.originalR = 4)
              .attr("fill", city.COLOR)
              .attr("data-city", city.CITY)
              .attr("data-country", city.COUNTRY)
              .on('click', () => {
                pinRowByCity(city.CITY)
              })

          })
          addCityTooltips()
 
      })
  }

  d3.select(".plus").on("click", () => {
    svg.transition().duration(750).call(zoom.scaleBy, 1.5)
  })

  function resetToCountryView(skipTableReset) {
    clicked = false
    expandedCountry = null
    svg.transition()
      .duration(750)
      .call(zoom.transform, d3.zoomIdentity)
    d3.selectAll(".circle-text").attr("font-size", '16px')
    drawCountryCircles()
    if (!skipTableReset && typeof resetTableOrder === "function") {
      resetTableOrder()
    }
  }

  d3.select(".minus").on("click", () => resetToCountryView(false))

  drawCountryCircles()

  function addCityTooltips() {

    features.selectAll("circle")
      .each(function (d) {
  
        if (!d) return
        if (d.countrySum > 1 && !clicked) return
  
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
          theme: 'light',
          placement: 'top'
        })
      })
  }

  // Expose a helper for table → map sync:
  // - If another country is expanded, reset to primary view first, then expand target country and show city tooltip.
  // - If the city circle is already visible, just show its tooltip.
  // - Otherwise expand the country, then show the city's tooltip.
  window.focusCityOnMap = function (row) {
    if (!row || !row.CITY || !row.COUNTRY) return

    const cityName = row.CITY
    const countryName = row.COUNTRY

    // If the circle already exists (city circle or single-city country), show tooltip.
    const direct = features.select(`circle[data-city="${cityName}"]`)
    if (!direct.empty() && direct.node()._tippy) {
      direct.node()._tippy.show()
      setTimeout(() => direct.node()._tippy.hide(), 3000)
      return
    }

    // If a different country is currently expanded, reset to primary view first, then expand target country.
    if (clicked && expandedCountry && expandedCountry !== countryName) {
      resetToCountryView(true)
      setTimeout(() => {
        const countryCircle = features.selectAll("circle").filter(d => d && d.COUNTRY === countryName)
        if (countryCircle.empty()) return
        countryCircle.dispatch("click")
        setTimeout(() => {
          const cityCircle = features.select(`circle[data-city="${cityName}"]`)
          if (!cityCircle.empty() && cityCircle.node()._tippy) {
            cityCircle.node()._tippy.show()
            setTimeout(() => cityCircle.node()._tippy.hide(), 3000)
          }
        }, 900)
      }, 800)
      return
    }

    // Same country expanded or not expanded: expand the country (if needed) and show city tooltip.
    const countryCircle = features.selectAll("circle").filter(d => d && d.COUNTRY === countryName)
    if (countryCircle.empty()) return

    countryCircle.dispatch("click")

    setTimeout(() => {
      const cityCircle = features.select(`circle[data-city="${cityName}"]`)
      if (!cityCircle.empty() && cityCircle.node()._tippy) {
        cityCircle.node()._tippy.show()
        setTimeout(() => cityCircle.node()._tippy.hide(), 3000)
      }
    }, 900)
  }
  
}
