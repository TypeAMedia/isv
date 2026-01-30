// Draw map with All months
d3.csv('./data/data-vitamin.csv').then((data) => {
  d3.json('./data/countries.geo.json').then((datum) => {
    map('#map', datum, data)
  })
  drawTable(data)
})

const colors = ['#cc0100', '#e06666', '#ea9999', '#f5cbcc', '#e69138', '#f9cb9c', '#fce5cd', '#93c47d', '#b7d7a8', '#d9ead3',]

// Add ISO codes to each city in the month data
const addIsoCodes = (monthData, vitaminData) => {
  const vitaminDataMap = new Map()
  vitaminData.forEach(city => {
    vitaminDataMap.set(city.CITY, city.CODE)
  })

  monthData.forEach(city => {
    city.CODE = vitaminDataMap.get(city.CITY) || null
  })
}

// Add event listener to change active status on month click
document.querySelectorAll('.month').forEach(monthElement => {
  monthElement.addEventListener('click', () => {
    // Remove active class from all months
    document.querySelectorAll('.month').forEach(el => el.classList.remove('active'))

    // Add active class to the clicked month
    monthElement.classList.add('active')

    // Get the data-month attribute of the clicked month
    const selectedMonth = monthElement.getAttribute('data-month')

    // Remove the existing map before drawing a new one
    d3.select('#map').selectAll('*').remove()

    // Remove the existing table before drawing a new one
    d3.select('#table-container').selectAll('*').remove()

    // Load new data for the selected month and redraw the map
    if (selectedMonth !== 'all') {
      const dataFile = `./data/${selectedMonth.toLowerCase()}.csv`
      d3.csv(dataFile).then((monthData) => {
        d3.csv('./data/data-vitamin.csv').then((vitaminData) => {
          // Add COLOR property to each city in the month data
          const getColor = (index) => {
            if (index >= 0 && index <= 15) {
              return colors[0]
            } else if (index > 15 && index <= 30) {
              return colors[1]
            } else if (index > 30 && index <= 45) {
              return colors[2]
            } else if (index > 45 && index <= 60) {
              return colors[3]
            } else if (index > 60 && index <= 75) {
              return colors[4]
            } else if (index > 75 && index <= 90) {
              return colors[5]
            } else if (index > 90 && index <= 105) {
              return colors[6]
            } else if (index > 105 && index <= 120) {
              return colors[7]
            } else if (index > 120 && index <= 135) {
              return colors[8]
            } else if (index > 135 && index < 150) {
              return colors[9]
            }
          }
          monthData.forEach((city, index) => {
            city.COLOR = getColor(index)
          })
          addIsoCodes(monthData, vitaminData)
          d3.json('./data/countries.geo.json').then((datum) => {
            map('#map', datum, monthData)
            drawTable(monthData)
          })
        })
      })
    }
    else {
      d3.csv('./data/data-vitamin.csv').then((data) => {
        d3.json('./data/countries.geo.json').then((datum) => {
          map('#map', datum, data)
          drawTable(data)
        })
      })
    }
  })
})



