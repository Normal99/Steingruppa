    // Function to fetch and display data (Ikke-fungerende)
    async function fetchData() {
        try {
          const response = await fetch('http://localhost:3000/api/stones');
          const data = await response.json();
  
          const tableBody = document.querySelector('#data-table tbody');
          tableBody.innerHTML = ''; // Clear previous rows
  
          data.forEach(item => {
            const row = document.createElement('tr');
            row.innerHTML = `
              <td>${item.name}</td>
              <td>${item.value}</td>
            `;
            tableBody.appendChild(row);
          });
        } catch (error) {
          console.error('Error fetching data:', error);
        }
      }
  
      // Fetch data on page load
      window.onload = fetchData;
  
      // Optional: Refresh data every 5 seconds
      setInterval(fetchData, 5000);