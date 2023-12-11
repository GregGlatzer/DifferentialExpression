import { logging } from 'protractor';
import { Component, OnInit } from '@angular/core';
import { PyodideService } from 'app/services/pyodide/pyodide.service';

interface ILogEntry {
  timestamp: string;
  message: string;
}

@Component({
  selector: 'app-diff-exp-widget',
  templateUrl: './diff-exp-widget.component.html',
  styleUrls: ['./diff-exp-widget.component.css']
})
export class DiffExpWidgetComponent implements OnInit {

  private diff_exp_script: string = './diff_exp.py';
  logs: ILogEntry[] = [];

  constructor(private pyodideService: PyodideService) { }

  ngOnInit() {
    this.pyodideService.init(this.loggingCallback.bind(this)).then(() => {
      this.runDiffExp();
    });
  }

  async runDiffExp(): Promise<void> {
    const response = await fetch(this.diff_exp_script);
    const scriptContent = await response.text();
    this.pyodideService.runPythonCode(scriptContent);
  }

  loggingCallback = (message: string) => {
    const now = new Date();
    const date = `${now.getMonth()}-${now.getDate()}-${now.getFullYear()}`;
    const time = `${now.getHours()}:${now.getMinutes()}:${now.getSeconds()}`;
    const timestamp = `${date} ${time}`;
    this.logs.push({
      timestamp,
      message
    });
  }
}
