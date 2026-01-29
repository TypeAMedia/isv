// Add event listener to change active status on month click
document.querySelectorAll('.month').forEach(monthElement => {
  monthElement.addEventListener('click', () => {
    // Remove active class from all months
    document.querySelectorAll('.month').forEach(el => el.classList.remove('active'));

    // Add active class to the clicked month
    monthElement.classList.add('active');
  });
});