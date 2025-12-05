# Unified System Integration Guide: TypeScript + Python OCR

This guide details how to set up a "Sidecar" architecture where a TypeScript backend automatically launches a Python Flask server for OCR tasks using a single command.

## 1. Project Structure
Organize your project folder to keep the Node.js and Python logic separate but manageable.

```
/my-kmis-project
├── /ocr-service           # [PYTHON] The PaddleOCR Microservice
│   ├── app.py             # Flask Server Code
│   └── requirements.txt   # Python Dependencies
├── /src                   # [TYPESCRIPT] Your Main KMIS Backend
│   ├── services
│   │   └── ocr.service.ts # Bridge to talk to Python
│   └── index.ts           # Main Node Entry point
├── package.json           # [CONFIG] Scripts to run both
└── tsconfig.json
```

## 2. System Prerequisites
Before coding, ensure your machine has the required system tools installed.
- Node.js: (v18 or higher)
- Python: (v3.8 or higher)
- Poppler: Required for reading PDF files.
  - Windows: Download Binary, extract, and add the bin folder to your System PATH variables.
  - Mac: `brew install poppler`
  - Linux: `sudo apt-get install poppler-utils`

## 3. Setup The Python Microservice

### A. Install Dependencies
Navigate to your project root and create the folder.

```bash
mkdir ocr-service
```

Create ocr-service/requirements.txt:

```
flask
paddlepaddle
paddleocr>=2.7
opencv-python-headless
pdf2image
numpy
```

Install them:

```bash
pip install -r ocr-service/requirements.txt
```

### B. Create the Flask App
Create ocr-service/app.py. This script runs on Port 5000.

```python
import logging
import cv2
import numpy as np
from flask import Flask, request, jsonify
from paddleocr import PPStructure
from pdf2image import convert_from_bytes

app = Flask(__name__)

# Initialize PP-Structure (Table Recognition)
# show_log=False keeps the console clean for the concurrently output
ocr_engine = PPStructure(show_log=False, table=True, layout=False, lang='en')

@app.route('/extract', methods=['POST'])
def extract():
    if 'file' not in request.files:
        return jsonify({'error': 'No file provided'}), 400
    
    file = request.files['file']
    filename = file.filename.lower()
    
    try:
        images = []
        
        # Handle PDF
        if filename.endswith('.pdf'):
            pil_images = convert_from_bytes(file.read())
            for p_img in pil_images:
                img = np.array(p_img)
                img = cv2.cvtColor(img, cv2.COLOR_RGB2BGR)
                images.append(img)
        # Handle Images
        elif filename.endswith(('.jpg', '.jpeg', '.png')):
            file_bytes = np.frombuffer(file.read(), np.uint8)
            img = cv2.imdecode(file_bytes, cv2.IMREAD_COLOR)
            images.append(img)
        else:
            return jsonify({'error': 'Invalid file type'}), 400

        results = []

        # Process Pages
        for i, img in enumerate(images):
            output = ocr_engine(img)
            
            for region in output:
                if region['type'] == 'table':
                    results.append({
                        "page": i + 1,
                        "type": "table",
                        "html": region['res']['html']
                    })
                elif region['type'] == 'text':
                     text_lines = [line['text'] for line in region['res']]
                     results.append({
                        "page": i + 1,
                        "type": "text",
                        "content": " ".join(text_lines)
                     })

        return jsonify({"status": "success", "data": results})

    except Exception as e:
        return jsonify({'error': str(e)}), 500

if __name__ == '__main__':
    print("🐍 Python OCR Service is ready on Port 5000")
    app.run(host='0.0.0', port=5000)
```

## 4. Setup The TypeScript Backend

### A. Install Node Dependencies
Go to your root folder and install the necessary tools, including concurrently and axios.

```bash
npm install axios form-data
npm install concurrently ts-node nodemon --save-dev
```

### B. Create the OCR Service Bridge
Create src/services/ocr.service.ts. This allows Node to send files to Python.

```typescript
import axios from 'axios';
import FormData from 'form-data';
import fs from 'fs';

export class OCRService {
  // We target the Python Flask server
  private pythonUrl = 'http://127.0.0.1:5000/extract';

  async processFile(filePath: string): Promise<any[]> {
    try {
      const formData = new FormData();
      formData.append('file', fs.createReadStream(filePath));

      const response = await axios.post(this.pythonUrl, formData, {
        headers: { ...formData.getHeaders() },
        maxContentLength: Infinity,
        maxBodyLength: Infinity
      });

      if (response.data.status === 'success') {
        return response.data.data;
      } else {
        throw new Error(response.data.error);
      }
    } catch (error: any) {
      console.error("❌ OCR Error:", error.message);
      throw new Error("Failed to communicate with Python OCR Service.");
    }
  }
}
```

## 5. Configure "Concurrently" (The Automation)
This is the most important step. We configure package.json to launch both servers with one command.

Open package.json and find the "scripts" section. Replace or update it with this:

```json
"scripts": {
  "build": "tsc",
  
  "start:node": "ts-node src/index.ts",
  "start:python": "cd ocr-service && python app.py",
  
  "dev": "concurrently --kill-others -n \"TS,PY\" -c \"blue,yellow\" \"npm run start:node\" \"npm run start:python\""
}
```

What these flags do:
- `--kill-others`: If you stop one process (Ctrl+C), it kills the other one automatically so you don't have orphan processes running in the background.
- `-n "TS,PY"`: Labels your console logs so you know which line comes from TypeScript (TS) and which comes from Python (PY).
- `-c "blue,yellow"`: Colors the logs for easy reading.

## 6. How to Run & Test

### 1. Create a Dummy Entry Point
Ensure you have a src/index.ts to keep the Node server alive.

```typescript
// src/index.ts
import express from 'express';

const app = express();
const PORT = 3000;

app.get('/', (req, res) => {
  res.send('KMIS Backend is Running');
});

app.listen(PORT, () => {
  console.log(`🚀 TypeScript Server ready on Port ${PORT}`);
});
```

### 2. The Launch Command
Open your terminal in the root folder and run:

```bash
npm run dev
```

### 3. Expected Output
You should see both servers starting up in the same terminal window:

```
[TS] 🚀 TypeScript Server ready on Port 300
[PY] 🐍 Python OCR Service is ready on Port 5000