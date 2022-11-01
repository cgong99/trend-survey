const reader = new FileReader();

reader.onload = function (e) {
  const text = e.target.result;
  const data = csvToArray(text);
  console.log(data)
};

reader.readAsText()

function csvToArray(str, delimiter = " ") {
  const headers = str.slice(0, str.indexOf("\n")).split(delimiter);

  const rows = str.slice(str.indexOf("\n") + 1).split("\n");

  const arr = rows.map(function (row) {
    const values = row.split(delimiter);
    const el = headers.reduce(function (object, header, index) {
      object[header] = values[index];
      return object;
    }, {});
    return el;
  });

  return arr;
}

// var data = $.csv.toObjects(csv)