// -- Operations -- //


// Initialise CouchAttachments instance
let couch = new CouchAttachments();

// Fetch attachments list, operate on list, then initialise view
couch.fetchList().then(onFetch).then(init);


// -- Function definitions -- //


// Handle raw attachment data input
async function onFetch(atts) {
  let _data = atts.filter(a => a.filename === "upload/_data.zip");
  if (_data.length !== 1) {
    throw new Error(`Need _data.length === 1, found ${_data.length}`);
  };
  let data = await fetch(_data[0].url).then(r => r.arrayBuffer());
  let uzdt = await unzip(data);
  return uzdt;
};

// Helper to unzip a zip file
async function unzip(data) {
  let out = new Object();
  let jsz = new JSZip();
  let zip = await jsz.loadAsync(data);
  let files = zip.files;
  for (let k in files) {
    let content = await files[k].async("string");
    out[k.replace(/\..+$/, '')] = JSON.parse(content.trimEnd());
  };
  return out;
};

// Initialise the view (create all necessary data)
function init(data) {
  for (let k in data) API.createData(k, data[k]);
  return;
};
