let classifier;
let lastLoadedImage = null;

function setup() {
    noCanvas();
    classifier = ml5.imageClassifier('MobileNet', modelLoaded);
    setupImageLoader();
    loadInitialImages();
}

function modelLoaded() {
    console.log('Model Loaded!');
}



function loadInitialImages() {
    ['positiveExamples', 'negativeExamples'].forEach((sectionId, index) => {
        for (let i = 0; i < 3; i++) {
            const imgId = index * 3 + i + 1;
            const imgContainer = document.createElement('div');
            imgContainer.className = 'col-md-6';
            const plotContainer = document.createElement('div');
            plotContainer.className = 'col-md-6';

            const row = document.createElement('div');
            row.className = 'row';

            const img = new Image();
            img.src = `images/bild${imgId}.jpg`;
            img.onload = function() {
                imageLoaded(img, plotContainer);
            };
            img.style.width = '100%';
            img.style.height = 'auto';

            imgContainer.appendChild(img);
            row.appendChild(imgContainer);
            row.appendChild(plotContainer);
            document.getElementById(sectionId).appendChild(row);
        }
    });
}

function setupImageLoader() {
    const imageUpload = document.getElementById('imageUpload');
    const dropZone = document.getElementById('dropZone');
    const classifyButton = document.getElementById('classifyButton');

    imageUpload.addEventListener('change', function(event) {
        handleCustomImageUpload(event.target.files[0]);
    });

    dropZone.addEventListener('dragover', function(event) {
        event.preventDefault();
        dropZone.style.backgroundColor = '#ccc';
    });

    dropZone.addEventListener('dragleave', function() {
        dropZone.style.backgroundColor = '#f8f8f8';
    });

    dropZone.addEventListener('drop', function(event) {
        event.preventDefault();
        handleCustomImageUpload(event.dataTransfer.files[0]);
        dropZone.style.backgroundColor = '#f8f8f8';
    });

    classifyButton.addEventListener('click', function() {
        let plotContainer = document.getElementById('customPlots');
        if (plotContainer && lastLoadedImage) {
            classifyImage(lastLoadedImage, plotContainer);
            classifyButton.style.display = 'none';
        } else {
            console.error('Plot-Container wurde nicht gefunden.');
        }
    });
}

document.getElementById('dropZone').addEventListener('dragover', function(event) {
    event.preventDefault(); 
    event.target.style.backgroundColor = '#f0f0f0'; 
});

document.getElementById('dropZone').addEventListener('dragleave', function(event) {
    event.target.style.backgroundColor = '#fff'; 
});

document.getElementById('dropZone').addEventListener('drop', function(event) {
    event.preventDefault(); 
    event.target.style.backgroundColor = '#fff'; 
    let files = event.dataTransfer.files; 
    if (files.length > 0) {
        let file = files[0];
        if (file.type.match('image.*')) { 
            handleFile(file); 
        } else {
            document.getElementById('alertBox').style.display = 'block';
            document.getElementById('alertBox').innerText = 'Bitte legen Sie eine g\u00fcltige Bilddatei ab.';
        }
    }
});

function handleCustomImageUpload(file) {
    if (file && file.type.startsWith('image')) {
        const reader = new FileReader();
        reader.onload = function(e) {
            const uploadedImage = document.getElementById('uploadedImage');
            uploadedImage.src = e.target.result;
            document.getElementById('uploadedImageContainer').style.display = 'flex'; 
            document.getElementById('classifyButton').style.display = 'block'; 
            
            // Verstecke das vorherige Diagramm
            document.getElementById('customPlots').style.display = 'none'; 
            document.getElementById('customPlots').innerHTML = ''; // Lösche den Inhalt des Diagramm-Containers

            lastLoadedImage = createImg(e.target.result, 'Uploaded Image');
            lastLoadedImage.style('display', 'none'); // Versteckt das p5.js Image-Objekt
        };
        reader.readAsDataURL(file);
    } else {
        console.error('Die hochgeladene Datei ist kein Bild.');
    }
}

function imageLoaded(img, plotContainer) {
    console.log('Bild geladen:', img);
    // Platzhaltertext einfügen, während die Klassifikation noch läuft
    const loadingText = document.createElement('p');
    loadingText.style.textAlign = 'center';
    plotContainer.appendChild(loadingText);
    classifyImage(img, plotContainer);
}

function classifyImage(img, plotContainer) {
    console.log('Klassifizierung gestartet:', img);
    plotContainer.innerHTML = ''; 
    plotContainer.style.display = 'block'; 

    const loadingText = document.createElement('p');
    loadingText.innerText = 'Einen Moment, bitte! ml5 Modell wird geladen.';
    loadingText.style.textAlign = 'center';
    plotContainer.appendChild(loadingText);

    classifier.classify(img, (error, results) => {
        if (error) {
            console.error(error);
            plotContainer.innerHTML = 'Fehler bei der Klassifikation!';
        } else {
            plotContainer.innerHTML = ''; // Alten Inhalt löschen
            displayResults(img, results, plotContainer);
        }
    });
}


function displayResults(img, results, plotContainer) {
    plotResults(results,plotContainer);
}

function adjustLabel(label, maxLength = 20) {
    if (label.length <= maxLength) return label; // Kein Umbruch nötig, wenn das Label kurz genug ist

    // Suche das letzte Leerzeichen vor dem Limit
    let lastSpace = label.substring(0, maxLength).lastIndexOf(' ');
    if (lastSpace > -1) {
        return label.substring(0, lastSpace) + '<br>' + label.substring(lastSpace + 1);
    } else {
        // Kein Leerzeichen gefunden, bricht hart um
        return label.substring(0, maxLength) + '<br>' + label.substring(maxLength);
    }
}

function getColorsForPercentages(percentages) {
    return percentages.map(percent => {
        if (percent >= 95) return 'rgb(27, 94, 32)'; // Dunkelgrün
        else if (percent >= 90) return 'rgb(56, 142, 60)'; // Starkes Grün
        else if (percent >= 85) return 'rgb(67, 160, 71)'; // Helles Starkgrün
        else if (percent >= 80) return 'rgb(102, 187, 106)'; // Grasgrün
        else if (percent >= 75) return 'rgb(129, 199, 132)'; // Blasses Grün
        else if (percent >= 70) return 'rgb(165, 214, 167)'; // Sehr blasses Grün
        else if (percent >= 65) return 'rgb(212, 225, 87)'; // Limonengrün
        else if (percent >= 60) return 'rgb(255, 238, 88)'; // Helles Gelb
        else if (percent >= 55) return 'rgb(255, 213, 79)'; // Gelb
        else if (percent >= 50) return 'rgb(255, 183, 77)'; // Dunkelgelb
        else if (percent >= 45) return 'rgb(255, 152, 0)'; // Orange
        else if (percent >= 40) return 'rgb(251, 140, 0)'; // Starkes Orange
        else if (percent >= 35) return 'rgb(244, 81, 30)'; // Helles Rot
        else if (percent >= 30) return 'rgb(229, 57, 53)'; // Rot
        else if (percent >= 25) return 'rgb(211, 47, 47)'; // Dunkelrot
        else if (percent >= 20) return 'rgb(198, 40, 40)'; // Dunkleres Rot
        else if (percent >= 15) return 'rgb(183, 28, 28)'; // Noch dunkleres Rot
        else if (percent >= 10) return 'rgb(162, 27, 30)'; // Sehr dunkles Rot
        else return 'rgb(123, 31, 162)'; // Violett für sehr niedrige Werte
    });
}


function plotResults(results, container) {
    let totalConfidence = results.reduce((acc, result) => acc + result.confidence, 0);
    let percentages = results.map(result => (result.confidence / totalConfidence * 100).toFixed(1)); // Nur eine Dezimalstelle
    let textLabels = percentages.map(percent => `${percent}%`);
    let colors = getColorsForPercentages(percentages); // Holt die Farben basierend auf den Prozentwerten

    let data = [{
        values: percentages,
        labels: results.map(result => adjustLabel(result.label)),
        type: 'pie',
        hole: 0.4,
        text: textLabels,
        textinfo: 'text',
        hoverinfo: 'label+percent',
        marker: {
            colors: colors,
            line: {
                color: 'white', // Konturlinie zwischen den Segmenten
                width: 2 // Breite der Konturlinie
            }
        },
        insidetextorientation: 'radial',
        pull: [0.02, 0.02, 0.02, 0.02, 0.02] // Kleiner Abstand zwischen den Segmenten
    }];

    let layout = {
        title: 'Klassifikationsergebnis',
        showlegend: true,
        legend: {
            orientation: "h",
            xanchor: "center",
            y: -0.2
            
        },
        autosize: true,
        responsive: true,
        margin: {
            l: 50, 
            r: 50,
            t: 60,
            b: 50
        }
    };

    let config = {
        responsive: true,
        displayModeBar: false
    };

    Plotly.newPlot(container, data, layout, config, {responsive: true});
}
