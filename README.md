This is a standalone application that runs a differential expression analysis test in a web worker.

To set up, download the HTML and Javascript files.
The data is fetched using requests tracing to this repository, so download is simply to view the zipped data file.

Once a directory is created, download requirements of the deseqpyodide (modified version of pydeseq2) package using pip. 

```bash
py -m pip install deseqpyodide
```

I am using Visual Studio Code, Python 3.11.4, and Powershell on my system.

Finally, the HTML file can be ran on a local server (I use the live server extenstion for VS Code), and the console can be brought up with F12.

Results should be brought up in the console. Network and memory developer tools can be used to check that requests are retrieving data correctly.


On my local machine, results take about 3 minutes and 40 seconds, with an output that looks like this:

<img width="864" alt="output" src="https://github.com/IvanRatushnyy/DifferentialExpression/assets/108242614/2d489bda-b27e-4443-91e5-e90609a77ba8">
