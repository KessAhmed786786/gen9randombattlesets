const rawData = {
  Alice: { age: 28, height: 165 },
  Bob: { age: 34, height: 180 },
  Charlie: { age: 12, height: 201 },
};

const formatCell = (name, age, height) => {
  return `
    <tr>
      <td><strong>${name}</strong></td>
      <td>${age.toString()}</td>
      <td>${height.toString()}</td>
    </tr>
  `;
};

const generateTableHTML = (data) => {
  return Object.entries(data)
    .map(([name, stats]) => formatCell(name, stats.age, stats.height))
    .join("");
};

const tableBody = document.querySelector('#data-table-body');
tableBody.innerHTML = generateTableHTML(rawData);