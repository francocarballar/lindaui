"use client";

import { useState } from "react";
import type { ReactNode } from "react";
import { Scan, ZoomIn, ZoomOut, Frame } from "lucide-react";

export interface ImageViewerProps {
  src?: string;
  alt?: string;
  annotations?: ReactNode;
  caption?: string;
  placeholderLabel?: string;
  dim?: number;
  showControls?: boolean;
  minZoom?: number;
  maxZoom?: number;
}

export function ImageViewer({
  src,
  alt = "",
  annotations,
  caption,
  placeholderLabel,
  dim = 0,
  showControls = false,
  minZoom = 1,
  maxZoom = 2.6,
}: ImageViewerProps) {
  const [zoom, setZoom] = useState(1);
  const [imgOk, setImgOk] = useState(false);

  const showPlaceholder = !src || !imgOk;

  return (
    <div className="absolute inset-0 overflow-hidden bg-viewer-bg text-viewer-foreground">
      <div
        className="absolute inset-0 grid place-items-center transition-transform duration-300"
        style={{ transform: `scale(${zoom})` }}
      >
        {src && (
          <img
            src={src}
            alt={alt}
            onLoad={() => setImgOk(true)}
            onError={() => setImgOk(false)}
            className="max-h-full max-w-full object-contain"
            style={{ display: imgOk ? "block" : "none" }}
          />
        )}
        {showPlaceholder && (
          <div className="grid place-items-center rounded-lg border border-dashed">
            <div className="text-center p-4">
              <Scan
                className="mx-auto opacity-50"
                style={{ width: 40, height: 40 }}
                strokeWidth={1.3}
              />
              {placeholderLabel && (
                <div className="mt-3 font-mono text-xs tracking-widest opacity-70">
                  {placeholderLabel}
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      {/* annotations slot — top-right */}
      {annotations && (
        <div className="absolute right-4 top-4 z-10">{annotations}</div>
      )}

      {/* caption — bottom-left */}
      {caption && (
        <div className="absolute bottom-3.5 left-4 font-mono text-[9px] opacity-40 sm:text-[10px]">
          {caption}
        </div>
      )}

      {/* zoom controls */}
      {showControls && (
        <div className="absolute bottom-4 left-3 z-20 flex items-center gap-1.5 sm:bottom-5 sm:left-4 sm:gap-2">
          <button
            type="button"
            onClick={() =>
              setZoom((z) => Math.max(minZoom, +(z - 0.2).toFixed(2)))
            }
            className="h-10 w-10 rounded-[10px] flex items-center justify-center sm:h-9 sm:w-9"
            aria-label="Reducir zoom"
          >
            <ZoomOut className="h-[17px] w-[17px]" />
          </button>
          <span className="self-center min-w-9 text-center font-mono text-[11px] opacity-75">
            {Math.round(zoom * 100)}%
          </span>
          <button
            type="button"
            onClick={() =>
              setZoom((z) => Math.min(maxZoom, +(z + 0.2).toFixed(2)))
            }
            className="h-10 w-10 rounded-[10px] flex items-center justify-center sm:h-9 sm:w-9"
            aria-label="Ampliar zoom"
          >
            <ZoomIn className="h-[17px] w-[17px]" />
          </button>
          <button
            type="button"
            onClick={() => setZoom(1)}
            className="h-10 w-10 rounded-[10px] flex items-center justify-center sm:h-9 sm:w-9"
            aria-label="Encuadrar"
          >
            <Frame className="h-4 w-4" />
          </button>
        </div>
      )}

      {/* dim overlay */}
      {dim > 0 && (
        <div
          className="absolute inset-0 transition-opacity duration-300"
          style={{
            background: `color-mix(in oklch, var(--viewer-bg) ${Math.round(dim * 100)}%, transparent)`,
          }}
        />
      )}
    </div>
  );
}
