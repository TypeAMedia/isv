// Function to draw the table
function drawTable(data) {
  const tableContainer = d3.select("#table-container")
  tableContainer.html("") // Clear old table

  const table = tableContainer.append("table").attr("class", "data-table")

  // Base colors for columns
  const colors = ['#3BC3B7', '#13A098', '#AED457', '#FFBB56', '#F2A45C', '#FB8361']

  // Table headers
  const headers = ["Destination", "Rainy Days", "Rainfall", "Hours of Sunshine", "Hours of Daylight", "Avg. UV", "Highest Avg. Temp"]
  const header = table.append("thead").append("tr")
  header.selectAll("th")
    .data(headers)
    .enter()
    .append("th")
    .text(d => d)

  const body = table.append("tbody")

  // --- Helper: convert hex color to rgba ---
  function hexToRgba(hex, alpha) {
    const r = parseInt(hex.slice(1, 3), 16)
    const g = parseInt(hex.slice(3, 5), 16)
    const b = parseInt(hex.slice(5, 7), 16)
    return `rgba(${r}, ${g}, ${b}, ${alpha})`
  }

  // --- Create color scales for numeric columns ---
  const numericColumns = [
    "AVG. NUMBER OF DAYS PER MONTH WITH SOME RAIN ACROSS YEAR",
    "AVG. MONTHLY RAINFALL ACROSS YEAR",
    "AVG. DAILY HOURS OF SUNSHINE",
    "AVG. DAILY HOURS OF DAYLIGHT",
    "AVERAGE UV ACROSS YEAR",
    "AVERAGE HIGHEST TEMP"
  ]

  const scales = {}
  numericColumns.forEach((col, i) => {
    scales[col] = d3.scaleLinear()
      .domain(d3.extent(data, d => +d[col]))
      .range([0.1, 1]) // opacity range
  })

  // --- Populate table rows ---
  data.forEach((row, index) => {
    const tr = body.append("tr")


    // Rank + Destination
    const rankAndDestination = tr.append("td").attr("class", "rank-and-destination")
    rankAndDestination.html(`
      <div class='rank' style='background-color: ${row.COLOR};'>${index + 1}</div>
      <div class='fi fi-${row.CODE}'> </div>
      <div class='flag'>${row.CITY}, ${row.COUNTRY}</div>
    `)



    // Select all table rows
    d3.selectAll('tr').on('click', function () {
      addCityTooltips()
      // Remove previous highlights (optional)
      d3.selectAll('.rank-and-destination').style('background-color', null)

      // Highlight clicked row by setting border on all its cells
      d3.select(this).selectAll('.rank-and-destination')
        .style('background-color', '#f0d6c1')
    })

    // Other columns with RGBA backgrounds
    numericColumns.forEach((col, i) => {
      const value = row[col]
      const opacity = scales[col](value)
      tr.append("td")
        .text(col === "AVERAGE HIGHEST TEMP" ? value + " °C" : value)
        .attr("class", col.toLowerCase().replace(/\s+/g, "-"))
        .style("background-color", hexToRgba(colors[i], opacity))
    })
  })
}
