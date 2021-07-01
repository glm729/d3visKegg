// Cell for preparing KEGG Module data to send to the simulation.
// Rewritten as in handlePathway.
(function handleModule() {
  // Get the module ID from the API
  let idModule = API.getData("idModule").resurrect();
  // Get the KEGG Module Reactions and KEGG Reaction Opposing Compounds
  let kmr = API.getData("kmr").resurrect();
  let kroc = API.getData("kroc").resurrect();
  // Get the reactions array for the Module ID
  let reac = kmr[idModule];
  // If reactions undefined, warn and give feedback, and stop
  if (reac === undefined) {
    let msg = `No KEGG Module entry found for ID:  ${idModule}`;
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
      // Add node if not already present
      if (nodes.filter(n => n.id === l).length === 0) nodes.push({id: l});
      // For each righthand ID
      kroc[idr].r.forEach(r => {
        // Add node if not yet present
        if (nodes.filter(n => n.id === r).length === 0) nodes.push({id: r});
        // Add the link entry (source and target)
        links.push({source: l, target: r});
      });
    });
  };
  // Create chart data and current node IDs in the API
  API.createData("_chart_data", {nodes: nodes, links: links});
  API.createData("idVisCurrent", nodes);
}).call(this);
