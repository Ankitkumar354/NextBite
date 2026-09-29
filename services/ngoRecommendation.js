const { spawn } = require('child_process');
const path = require('path');

exports.recommendNearestNGO = (kitchenLat, kitchenLon) => {
    return new Promise((resolve, reject) => {
        const scriptPath = path.join(__dirname, '../ml/predict_nearest.py');
        const pythonPath = path.join(__dirname, '../venv/Scripts/python.exe');

        const pythonProcess = spawn(pythonPath, [scriptPath, kitchenLat, kitchenLon]);

        let outputData = '';

        pythonProcess.stdout.on('data', (data) => {
            outputData += data.toString();
        });

        pythonProcess.stderr.on('data', (data) => {
            console.warn(`Recommendation ML Log: ${data}`);
        });

        pythonProcess.on('close', (code) => {
            if (code !== 0) {
                return reject(`Python script exited with code ${code}`);
            }
            try {
                const result = JSON.parse(outputData);
                resolve(result);
            } catch (err) {
                reject("Failed to parse ML output");
            }
        });
    });
};