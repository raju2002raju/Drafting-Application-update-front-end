import React, { useState } from 'react';
import * as pdfjsLib from 'pdfjs-dist/webpack';
import Tesseract from 'tesseract.js';
import mammoth from 'mammoth';

// Set the workerSrc for pdfjsLib
pdfjsLib.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjsLib.version}/pdf.worker.min.js`;

const UploadImagePdf = () => {
  const [extractedText, setExtractedText] = useState('');

  const handleFileChange = async (event) => {
    const file = event.target.files[0];
    if (!file) return;

    const fileType = file.type;

    if (fileType === 'application/pdf') {
      extractTextFromPDF(file);
    } else if (fileType.startsWith('image/')) {
      extractTextFromImage(file);
    } else if (fileType === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document') {
      extractTextFromDocx(file);
    }
  };

  const extractTextFromPDF = async (file) => {
    const reader = new FileReader();
    reader.onload = async function () {
      const typedArray = new Uint8Array(this.result);
      const pdf = await pdfjsLib.getDocument(typedArray).promise;
      let text = '';
      for (let i = 0; i < pdf.numPages; i++) {
        const page = await pdf.getPage(i + 1);
        const content = await page.getTextContent();
        content.items.forEach(item => {
          text += item.str + ' ';
        });
      }
      setExtractedText(text);
    };
    reader.readAsArrayBuffer(file);
  };

  const extractTextFromImage = (file) => {
    Tesseract.recognize(file, 'eng')
      .then(({ data: { text } }) => {
        setExtractedText(text);
      })
      .catch((err) => {
        console.error(err);
      });
  };

  const extractTextFromDocx = (file) => {
    const reader = new FileReader();
    reader.onload = function (event) {
      mammoth.extractRawText({ arrayBuffer: event.target.result })
        .then((result) => {
          setExtractedText(result.value);
        })
        .catch((err) => {
          console.error(err);
        });
    };
    reader.readAsArrayBuffer(file);
  };

  return (

    <div>

   <div style={{ display: 'flex', justifyContent: 'center', padding: '20px' }}>
      <div className='main_container'>
        <div className='container'>
          <h1>Upload Draft Here </h1>
          <p>Supported Files :- PDF, DOCS File and Image</p>
          <input type='file' onChange={handleFileChange} />
          {/* <button> START</button> */}
      {extractedText && (
        <textarea value={extractedText} readOnly rows={10} cols={50} />
      )}
        </div>
      </div>
    </div>
    </div>
  );
};

export default UploadImagePdf;
