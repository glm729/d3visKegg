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
 * Abstracted and generalised simulation function for defining a per-node
 * visual attribute in the D3 force-directed graph.
 * @param {Object} d Data for current iteration
 * @param {Integer} i Index of current iteration
 * @param {String} key Key at which to access the attribute
 * @param {?} df Default value to return if attribute does not exist
 * @return {?} Attribute value returned, either as the default or as the
 * attribute provided in the current iteration of the data
 */
function attrDefault({data, idx, key, def}) {
  if (data === undefined) { return; }
  if (data[key] === undefined) { return def; }
  return data[key];
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
 * Abstracted simulation function to define actions completed on drag.
 * @param {Object} sim Simulation in which to operate
 * @return {Object} Not exactly sure.  D3 artefact.
 */
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


/**
 * Helper function for determining whether two nodes in a graph are connected.
 * Relies on the idxLink object.
 * @param {Object} a Node a
 * @param {Object} b Node b
 * @param {Object} idxLink Specific-purpose object containing a value of `true`
 * if nodes a and b are connected, or `undefined` otherwise
 * @return {Boolean} Boolean value indicating whether nodes a and b are
 * directly connected in the graph
 */
function isConnected(a, b, idxLink) {
  let c0 = idxLink[`${a.id}|${b.id}`];
  let c1 = idxLink[`${b.id}|${a.id}`];
  return (c0 || c1);
}


/**
 * This series defines the abstracted simulation functions for defining node
 * mouseover changes.
 * @param {Object} data Current iteration data
 * @param {Integer} idx Current iteration index
 * @param {Object} orig Origin node -- outer loop
 * @param {?} def Default value to apply, if none available
 * @param {Object} idxLink Object defining which node indices are linked in the
 * graph
 * @return {?} Current applicable value to use for visual components of graph,
 * or the default value
 */
// Links
function nmoLinkColour({data, idx, orig, def, idxLink}) {
  if (data.source.id === orig.id || data.target.id === orig.id) {
    return "royalblue";
  }
  return attrDefault({data: data, idx: idx, key: "colour", def: def});
}
function nmoLinkOpacity({data, idx, orig, def, idxLink}) {
  let l0 = attrDefault({data: data, idx: idx, key: "opacity", def: def});
  let c0 = (data.source.id === orig.id) || (data.target.id === orig.id);
  if (c0) { return l0; }
  return 0.15 * l0;
}
function nmoLinkWidth({data, idx, orig, def, idxLink}) {
  return attrDefault({data: data, idx: idx, key: "strokeWidth", def: def});
}
// Nodes
function nmoNodeFill({data, idx, orig, def, idxLink}) {
  if (data === orig) { return "red"; }
  if (isConnected(orig, data, idxLink)) { return "darkorange"; }
  return attrDefault({data: data, idx: idx, key: "fill", def: def});
}
function nmoNodeOpacity({data, idx, orig, def, idxLink}) {
  let n0 = attrDefault({data: data, idx: idx, key: "opacity", def: def});
  if (isConnected(orig, data, idxLink) || data === orig) { return n0; }
  return 0.15 * n0;
}
function nmoNodeRadius({data, idx, orig, def, idxLink}) {
  return attrDefault({data: data, idx: idx, key: "radius", def: def});
}
function nmoNodeStroke({data, idx, orig, def, idxLink}) {
  if (isConnected(orig, data, idxLink) || data === orig) {
    return "royalblue";
  }
  return attrDefault({data: data, idx: idx, key: "stroke", def: def});
}
function nmoNodeStrokeWidth({data, idx, orig, def, idxLink}) {
  return attrDefault({data: data, idx: idx,  key: "strokeWidth", def: def});
}
// Text
function nmoTextFontSize({data, idx, orig, def, idxLink}) {
  return attrDefault({data: data, idx: idx, key: "size", def: def});
}
function nmoTextFontWeight({data, idx, orig, def, idxLink}) {
  if (data === orig) { return "bold"; }
  return attrDefault({data: data, idx: idx, key: "weight", def: def});
}
function nmoTextVisibility({data, idx, orig, def, idxLink}) {
  if (isConnected(orig, data, idxLink) || data === orig) {
    return "visible";
  }
  return attrDefault({data: data, idx: idx, key: "visibility", def: def});
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
          .attr("stroke", (d, i) => {
            return attrDefault({
              data: d,
              idx: i,
              key: "stroke",
              def: def.node.stroke.colour
            });
          })
          .attr("stroke-width", (d, i) => {
            return attrDefault({
              data: d,
              idx: i,
              key: "strokeWidth",
              def: def.node.stroke.width
            });
          })
          .attr("fill", (d, i) => {
            return attrDefault({
              data: d,
              idx: i,
              key: "fill",
              def: def.node.fill
            });
          })
          .attr("r", (d, i) => {
            return attrDefault({
              data: d,
              idx: i,
              key: "radius",
              def: def.node.radius
            });
          })
          .attr("opacity", (d, i) => {
            return attrDefault({
              data: d,
              idx: i,
              key: "opacity",
              def: def.node.opacity
            });
          }))
        .call(drag(simulation));
      link = link
        .data(links, d => [d.source, d.target])
        .join(enter => enter.append("line")
          .attr("pointer-events", "none")
          .attr("stroke", (d, i) => {
            return attrDefault({
              data: d,
              idx: i,
              key: "colour",
              def: def.link.colour
            });
          })
          .attr("stroke-width", (d, i) => {
            return attrDefault({
              data: d,
              idx: i,
              key: "width",
              def: def.link.width
            });
          })
          .attr("opacity", (d, i) => {
            return attrDefault({
              data: d,
              idx: i,
              key: "opacity",
              def: def.link.opacity
            });
          }));
      text = text
        .data(nodes, d => d.id)
        .join(enter => enter.append("text")
          .text(nodeLabel)
          .attr("pointer-events", "none")
          .attr("font-size", (d, i) => {
            return attrDefault({
              data: d,
              idx: i,
              key: "size",
              def: def.text.size
            });
          })
          .attr("font-weight", (d, i) => {
            return attrDefault({
              data: d,
              idx: i,
              key: "weight",
              def: def.text.weight
            });
          })
          .attr("visibility", (d, i) => {
            return attrDefault({
              data: d,
              idx: i,
              key: "visibility",
              def: def.text.visibility
            });
          }));
      // Define the node label function
      function nodeLabel(d, i) {
        if (d?.label === undefined) { return d.id; }
        return d.label;
      }
      // Implement node mouseover and mouseout
      let idxLink = new Object();
      links.forEach(l => idxLink[`${l.source}|${l.target}`] = true);
      node.on("mouseover", nodeMouseOver).on("mouseout", nodeMouseOut);
      function nodeMouseOver(e, d) {
        node.attr("stroke", (o, j) => {
              return nmoNodeStroke({
                data: o,
                idx: j,
                orig: d,
                def: def.node.stroke.colour,
                idxLink: idxLink
              });
            })
            .attr("stroke-width", (o, j) => {
              return nmoNodeStrokeWidth({
                data: o,
                idx: j,
                orig: d,
                def: def.node.stroke.width,
                idxLink: idxLink
              });
            })
            .attr("fill", (o, j) => {
              return nmoNodeFill({
                data: o,
                idx: j,
                orig: d,
                def: def.node.fill,
                idxLink: idxLink
              });
            })
            .attr("r", (o, j) => {
              return nmoNodeRadius({
                data: o,
                idx: j,
                orig: d,
                def: def.node.radius,
                idxLink: idxLink
              });
            })
            .attr("opacity", (o, j) => {
              return nmoNodeOpacity({
                data: o,
                idx: j,
                orig: d,
                def: def.node.opacity,
                idxLink: idxLink
              });
            });
        link.attr("stroke", (o, j) => {
              return nmoLinkColour({
                data: o,
                idx: j,
                orig: d,
                def: def.link.colour,
                idxLink: idxLink
              });
            })
            .attr("stroke-width", (o, j) => {
              return nmoLinkWidth({
                data: o,
                idx: j,
                orig: d,
                def: def.link.width,
                idxLink: idxLink
              });
            })
            .attr("opacity", (o, j) => {
              return nmoLinkOpacity({
                data: o,
                idx: j,
                orig: d,
                def: def.link.opacity,
                idxLink: idxLink
              });
            });
        text.attr("font-size", (o, j) => {
              return nmoTextFontSize({
                data: o,
                idx: j,
                orig: d,
                def: def.text.size,
                idxLink: idxLink
              });
            })
            .attr("font-weight", (o, j) => {
              return nmoTextFontWeight({
                data: o,
                idx: j,
                orig: d,
                def: def.text.weight,
                idxLink: idxLink
              });
            })
            .attr("visibility", (o, j) => {
              return nmoTextVisibility({
                data: o,
                idx: j,
                orig: d,
                def: def.text.visibility,
                idxLink: idxLink
              });
            });
      }
      function nodeMouseOut(e, d) {
        node.attr("stroke", (d, i) => {
              return attrDefault({
                data: d,
                idx: i,
                key: "stroke",
                def: def.node.stroke.colour});
            })
            .attr("stroke-width", (d, i) => {
              return attrDefault({
                data: d,
                idx: i,
                key: "strokeWidth",
                def: def.node.stroke.width
              });
            })
            .attr("fill", (d, i) => {
              return attrDefault({
                data: d,
                idx: i,
                key: "fill",
                def: def.node.fill});
            })
            .attr("r", (d, i) => {
              return attrDefault({
                data: d,
                idx: i,
                key: "radius",
                def: def.node.radius});
            })
            .attr("opacity", (d, i) => {
              return attrDefault({
                data: d,
                idx: i,
                key: "opacity",
                def: def.node.opacity});
            });
        link.attr("stroke", (d, i) => {
              return attrDefault({
                data: d,
                idx: i,
                key: "colour",
                def: def.link.colour
              })
            })
            .attr("stroke-width", (d, i) => {
              return attrDefault({
                data: d,
                idx: i,
                key: "width",
                def: def.link.width});
            })
            .attr("opacity", (d, i) => {
              return attrDefault({
                data: d,
                idx: i,
                key: "opacity",
                def: def.link.opacity});
            });
        text.attr("font-size", (d, i) => {
              return attrDefault({
                data: d,
                idx: i,
                key: "size",
                def: def.text.size});
            })
            .attr("font-weight", (d, i) => {
              return attrDefault({
                data: d,
                idx: i,
                key: "weight",
                def: def.text.weight
              });
            })
            .attr("visibility", (d, i) => {
              return attrDefault({
                data: d,
                idx: i,
                key: "visibility",
                def: def.text.visibility});
            });
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
