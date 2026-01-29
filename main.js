// Calendar functionality

const months = ['All', 'Jan', 'Feb', 'Mar', "Apr", 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']

const calendarElement = document.querySelector('.calendar')

months.forEach((month) => {
  calendarElement.appendChild('div')
})