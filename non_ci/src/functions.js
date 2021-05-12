/**
 * Asynchronous function, relying on the JSZip package (by Stuart Knightley and
 * others; https://github.com/Stuk/jszip), to extract the contents of a zip
 * file and return an Object of the file contents.
 * - Currently assumes that all files are in JSON format only!
 * @param {ArrayBuffer} data Contents of the zip file, as an ArrayBuffer
 * @return {Object} An Object containing the individual files within the zip
 * file, with the filename (without its extension) as the key name
 */
async function unzip(data) {
  let out = new Object();
  let jsz = new JSZip();
  let zip = await jsz.loadAsync(data);
  let files = zip.files;
  for (let k in files) {
    let content = await files[k].async("string");
    let key = k.replace(/\..+$/, '').replace(/\W/, "_");
    out[key] = JSON.parse(content.trimEnd());
  };
  return out;
}


/**
 * Helper function to generate a div element of class `table`, such that a div
 * table can be constructed.
 * @param {String} ihtml Optional innerHTML to apply upon generating the table
 * @return {Object} Div of class `table`, possibly with innerHTML assigned
 */
function divTable(ihtml) {
  let table = document.createElement("div");
  table.classList.add("table");
  if (ihtml !== undefined) { table.innerHTML = ihtml; }
  return table;
}


/**
 * Helper function to generate a div element of class `tableCell`, such that a
 * div table can be constructed.
 * @param {String} ihtml Optional innerHTML to apply upon generating the cell
 * @return {Object} Div of class `tableCell`, possibly with innerHTML assigned
 */
function divTableCell(ihtml) {
  let cell = document.createElement("div");
  cell.classList.add("tableCell");
  if (ihtml !== undefined) { cell.innerHTML = ihtml; }
  return cell;
}


/**
 * Helper function to generate a div element of classes `tableRow` and
 * `tableHeader`, such that a div table can be constructed.
 * @param {String} ihtml Optional innerHTML to apply upon generating the header
 * row
 * @return {Object} Div of classes `tableRow` and `tableCell`, possibly with
 * innerHTML assigned
 */
function divTableHeader(ihtml) {
  let header = divTableRow(ihtml);
  header.classList.add("tableHeader");
  return header;
}


/**
 * Helper function to generate a div element of class `tableRow`, such that a
 * div table can be constructed.
 * @param {String} ihtml Optional innerHTML to apply upon generating the row
 * @return {Object} Div of class `tableRow`, possibly with innerHTML assigned
 */
function divTableRow(ihtml) {
  let row = document.createElement("div");
  row.classList.add("tableRow");
  if (ihtml !== undefined) { row.innerHTML = ihtml; }
  return row;
}


/**
 * Generate a D3 Force-Directed Graph, according to an input data object
 * containing three main components -- the initial chart data, the default or
 * fallback values, and the CSS selector to select the SVG.
 * @param {Object} _data Object containing initial chart data `chartData`,
 * default values `defaults`, and SVG CSS selector `selector`
 * @return {Object} SVG DOM node with prototype modified by the D3 package,
 * permitting updating the data on the fly
 */
function generateChart(_data) {
  // -- Main operations -- //
  // Assign defaults
  let data = _data.chartData;
  let def = _data.defaults;
  let selector = _data.selector;
  // Handle the SVG
  let _svg = document.querySelector(selector);
  let width = _svg.width.baseVal.value;
  let height = _svg.height.baseVal.value;
  _svg.innerHTML = '';
  let svg = d3.select(selector)
    .attr("viewBox", [-width / 2, -height / 2, width, height]);
  let main_group = svg.append("g");
  // Initialise nodes and simulation
  let nodes = data.nodes.map(d => Object.create(d));
  let links = data.links.map(d => Object.create(d));
  let simulation = d3.forceSimulation()
      .force(
        "charge",
        d3.forceManyBody().strength(def.force.chargeStrength))
      .force(
        "link",
        d3.forceLink().id(d => d.id).distance(def.force.linkDistance))
      .force("x", d3.forceX())
      .force("y", d3.forceY())
      .on("tick", tickFunction);
  // Create link and node groups
  let link = main_group.append("g").selectAll("line");
  let nodes_text = main_group.append("g");
  let node = nodes_text.append("g").selectAll("circle")
  let text = nodes_text.append("g").selectAll("text");
  // Call zoom on the SVG
  svg.call(
    d3.zoom()
      .extent([[0, 0], [width, height]])
      .scaleExtent([1 / 4, 8])
      .on("zoom", zoomFunction));
  // -- Internal function definitions -- //
  // Link attribute functions
  function linkColour(d, i) {
    if (d?.colour === undefined) { return def.link.colour; }
    return d.colour;
  }
  function linkWidth(d, i) {
    if (d?.width === undefined) { return def.link.width; }
    return d.width;
  }
  function linkOpacity(d, i) {
    if (d?.opacity === undefined) { return def.link.opacity; }
    return d.opacity;
  }
  function linkId(d, i) {
    return `_link_s${d.source.id}_t${d.target.id}`;
  }
  // Node attribute functions
  function nodeFill(d, i) {
    if (d?.fill === undefined) { return def.node.fill; }
    return d.fill;
  }
  function nodeOpacity(d, i) {
    if (d?.opacity === undefined) { return def.node.opacity; }
    return d.opacity;
  }
  function nodeRadius(d, i) {
    if (d?.radius === undefined) { return def.node.radius; }
    return d.radius;
  }
  function nodeStroke(d, i) {
    if (d?.stroke === undefined) { return def.node.stroke.colour; }
    return d.stroke;
  }
  function nodeStrokeWidth(d, i) {
    if (d?.strokeWidth === undefined) { return def.node.stroke.width; }
    return d.strokeWidth;
  }
  // Text attribute functions
  function textFontSize(d, i) {
    if (d?.fontSize === undefined) { return def.text.font.size; }
    return d.fontSize;
  }
  function textFontWeight(d, i) {
    if (d?.fontWeight === undefined) { return def.text.font.weight; }
    return d.fontWeight;
  }
  function textVisibility(d, i) {
    if (d?.visibility === undefined) { return def.text.visibility; }
    return d.visibility;
  }
  // Simulation drag function
  function drag(sim) {
    function dragStart(event, d) {
      if (!event.active) { sim.alphaTarget(0.3).restart(); }
      d.fx = d.x;
      d.fy = d.y;
    }
    function dragging(event, d) {
      d.fx = event.x;
      d.fy = event.y;
    }
    function dragEnd(event, d) {
      if (!event.active) { sim.alphaTarget(0); }
      d.fx = null;
      d.fy = null;
    }
    return d3.drag()
      .on("start", dragStart)
      .on("drag", dragging)
      .on("end", dragEnd);
  }
  // Simulation tick function
  function tickFunction() {
    node.attr("transform", d => `translate(${d.x}, ${d.y})`);
    link.attr("x1", d => d.source.x)
        .attr("x2", d => d.target.x)
        .attr("y1", d => d.source.y)
        .attr("y2", d => d.target.y);
    text.attr("transform", textTransform);
  }
  // Text transform function
  function textTransform(d, i) {
    let r = +node._groups[0][i].getAttribute("r");
    // ^ This is a bit of a hack, but it was the most proper way
    let off = {x: r + 2, y: r / 2};
    return `translate(${d.x + off.x}, ${d.y + off.y})`;
  }
  // Zoom function
  function zoomFunction({transform}) {
    main_group.attr("transform", transform);
  }
  // -- Return -- //
  // Return the custom DOM node
  return Object.assign(svg.node(), {
    update({nodes, links}) {
      // Copy and overwrite data
      let old = new Map(node.data().map(d => [d.id, d]));
      nodes = nodes.map(d => Object.assign(old.get(d.id) || new Object(), d));
      links = links.map(d => Object.assign(new Object(), d));
      node = node
        .data(nodes, d => d.id)
        .join(enter => enter.append("circle")
          .attr("cursor", "grab")
          .attr("stroke", nodeStroke)
          .attr("stroke-width", nodeStrokeWidth)
          .attr("fill", nodeFill)
          .attr("r", nodeRadius)
          .attr("opacity", nodeOpacity))
        .call(drag(simulation));
      link = link
        .data(links, d => [d.source, d.target])
        .join(enter => enter.append("line")
          .attr("pointer-events", "none")
          .attr("stroke", linkColour)
          .attr("stroke-width", linkWidth)
          .attr("opacity", linkOpacity));
      text = text
        .data(nodes, d => d.id)
        .join(enter => enter.append("text")
          .text(nodeLabel)
          .attr("pointer-events", "none")
          .attr("font-size", textFontSize)
          .attr("font-weight", textFontWeight)
          .attr("visibility", textVisibility));
      // Define the node label function
      function nodeLabel(d, i) {
        if (d?.label === undefined) { return d.id; }
        return d.label;
      }
      // Implement node mouseover and mouseout
      let idxLink = new Object();
      links.forEach(l => idxLink[`${l.source}|${l.target}`] = true);
      node.on("mouseover", nodeMouseOver).on("mouseout", nodeMouseOut);
      function isConnected(a, b) {
        let c0 = idxLink[`${a.id}|${b.id}`];
        let c1 = idxLink[`${b.id}|${a.id}`];
        return (c0 || c1);
      }
      function nmoNodeFill(o, j, d) {
        if (d === o) { return "red"; }
        if (isConnected(d, o)) { return "darkorange"; }
        return nodeFill(o, j);
      }
      function nmoNodeOpacity(o, j, d) {
        let n0 = nodeOpacity(o, j);
        if (isConnected(d, o) || d === o) { return n0; }
        return 0.15 * n0;
      }
      function nmoNodeStroke(o, j, d) {
        if (isConnected(d, o) || d === o) { return "royalblue"; }
        return nodeStroke(o, j);
      }
      function nmoNodeStrokeWidth(o, j, d) { return nodeStrokeWidth(o, j); }
      function nmoNodeRadius(o, j, d) { return nodeRadius(o, j); }
      function nmoLinkColour(o, j, d) {
        if (o.source.id === d.id || o.target.id === d.id) {
          return "royalblue";
        }
        return linkColour(o, j);
      }
      function nmoLinkWidth(o, j, d) { return linkWidth(o, j); }
      // ^ The above five are currently effectively dummy functions, but are
      //   left here to demonstrate potential control.
      function nmoLinkOpacity(o, j, d) {
        let l0 = linkOpacity(o, j);
        let c0 = (o.source.id === d.id) || (o.target.id === d.id);
        if (c0) { return l0; }
        return 0.15 * l0;
      }
      function nmoTextFontSize(o, j, d) { return textFontSize(o, j); }
      // ^ This one's also a dummy at this stage.
      function nmoTextFontWeight(o, j, d) {
        if (d === o) { return "bold"; }
        return textFontWeight(o, j);
      }
      function nmoTextVisibility(o, j, d) {
        if (isConnected(d, o) || d === o) { return "visible"; }
        return textVisibility(o, j);
      }
      function nodeMouseOver(e, d) {
        node.attr("stroke", (o, j) => nmoNodeStroke(o, j, d))
            .attr("stroke-width", (o, j) => nmoNodeStrokeWidth(o, j, d))
            .attr("fill", (o, j) => nmoNodeFill(o, j, d))
            .attr("r", (o, j) => nmoNodeRadius(o, j, d))
            .attr("opacity", (o, j) => nmoNodeOpacity(o, j, d));
        link.attr("stroke", (o, j) => nmoLinkColour(o, j, d))
            .attr("stroke-width", (o, j) => nmoLinkWidth(o, j, d))
            .attr("opacity", (o, j) => nmoLinkOpacity(o, j, d));
        text.attr("font-size", (o, j) => nmoTextFontSize(o, j, d))
            .attr("font-weight", (o, j) => nmoTextFontWeight(o, j, d))
            .attr("visibility", (o, j) => nmoTextVisibility(o, j, d));
      }
      function nodeMouseOut(e, d) {
        node.attr("stroke", nodeStroke)
            .attr("stroke-width", nodeStrokeWidth)
            .attr("fill", nodeFill)
            .attr("r", nodeRadius)
            .attr("opacity", nodeOpacity);
        link.attr("stroke", linkColour)
            .attr("stroke-width", linkWidth)
            .attr("opacity", linkOpacity);
        text.attr("font-size", textFontSize)
            .attr("font-weight", textFontWeight)
            .attr("visibility", textVisibility);
      }
      // Reset the simulation
      simulation.stop();
      simulation.nodes(nodes);
      simulation.force("link").links(links);
      simulation.alpha(1).restart();
    }
  });
}


/**
 * Final function in the startup fetch chain, to initialise the zip file data
 * and generate the empty chart node.
 * @param {Object} data Zip file data, passed on from `unzip`
 * @return {undefined}
 */
function initialise(data) {
  for (let k in data) { window[k] = data[k]; }
  window._chart = generateChart(window._defaults);
  document.querySelector("#feedback").innerHTML = '';
  return;
}


/**
 * Helper to generate an anchor element but specifically for KEGG Compound
 * entries.
 * @param {String} id KEGG Compound ID
 * @return {Object} Anchor DOM element with href pointing to the KEGG Compound
 * entry for the given ID, whereby the innerHTML is the provided ID
 */
function keggCompoundAnchor(id) {
  return makeAnchor({
    href: `https://www.kegg.jp/dbget-bin/www_bget?cpd:${id}`,
    ihtml: id
  });
}


/**
 * Generate a div table of the current IDs displayed in the D3 FDG
 * visualisation.
 * @param {Array} ids Array of KEGG Compound IDs currently present in the D3
 * FDG visualisation
 * @return {undefined}
 */
function listIdCurrent(ids) {
  let klc = window.klc;
  if (klc === undefined) {
    throw new Error("KEGG List Compound data are undefined!");
  }
  let container = document.querySelector("#idCurrentContainer");
  let table = divTable();
  let header = divTableHeader();
  let h0 = divTableCell("KEGG Compound ID");
  let h1 = divTableCell("Alias(es)");
  header.append(h0);
  header.append(h1);
  table.append(header);
  table = ids.reduce((a, c) => {
    let d = klc.filter(k => k.id === c);
    d = (d === undefined) ? "" : d[0].name.slice().sort().join(", ");
    let row = divTableRow();
    let c0 = divTableCell(keggCompoundAnchor(c).outerHTML);
    let c1 = divTableCell(d);
    row.append(c0);
    row.append(c1);
    a.append(row);
    return a;
  }, table);
  container.innerHTML = "";
  container.append(table);
  return;
}


/**
 * Helper function to quickly generate an anchor element.
 * @param {String} href Hyperlink reference to use
 * @param {String} ihtml InnerHTML to provide for the anchor
 * @return {Object} DOM anchor node with specified href and innerHTML
 */
function makeAnchor({href, ihtml}) {
  let a = document.createElement("a");
  a.setAttribute("rel", "nofollow noopener noreferrer");
  a.setAttribute("target", "_blank");
  a.setAttribute("href", href);
  a.innerHTML = ihtml;
  return a;
}


/**
 * Run the startup function on loading the page, such that the core background
 * data zip is fetched, coerced to ArrayBuffer, and unzipped, and the page data
 * are initialised.
 * @param {undefined}
 * @return {undefined}
 */
function startup() {
  let fb = document.querySelector("#feedback");
  fb.innerHTML = "Please wait, loading data....";
  fetch("./_data.zip").then(r => r.arrayBuffer()).then(unzip).then(initialise);
  return;
}


/**
 * Button onclick function to handle submission of the KEGG Pathway or Module
 * ID, including validation and updating the simulation.
 * @param {undefined}
 * @return {undefined}
 */
function submitKeggId() {
  let id = document.querySelector("#inputKeggId").value;
  let fb = document.querySelector("#feedback");
  let cl = [...fb.classList];
  ["Positive", "Negative"].forEach(t => {
    let c = `feedback${t}`;
    if (cl.indexOf(c) !== -1) { fb.classList.remove(c); }
  });
  if (!/^(map|M)\d{5}$/.test(id)) {
    fb.classList.add("feedbackNegative");
    fb.innerHTML = `ID "${id}" not recognised as KEGG Pathway or Module ID`;
    return;
  }
  fb.classList.add("feedbackPositive");
  if (/^map\d{5}$/.test(id)) {
    fb.innerHTML = `ID "${id}" is a KEGG Pathway ID`;
    updateSim(window.kpr[id]);
    return;
  }
  if (/^M\d{5}$/.test(id)) {
    fb.innerHTML = `ID "${id}" is a KEGG Module ID`;
    updateSim(window.kmr[id]);
    return;
  }
  fb.classList.remove("feedbackPositive");
  throw new Error("Unknown error in KEGG ID input submission!");
}


/**
 * Update the simulation data on receipt of a set of KEGG Reaction IDs,
 * including the table of the current compounds present.
 * @param {Object} data Object with each key being either a KEGG Pathway or
 * Module ID, and each value being an array of KEGG Reaction IDs
 * @return {undefined}
 */
function updateSim(data) {
  let chart = window._chart;
  if (chart === undefined) { throw new Error("Chart is undefined!"); }
  if (data === undefined) {
    let msg = `No data found for ID:  ${id}`;
    let fb = document.querySelector("#feedback");
    if (fb.classList.indexOf("feedbackPositive") !== -1) {
      fb.classList.remove("feedbackPositive");
    }
    if (fb.classList.indexOf("feedbackNegative") === -1) {
      fb.classList.add("feedbackNegative");
    }
    fb.innerHTML = msg;
    console.warn(msg);
    return;
  }
  let nodes = new Array();
  let links = new Array();
  for (let idrg of data) {
    if (kroc[idrg] === undefined) { continue; }
    kroc[idrg].l.forEach(l => {
      if (nodes.filter(n => n.id === l).length === 0) { nodes.push({id: l}); }
      kroc[idrg].r.forEach(r => {
        if (nodes.filter(n => n.id === r).length === 0) {
          nodes.push({id: r});
        }
        links.push({source: l, target: r});
      });
    });
  }
  chart.update({nodes, links});
  listIdCurrent(nodes.map(n => n.id).sort());
  return;
}
