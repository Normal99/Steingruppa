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
  
       // Client‑side filtering if any input is provided
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
      
      // Update the table using the filtered stones array
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
        // Also allow clicking the row to view details (unless a button was clicked)
        row.addEventListener("click", (e) => {
          if (e.target.tagName !== "BUTTON") {
            showStoneData(item.docId);
          }
        });
        tableBody.appendChild(row);
      });
      console.log("Table updated");
    } catch (error) {
      console.error("Error fetching data:", error);
    }
}

// ---------- ADD A NEW STONE ----------
async function addStone() {
  try {
    // Gather input values for a new stone
    const kasse = document.getElementById('new-kasse').value.trim();
    const steingruppe = document.getElementById('new-steingruppe').value.trim();
    const id = document.getElementById('new-id').value.trim();
    const sted = document.getElementById('new-sted').value.trim();

    const newStone = { kasse, steingruppe, id, sted };

    // Add document to Firestore collection "steiner"
    const docRef = await addDoc(collection(db, "steiner"), newStone);
    alert("Stein lagt til med id: " + docRef.id);
    fetchData(); // Refresh the table
  } catch (error) {
    console.error("Error adding stone:", error);
  }
}

// ---------- SHOW STONE DETAILS (using Firestore doc id) ----------
async function showStoneData(docId) {
  try {
    const docRef = doc(db, "steiner", docId);
    const docSnap = await getDoc(docRef);
    if (docSnap.exists()) {
      const data = docSnap.data();
      const detailEl = document.getElementById("stein"); // assumed container for detailed view
      detailEl.innerHTML = `
        <h2>${data.steingruppe || ""}</h2>
        <hr>
        <div id="steininfo">
          <div id="info1">
            <p>Kasse: ${data.kasse || ""}</p>
            <p>Sted: ${data.sted || ""}</p>
            <p>ID: ${data.id || ""}</p>
          </div>
          <div id="beskrivelse">
            <h3>Beskrivelse:</h3>
            <p>Lorem ipsum bla bla bla</p>
          </div>
        </div>
      `;
    } else {
      console.error("No such document!");
    }
  } catch (error) {
    console.error("Error fetching stone details:", error);
  }
}

// ---------- EDIT A STONE ----------
async function editStone(docId) {
  try {
    // Get updated values from the edit form
    const kasse = document.getElementById('edit-kasse').value.trim();
    const steingruppe = document.getElementById('edit-steingruppe').value.trim();
    const id = document.getElementById('edit-id').value.trim();
    const sted = document.getElementById('edit-sted').value.trim();

    const updatedStone = { kasse, steingruppe, id, sted };

    // Update document in Firestore
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
  // Fill edit form with stone data
  document.getElementById('edit-kasse').value = stone.kasse || "";
  document.getElementById('edit-steingruppe').value = stone.steingruppe || "";
  document.getElementById('edit-id').value = stone.id || "";
  document.getElementById('edit-sted').value = stone.sted || "";
  // Store the docId on the update button using a data attribute
  document.getElementById('edit-stone-button').setAttribute("data-docid", stone.docId);
  // Show the edit form
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

// ---------- EVENT LISTENER FOR EDIT BUTTON ----------
document.getElementById('edit-stone-button').addEventListener("click", () => {
  const docId = document.getElementById('edit-stone-button').getAttribute("data-docid");
  if(docId) {
    editStone(docId);
  }
});

// ---------- INITIAL FETCH ----------
window.addEventListener("load", fetchData);

document.getElementById('søkefelt').addEventListener('input', fetchData);
document.getElementById('filter-kasse').addEventListener('input', fetchData);
document.getElementById('filter-steingruppe').addEventListener('input', fetchData);
document.getElementById('filter-id').addEventListener('input', fetchData);
document.getElementById('filter-sted').addEventListener('input', fetchData);
window.toggleAddStoneForm = toggleAddStoneForm;
window.toggleFilter = toggleFilter;
window.deleteStone = deleteStone;
window.showEditForm = showEditForm;
window.closeEditForm = closeEditForm;
window.addStone = addStone;
window.fetchData = fetchData;
window.showStoneData = showStoneData;
window.editStone = editStone;