// Function to fetch data from the server and update the table
async function fetchData() {
  try {
      // Bruk objekter her for å fylle inn hva enn
      //const {allesteiner} = require('./mongoDB til object');
      //console.log(allesteiner)
      //noe sånt er ikke sikker, forstår ikke koden


      const søkefelt = document.getElementById('søkefelt').value;
      const filterKasse = document.getElementById('filter-kasse').value;
      const filterSteingruppe = document.getElementById('filter-steingruppe').value;
      const filterId = document.getElementById('filter-id').value;
      const filterSted = document.getElementById('filter-sted').value;

      // Create a query string from the input values
      const query = new URLSearchParams({
          søkefelt,
          filterKasse,
          filterSteingruppe,
          filterId,
          filterSted
      });

      // Fetch data from the server using the query string
      const response = await fetch(`http://localhost:3000/api/stones?${query.toString()}`);
      const data = await response.json();

      // Get the table body element
      const tableBody = document.querySelector('#data-table tbody');
      tableBody.innerHTML = ''; // Clear previous rows

      // Populate the table with the fetched data
      data.forEach(item => {
          const row = document.createElement('tr');
          row.innerHTML = `
              <td>${item.kasse}</td>
              <td>${item.steingruppe}</td>
              <td>${item.id}</td>
              <td>${item.sted}</td>
          `;
          tableBody.appendChild(row);
      });
  } catch (error) {
      // Log any errors that occur during the fetch
      console.error('Error fetching data:', error);
  }
}



// Function to toggle the visibility of the add stone form ved det mennesklig ord betyr dette at man viser greia for å adde steinene bare når du trykker på knappen.
function toggleAddStoneForm() {
  const form = document.getElementById('add-stone-form');
  if (form.style.display === 'none' || form.style.display === '') {
      form.style.display = 'block';
  } else {
      form.style.display = 'none';
  }
}


// Fetch data on page load
window.onload = fetchData;

// Optional: Refresh data every 5 seconds
setInterval(fetchData, 5000);