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
        <button onclick="deleteStone('${item.docId}')">🗑️</button>
        <button onclick='showEditForm(${JSON.stringify(item).replace(/'/g, "&#39;")})'>✏️</button>
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
        <button onclick="deleteStone('${item.docId}')">🗑️</button>
        <button onclick='showEditForm(${JSON.stringify(item).replace(/'/g, "&#39;")})'>✏️</button>
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
  } catch (error) {
    console.error("Error fetching stone details:", error);
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