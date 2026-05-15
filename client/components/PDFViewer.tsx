'use client';

import React, { useState } from 'react';
import { Viewer, Worker } from '@react-pdf-viewer/core';
import { pageNavigationPlugin } from '@react-pdf-viewer/page-navigation';
import { zoomPlugin } from '@react-pdf-viewer/zoom';
import { searchPlugin } from '@react-pdf-viewer/search';
import { thumbnailPlugin } from '@react-pdf-viewer/thumbnail';
import { highlightPlugin } from '@react-pdf-viewer/highlight';

import '@react-pdf-viewer/core/lib/styles/index.css';
import '@react-pdf-viewer/page-navigation/lib/styles/index.css';
import '@react-pdf-viewer/zoom/lib/styles/index.css';
import '@react-pdf-viewer/search/lib/styles/index.css';
import '@react-pdf-viewer/thumbnail/lib/styles/index.css';
import '@react-pdf-viewer/highlight/lib/styles/index.css';

import { Loader2 } from 'lucide-react';

interface PDFViewerProps {
  url: string;
  fileName?: string;
}

export function PDFViewer({ url, fileName }: PDFViewerProps) {
  const [loading, setLoading] = useState(true);

  // Initialize plugins
  const pageNavigationPluginInstance = pageNavigationPlugin();
  const zoomPluginInstance = zoomPlugin();
  const searchPluginInstance = searchPlugin();
  const thumbnailPluginInstance = thumbnailPlugin();
  const highlightPluginInstance = highlightPlugin();

  // Get plugin components for custom toolbar
  const { CurrentPageInput, GoToNextPage, GoToPreviousPage } = pageNavigationPluginInstance;
  const { CurrentScale, ZoomIn, ZoomOut } = zoomPluginInstance;
  const { Search } = searchPluginInstance;
  const { Thumbnails } = thumbnailPluginInstance;

  return (
    <div className="flex flex-col w-full h-full bg-[#262626]">
      <Worker workerUrl="https://unpkg.com/pdfjs-dist@3.11.174/build/pdf.worker.min.js">
        {/* Custom Toolbar - positioned below lightbox controls */}
        <div className="flex items-center justify-between gap-4 px-4 py-2 bg-neutral-800 border-b border-neutral-700 mt-10">
          {/* Left side - Navigation */}
          <div className="flex items-center gap-1.5">
            <GoToPreviousPage>
              {(props) => (
                <button
                  className="px-3 py-1.5 text-sm text-white bg-neutral-700 hover:bg-neutral-600 rounded disabled:opacity-50 disabled:cursor-not-allowed"
                  onClick={props.onClick}
                  disabled={props.isDisabled}
                >
                  Prev
                </button>
              )}
            </GoToPreviousPage>

            <div className="flex items-center gap-1 text-white text-sm">
              <CurrentPageInput />
            </div>

            <GoToNextPage>
              {(props) => (
                <button
                  className="px-3 py-1.5 text-sm text-white bg-neutral-700 hover:bg-neutral-600 rounded disabled:opacity-50 disabled:cursor-not-allowed"
                  onClick={props.onClick}
                  disabled={props.isDisabled}
                >
                  Next
                </button>
              )}
            </GoToNextPage>
          </div>

          {/* Center - Search */}
          <div className="flex-1 max-w-md">
            <Search>
              {(props) => (
                <div className="relative">
                  <input
                    type="text"
                    placeholder="Search in PDF..."
                    className="w-full px-3 py-1.5 text-sm bg-neutral-700 text-white placeholder-neutral-400 rounded border border-neutral-600 focus:outline-none focus:border-neutral-500"
                    value={props.keyword}
                    onChange={(e) => props.setKeyword(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        props.search();
                      }
                    }}
                  />
                </div>
              )}
            </Search>
          </div>

          {/* Right side - Zoom */}
          <div className="flex items-center gap-1.5">
            <ZoomOut>
              {(props) => (
                <button
                  className="px-3 py-1.5 text-sm text-white bg-neutral-700 hover:bg-neutral-600 rounded w-7 h-7 flex items-center justify-center"
                  onClick={props.onClick}
                >
                  −
                </button>
              )}
            </ZoomOut>

            <CurrentScale>
              {(props) => (
                <span className="text-white text-sm min-w-[60px] text-center">
                  {`${Math.round(props.scale * 100)}%`}
                </span>
              )}
            </CurrentScale>

            <ZoomIn>
              {(props) => (
                <button
                  className="px-3 py-1.5 text-sm text-white bg-neutral-700 hover:bg-neutral-600 rounded w-7 h-7 flex items-center justify-center"
                  onClick={props.onClick}
                >
                  +
                </button>
              )}
            </ZoomIn>
          </div>
        </div>

        {/* PDF Viewer */}
        <div className="flex-1 relative overflow-hidden">
          {loading && (
            <div className="absolute inset-0 flex items-center justify-center bg-neutral-900 z-10">
              <Loader2 className="w-8 h-8 animate-spin text-white" />
            </div>
          )}

          <div className="flex h-full">
            {/* Thumbnail Sidebar */}
            <div className="w-48 border-r border-neutral-700 overflow-y-auto bg-neutral-800">
              <Thumbnails />
            </div>

            {/* Main Viewer */}
            <div className="flex-1 overflow-auto">
              <Viewer
                fileUrl={url}
                onDocumentLoad={() => setLoading(false)}
                theme={{
                  theme: 'dark',
                }}
                plugins={[
                  pageNavigationPluginInstance,
                  zoomPluginInstance,
                  searchPluginInstance,
                  thumbnailPluginInstance,
                  highlightPluginInstance,
                ]}
              />
            </div>
          </div>
        </div>
      </Worker>
    </div>
  );
}
