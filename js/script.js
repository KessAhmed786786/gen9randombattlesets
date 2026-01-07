const allData = [];

async function loadAndDisplayData() {
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
      const evs = roleDetails.evs || {};
      const ivs = roleDetails.ivs || {};

      const levelValue = Number(details.level) || 0;
      const evHP = Number(evs.hp) || 84;
      const evAttack = evs.atk !== undefined ? Number(evs.atk) : 84;
      const evSpeed = evs.spe !== undefined ? Number(evs.spe) : 84;
      const ivAttack = ivs.atk !== undefined ? Number(ivs.atk) : 31;
      const ivSpeed = ivs.spe !== undefined ? Number(ivs.spe) : 31;

      const flatRow = {
        Pokemon: pokemonName,
        Type: baseInfo.types,
        Level: details.level,
        HP: calcStat(baseInfo.HP, 31, evHP, levelValue, true),
        Atk: calcStat(
          baseInfo.Attack,
          ivAttack,
          evAttack,
          levelValue,
          false
        ),
        Def: calcStat(baseInfo.Defense, 31, 84, levelValue, false),
        SpA: calcStat(baseInfo.SpAtk, 31, 84, levelValue, false),
        SpD: calcStat(baseInfo.SpDef, 31, 84, levelValue, false),
        Spe: calcStat(baseInfo.Speed, ivSpeed, evSpeed, levelValue, false),
        Role: roleName,
        Abilities: roleDetails.abilities,
        Items: roleDetails.items,
        TeraTypes: roleDetails.teraTypes,
        Moves: roleDetails.moves,
      };
      flattenedRows.push(flatRow);
    }
  }
  allData.length = 0;
  allData.push(...flattenedRows);
  console.log(allData);
  renderTable(allData);
}

const formatters = {
  number: (num) => num.toLocaleString(),
};

function renderTable(data) {
  const headerRow = document.getElementById("headerRow");
  const tableBody = document.getElementById("tableBody");
  headerRow.innerHTML = "";
  tableBody.innerHTML = "";

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

  if (!data.length) {
    tableBody.innerHTML = `<tr><td colspan="7" style="text-align:center">No results found</td></tr>`;
    return;
  }
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

const calcStat = (base, iv, ev, level, isHP) => {
  if (isHP) {
    return Math.floor(((2 * base + iv + ev / 4) * level) / 100 + level + 10);
  }
  return Math.floor(((2 * base + iv + ev / 4) * level) / 100 + 5);
};

const debouncedSearch = debounce(handleSearch, 100);
loadAndDisplayData();
