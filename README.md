# Stein‑gruppa Admin Panel

## 1. Oversikt
Kort beskrivelse av applikasjonen:  
- Frontend: HTML/CSS/JS  
- Backend: Firebase (Auth + Firestore)  
- Brukerroller: Admin vs. vanlig bruker  
- CRUD‑operasjoner mot `steiner`-samlingen  
- Forespørsler via `requests`-samlingen

## 2. Arkitekturdiagram

```mermaid
flowchart LR
  subgraph Klient
    A[Browser<br/>HTML/CSS/JS] -->|Auth| B[Firebase Auth]
    A -->|CRUD| C[Firestore]
    A -->|Lytter på| D[Realtime Listeners]
  end

  subgraph Firebase
    B -->|Token| C
    C -->|Data| D
    C -->|Collection: `steiner`| E((Steiner))
    C -->|Collection: `requests`| F((Requests))
  end

  style Klient fill:#f9f,stroke:#333,stroke-width:1px
  style Firebase fill:#bbf,stroke:#333,stroke-width:1px
