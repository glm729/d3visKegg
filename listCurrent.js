// Cell for displaying a table of the current visualised IDs


// Find the sink
let sink = document.querySelector("#sinkIdVis");

// Get the KEGG List Compound and current vis IDs data
let klc = API.getData("klc").resurrect();
let crt = API.getData("idVisCurrent").resurrect();

// Get the IDs only, and the KEGG Compound shortlist
let ids = crt.map(c => c.id).sort();
let kcs = ids.map(i => klc.filter(k => k.id === i)[0]);

// Generate the HTML table
let table = divTable();

// Initialise the header
let header = divTableHeader();

// Generate the header contents
let hc0 = divTableCell("KEGG Compound ID");
let hc1 = divTableCell("Alias(es)");

// Append header contents to the header
header.append(hc0);
header.append(hc1);

// Append the header to the table
table.append(header);

// Reduce the KEGG Compound shortlist into the table
table = kcs.reduce(reduceKcs, table);

// Empty and refresh the sink
sink.innerHTML = '';
sink.append(table);


// -- Function definitions -- //

// Reduce the KEGG Compound ID shortlist into the table
// - Includes links to KEGG Compound
function reduceKcs(a, c) {
  let row = divTableRow();
  let c0 = divTableCell(keggCompoundAnchor(c.id).outerHTML);
  let c1 = divTableCell(c.name.slice().sort().join(", "));
  // row.addEventListener("mouseover", rowHoverApi);
  row.append(c0);
  row.append(c1);
  a.append(row);
  return a;
}

// Helper to generate a div table
function divTable(ihtml) {
  let table = document.createElement("div");
  table.classList.add("divTable");
  if (ihtml !== undefined) { table.innerHTML = ihtml; }
  return table;
}

// Helper to generate a div table row
function divTableRow(ihtml) {
  let row = document.createElement("div");
  row.classList.add("divTableRow");
  if (ihtml !== undefined) { row.innerHTML = ihtml; }
  return row;
}

// Helper to generate a div table header row
function divTableHeader(ihtml) {
  let header = divTableRow(ihtml);
  header.classList.add("divTableHeader");
  return header;
}

// Helper to generate a div table cell
function divTableCell(ihtml) {
  let cell = document.createElement("div");
  cell.classList.add("divTableCell");
  if (ihtml !== undefined) { cell.innerHTML = ihtml; }
  return cell;
}

// Helper to generate an anchor, according to spec
function makeAnchor({href, ihtml}) {
  let a = document.createElement("a");
  a.setAttribute("rel", "nofollow noopener noreferrer");
  a.setAttribute("target", "_blank");
  a.setAttribute("href", href);
  a.innerHTML = ihtml;
  return a;
}

// Shorthand to make a KEGG Compound URI anchor
function keggCompoundAnchor(id) {
  return makeAnchor({
    href: `https://www.kegg.jp/dbget-bin/www_bget?cpd:${id}`,
    ihtml: id,
  });
}

// Might use this in future....
function rowHoverApi(event) {
  let id = event.currentTarget.firstChild.firstChild.innerHTML;
  API.createData("idHovered", id);
  return;
}
