// Keep track of the currently pinned row
let pinnedRow = null

function drawTable(data) {
  const tableContainer = d3.select("#table-container")
  tableContainer.html("")

  const table = tableContainer.append("table").attr("class", "data-table")

  // Base colors for numeric columns
  const colors = ['#3BC3B7', '#13A098', '#AED457', '#FFBB56', '#F2A45C', '#FB8361']

  // Table headers
  const headers = [
    "Destination",
    "Rainy Days",
    "Rainfall",
    "Hours of Sunshine",
    "Hours of Daylight",
    "Avg. UV",
    "Highest Avg. Temp"
  ]

  const thead = table.append("thead").append("tr")
  thead.selectAll("th")
    .data(headers)
    .enter()
    .append("th")
    .text(d => d)

  const body = table.append("tbody")

  // --- Helper: hex → rgba ---
  function hexToRgba(hex, alpha) {
    const r = parseInt(hex.slice(1, 3), 16)
    const g = parseInt(hex.slice(3, 5), 16)
    const b = parseInt(hex.slice(5, 7), 16)
    return `rgba(${r}, ${g}, ${b}, ${alpha})`
  }

  // --- Numeric columns ---
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

  // --- Create rows ---
  data.forEach((row, index) => {
    const tr = body.append("tr")
      .attr("data-original-index", index)

    // Rank + destination cell
    const rankAndDestination = tr.append("td")
      .attr("class", "rank-and-destination")

    rankAndDestination.html(`
      <div class="rank" style="background-color:${row.COLOR};">${index + 1}</div>
      <div class="fi fi-${row.CODE}"></div>
      <div class="flag">${row.CITY}, ${row.COUNTRY}</div>
    `)

    // ---- CLICK HANDLER ----
    tr.on("click", function () {
      const tbody = body.node()
      const clickedRow = this

      // Restore previously pinned row
      if (pinnedRow && pinnedRow !== clickedRow) {
        const originalIndex = +pinnedRow.getAttribute("data-original-index")
        const rows = Array.from(tbody.children).filter(r => r !== pinnedRow)

        // Insert AFTER the pinned slot
        const referenceNode = rows[originalIndex] || null
        tbody.insertBefore(pinnedRow, referenceNode)
        
      }

      // Pin clicked row to top
      tbody.insertBefore(clickedRow, tbody.firstChild)
      pinnedRow = clickedRow

      // ---- Reset styles ----
      d3.selectAll(".rank-and-destination").style("background-color", null)
      d3.selectAll(".flag").style("font-weight", null)
      d3.selectAll("td").style("font-weight", null)

      // ---- Highlight active row ----
      d3.select(clickedRow)
        .select(".rank-and-destination")
        .style("background-color", "#f0d6c1")

      d3.select(clickedRow)
        .selectAll(".flag, td")
        .style("font-weight", "bold")

      // ---- Sync map tooltip ----
      const circle = d3.select(`circle[data-city="${row.CITY}"]`)

      if (!circle.empty()) {
        const tooltipContent = `
          <div class="tooltip">
            <div class="rank" style="background-color:${row.COLOR}">
              ${Math.floor(row["OVERALL RANK"]) || "N/A"}
            </div>
            <div class="fi fi-${row.CODE}"></div>
            <div>${row.CITY},</div>
            <div>${row.COUNTRY}</div>
          </div>
        `

        // destroy previous tooltip if exists
        if (circle.node()._tippy) {
          circle.node()._tippy.destroy()
        }

        tippy(circle.node(), {
          content: tooltipContent,
          allowHTML: true,
          theme: "light",
          trigger: "manual",
          placement: "top"
        })

        circle.node()._tippy.show()
      }
    })

    // ---- Numeric columns ----
    numericColumns.forEach((col, i) => {
      const value = row[col]
      const opacity = scales[col](value)

      tr.append("td")
        .text(col === "AVERAGE HIGHEST TEMP" ? `${value} °C` : value)
        .attr("class", col.toLowerCase().replace(/\s+/g, "-"))
        .style("background-color", hexToRgba(colors[i], opacity))
    })
  })
}
