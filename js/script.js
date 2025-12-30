fetch("data/data.json")
  .then((response) => {
    return response.json();
  })
  .then((data) => {
    populateTable(data);
  })
  .catch(console.error("Error fetching data:", error));

function populateTable(data) {
  const tableBody = document.getElementById("table-body");

  for (const key in data) {
    const row = document.createElement("tr");

    const nameCell = document.createElement("td");
    nameCell.textContent = key;

    const levelCell = document.createElement("td");
    levelCell.textContent = data[key].level;

    row.appendChild(nameCell);
    row.appendChild(levelCell);
    tableBody.appendChild(row);
  }
}
