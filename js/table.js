// Track currently pinned row
let pinnedRow = null
let currentTableData = []

// ---------------------------------------
// PIN ROW BY CITY (used by map too)
// ---------------------------------------

function resetTableOrder() {

  const tbody = d3.select("#table-container tbody").node()
  if (!tbody) return

  const rows = Array.from(tbody.children)

  // Sort rows by original index
  rows.sort((a, b) => {
    return +a.getAttribute("data-original-index") -
           +b.getAttribute("data-original-index")
  })

  rows.forEach(row => tbody.appendChild(row))

  // Remove highlight styles
  d3.selectAll(".rank-and-destination").style("background-color", null)
  d3.selectAll(".flag").style("font-weight", null)
  d3.selectAll("td").style("font-weight", null)

  pinnedRow = null
}

function pinRowByCity(cityName) {

  const tbody = d3.select("#table-container tbody").node()
  if (!tbody) return

  const targetRow = d3.select(`tr[data-city="${cityName}"]`).node()
  if (!targetRow) return

  const rows = Array.from(tbody.children)

  // Restore previous pinned row
  if (pinnedRow && pinnedRow !== targetRow) {
    const originalIndex = +pinnedRow.getAttribute("data-original-index")

    const rowsWithoutPinned = rows.filter(r => r !== pinnedRow)
    const referenceNode = rowsWithoutPinned[originalIndex] || null

    tbody.insertBefore(pinnedRow, referenceNode)
  }

  // Move new row to top
  tbody.insertBefore(targetRow, tbody.firstChild)
  pinnedRow = targetRow

  // Smooth scroll to top
  d3.select("#table-container").node().scrollTo({
    top: 0,
    behavior: "smooth"
  })

  // Reset styles
  d3.selectAll(".rank-and-destination").style("background-color", null)
  d3.selectAll(".flag").style("font-weight", null)
  d3.selectAll("td").style("font-weight", null)

  // Highlight
  d3.select(targetRow)
    .select(".rank-and-destination")
    .style("background-color", "#f0d6c1")

  d3.select(targetRow)
    .selectAll(".flag, td")
    .style("font-weight", "bold")
}


// ---------------------------------------
// DRAW TABLE
// ---------------------------------------
function drawTable(data) {

  currentTableData = data

  const tableContainer = d3.select("#table-container")
  tableContainer.html("")

  const table = tableContainer.append("table")
    .attr("class", "data-table")

  const headers = [
    "Destination",
    "Rainy Days",
    "Rainfall",
    "Hours of Sunshine",
    "Hours of Daylight",
    "Avg. UV",
    "Highest Avg. Temp"
  ]

  table.append("thead")
    .append("tr")
    .selectAll("th")
    .data(headers)
    .enter()
    .append("th")
    .text(d => d)

  const body = table.append("tbody")

  const colors = ['#3BC3B7', '#13A098', '#AED457', '#FFBB56', '#F2A45C', '#FB8361']

  function hexToRgba(hex, alpha) {
    const r = parseInt(hex.slice(1, 3), 16)
    const g = parseInt(hex.slice(3, 5), 16)
    const b = parseInt(hex.slice(5, 7), 16)
    return `rgba(${r}, ${g}, ${b}, ${alpha})`
  }

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
      .range([0.1, 1])
  })

  data.forEach((row, index) => {

    const tr = body.append("tr")
      .attr("data-original-index", index)
      .attr("data-city", row.CITY)

    tr.append("td")
      .attr("class", "rank-and-destination")
      .html(`
        <div class="rank" style="background-color:${row.COLOR};">${index + 1}</div>
        <div class="fi fi-${row.CODE}"></div>
        <div class="flag">${row.CITY}, ${row.COUNTRY}</div>
      `)

    // Row click → sync map
    tr.on("click", function () {

      pinRowByCity(row.CITY)

      if (typeof focusCityOnMap === "function") {
        focusCityOnMap(row)
        return
      }

      // Fallback: if circle already exists, show tooltip
      const circle = d3.select(`circle[data-city="${row.CITY}"]`)
      if (!circle.empty() && circle.node()._tippy) {
        circle.node()._tippy.show()
        setTimeout(() => circle.node()._tippy.hide(), 3000)
      }
    })

    numericColumns.forEach((col, i) => {
      const value = row[col]

      tr.append("td")
        .text(col === "AVERAGE HIGHEST TEMP" ? `${value} °C` : value)
        .style("background-color", hexToRgba(colors[i], scales[col](value)))
    })
  })
}
