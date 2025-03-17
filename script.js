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
              <td><button onclick="deleteStone('${item._id}')">🗑️</button></td>
          `;
          row.addEventListener("click", () =>{
            console.log(item._id)
            ShowStoneData(item._id)
          })
          // Append the row to the table body
          tableBody.appendChild(row);
      });
  } catch (error) {
      // Log any errors that occur during the fetch
      console.error('Error fetching data:', error);
  }
}

// Function to add a new stone
async function addStone() {
  try {
      // Get the values from the input fields
      const kasse = document.getElementById('new-kasse').value;
      const steingruppe = document.getElementById('new-steingruppe').value;
      const id = document.getElementById('new-id').value;
      const sted = document.getElementById('new-sted').value;

      // Create a new stone object with the input values
      const newStone = { kasse, steingruppe, id, sted };

      // Send a POST request to the server to add the new stone
      const response = await fetch('http://localhost:3000/api/stones', {
          method: 'POST',
          headers: {
              'Content-Type': 'application/json'
          },
          body: JSON.stringify(newStone)
      });

      // Check if the response is successful
      if (response.ok) {
          alert('Stone added successfully');
          fetchData(); // Refresh the table data
      } else {
          // Handle errors if the response is not successful
          const errorData = await response.json();
          alert(`Error adding stone: ${errorData.message}`);
      }
  } catch (error) {
      // Log any errors that occur during the fetch
      console.error('Error adding stone:', error);
  }
}

// Show stone details in a modal
async function showStoneData(docId) {
  try {
    const docRef = doc(db, "steiner", docId);
    const docSnap = await getDoc(docRef);
    if (docSnap.exists()) {
      const data = docSnap.data();
      const modalBody = document.getElementById("modal-body");
      modalBody.innerHTML = `
        <h2>${data.steingruppe || ""}</h2>
        <hr>
        <div id="steininfo">
          <div id="info1">
            <p><strong>Kasse:</strong> ${data.kasse || ""}</p>
            <p><strong>Sted:</strong> ${data.sted || ""}</p>
            <p><strong>ID:</strong> ${data.id || ""}</p>
          </div>
          <div id="beskrivelse">
            <h3>Beskrivelse:</h3>
            <p>Lorem ipsum bla bla bla</p>
          </div>
        </div>
      `;
      document.getElementById("modal").style.display = "block";
    } else {
      console.error("No such document!");
    }
  }
  catch (error) {
    console.error("Error getting stone:", error); 
  }
}

// Close the modal
function closeModal() {
  document.getElementById("modal").style.display = "none";
}

// Edit a stone
async function editStone(docId) {
  try {
    const kasse = document.getElementById('edit-kasse').value.trim();
    const steingruppe = document.getElementById('edit-steingruppe').value.trim();
    const id = document.getElementById('edit-id').value.trim();
    const sted = document.getElementById('edit-sted').value.trim();
    const updatedStone = { kasse, steingruppe, id, sted };

    await updateDoc(doc(db, "steiner", docId), updatedStone);
    alert("Stein oppdatert!");
    closeEditForm();
  } catch (error) {
    console.error("Error updating stone:", error);
  }
}

// Delete a stone (also clears modal info if showing)
async function deleteStone(docId) {
  if (confirm("Er du sikker på at du vil slette denne steinen?")) {
    try {
      await deleteDoc(doc(db, "steiner", docId));
      alert("Stein slettet!");

      // If the deleted stone is currently shown, clear its display:
      const modal = document.getElementById("modal");
      if (modal.style.display === "block") {
        closeModal();
      }
    } catch (error) {
      console.error("Error deleting stone:", error);
      alert("Feil ved sletting!");
    }
  }
}

// ---------- UI HELPERS ----------

// Show/close edit form
function showEditForm(stone) {
  document.getElementById('edit-kasse').value = stone.kasse || "";
  document.getElementById('edit-steingruppe').value = stone.steingruppe || "";
  document.getElementById('edit-id').value = stone.id || "";
  document.getElementById('edit-sted').value = stone.sted || "";
  document.getElementById('edit-stone-button').setAttribute("data-docid", stone.docId);
  document.getElementById('edit-stone-form').style.display = "block";
}
function closeEditForm() {
  document.getElementById('edit-stone-form').style.display = "none";
}

// Toggle visibility of add-form & filters
function toggleAddStoneForm() {
  const form = document.getElementById('add-stone-form');
  form.style.display = (form.style.display === "block") ? "none" : "block";
}
function toggleFilter() {
  const form = document.getElementById('filters');
  form.style.display = (form.style.display === "block") ? "none" : "block";
}

// Toggle between table and card view
function toggleView() {
  viewMode = (viewMode === "table") ? "card" : "table";
  renderView(applyFilters(allStones));
}

// ---------- EVENT LISTENERS ----------

document.getElementById('edit-stone-button').addEventListener("click", () => {
  const docId = document.getElementById('edit-stone-button').getAttribute("data-docid");
  if(docId) { editStone(docId); }
});

// Re-render view on filter input changes
document.getElementById('søkefelt').addEventListener('input', () => renderView(applyFilters(allStones)));
document.getElementById('filter-kasse').addEventListener('input', () => renderView(applyFilters(allStones)));
document.getElementById('filter-steingruppe').addEventListener('input', () => renderView(applyFilters(allStones)));
document.getElementById('filter-id').addEventListener('input', () => renderView(applyFilters(allStones)));
document.getElementById('filter-sted').addEventListener('input', () => renderView(applyFilters(allStones)));

// Expose functions globally if needed by inline HTML
window.toggleAddStoneForm = toggleAddStoneForm;
window.toggleFilter = toggleFilter;
window.deleteStone = deleteStone;
window.showEditForm = showEditForm;
window.closeEditForm = closeEditForm;
window.addStone = addStone;
window.showStoneData = showStoneData;
window.editStone = editStone;
window.toggleView = toggleView;
window.closeModal = closeModal;

// Start listening in real time on page load
window.addEventListener("load", subscribeToStones);
