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
  try {
    await micropip.install([
      'anndata',
      'numpy',
      'pandas',
      'scikit-learn',
      'scipy',
      'statsmodels',
      'matplotlib',
    ]);
  } catch (error) {
    self.postMessage({cmd: 'error', data: error});
  }

  try {
    await micropip.install(['https://files.pythonhosted.org/packages/53/ff/757c56e114a2fcca6026b6faccef762743cd8e9c84a91a67be345755de51/deseqpyodide-0.0.7-py2.py3-none-any.whl'], { keep_going: true, deps: false });
  } catch (error) {
    self.postMessage({cmd: 'error', data: error});
  }
}

// listen for messages from the main threa
self.onmessage = async function (params) {

  switch (params.data['cmd']) {
    case 'install':
      self.postMessage({cmd: 'log', data: 'Installing packages'});
      await initializePyodide();
      await installPackages();
      self.postMessage({cmd: 'log', data: 'Packages installed'});
      break;
    case 'runPython':
      self.postMessage({cmd: 'log', data: 'Running Python code'});
      pyodide.runPython(params.data['data']);
      self.postMessage({cmd: 'log', data: 'Python code finished running'});
      break;
    default:
      self.postMessage({cmd: 'error', data: 'Command unknown'});
  }
};
