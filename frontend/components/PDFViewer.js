'use client';

import { useState, useEffect } from 'react';
import { Document, Page, pdfjs } from 'react-pdf';

// Configurar el worker de PDF.js
pdfjs.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjs.version}/pdf.worker.min.js`;

export default function PDFViewer({ fileUrl, fileName, onLoadSuccess, numPages }) {
  const [pdfNumPages, setPdfNumPages] = useState(null);
  const [error, setError] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const timeout = setTimeout(() => {
      if (loading) {
        setError(true);
        setLoading(false);
      }
    }, 10000); // 10 segundos de timeout

    return () => clearTimeout(timeout);
  }, [loading]);

  const handleLoadSuccess = (pdf) => {
    setPdfNumPages(pdf.numPages);
    setError(false);
    setLoading(false);
    if (onLoadSuccess) {
      onLoadSuccess(pdf);
    }
  };

  const handleLoadError = () => {
    setError(true);
    setLoading(false);
  };

  if (error) {
    return (
      <div className="bg-white rounded border border-gray-300 p-6 text-center">
        <div className="text-red-500 text-sm font-medium mb-3">Error al cargar PDF</div>
        <a
          href={fileUrl}
          download={fileName}
          className="text-xs text-primary hover:text-green-700 font-medium inline-block px-3 py-2 bg-green-50 rounded"
        >
          Descargar archivo
        </a>
      </div>
    );
  }

  return (
    <div className="bg-white rounded border border-gray-300 overflow-hidden">
      <div className="h-96 overflow-y-auto flex items-center justify-center bg-gray-100">
        {loading && <div className="text-gray-500 text-sm">Cargando PDF...</div>}
        {!error && (
          <Document
            file={fileUrl}
            onLoadSuccess={handleLoadSuccess}
            onError={handleLoadError}
            loading={<div className="text-gray-500 text-sm">Cargando PDF...</div>}
            error={<div className="text-red-500 text-sm">Error al cargar PDF</div>}
          >
            <Page pageNumber={1} width={500} />
          </Document>
        )}
      </div>
      <div className="bg-white p-3 border-t border-gray-200 flex items-center justify-between">
        <p className="text-xs text-gray-500">Página 1 de {pdfNumPages || numPages || '...'}</p>
        <a
          href={fileUrl}
          download={fileName}
          className="text-xs text-primary hover:text-green-700 font-medium"
        >
          Descargar PDF completo
        </a>
      </div>
    </div>
  );
}
