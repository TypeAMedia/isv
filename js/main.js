// Draw map with All months
d3.csv('./data/data-vitamin.csv').then((data) => {
  d3.json('./data/countries.geo.json').then((datum) => {
    map('#map', datum, data)
  })
})



// Add event listener to change active status on month click
document.querySelectorAll('.month').forEach(monthElement => {
  monthElement.addEventListener('click', () => {
    // Remove active class from all months
    document.querySelectorAll('.month').forEach(el => el.classList.remove('active'))

    // Add active class to the clicked month
    monthElement.classList.add('active')

    // Get the data-month attribute of the clicked month
    const selectedMonth = monthElement.getAttribute('data-month')
    console.log('Selected month:', selectedMonth)

    // Remove the existing map before drawing a new one
    d3.select('#map').selectAll('*').remove();

    // Load new data for the selected month and redraw the map
    const dataFile = `./data/${selectedMonth.toLowerCase()}.csv`;
    d3.csv(dataFile).then((data) => {
      d3.json('./data/countries.geo.json').then((datum) => {
        map('#map', datum, data);
      });
    });
  })
});




