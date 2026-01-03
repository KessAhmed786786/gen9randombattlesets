// Load and add pokemon to table for pokemon data json

// Global array for searching etc.
const allData = [];

// FUNCTION: Fetch and push data into a flattened array
async function loadAndDisplayData() {
  // Fetch the data
  const [setsResponse, statsResponse] = await Promise.all([
    fetch("data/gen9sets.json"),
    fetch("data/gen9stats.json"),
  ]);

  const setsData = await setsResponse.json();
  const statsData = await statsResponse.json();

  // New empty array for flattened data only
  const flattenedRows = [];

  // Flattening logic
  for (const [pokemonName, details] of Object.entries(setsData)) {
    const baseInfo = statsData[pokemonName] || {
      types: ["Unknown"],
      HP: 0,
      Attack: 0,
      Defense: 0,
      SpAtk: 0,
      SpDef: 0,
      Speed: 0,
      BST: 0,
    };
    for (const [roleName, roleDetails] of Object.entries(details.roles)) {
      // Create real values for stats, using level, base stats, evs and ivs
      const baseHP = Number(baseInfo.HP) || 0;
      const baseAttack = Number(baseInfo.Attack) || 0;
      const baseDefense = Number(baseInfo.Defense) || 0;
      const baseSpAtk = Number(baseInfo.SpAtk) || 0;
      const baseSpDef = Number(baseInfo.SpDef) || 0;
      const baseSpeed = Number(baseInfo.Speed) || 0;
      const levelValue = Number(details.level) || 0;

      const evs = roleDetails.evs || {};
      const ivs = roleDetails.ivs || {};

      const evHP = Number(evs.hp) || 84;
      const evAttack = evs.atk !== undefined ? Number(evs.atk) : 84;
      const evSpeed = evs.spe !== undefined ? Number(evs.spe) : 84;
      const ivAttack = ivs.atk !== undefined ? Number(ivs.atk) : 31;
      const ivSpeed = ivs.spe !== undefined ? Number(ivs.spe) : 31;

      const realHP = roundDown(
        ((2 * baseHP + 31 + evHP / 4) * levelValue) / 100 + levelValue + 10
      );
      const realAttack = roundDown(
        ((2 * baseAttack + ivAttack + evAttack / 4) * levelValue) / 100 + 5
      );
      const realDefense = roundDown(
        ((2 * baseDefense + 31 + 84 / 4) * levelValue) / 100 + 5
      );
      const realSpAtk = roundDown(
        ((2 * baseSpAtk + 31 + 84 / 4) * levelValue) / 100 + 5
      );
      const realSpDef = roundDown(
        ((2 * baseSpDef + 31 + 84 / 4) * levelValue) / 100 + 5
      );
      const realSpeed = roundDown(
        ((2 * baseSpeed + ivSpeed + evSpeed / 4) * levelValue) / 100 + 5
      );

      // Each role per pokemon creates new object for array
      const flatRow = {
        Pokemon: pokemonName,
        Type: baseInfo.types.join(" | "),
        Level: details.level,
        HP: realHP.toLocaleString(),
        Attack: realAttack.toLocaleString(),
        Defense: realDefense.toLocaleString(),
        SpAtk: realSpAtk.toLocaleString(),
        SpDef: realSpDef.toLocaleString(),
        Speed: realSpeed.toLocaleString(),
        Role: roleName,
        Abilities: roleDetails.abilities.join("<br>"),
        Items: roleDetails.items ? roleDetails.items.join("<br>") : "None",
        TeraTypes: roleDetails.teraTypes
          ? roleDetails.teraTypes.join("<br>")
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
  const searchTerm = event.target.value.toLowerCase().trim();

  // If no search then show all data and stop
  if (!searchTerm) {
    renderTable(allData);
    return;
  }

  // Command filtering
  let filteredResults = [];

//  if (searchTerm.startsWith(".")) {
//    const parts = searchTerm.split(" ");
//    const command = parts[0];
//    const query = parts.slice(1).join(" ");

//    filteredResults = allData.filter((row) => {
  //     switch (command) {
  //       case ".t":
  //       case ".type":
  //         return row.Role.toLowerCase().includes(query);
  //       case ".r":
  //       case ".role":
  //         return row.Role.toLowerCase().startsWith(query);
  //       case ".a":
  //       case ".ability":
  //         return row.Role.toLowerCase().includes(query);
  //       case ".i":
  //       case ".item":
  //         return row.Role.toLowerCase().includes(query);
  //       case ".e":
  //       case ".tera":
  //         return row.Role.toLowerCase().includes(query);
  //       case ".m":
  //       case ".move":
  //         return row.Role.toLowerCase().includes(query);
  //       default:
  //         return row.Pokemon.toLowerCase().startsWith(searchTerm);
  //     }
  //   });
  // } else {
  //   filteredResults = allData.filter((row) => {
  //     return row.Pokemon.toLowerCase().includes(searchTerm);
  //   });
  // }

  filteredResults = allData.filter((row) => {
    const match = (value) =>
      value ? String(value).toLowerCase().includes(searchTerm) : false;
    return (
      match(row.Pokemon) ||
      match(row.Role) ||
      match(row.Type) ||
      match(row.Abilities) ||
      match(row.Moves)
    );
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

// FUNCTION: Round down to nearest whole number
function roundDown(num) {
  return Math.floor(num);
}

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

const debouncedSearch = debounce(handleSearch, 100);
loadAndDisplayData();
