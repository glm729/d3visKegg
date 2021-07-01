// Cell for controlling user input of the KEGG ID


// -- Class definitions -- //

// Helper box to display feedback text
class FeedbackBox {
  constructor() {
    this.element = document.createElement("p");
    this.element.classList.add("feedback-box");
    this.setStatus("neutral");
  };
  setStatus(status) {
    switch (status) {
      case "neutral":
        this.element.classList.remove("feedback-negative");
        this.element.classList.remove("feedback-positive");
        this.status = "neutral";
        break;
      case "positive":
        this.element.classList.remove("feedback-negative");
        this.element.classList.add("feedback-positive");
        this.status = "positive";
        break;
      case "negative":
        this.element.classList.remove("feedback-positive");
        this.element.classList.add("feedback-negative");
        this.status = "negative";
        break;
      default:
        console.warn("FeedbackBox:  No state specified, ignoring");
        break;
    };
    return null;
  };
  queryStatus() {
    return this.status;
  };
  message(text) {
    this.element.innerText = text;
  };
  clearMessage() {
    this.element.innerText = '';
  };
  attachTo(domnode) {
    domnode.appendChild(this.element);
  };
};


// -- Function definitions -- //


// Handle KEGG ID submission
function submitKeggID() {
  let ip = document.querySelector("#inputKeggId").value;
  _fb.setStatus("neutral");
  if (ip === '') {
    _fb.message("No ID entered");
    return;
  };
  if (/^map\d{5}$/.test(ip)) {
    _fb.setStatus("positive");
    _fb.message(`ID "${ip}" is a KEGG Pathway ID`);
    API.createData("idPathway", ip);
    return;
  };
  if (/^M\d{5}$/.test(ip)) {
    _fb.setStatus("positive");
    _fb.message(`ID "${ip}" is a KEGG Module ID`);
    API.createData("idModule", ip);
    return;
  };
  _fb.setStatus("negative");
  _fb.message(`ID "${ip}" not recognised as KEGG Pathway or Module ID`);
  return;
};


// -- Operations -- //


// Initialise feedback box
window._fb = new FeedbackBox();

// Find the sink
let sink = document.querySelector("#sinkEnterId");

// Initialise DOM nodes
let container = document.createElement("p");
let button = document.createElement("button");
let label = document.createElement("label");
let input = document.createElement("input");

// Add classes
button.classList.add("inputSubmitButton");
label.classList.add("inputTextLabel");
input.classList.add("inputText");

// Specify input ID and label target
input.setAttribute("id", "inputKeggId");
label.setAttribute("for", "inputKeggId");

// Button attributes
button.innerHTML = "Submit ID";
button.onclick = submitKeggID.bind(this);

// Input attributes
input.type = "text";
input.pattern = "^(map|M)\d{5}$";

// Label attributes
label.innerHTML = "Enter KEGG Pathway or Module ID:";

// Append the components to the container
container.append(label);
container.append(input);
container.append(button);

// Empty and refresh the sink (though this should only run once)
sink.innerHTML = '';
sink.append(container);
_fb.attachTo(sink);
