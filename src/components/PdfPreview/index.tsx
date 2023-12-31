"use client";

import { useCallback, useState } from "react";
import { useResizeObserver } from "@wojtekmaj/react-hooks";
import { pdfjs, Document, Page } from "react-pdf";
import "react-pdf/dist/esm/Page/AnnotationLayer.css";
import "react-pdf/dist/esm/Page/TextLayer.css";
import styles from "./index.module.css"; // Import the CSS module
import type { PDFDocumentProxy } from "pdfjs-dist";
import LoadingSpinner from "@/components/LoadingSpinner";
import { usePdfContext } from "../../contexts/PdfContext";

// React PDF Configuration
pdfjs.GlobalWorkerOptions.workerSrc = new URL(
  "pdfjs-dist/build/pdf.worker.min.js",
  import.meta.url
).toString();

const options = {
  cMapUrl: "/cmaps/",
  standardFontDataUrl: "/standard_fonts/",
};

const resizeObserverOptions = {};

const maxWidth = 800;

const PdfPreview = () => {
  const { pdfFiles, setPdfFiles } = usePdfContext();

  // Local State
  const [numPages, setNumPages] = useState<number>();
  const [containerRef, setContainerRef] = useState<HTMLElement | null>(null);
  const [containerWidth, setContainerWidth] = useState<number>();

  // Resize Functionality
  const onResize = useCallback<ResizeObserverCallback>((entries) => {
    const [entry] = entries;

    if (entry) {
      setContainerWidth(entry.contentRect.width);
    }
  }, []);
  useResizeObserver(containerRef, resizeObserverOptions, onResize);

  const onDocumentLoadSuccess = ({
    numPages: nextNumPages,
  }: PDFDocumentProxy): void => {
    setNumPages(nextNumPages);
  };

  return (
    <div className={styles.PDF}>
      <div className={styles.PDF__container}>
        {pdfFiles?.map((pdfFile, index) => {
          return (
            <div
              key={index}
              className={styles.PDF__container__document}
              ref={setContainerRef}
            >
              <Document
                file={pdfFile.url}
                onLoadSuccess={onDocumentLoadSuccess}
                options={options}
                loading={<LoadingSpinner />}
              >
                {Array.from(new Array(numPages), (el, index) => (
                  <Page
                    key={`page_${index + 1}`}
                    pageNumber={index + 1}
                    width={
                      containerWidth
                        ? Math.min(containerWidth, maxWidth)
                        : maxWidth
                    }
                  />
                ))}
              </Document>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default PdfPreview;
