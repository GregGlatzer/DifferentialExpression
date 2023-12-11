// pyodide-worker.js

self.languagePluginUrl = 'https://cdn.jsdelivr.net/pyodide/v0.23.4/full/';
importScripts('https://cdn.jsdelivr.net/pyodide/v0.23.4/full/pyodide.js');

// Override console.log to capture logs
const originalConsoleLog = console.log;
console.log = function (message) {
  // Send log messages to the main thread
  self.postMessage(message);
  // Call the original console.log
  originalConsoleLog.apply(console, arguments);
};

let pyodide;

// initialize Pyodide and packages
async function initializePyodide() {
  pyodide = await self.loadPyodide();
  await pyodide.loadPackage('micropip');
}

// install Python packages
async function installPackages() {
  const micropip = pyodide.pyimport('micropip');
  await micropip.install([
    'anndata',
    'numpy',
    'pandas',
    'scikit-learn',
    'scipy',
    'statsmodels',
    'matplotlib',
  ]);
  await micropip.install('deseqpyodide', { keep_going: true, deps: false });
}

// listen for messages from the main threa
self.onmessage = async function (params) {

  switch (params.data['cmd']) {
    case 'install':
      self.postMessage('Installing packages');
      await initializePyodide();
      await installPackages();
      self.postMessage('Packages imported');
      break;
    case 'runPython':
      self.postMessage('Running Python code');
      pyodide.runPython(params.data['data']);
      self.postMessage('Python code finished running');
      break;
    default:
      self.postMessage('Command unknown');
  }
};
