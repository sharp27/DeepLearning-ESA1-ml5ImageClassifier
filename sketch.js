let classifier = ml5.imageClassifier('MobileNet', modelLoaded);
let lastLoadedImage = null;

function modelLoaded() {
  console.log('Model Loaded!');
}

function setup() {
  noCanvas();
  setupImageLoader();
  for (let i = 0; i < 6; i++) {
    let img = createImg(`images/bild${i+1}.jpg`, () => imageLoaded.call(img));
    img.style('width', '400px');
    img.style('height', '400px');
    img.parent('imageContainer');
  }
}

function setupImageLoader() {
  const imageUpload = select('#imageUpload');
  imageUpload.changed(event => handleImageUpload(event.target.files[0]));

  const dropZone = select('#dropZone');
  dropZone.dragOver(() => dropZone.style('background-color', '#ccc'));
  dropZone.dragLeave(() => dropZone.style('background-color', '#f8f8f8'));
  dropZone.drop(handleImageUpload, () => dropZone.style('background-color', '#f8f8f8'));

  const classifyButton = select('#classifyButton');
  classifyButton.mousePressed(() => {
    if (lastLoadedImage) {
      classifyImage(lastLoadedImage);
      lastLoadedImage = null; // Zurücksetzen nach der Klassifizierung
      classifyButton.style('display', 'none'); // Button ausblenden
    }
  });
}

function handleImageUpload(file) {
  if (file.type && file.type.startsWith('image')) {
    let img = createImg(file.data || URL.createObjectURL(file), () => imageReady(img));
    img.style('width', '400px');
    img.style('height', '400px');
    img.parent('imageContainer');
  } else {
    console.error('Datei ist kein Bild.');
  }
}

function imageReady(img) {
  console.log('Bild geladen und bereit zur Klassifizierung:', img);
  lastLoadedImage = img; // Speichern des zuletzt geladenen Bildes
  select('#classifyButton').style('display', 'inline');
}

function classifyImage(img) {
  console.log('Klassifizierung gestartet:', img);
  classifier.classify(img, (error, results) => {
    if (error) {
      console.error(error);
    } else {
      let resultText = `Label: ${results[0].label}, Confidence: ${nf(results[0].confidence, 0, 2)}`;
      let resultDiv = createDiv(resultText);
      resultDiv.parent(img.elt.parentNode);
    }
  });
}

function imageLoaded() {
  console.log('Bild geladen:', this);
  classifyImage(this);
}
