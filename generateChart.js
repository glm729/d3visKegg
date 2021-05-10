// Cell for running the force-directed graph simulation


// Initialise the defaults to use (chartData initialised empty)
let _data = {
  chartData: {nodes: [], links: []},
  defaults: {
    force: {
      chargeStrength: -100,
      linkDistance: 20,
    },
    link: {
      colour: "#cccccc",
      width: 2,
    },
    node: {
      fill: "#ee2222",
      radius: 5,
      stroke: {
        colour: "#ffffff",
        width: 1.5,
      },
    },
  },
  selector: "#sinkVis",
};

// Generate the chart in the window
window._chart = generateChart(_data);


// -- Function definitions -- //


// Generate the force-directed graph node
function generateChart(_data) {
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
  let link = main_group.append("g")
      .attr("stroke", def.link.colour)
      .attr("stroke-width", def.link.width)
    .selectAll("line");
  let node = main_group.append("g")
      .attr("stroke", def.node.stroke.colour)
      .attr("stroke-width", def.node.stroke.width)
      .attr("fill", def.node.fill)
      .attr("r", def.node.radius)
    .selectAll("circle");
  // Define the simulation tick function
  function tickFunction() {
    node.attr("cx", d => d.x)
        .attr("cy", d => d.y);
    link.attr("x1", d => d.source.x)
        .attr("x2", d => d.target.x)
        .attr("y1", d => d.source.y)
        .attr("y2", d => d.target.y);
  };
  // Define the zoom function
  function zoomFunction({transform}) {
    main_group.attr("transform", transform);
  };
  // Call zoom on the SVG
  svg.call(
    d3.zoom()
      .extent([[0, 0], [width, height]])
      .scaleExtent([1 / 2, 8])
      .on("zoom", zoomFunction)
  );
  // Return the custom DOM node
  return Object.assign(svg.node(), {
    update({nodes, links}) {
      let old = new Map(node.data().map(d => [d.id, d]));
      nodes = nodes.map(d => Object.assign(old.get(d.id) || new Object(), d));
      links = links.map(d => Object.assign(new Object(), d));
      node = node
        .data(nodes, d => d.id)
        .join(enter => enter.append("circle")
          .attr("r", def.node.radius)
          .attr("fill", def.node.fill))
        .call(drag(simulation));
      link = link
        .data(links, d => [d.source, d.target])
        .join("line");
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
