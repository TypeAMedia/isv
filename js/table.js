
// Function to draw the table
function drawTable(data) {
  // Select the table container
  const tableContainer = d3.select("#table-container")

  // Clear any existing table
  tableContainer.html("")

  // Create the table element
  const table = tableContainer.append("table").attr("class", "data-table")

  // Add table header
  const header = table.append("thead").append("tr")
  const headers = ["Destination", "Rainy Days", "Rainfall", "Hours of Sunshine", "Hours of Daylight", "Avg. UV", "Highest Avg. Temp"]
  header.selectAll("th")
    .data(headers)
    .enter()
    .append("th")
    .text(d => d)

  // Add table body
  const body = table.append("tbody")

  // Populate table rows
  data.forEach((row, index) => {
    const tr = body.append("tr")

    // Add rank and destination in one row
    const rankAndDestination = tr.append("td").attr("class", "rank-and-destination");
    rankAndDestination.html(`
      <div class='rank' style='background-color: ${row.COLOR};'>${index + 1}</div>
      <div class='flag'>${row.CITY}, ${row.COUNTRY}</div> 
    `);


    // Add other data columns
    tr.append("td").text(row["AVG. NUMBER OF DAYS PER MONTH WITH SOME RAIN ACROSS YEAR"]).attr("class", "rainy-days")
    tr.append("td").text(row["AVG. MONTHLY RAINFALL ACROSS YEAR"]).attr("class", "rainfall")
    tr.append("td").text(row["AVG. DAILY HOURS OF SUNSHINE"]).attr("class", "hours-of-sunshine")
    tr.append("td").text(row["AVG. DAILY HOURS OF DAYLIGHT"]).attr("class", "hours-of-daylight")
    tr.append("td").text(row["AVERAGE UV ACROSS YEAR"]).attr("class", "avg-uv")
    tr.append("td").text(row["AVERAGE HIGHEST TEMP"] + " " + "°C").attr("class", "highest-avg-temp")
  })
}