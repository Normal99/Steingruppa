// Import Firebase modules
import { initializeApp } from "https://www.gstatic.com/firebasejs/9.22.2/firebase-app.js";
import { 
  getFirestore, collection, getDocs, addDoc, updateDoc, deleteDoc, doc, getDoc, query, orderBy 
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

// Global variable for view mode ("table" or "card")
let viewMode = "table"; // default mode

// ---------- FETCH DATA (with ordering by kasse and client‑side filtering) ----------
async function fetchData() {
    try {
      // Get filter values from HTML inputs
      const søkefelt = document.getElementById('søkefelt').value.trim().toLowerCase();
      const filterKasse = document.getElementById('filter-kasse').value.trim().toLowerCase();
      const filterSteingruppe = document.getElementById('filter-steingruppe').value.trim().toLowerCase();
      const filterId = document.getElementById('filter-id').value.trim().toLowerCase();
      const filterSted = document.getElementById('filter-sted').value.trim().toLowerCase();
  
      // Create a query that orders by the "kasse" field
      const q = query(collection(db, "steiner"), orderBy("kasse"));
      const querySnapshot = await getDocs(q);
  
      // Map each document to an object that also stores the Firestore document id as "docId"
      let stones = querySnapshot.docs.map(docSnap => ({ ...docSnap.data(), docId: docSnap.id }));
  
      // Client‑side filtering if any input is provided (relaxed using includes)
      if(søkefelt) {
          stones = stones.filter(s => 
          (s.kasse && s.kasse.toLowerCase().includes(søkefelt)) ||
          (s.steingruppe && s.steingruppe.toLowerCase().includes(søkefelt)) ||
          (s.id && s.id.toLowerCase().includes(søkefelt)) ||
          (s.sted && s.sted.toLowerCase().includes(søkefelt))
          );
      }
      if(filterKasse) {
          stones = stones.filter(s => s.kasse && s.kasse.toLowerCase().includes(filterKasse));
      }
      if(filterSteingruppe) {
          stones = stones.filter(s => s.steingruppe && s.steingruppe.toLowerCase().includes(filterSteingruppe));
      }
      if(filterId) {
          stones = stones.filter(s => s.id && s.id.toLowerCase().includes(filterId));
      }
      if(filterSted) {
          stones = stones.filter(s => s.sted && s.sted.toLowerCase().includes(filterSted));
      }
  
      console.log("Fetched data:", stones);
  
      // Render based on the selected view mode.
      if (viewMode === "table") {
          renderTable(stones);
      } else {
          renderCards(stones);
      }
    } catch (error) {
      console.error("Error fetching data:", error);
    }
}
  
// Render table view
function renderTable(stones) {
    // Show table container and hide cards container
    document.getElementById("data-table").style.display = "table";
    document.getElementById("cards-container").style.display = "none";
    
    const tableBody = document.querySelector('#data-table tbody');
    tableBody.innerHTML = ""; // Clear previous rows
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
  
// Render card view with placeholder images
function renderCards(stones) {
    // Hide table container and show cards container
    document.getElementById("data-table").style.display = "none";
    const cardsContainer = document.getElementById("cards-container");
    cardsContainer.style.display = "flex";
    cardsContainer.style.flexWrap = "wrap";
    cardsContainer.innerHTML = ""; // Clear previous cards
    
  
    stones.forEach(item => {
      const card = document.createElement("div");
      card.classList.add("card");
      // Placeholder image (update URL as desired)
      card.innerHTML = `
        <img src="./bilder/placeholder.jpg" alt="Stein" style="width:100%; border-radius: 4px;">
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
        if(e.target.tagName !== "BUTTON") {
          showStoneData(item.docId);
        }
      });
      cardsContainer.appendChild(card);
    });
    console.log("Card view updated");
}
  
// ---------- ADD A NEW STONE ----------
async function addStone() {
    try {
      const kasse = document.getElementById('new-kasse').value.trim();
      const steingruppe = document.getElementById('new-steingruppe').value.trim();
      const id = document.getElementById('new-id').value.trim();
      const sted = document.getElementById('new-sted').value.trim();
  
      const newStone = { kasse, steingruppe, id, sted };
  
      const docRef = await addDoc(collection(db, "steiner"), newStone);
      alert("Stein lagt til med id: " + docRef.id);
      fetchData();
    } catch (error) {
      console.error("Error adding stone:", error);
    }
}
  
// ---------- SHOW STONE DETAILS (in a modal) ----------
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
      // Show the modal
      document.getElementById("modal").style.display = "block";
    } else {
      console.error("No such document!");
    }
  } catch (error) {
    console.error("Error fetching stone details:", error);
  }
}

// Function to close the modal
function closeModal() {
  document.getElementById("modal").style.display = "none";
}

// Expose closeModal to the global scope
window.closeModal = closeModal;

  
// ---------- EDIT A STONE ----------
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
      fetchData();
    } catch (error) {
      console.error("Error updating stone:", error);
    }
}
  
// ---------- DELETE A STONE ----------
async function deleteStone(docId) {
    if (confirm("Er du sikker på at du vil slette denne steinen?")) {
      try {
        await deleteDoc(doc(db, "steiner", docId));
        alert("Stein slettet!");
        fetchData();
      } catch (error) {
        console.error("Error deleting stone:", error);
        alert("Feil ved sletting!");
      }
    }
}
  
// ---------- SHOW / CLOSE EDIT FORM ----------
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
  
// ---------- TOGGLE VISIBILITY OF ADD FORM & FILTERS ----------
function toggleAddStoneForm() {
    const form = document.getElementById('add-stone-form');
    form.style.display = (form.style.display === "block") ? "none" : "block";
}
  
function toggleFilter() {
    const form = document.getElementById('filters');
    form.style.display = (form.style.display === "block") ? "none" : "block";
}
  
// ---------- TOGGLE VIEW ----------
function toggleView() {
  viewMode = (viewMode === "table") ? "card" : "table";
  
  const toggleBtn = document.getElementById('toggle-view-button');  
  
  fetchData();
}
  
// ---------- EVENT LISTENER FOR EDIT BUTTON ----------
document.getElementById('edit-stone-button').addEventListener("click", () => {
    const docId = document.getElementById('edit-stone-button').getAttribute("data-docid");
    if(docId) {
      editStone(docId);
    }
});
  
// ---------- INITIAL FETCH & FILTER LISTENERS ----------
window.addEventListener("load", fetchData);
document.getElementById('søkefelt').addEventListener('input', fetchData);
document.getElementById('filter-kasse').addEventListener('input', fetchData);
document.getElementById('filter-steingruppe').addEventListener('input', fetchData);
document.getElementById('filter-id').addEventListener('input', fetchData);
document.getElementById('filter-sted').addEventListener('input', fetchData);
  
// Expose functions to global scope for use in inline HTML
window.toggleAddStoneForm = toggleAddStoneForm;
window.toggleFilter = toggleFilter;
window.deleteStone = deleteStone;
window.showEditForm = showEditForm;
window.closeEditForm = closeEditForm;
window.addStone = addStone;
window.fetchData = fetchData;
window.showStoneData = showStoneData;
window.editStone = editStone;
window.toggleView = toggleView;
window.showStoneData = showStoneData;
window.closeModal = closeModal;
