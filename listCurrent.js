// Cell for displaying a table of the current visualised IDs


// -- Class definitions -- //


class DivTable {
  constructor(width) {
    this.table = document.createElement("div");
    this.table.classList.add("table");
    this.width = width;
    this.rows = [];
  };
  _cell(content) {
    let cell = document.createElement("div");
    cell.classList.add("table-cell");
    if (content !== undefined) cell.innerHTML = content;
    return cell;
  };
  _row(content) {
    let row = {content: content, element: document.createElement("div")};
    row.element.classList.add("table-row");
    if (content !== undefined) {
      content.forEach(c => row.element.appendChild(this._cell(c)));
    };
    return row;
  };
  _header(content) {
    let header = this._row(content);
    header.element.classList.add("table-header");
    return header;
  };
  addHeader(content) {
    if (content.length !== this.width) {
      throw new Error("Content length does not match table width");
    };
    this.header = this._header(content);
    this.table.appendChild(this.header.element);
  };
  addRow(content) {
    if (content.length !== this.width) {
      throw new Error("Content length does not match table width");
    };
    this.rows.push(this._row(content));
    this.table.appendChild(this.rows[this.rows.length - 1].element);
  };
  attachTo(node) {
    node.appendChild(this.table);
  };
};


// -- Function definitions -- //


// Helper to generate an anchor, according to spec
function makeAnchor({href, ihtml}) {
  let a = document.createElement("a");
  a.setAttribute("rel", "nofollow noopener noreferrer");
  a.setAttribute("target", "_blank");
  a.setAttribute("href", href);
  a.innerHTML = ihtml;
  return a;
};

// Shorthand to make a KEGG Compound URI anchor
function keggCompoundAnchor(id) {
  return makeAnchor({
    href: `https://www.kegg.jp/dbget-bin/www_bget?cpd:${id}`,
    ihtml: id,
  });
};


// -- Operations -- //


// Find the sink
let sink = document.querySelector("#sinkIdVis");

// Get the KEGG List Compound and current vis IDs data
let klc = API.getData("klc").resurrect();
let crt = API.getData("idVisCurrent").resurrect();

// Get the IDs only, and the KEGG Compound shortlist
let ids = crt.map(c => c.id).sort();
let kcs = ids.map(i => klc.filter(k => k.id === i)[0]);

// Create the output table
let table = new DivTable(2);
table.addHeader(["KEGG Compound ID", "Alias(es)"]);

// Add the KEGG Compound shortlist data
kcs.forEach(k => {
  table.addRow([
    keggCompoundAnchor(k.id).outerHTML,
    k.name.slice().sort().join(", ")
  ]);
});

// Empty and refresh the sink
sink.innerHTML = '';
table.attachTo(sink);
