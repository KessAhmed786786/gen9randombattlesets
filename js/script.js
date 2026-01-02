// Load and add pokemon to table for pokemon data json

// Global array for searching etc.
const allData = [];

// FUNCTION: Fetch and push data into a flattened array
async function loadAndDisplayData() {
  // Fetch the data
  const response = await fetch("data/gen9sets.json");
  const rawData = await response.json();

  // New empty array for flattened data only
  const flattenedRows = [];

  // Flattening logic
  for (const [pokemonName, details] of Object.entries(rawData)) {
    for (const [roleName, roleDetails] of Object.entries(details.roles)) {
      // Each role per pokemon creates new object for array
      const flatRow = {
        Pokemon: pokemonName,
        Level: details.level,
        Role: roleName,
        Abilities: roleDetails.abilities.join(", "),
        Items: roleDetails.items ? roleDetails.items.join(", ") : "None",
        TeraTypes: roleDetails.teraTypes
          ? roleDetails.teraTypes.join(", ")
          : "N/A",
        Moves: roleDetails.moves ? roleDetails.moves.join("<br>") : "N/A",
      };
      flattenedRows.push(flatRow);
    }
  }
  allData.push(...flattenedRows);
  renderTable(allData);
}

// FUNCTION: Search functionality
function handleSearch(event) {
  const searchTerm = event.target.value.toLowerCase();
  const filteredResults = allData.filter((row) => {
    return row.Pokemon.toLowerCase().includes(searchTerm);
  });
  renderTable(filteredResults);
}

// FUNCTION: Debounce to imporove searching
function debounce(func, delay) {
  let timeoutId;
  return (...args) => {
    clearTimeout(timeoutId);
    timeoutId = setTimeout(() => {
      func.apply(null, args);
    }, delay);
  };
}

const debouncedSearch = debounce(handleSearch, 200);

// FUNCTION: Generate table for data
function renderTable(data) {
  const headerRow = document.getElementById("headerRow");
  const tableBody = document.getElementById("tableBody");

  // Clear existing content
  headerRow.innerHTML = "";
  tableBody.innerHTML = "";

  // Safety check, if data is empty don't try to render
  if (!data || data.length === 0) {
    const tr = document.createElement("tr");
    const td = document.createElement("td");
    td.textContent = "No Pokemon found matching that search";
    td.setAttribute("colspan", "7");
    td.style.textAlign = "center";
    tr.appendChild(td);
    tableBody.appendChild(tr);
    return;
  }

  // Create Headers based on the keys of the first object
  const headers = Object.keys(data[0]);
  headers.forEach((headerText) => {
    const th = document.createElement("th");
    th.textContent = headerText;
    headerRow.appendChild(th);
  });

  // Create Rows
  data.forEach((item) => {
    const tr = document.createElement("tr");
    headers.forEach((header) => {
      const td = document.createElement("td");
      if (header === "Pokemon") {
        td.innerHTML = `<strong>${item[header]}</strong>`;
      } else {
        td.innerHTML = item[header];
      }
      tr.appendChild(td);
    });
    tableBody.appendChild(tr);
  });
}

loadAndDisplayData();
