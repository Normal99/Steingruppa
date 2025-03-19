//// filepath: /c:/Users/VolkanBayram/Dokumenter/GitHub/Steingruppa/script.js
import { 
  initializeApp 
} from "https://www.gstatic.com/firebasejs/9.22.2/firebase-app.js";
import { 
  getFirestore, collection, onSnapshot, addDoc, updateDoc, deleteDoc, doc, getDoc, query, orderBy 
} from "https://www.gstatic.com/firebasejs/9.22.2/firebase-firestore.js";

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyCWIFCogJ15e4dPLtOMxhLOtxMrlyOskGc",
  authDomain: "steingruppa.firebaseapp.com",
  projectId: "steingruppa",
  storageBucket: "steingruppa.firebasestorage.app",
  messagingSenderId: "1067625469581",
  appId: "1:1067625469581:web:a3ccfc19a4b0035710f4c4"
};

// Initialize Firebase and Firestore
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

// Global settings & data
let viewMode = "table"; // "table" or "card"
let allStones = [];      // will hold the raw stone data
let unsubscribe;         // holds the onSnapshot unsubscribe function

// Start real‑time listener using onSnapshot
function subscribeToStones() {
  const stonesQuery = query(collection(db, "steiner"), orderBy("kasse"));
  // Unsubscribe any previous listener
  if (unsubscribe) { unsubscribe(); }
  unsubscribe = onSnapshot(stonesQuery, snapshot => {
    allStones = snapshot.docs.map(docSnap => ({ docId: docSnap.id, ...docSnap.data() }));
    renderView(applyFilters(allStones));
    console.log("Realtime update:", allStones);
  }, error => {
    console.error("Error listening to stones:", error);
  });
}

// Apply client‑side filtering based on input values
function applyFilters(stones) {
  const søkefelt = document.getElementById('søkefelt').value.trim().toLowerCase();
  const filterKasse = document.getElementById('filter-kasse').value.trim().toLowerCase();
  const filterSteingruppe = document.getElementById('filter-steingruppe').value.trim().toLowerCase();
  const filterId = document.getElementById('filter-id').value.trim().toLowerCase();
  const filterSted = document.getElementById('filter-sted').value.trim().toLowerCase();

  return stones.filter(s => {
    let match = true;
    if (søkefelt) {
      match = match && (
        (s.kasse && s.kasse.toLowerCase().includes(søkefelt)) ||
        (s.steingruppe && s.steingruppe.toLowerCase().includes(søkefelt)) ||
        (s.id && s.id.toLowerCase().includes(søkefelt)) ||
        (s.sted && s.sted.toLowerCase().includes(søkefelt))
      );
    }
    if (filterKasse) {
      match = match && (s.kasse && s.kasse.toLowerCase().includes(filterKasse));
    }
    if (filterSteingruppe) {
      match = match && (s.steingruppe && s.steingruppe.toLowerCase().includes(filterSteingruppe));
    }
    if (filterId) {
      match = match && (s.id && s.id.toLowerCase().includes(filterId));
    }
    if (filterSted) {
      match = match && (s.sted && s.sted.toLowerCase().includes(filterSted));
    }
    return match;
  });
}

// Pick which view to render based on viewMode
function renderView(filteredStones) {
  if (viewMode === "table") {
    renderTable(filteredStones);
  } else {
    renderCards(filteredStones);
  }
}

// Render table view
function renderTable(stones) {
  document.getElementById("data-table").style.display = "table";
  document.getElementById("cards-container").style.display = "none";
  
  const tableBody = document.querySelector('#data-table tbody');
  tableBody.innerHTML = "";
  stones.forEach(item => {
    const row = document.createElement('tr');
    row.innerHTML = `
      <td>${item.kasse || ""}</td>
      <td>${item.steingruppe || ""}</td>
      <td>${item.id || ""}</td>
      <td>${item.sted || ""}</td>
      <td>
        <button onclick='populateRequestForm(${JSON.stringify(item).replace(/'/g, "&#39;")}, "delete")'>🗑️</button>
        <button onclick='populateRequestForm(${JSON.stringify(item).replace(/'/g, "&#39;")}, "update")'>✏️</button>
      </td>
    `;
    row.addEventListener("click", (e) => {
      if (e.target.tagName !== "BUTTON") {
        showStoneData(item.docId);
      }
    });
    tableBody.appendChild(row);
  });
  console.log("Table view updated");
}

// Render card view
function renderCards(stones) {
  document.getElementById("data-table").style.display = "none";
  const cardsContainer = document.getElementById("cards-container");
  cardsContainer.style.display = "flex";
  cardsContainer.style.flexWrap = "wrap";
  cardsContainer.innerHTML = "";
  

  stones.forEach(item => {
    const card = document.createElement("div");
    card.classList.add("card");
    card.innerHTML = `
      <img src="./bilder/placeholder.png" alt="Stein" style="width:100%; border-radius: 4px;">
      <h3>${item.steingruppe || "Ukjent"}</h3>
      <p><strong>Kasse:</strong> ${item.kasse || ""}</p>
      <p><strong>ID:</strong> ${item.id || ""}</p>
      <p><strong>Sted:</strong> ${item.sted || ""}</p>
      <div>
        <button onclick='populateRequestForm(${JSON.stringify(item).replace(/'/g, "&#39;")}, "delete")'>🗑️</button>
        <button onclick='populateRequestForm(${JSON.stringify(item).replace(/'/g, "&#39;")}, "update")'>✏️</button>
      </div>
    `;
    card.addEventListener("click", (e) => {
      if (e.target.tagName !== "BUTTON") {
        showStoneData(item.docId);
      }
    });
    cardsContainer.appendChild(card);
  });
  console.log("Card view updated");
}

// ---------- CRUD OPERATIONS ----------

const getCellValue = (tr, idx) => tr.children[idx].innerText || tr.children[idx].textContent;

const comparer = (idx, asc) => (a, b) => {
const v1 = getCellValue(asc ? a : b, idx);
const v2 = getCellValue(asc ? b : a, idx);
return (v1 !== '' && v2 !== '' && !isNaN(v1) && !isNaN(v2))
    ? v1 - v2                                                                           
    : v1.toString().localeCompare(v2);
};

// Add sorting functionality
document.querySelectorAll('th').forEach(th => {
th.addEventListener('click', function () {
    const table = th.closest('table');
    const tbody = table.querySelector('tbody');
    const index = Array.from(th.parentNode.children).indexOf(th);
    const ascending = !this.asc;

    // Remove arrows from all headers
    document.querySelectorAll('th').forEach(header => {
    header.textContent = header.textContent.replace(/[\u25B2\u25BC]/g, '');
    });

    // Append the appropriate arrow
    th.textContent += ascending ? ' ▲' : ' ▼';
    this.asc = ascending;

    // Sort rows
    Array.from(tbody.querySelectorAll('tr'))
    .sort(comparer(index, ascending))
    .forEach(row => tbody.appendChild(row));
});
});
// Add a new stone
async function addStone() {
  try {
    const kasse = document.getElementById('new-kasse').value.trim();
    const steingruppe = document.getElementById('new-steingruppe').value.trim();
    const id = document.getElementById('new-id').value.trim();
    const sted = document.getElementById('new-sted').value.trim();

    const newStone = { kasse, steingruppe, id, sted };
    const docRef = await addDoc(collection(db, "steiner"), newStone);
    alert("Stein lagt til med id: " + docRef.id);
    // No need to manually re-fetch data—onSnapshot does real‑time updates.
  } catch (error) {
    console.error("Error adding stone:", error);
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

// Toggle visible fields based on request type
function toggleRequestFields() {
  const type = document.getElementById('request-type').value;
  // Hide all sections first
  document.getElementById('add-request-fields').style.display = "none";
  document.getElementById('current-request-fields').style.display = "none";
  document.getElementById('update-request-fields').style.display = "none";
  
  if (type === "add") {
    document.getElementById('add-request-fields').style.display = "block";
  } else if (type === "update") {
    document.getElementById('current-request-fields').style.display = "block";
    document.getElementById('update-request-fields').style.display = "block";
  } else if (type === "delete") {
    document.getElementById('current-request-fields').style.display = "block";
  }
}


// Call this function when a user clicks a request button (for update or delete)
// It auto-populates the current values and saves the stone's docId
function populateRequestForm(stone, requestType) {
  console.log("Populating request for stone:", stone);
  // Set the request type dropdown
  document.getElementById('request-type').value = requestType;
  // Toggle request form fields based on type
  toggleRequestFields();
  
  if (requestType === "update" || requestType === "delete") {
    // Populate the current (readonly) fields with this stone's details
    document.getElementById('current-kasse').value = stone.kasse || "";
    document.getElementById('current-steingruppe').value = stone.steingruppe || "";
    document.getElementById('current-id').value = stone.id || "";
    document.getElementById('current-sted').value = stone.sted || "";
    // Store the Firestore docId in a hidden field so the request is tied to this stone
    document.getElementById('request-stone-docid').value = stone.docId;
    
    // For update requests, pre-fill the new field values (side-by-side comparison)
    if (requestType === "update") {
      document.getElementById('req-new-kasse').value = stone.kasse || "";
      document.getElementById('req-new-steingruppe').value = stone.steingruppe || "";
      document.getElementById('req-new-id').value = stone.id || "";
      document.getElementById('req-new-sted').value = stone.sted || "";
    }
  } else if (requestType === "add") {
    // Clear any existing stone reference
    document.getElementById('request-stone-docid').value = "";
    // Clear the add request fields
    document.getElementById('req-add-kasse').value = "";
    document.getElementById('req-add-steingruppe').value = "";
    document.getElementById('req-add-id').value = "";
    document.getElementById('req-add-sted').value = "";
  }
}

function closeRequest() {
  // Force all toggled sections to hide
  document.getElementById('add-request-fields').style.display = "none";
  document.getElementById('current-request-fields').style.display = "none";
  document.getElementById('update-request-fields').style.display = "none";
}

// Submit the request – this creates a document in the "requests" collection
// You may want to add additional properties like timestamp and requester info
async function submitRequest() {
  const requestType = document.getElementById('request-type').value;
  const message = document.getElementById('request-message').value.trim();
  const stoneDocId = document.getElementById('request-stone-docid').value.trim() || null;
  
  let requestData = {
    type: requestType,
    message,
    stoneDocId,  // For update and delete, this will be set
    timestamp: new Date().toISOString()
  };
  
  // Build details based on request type
  if (requestType === "add") {
    const kasse = document.getElementById('req-add-kasse').value.trim();
    const steingruppe = document.getElementById('req-add-steingruppe').value.trim();
    const id = document.getElementById('req-add-id').value.trim();
    const sted = document.getElementById('req-add-sted').value.trim();
    requestData.details = { kasse, steingruppe, id, sted };
  } else if (requestType === "update") {
    // Include both current and requested new values
    const current = {
      kasse: document.getElementById('current-kasse').value.trim(),
      steingruppe: document.getElementById('current-steingruppe').value.trim(),
      id: document.getElementById('current-id').value.trim(),
      sted: document.getElementById('current-sted').value.trim()
    };
    const requested = {
      kasse: document.getElementById('req-new-kasse').value.trim(),
      steingruppe: document.getElementById('req-new-steingruppe').value.trim(),
      id: document.getElementById('req-new-id').value.trim(),
      sted: document.getElementById('req-new-sted').value.trim()
    };
    requestData.details = { current, requested };
  } else if (requestType === "delete") {
    // For deletion, the current details are enough
    requestData.details = {
      kasse: document.getElementById('current-kasse').value.trim(),
      steingruppe: document.getElementById('current-steingruppe').value.trim(),
      id: document.getElementById('current-id').value.trim(),
      sted: document.getElementById('current-sted').value.trim()
    };
  }
  
  // Validation – ensure a type is selected and necessary fields are filled:
  if (!requestType) {
    alert("Velg en forespørselstype før du sender");
    return;
  }
  
  // Now, add the request document in Firestore (assuming Firestore is already initialized as db)
  try {
    await addDoc(collection(db, "requests"), requestData);
    alert("Forespørsel sendt!");
    document.getElementById("request-form").reset();
    // Optionally hide fields after submission
    toggleRequestFields();
  } catch (error) {
    console.error("Error submitting request:", error);
    alert("Feil ved sending av forespørsel, prøv igjen!");
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
window.populateRequestForm = populateRequestForm;
window.submitRequest = submitRequest;
window.toggleRequestFields = toggleRequestFields;
window.closeRequest = closeRequest;

// Start listening in real time on page load
window.addEventListener("load", subscribeToStones);
