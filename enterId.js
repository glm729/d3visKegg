// Cell for controlling user input of the KEGG ID


// Find the sink
let sink = document.querySelector("#sinkEnterId");

// Initialise DOM nodes
let container = document.createElement("p");
let feedback = document.createElement("p");
let button = document.createElement("button");
let label = document.createElement("label");
let input = document.createElement("input");

// Add classes
feedback.classList.add("feedback");
button.classList.add("inputSubmitButton");
label.classList.add("inputTextLabel");
input.classList.add("inputText");

// Specify input ID and label target
feedback.setAttribute("id", "inputKeggIdFeedback");
input.setAttribute("id", "inputKeggId");
label.setAttribute("for", "inputKeggId");

// Button attributes
button.innerHTML = "Submit ID";
button.onclick = button_onclick;

// Input attributes
input.type = "text";
input.pattern = /^(map|M)\d{5}$/;

// Label attributes
label.innerHTML = "Enter KEGG Pathway or Module ID:";

// Append the components to the container
container.append(label);
container.append(input);
container.append(button);

// Empty and refresh the sink (though this should only run once)
sink.innerHTML = '';
sink.append(container);
sink.append(feedback);


// -- Function definitions -- //


// Handle KEGG ID submission
function button_onclick() {
  let ip = document.querySelector("#inputKeggId").value;
  let fb = document.querySelector("#inputKeggIdFeedback");
  let cl = [...fb.classList];
  if (cl.indexOf("feedbackPositive") !== -1)
    fb.classList.remove("feedbackPositive");
  if (cl.indexOf("feedbackNegative") !== -1)
    fb.classList.remove("feedbackNegative");
  if (!/^(map|M)\d{5}$/.test(ip)) {
    fb.classList.add("feedbackNegative");
    fb.innerHTML = `ID "${ip}" not recognised as KEGG Pathway or Module ID`;
    return;
  };
  fb.classList.add("feedbackPositive");
  if (/^map\d{5}$/.test(ip)) {
    fb.innerHTML = `ID "${ip}" is a KEGG Pathway ID`;
    API.createData("idPathway", ip);
    return;
  };
  if (/^M\d{5}$/.test(ip)) {
    fb.innerHTML = `ID "${ip}" is a KEGG Module ID`;
    API.createData("idModule", ip);
    return;
  };
  fb.classList.remove("feedbackPositive");
  throw new Error("Unknown error in KEGG ID input submit!");
};
