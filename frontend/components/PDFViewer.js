'use client';

import { useState, useEffect } from 'react';
import { Document, Page, pdfjs } from 'react-pdf';
import { buildPdfPreviewCopy } from '../lib/pdfPreviewCopy';

// Configurar el worker de PDF.js
pdfjs.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjs.version}/pdf.worker.min.js`;

export default function PDFViewer({ fileUrl, fileName, documentTitle, onLoadSuccess, numPages }) {
  const [pdfNumPages, setPdfNumPages] = useState(null);
  const [error, setError] = useState(false);
  const [loading, setLoading] = useState(true);
  const [pageWidth, setPageWidth] = useState(720);
  const previewCopy = buildPdfPreviewCopy({ title: documentTitle, fileName });

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
      <div className="bg-white rounded border border-gray-300 p-4 flex items-center justify-between gap-3 flex-wrap">
        <div>
          <p className="text-xs uppercase tracking-wide text-gray-400 mb-1">{previewCopy.label}</p>
          <p className="text-sm font-semibold text-gray-800">{previewCopy.title}</p>
        </div>
        <a
          href={fileUrl}
          download={fileName}
          className="text-xs text-primary hover:text-green-700 font-medium inline-block px-3 py-2 bg-green-50 rounded"
        >
          Descargar archivo
        </a>
        <div className="w-full text-sm text-gray-500">
          No se pudo cargar la vista previa.
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded border border-gray-300 overflow-hidden">
      <div className="h-[32rem] overflow-y-auto flex items-center justify-center bg-gray-100 p-3">
        {!error && (
          <Document
            file={fileUrl}
            onLoadSuccess={handleLoadSuccess}
            onError={handleLoadError}
            loading={null}
            error={<div className="text-red-500 text-sm">Error al cargar PDF</div>}
          >
            <Page pageNumber={1} width={pageWidth} />
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
