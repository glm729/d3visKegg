// Trying a slightly rewritten script for handling KEGG Pathway data.
// CoffeeScript style, I guess (cell is a self-calling function).
// Wanted the shortcut return if reac undefined.
(function handlePathway() {
  // Get pathway ID from the API
  let idPathway = API.getData("idPathway").resurrect();
  // Get KEGG Pathway Reactions and KEGG Reaction Opposing Compounds
  let kpr = API.getData("kpr").resurrect();
  let kroc = API.getData("kroc").resurrect();
  // Get reactions for the current ID
  let reac = kpr[idPathway];
  // If undefined, warn and give feedback, and stop
  if (reac === undefined) {
    let msg = `No KEGG Pathway entry found for ID:  ${idPathway}`;
    _fb.setStatus("negative");
    _fb.message(msg);
    console.warn(msg);
    return;
  };
  // Initialise nodes and links
  let nodes = [];
  let links = [];
  // For each Reaction ID in the reactions array
  for (let idr of reac) {
    // If no opposing compounds for the ID, skip
    if (kroc[idr] === undefined) continue;
    // For each lefthand ID
    kroc[idr].l.forEach(l => {
      // Add node if not yet present
      if (nodes.filter(n => n.id === l).length === 0) nodes.push({id: l});
      // For each righthand ID
      kroc[idr].r.forEach(r => {
        // Add node if not yet present
        if (nodes.filter(n => n.id === r).length === 0) nodes.push({id: r});
        // Push the link source and target
        links.push({source: l, target: r});
      });
    });
  };
  // Create chart data and current node IDs in the API
  API.createData("_chart_data", {nodes: nodes, links: links});
  API.createData("idVisCurrent", nodes);
}).call(this);
