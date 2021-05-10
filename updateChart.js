// Try to get the chart and throw an error if undefined
let chart = window._chart;
if (chart === undefined) { throw new Error("window._chart not defined!"); }

// Pull in the visualisation data
let data = API.getData("_chart_data").resurrect();

// Update the chart
chart.update({nodes: data.nodes, links: data.links});
