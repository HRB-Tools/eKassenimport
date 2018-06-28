var loadedJSON = {}; // Dauerhafte Einstellungen
var tempSettings = []; // Temporäre Einstellungen aus den Feldern
var saveDefault;

/*******************************************************************
          ┏━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┓
          ┃                      To-Do Liste                      ┃
          ┃        -Module verwenden (recyclen)                   ┃
          ┃        -Export als CSV Datei                          ┃
          ┃        -Testen mit versch. Dateien                    ┃
          ┃                                                       ┃
          ┃                                                       ┃
          ┃                                                       ┃
          ┗━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┛



/********************* Funktionen zum Einlesen *********************/
function init(){
  loadJSON("settings", function(response){
    loadedJSON = JSON.parse(response); //responseText in JSON parsen
  });
}
function loadJSON(filename, callback) {
  var jName = filename + ".JSON";
  var xobj = new XMLHttpRequest();
  xobj.overrideMimeType("application/json");
  xobj.open('GET', jName, true);
  xobj.onreadystatechange = function() {
    if (xobj.readyState == 4 && xobj.status == "200") {
      if (callback) {
        callback(xobj.responseText);
      }
    }
  };
  xobj.send(null);
}
init();
function einlesen(){
  var fieldValues = [] ;
  var pflichtfelder = [];
  var optional = [];
  var format = [];
  var alternative = [];
  var date = [];
  var temp = document.getElementsByClassName("fieldValues");
  for ( var i = 0; i < temp[0].length; i++ ) {
    if ( temp[0][i].tagName == "INPUT" ){
      var tt = temp[0][i];
      fieldValues.push(tt);
      var tte = tt.parentElement.className;
      if ( tte == "Pflichtfelder" ) {
        pflichtfelder.push(tt);
      } else if ( tte == "Optional" ) {
        optional.push(tt);
      } else if ( tte == "date" ) {
        date.push(tt);
      } else if ( tte == "format" ) {
        format.push(tt);
      }
    }
  }
  for ( var i = 0; i < fieldValues.length; i++ ){
    tempSettings.push(fieldValues[i].value);
  }
  save();
}
/*******************************************************************/

/********************* Funktionen zum Speichern *********************/
function cpyValues(a){
  var tempObject = {
    "Konto" : "-1",
    "Gegenkonto" : "-1",
    "SollHaben" : "-1",
    "BU" : "-1",
    "Umsatz" : " ",
    "Datum" : " ",
    "Belegfeld 1": "-1",
    "Buchungstext" : "4",
    "WKZ" : "5",
    "lfdNr" : "11",
    "separator" : ";",
    "newline" : "\r\n",
    "Belegdatum" : ".",
    "day" : "1",
    "month" : "2",
    "year" : "3",
    "umsatzSoll" : "7",
    "umsatzHaben" : "6"
    }
  var j = 0;
  for ( var i in tempObject ) {
    tempObject[i] = a[j];
    console.log(a[j]);
    j++;
  }
  return tempObject;
}
function save(){
  var tempJSON = cpyValues(tempSettings);
  console.log(tempJSON);
  saveDefault = tempJSON;
  var pp = JSON.stringify(tempJSON);
  var blob = new Blob([pp]);
  var url = URL.createObjectURL(blob);
  var link = document.createElement("a");
  link.setAttribute("href", url);
  link.setAttribute("download", "settings.JSON");
  link.style.visibility = 'hidden';
  document.body.appendChild(link);
  var https = require('https'); var fs = require('fs'); const remote = require('electron').remote, app = require('electron').remote.app; //Electron Modules
  var basepath = app.getAppPath();
  var fReader = new FileReader();
  fReader.addEventListener("loadend", function(){
    file.write(fReader.result);
  });
  fReader.readAsBinaryString(blob);
  var file = fs.createWriteStream(basepath + '/settings.JSON');
  document.body.removeChild(link);
  document.getElementById("success").className = 'vis';
  setTimeout(invis, 1200)
}
function invis(){
  document.getElementById("success").classList.remove("vis");
  document.getElementById("success").className = 'invis';
}
/*******************************************************************/

/********************* Funktionen zum CSV-Import *********************/
var reader = new FileReader();
var buchungen = [[]];
var filein;
var csv = [[]]; //CSV table for output
function cl(a) {
  console.log(a);
}
reader.addEventListener("loadend", function(){
  var text = reader.result;
  //console.log(text);
  var temp1 = loadedJSON["newline"];
  if ( temp1 == "CR" ) {
    temp1 = String.fromCharCode(13);
  } else if ( temp1 == "LF" ) {
    temp1 = String.fromCharCode(10);
  } else if ( temp1 == "CRLF" ) {
    temp1 = String.fromCharCode(13) + String.fromCharCode(10);
  }
  var buchungssaetze = text.split(temp1);
  for ( var i = 0; i < buchungssaetze.length; i++ ) {
    var satz = buchungssaetze[i].split(loadedJSON["separator"]);
    buchungen[i] = satz;
    if ( i == buchungssaetze.length - 1 && i > 1 ) {
      setTimeout(invis, 1200);
    }
  }
  csv = assignFieldValues();
  // exportToCsv(csv);
});
window.onload = function () {
  filein = document.getElementById("fileinput");
  filein.addEventListener("change", function(){reader.readAsText(this.files[0])});
}
function importieren(){
  filein.click();
}
function assignFieldValues(){
  var tempBuchungsStapel = [];
  for ( var i = 1; i < buchungen.length - 1; i++ ) {
    tempBuchungsStapel[i-1] = createRow(buchungen[i], false);
  }
  return tempBuchungsStapel;
}
function createRow(array, b){
  var subArray = new Array(115);
  subArray.fill('""');
  var tempDate = array[loadedJSON["Datum"]-1].split(loadedJSON["Belegdatum"]);
  var mm = tempDate[loadedJSON["month"]-1];
  var dd = tempDate[loadedJSON["day"]-1];
  var yyyy = tempDate[loadedJSON["year"]-1];
  tempDate = dd + '' + mm;
  console.log(tempDate);
  subArray[0] = array[loadedJSON["Umsatz"]-1]; //Umsatz
  subArray[7] = array[loadedJSON["Gegenkonto"]-1]; //Gegenkonto
  subArray[9] = tempDate; //Datum
  subArray[6] = array[loadedJSON["Konto"]-1]; //Konto
  subArray[13] = array[loadedJSON["Buchungstext"]-1]; //Buchungstext
  subArray[1] = array[loadedJSON["WKZ"]-1].slice(1); //WKZ
  if ( b === true ) {
    subArray[36] = array[6]; //KOST1  Existiert momentan nicht!!
    subArray[10] = array[7]; //Belegfeld1 - OPOS Kostenstelle
  }
  return subArray;
}
/*******************************************************************/

/********************* Funktionen zum CSV-Export *********************/
