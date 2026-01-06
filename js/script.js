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
      const levelValue = Number(details.level) || 0;
      const evs = roleDetails.evs || {};
      const ivs = roleDetails.ivs || {};
      const evHP = Number(evs.hp) || 84;
      const evAttack = evs.atk !== undefined ? Number(evs.atk) : 84;
      const evSpeed = evs.spe !== undefined ? Number(evs.spe) : 84;
      const ivAttack = ivs.atk !== undefined ? Number(ivs.atk) : 31;
      const ivSpeed = ivs.spe !== undefined ? Number(ivs.spe) : 31;

      const flatRow = {
        Pokemon: pokemonName,
        Type: baseInfo.types,
        Level: details.level,
        //        Stats: {
        HP: calcStat(baseInfo.HP, 31, evHP, levelValue, true),
        Attack: calcStat(baseInfo.Attack, ivAttack, evAttack, levelValue, false),
        Defense: calcStat(baseInfo.Defense, 31, 84, levelValue, false),
        SpAtk: calcStat(baseInfo.SpAtk, 31, 84, levelValue, false),
        SpDef: calcStat(baseInfo.SpDef, 31, 84, levelValue, false),
        Speed: calcStat(baseInfo.Speed, ivSpeed, evSpeed, levelValue, false),
        Role: roleName,
        //        },
        Abilities: roleDetails.abilities,
        Items: roleDetails.items,
        TeraTypes: roleDetails.teraTypes,
        Moves: roleDetails.moves,
      };

      const Formatters = {
        types: (types) => types.map((t) => `<strong>${t}</strong>.join(' '),`),
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

  if (!data.length) {
    tableBody.innerHTML = `<tr><td colspan="7" style="text-align:center">No results found</td></tr>`;
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
      if (header === "Type") {
        td.innerHTML = item[header];
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

const calcStat = (base, iv, ev, level, isHP) => {
  if (isHP) {
    return Math.floor(((2 * base + iv + ev / 4) * level) / 100 + level + 10);
  }
  return Math.floor(((2 * base + iv + ev / 4) * level) / 100 + 5);
};
