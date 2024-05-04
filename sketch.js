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
      let resultText = `Label: ${results[0].label}, Confidence: ${(results[0].confidence * 100).toFixed(2)}%`;
      let resultDiv = createDiv(resultText);
      resultDiv.parent(img.elt.parentNode);

      // Erstellen eines Containers für das Diagramm direkt unter dem Bild
      let plotContainer = createDiv('');
      plotContainer.style('width', '400px');
      plotContainer.style('height', '300px');
      plotContainer.parent(img.elt.parentNode);
      plotContainer.class('plot');
      
      // Visualisierung der Ergebnisse als Balkendiagramm im neuen Container
      plotResults(results, plotContainer.elt);
    }
  });
}

function plotResults(results, container) {
  let labels = results.map(result => result.label);
  let confidences = results.map(result => result.confidence * 100); // Umwandlung in Prozent

  let data = [{
    x: labels,
    y: confidences,
    type: 'bar',
    text: confidences.map(String),
    textposition: 'auto',
    marker: {
      color: 'rgb(158,202,225)',
      opacity: 0.6,
      line: {
        color: 'rgb(8,48,107)',
        width: 1.5
      }
    }
  }];

  let layout = {
    title: 'Klassifikationsergebnisse',
    xaxis: {
      title: 'Label'
    },
    yaxis: {
      title: 'Confidence (%)'
    }
  };

  Plotly.newPlot(container, data, layout);
}

function imageLoaded() {
  console.log('Bild geladen:', this);
  classifyImage(this);
}
