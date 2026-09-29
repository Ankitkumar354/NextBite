const { spawn } = require('child_process');
const path = require('path');

exports.analyzeFoodImage = (imagePath) => {
    return new Promise((resolve, reject) => {
        const scriptPath = path.join(__dirname, '../ml/assess_quality.py');
        const pythonPath = path.join(__dirname, '../venv/Scripts/python.exe');

        const pythonProcess = spawn(pythonPath, [scriptPath, imagePath]);

        let outputData = '';

        pythonProcess.stdout.on('data', (data) => {
            outputData += data.toString();
        });

        pythonProcess.stderr.on('data', (data) => {
            // Log it, but DO NOT reject. PyTorch download progress bars show up here!
            console.warn(`Vision ML Log: ${data}`);
        });

        pythonProcess.on('close', (code) => {
            if (code !== 0) {
                return reject(`Python script exited with code ${code}`);
            }
            try {
                const result = JSON.parse(outputData);
                resolve(result);
            } catch (err) {
                reject("Failed to parse ML Vision output");
            }
        });
    });
};