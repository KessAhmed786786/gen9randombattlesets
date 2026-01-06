const allData = [];

async function loadAndDisplayData() {
  allData.length = 0;
  const [setsResponse, statsResponse] = await Promise.all([
    fetch("data/gen9sets.json"),
    fetch("data/gen9stats.json"),
  ]);
  const setsData = await setsResponse.json();
  const statsData = await statsResponse.json();
  const flattenedRows = [];

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

      const flatRow = {
        Pokemon: pokemonName,
        Type: baseInfo.types,
        Level: details.level,
        Stats: {
          HP: realHP,
          Attack: realAttack,
          Defense: realDefense,
          SpAtk: realSpAtk,
          SpDef: realSpDef,
          Speed: realSpeed,
          Role: roleName,
        },
        Abilities: roleDetails.abilities,
        Items: roleDetails.items,
        TeraTypes: roleDetails.teraTypes,
        Moves: roleDetails.moves,
      };
      flattenedRows.push(flatRow);
    }
  }
  allData.push(...flattenedRows);
  renderTable(allData);
}

function renderTable(data) {
  const headerRow = document.getElementById("headerRow");
  const tableBody = document.getElementById("tableBody");

  headerRow.innerHTML = "";
  tableBody.innerHTML = "";

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

  const headers = Object.keys(data[0]);
  headers.forEach((headerText) => {
    const th = document.createElement("th");
    th.textContent = headerText;
    headerRow.appendChild(th);
  });

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

function handleSearch(event) {
  const searchTerm = event.target.value.toLowerCase().trim();

  let filteredResults = [];

  if (!searchTerm) {
    renderTable(allData);
    return;
  }

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

function debounce(func, delay) {
  let timeoutId;
  return (...args) => {
    clearTimeout(timeoutId);
    timeoutId = setTimeout(() => {
      func.apply(null, args);
    }, delay);
  };
}

function roundDown(num) {
  return Math.floor(num);
}

const debouncedSearch = debounce(handleSearch, 100);
loadAndDisplayData();
