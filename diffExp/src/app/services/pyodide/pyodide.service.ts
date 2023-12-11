// pyodide.service.ts

import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root',
})
export class PyodideService {
  private worker: Worker;

  constructor() {

    // Construct the worker URL based on the app's base URL
    const workerUrl = `assets/scripts/webworker.js`;

    // Create a new Web Worker
    this.worker = new Worker(workerUrl);
  }

  /**
   * @description Initialize Pyodide in the worker. This will install the necessary Python packages to do Differential Expression.
   * @returns
   */
  async init(loggingCallback: (msg: string | {cmd: string; data: string}) => void = () => {}) {
    // Initialize Pyodide in the worker
    this.worker.postMessage({ cmd: 'install', data: null });

    // Wait for the worker to finish initializing Pyodide
    return new Promise<void>((resolve) => {
      this.worker.addEventListener('message', (msg) => {
        loggingCallback(msg.data);
        if (msg.data === 'Packages imported') {
          console.log('Pyodide initialized');
          resolve();
        }
      });
    });
  }

  async runPythonCode(script: string) {
    // Run Python code in the worker
    this.worker.postMessage({ cmd: 'runPython', data: script });
  }
}
