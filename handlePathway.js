// Cell for preparing KEGG Pathway data to send to the simulation


// Get the pathway ID from the API
let idPathway = API.getData("idPathway").resurrect();

// Get the KEGG Pathway Reactions and KEGG Reaction Opposing Compounds
let kpr = API.getData("kpr").resurrect();
let kroc = API.getData("kroc").resurrect();

// Get the reactions array for the pathway ID
let reac = kpr[idPathway];

// If undefined, warn in the console and give feedback
if (reac === undefined) {
  let fb = document.querySelector("#inputKeggIdFeedback");
  let cl = [...fb.classList];
  if (cl.indexOf("feedbackPositive") !== -1)
    fb.classList.remove("feedbackPositive");
  if (cl.indexOf("feedbackNegative") === -1)
    fb.classList.add("feedbackNegative");
  fb.innerHTML = `No KEGG Pathway entry found for ID:  ${idPathway}`;
  console.warn(`No KEGG Pathway entry found for ID:  ${idPathway}`);
} else {
  let nodes = new Array();
  let links = new Array();
  for (let idr of reac) {
    if (kroc[idr] === undefined) continue;
    kroc[idr].l.forEach(l => {
      if (nodes.filter(n => n.id === l).length === 0) {
        nodes.push({id: l});
      };
      kroc[idr].r.forEach(r => {
        if (nodes.filter(n => n.id === r).length === 0) {
          nodes.push({id: r});
        };
        links.push({source: l, target: r});
      });
    });
  };
  API.createData("_chart_data", {nodes: nodes, links: links});
};
