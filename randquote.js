// randquote.js
// Store, delete and print quotes

// Stockage : quotes.json là ou l'on exécute le script

// Structure des données
// =====================
//  - supprimer des quotes implique d'avoir des quotes identifiées
//    => <id> : <valeur>
//    => Objet { key: value, key: value, key:value }...
//    => Map
//  - la sauvegarde dans un fichier json implique de pouvoir sérialiser
//    et désérialiser la collection des quotes
//  - la séléction aléatoire des quotes suppose de lister les clés et de
//    sélectionner une clé au hasard puis de remonter la quote correspondante.

// ==> on utilise un Objet { key: value, key: value ... } et pas une Map pour
// des raisons de sérialisation / désérialisation

// dépendances
const _ = require('lodash');
const fs = require('fs');
const path = require('path');

// récupération du répertoire courant pour stocker / lire la collection
const { cwd } = process;
const workdir = cwd();
const db = path.join(workdir, 'quotes.db.json');

// copie de la collection de quotes en mémoire
let quotes = {};

// primitives de lecture et écriture de données dans un fichier
function pReadFile(path, options) {
  return new Promise((resolve, reject) => {
    fs.readFile(path, options, (err, data) => {
      if(err) {
        reject(err);
      } else {
        resolve(data);
      }
    });
  });
}

function pWriteFile(path, data, options) {
  return new Promise((resolve, reject) => {
    fs.writeFile(path, data, (err) => {
      if(err) {
        reject(err);
      } else {
        resolve();
      }
    });
  });
}

async function loadData() {
  const encoding = 'utf-8';
  const flags = 'a+';

  // Ensure file exists before reading it
  fs.closeSync(fs.openSync(db, 'a'));

  // Read data from file (even empty)
  const data = await pReadFile(db, { encoding, flags });

  try {
    quotes = JSON.parse(data);
  } catch(err) {
    quotes = {};
    await saveData();
  }
}

async function saveData() {
  const data = JSON.stringify(quotes);
  await pWriteFile(db, data);
}

async function setQuote(label, quote) {
  quotes[label] = quote;
  await saveData();
}

async function rmQuote(label) {
  delete quotes[label];
  await saveData();
}

async function getQuote(label) {
  return quotes[label];
}

(async () => {
  await loadData(); // on charge les données au début de l'exécution du script

  require('yargs')
    .scriptName("randquote")
    .usage("$0 <cmd> [args]")
    .command("set [label] [quote]", "Add a quote", (yargs) => {
      yargs.positional('label', {
        type: 'string',
        description: 'the label of the quote'
      }).positional('quote', {
        type: 'string',
        default: 'Lorem Ipsum',
        description: 'the quote itself'
      });
    }, async function(argv) {
      const { label, quote } = argv;
      await setQuote(label, quote);
    })
    .command("rm [label]", "Remove a quote", (yargs) => {
      yargs.positional('label', {
        type: 'string',
        description: 'the label of the quote'
      });
    }, async function(argv) {
      const { label } = argv;
      await rmQuote(label);
    })
    .command("get [label]", "Print a given quote", (yargs) => {
      yargs.positional('label', {
        type: 'string',
        description: 'the label of the quote'
      });
    }, async function(argv) {
      const { label } = argv;
      const quote = await getQuote(label);
      console.log(quote);
    })
    .help()
    .argv
})();
