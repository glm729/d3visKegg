// Cell for generating the force-directed graph simulation


// Initialise the defaults to use (chartData initialised empty)
let _data = {
  chartData: {
    nodes: [],
    links: []
  },
  defaults: {
    force: {
      chargeStrength: -100,
      linkDistance: 20,
    },
    link: {
      colour: "#cccccc",
      width: 2,
      opacity: 0.75,
    },
    node: {
      fill: "#2222bb",
      opacity: 1,
      radius: 5,
      stroke: {
        colour: "#ffffff",
        width: 1.5,
      },
    },
    text: {
      font: {
        size: "5pt",
        weight: "normal",
      },
      visibility: "hidden",
    },
  },
  selector: "#sinkVis",
};

// Generate the chart in the window
window._chart = generateChart(_data);


// -- Function definitions -- //


// Generate the force-directed graph node
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
      .scaleExtent([1 / 2, 8])
      .on("zoom", zoomFunction)
  );
  // -- Internal function definitions -- //
  // Link attribute functions
  function linkColour(d, i) {
    if (d?.colour === undefined) { return def.link.colour; }
    return d.colour;
  };
  function linkWidth(d, i) {
    if (d?.width === undefined) { return def.link.width; }
    return d.width;
  };
  function linkOpacity(d, i) {
    if (d?.opacity === undefined) { return def.link.opacity; }
    return d.opacity;
  };
  function linkId(d, i) {
    return `_link_s${d.source.id}_t${d.target.id}`;
  };
  // Node attribute functions
  function nodeFill(d, i) {
    if (d?.fill === undefined) { return def.node.fill; }
    return d.fill;
  };
  function nodeOpacity(d, i) {
    if (d?.opacity === undefined) { return def.node.opacity; }
    return d.opacity;
  };
  function nodeRadius(d, i) {
    if (d?.radius === undefined) { return def.node.radius; }
    return d.radius;
  };
  function nodeStroke(d, i) {
    if (d?.stroke === undefined) { return def.node.stroke.colour; }
    return d.stroke;
  };
  function nodeStrokeWidth(d, i) {
    if (d?.strokeWidth === undefined) { return def.node.stroke.width; }
    return d.strokeWidth;
  };
  // Text attribute functions
  function textFontSize(d, i) {
    if (d?.fontSize === undefined) { return def.text.font.size; }
    return d.fontSize;
  };
  function textFontWeight(d, i) {
    if (d?.fontWeight === undefined) { return def.text.font.weight; }
    return d.fontWeight;
  };
  function textVisibility(d, i) {
    if (d?.visibility === undefined) { return def.text.visibility; }
    return d.visibility;
  };
  // Simulation tick function
  function tickFunction() {
    node.attr("transform", d => `translate(${d.x}, ${d.y})`);
    link.attr("x1", d => d.source.x)
        .attr("x2", d => d.target.x)
        .attr("y1", d => d.source.y)
        .attr("y2", d => d.target.y);
    text.attr("transform", textTransform);
  };
  // Text transform function
  function textTransform(d, i) {
    let r = +node._groups[0][i].getAttribute("r");
    // ^ This is a bit of a hack, but it was the most proper way
    let off = {x: r + 2, y: r / 2};
    return `translate(${d.x + off.x}, ${d.y + off.y})`;
  };
  // Zoom function
  function zoomFunction({transform}) {
    main_group.attr("transform", transform);
  };
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
          .text(d => d.id)
          .attr("pointer-events", "none")
          .attr("font-size", textFontSize)
          .attr("font-weight", textFontWeight)
          .attr("visibility", textVisibility));
      // Implement node mouseover and mouseout
      let idxLink = new Object();
      links.forEach(l => idxLink[`${l.source}|${l.target}`] = true);
      node.on("mouseover", nodeMouseOver).on("mouseout", nodeMouseOut);
      function isConnected(a, b) {
        let c0 = idxLink[`${a.id}|${b.id}`];
        let c1 = idxLink[`${b.id}|${a.id}`];
        return (c0 || c1);
      };
      function nmoNodeFill(o, j, d) {
        if (isConnected(d, o) || d === o) { return "#ee2222"; }
        return nodeFill(o, j);
      };
      function nmoNodeOpacity(o, j, d) {
        let n0 = nodeOpacity(o, j);
        if (isConnected(d, o) || d === o) { return n0; }
        return 0.15 * n0;
      };
      function nmoNodeStroke(o, j, d) { return nodeStroke(o, j); }
      function nmoNodeStrokeWidth(o, j, d) { return nodeStrokeWidth(o, j); }
      function nmoNodeRadius(o, j, d) { return nodeRadius(o, j); }
      function nmoLinkColour(o, j, d) { return linkColour(o, j); }
      function nmoLinkWidth(o, j, d) { return linkWidth(o, j); }
      // ^ The above five are currently effectively dummy functions, but are
      //   left here to demonstrate potential control.
      function nmoLinkOpacity(o, j, d) {
        let l0 = linkOpacity(o, j);
        let c0 = (o.source.id === d.id) || (o.target.id === d.id);
        if (c0) { return l0; }
        return 0.15 * l0;
      };
      function nmoTextFontSize(o, j, d) { return textFontSize(o, j); }
      // ^ This one's also a dummy at this stage.
      function nmoTextFontWeight(o, j, d) {
        if (d === o) { return "bold"; }
        return textFontWeight(o, j);
      };
      function nmoTextVisibility(o, j, d) {
        if (isConnected(d, o) || d === o) { return "visible"; }
        return textVisibility(o, j);
      };
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
      };
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
      };
      // Reset the simulation
      simulation.stop();
      simulation.nodes(nodes);
      simulation.force("link").links(links);
      simulation.alpha(1).restart();
    }
  })
};

// Simulation -- node drag function
function drag(sim) {
  function dragStart(event, d) {
    if (!event.active) sim.alphaTarget(0.3).restart();
    d.fx = d.x;
    d.fy = d.y;
  };
  function dragging(event, d) {
    d.fx = event.x;
    d.fy = event.y;
  };
  function dragEnd(event, d) {
    if (!event.active) sim.alphaTarget(0);
    d.fx = null;
    d.fy = null;
  };
  return d3.drag()
    .on("start", dragStart)
    .on("drag", dragging)
    .on("end", dragEnd);
};
