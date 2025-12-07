'use client';

interface PDFViewerProps {
  url: string;
  title?: string;
}

export function PDFViewer({ url, title }: PDFViewerProps) {
  return (
    <div className="bg-gray-100 rounded-lg border border-gray-200 overflow-hidden">
      {title && (
        <div className="px-4 py-2 bg-white border-b border-gray-200">
          <span className="font-medium text-gray-700 text-sm">{title}</span>
        </div>
      )}
      <object
        data={url}
        type="application/pdf"
        width="100%"
        height="700px"
      >
        <p className="p-4 text-center text-gray-600">
          Twoja przeglądarka nie obsługuje wyświetlania PDF.{' '}
          <a href={url} className="text-primary-600 hover:underline">
            Pobierz PDF
          </a>
        </p>
      </object>
    </div>
  );
}
