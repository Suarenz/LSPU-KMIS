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