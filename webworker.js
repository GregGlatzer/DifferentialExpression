// import pyodide
self.languagePluginUrl = 'https://cdn.jsdelivr.net/pyodide/v0.23.4/full/';
importScripts('https://cdn.jsdelivr.net/pyodide/v0.23.4/full/pyodide.js');

let pyodide; // define the pyodide variable in a global scope


// initialize pyodide and all packages/dependencies required for the project
async function installPackages() {
    // define pyodide variable and load micropip for installation
    pyodide = await loadPyodide();
    await pyodide.loadPackage('micropip');
    const micropip = pyodide.pyimport('micropip');

    await micropip.install(['anndata', 'numpy', 'pandas', 'scikit-learn', 'scipy', 'statsmodels', 'matplotlib']); // dependencies of pydeseq2
    await micropip.install('deseqpyodide', keep_going=true, deps=false); // modified version of pydeseq2 package, removing compatiblity issues (termios, joblib loky backend)
    // await micropip.install('pydeseq2', keep_going=true, deps=false);

    // fetch test data and unpack into current directory (virtual in-memory file system, by default MEMFS for pyodide)
    let zipResponse = await fetch("https://raw.githubusercontent.com/IvanRatushnyy/DifferentialExpression/main/count_table.zip");
    let zipBinary = await zipResponse.arrayBuffer();
    pyodide.unpackArchive(zipBinary, "zip");
}


// await message from main script, running the specified command
// 'install': installation and intialization of python packages. 'python': run python code.
var onmessage = async function(params) {
    console.log('Worker: Message received from main script');
    
    //switch statement to check given command, more functions may be added later
    switch (params.data['cmd']) {
        case 'install':
            console.log('Importing packages');
            await installPackages();
            self.postMessage('Packages imported');
            break;
        case 'python':
            console.log('Running Python code');
            pyodide.runPython(params.data['data']);
            self.postMessage('Python code finished running');
            break;
        default:
            self.postMessage('Command unknown');
    }
}