import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { ICONS } from '../constants';

interface FlipbookProps {
  pages: string[];
  onFlip?: () => void;
}

type Sheet = {
  front: string;
  back: string;
};

const PageContent: React.FC<{ pageUrl: string; pageNumber: number }> = ({ pageUrl, pageNumber }) => {
  if (pageUrl === 'blank') {
    return <div className="w-full h-full bg-white" />;
  }
  return (
    <img
      src={pageUrl}
      alt={`Page ${pageNumber}`}
      className="max-w-full max-h-full object-contain"
    />
  );
};

export const Flipbook: React.FC<FlipbookProps> = ({ pages, onFlip }) => {
  const sheets = useMemo<Sheet[]>(() => {
    const result: Sheet[] = [];
    const evenPages = [...pages];
    if (pages.length % 2 !== 0) {
      evenPages.push('blank');
    }
    for (let i = 0; i < evenPages.length; i += 2) {
      result.push({ front: evenPages[i], back: evenPages[i + 1] });
    }
    return result;
  }, [pages]);

  const numSheets = sheets.length;
  const [flippedCount, setFlippedCount] = useState(0);

  const handleNextPage = useCallback(() => {
    if (flippedCount < numSheets) {
      setFlippedCount((c) => c + 1);
      onFlip?.();
    }
  }, [flippedCount, numSheets, onFlip]);

  const handlePrevPage = useCallback(() => {
    if (flippedCount > 0) {
      setFlippedCount((c) => c - 1);
      onFlip?.();
    }
  }, [flippedCount, onFlip]);

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'ArrowRight') {
        handleNextPage();
      } else if (event.key === 'ArrowLeft') {
        handlePrevPage();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [handleNextPage, handlePrevPage]);
  
  const isCoverView = flippedCount === 0;
  const isBackCoverView = flippedCount === numSheets;
  const isSpreadView = !isCoverView && !isBackCoverView;

  const getPageNumberText = () => {
      if (isCoverView) return `Cover (Page 1 of ${pages.length})`;
      if (isBackCoverView) return `Back Cover (Page ${pages.length} of ${pages.length})`;
      const leftPage = flippedCount * 2;
      const rightPage = flippedCount * 2 + 1;
      if (rightPage <= pages.length) {
          return `Pages ${leftPage} - ${rightPage} of ${pages.length}`;
      }
      return `Page ${leftPage} of ${pages.length}`;
  }

  return (
    <div className="w-full h-full flex flex-col items-center justify-center gap-4">
      <div
        className={`relative drop-shadow-2xl transition-all duration-500 ease-in-out ${
          isSpreadView
            ? 'w-full max-w-[calc(100vw-2rem)] md:max-w-4xl lg:max-w-6xl aspect-[2/1.4]'
            : 'w-1/2 max-w-[calc(50vw-1rem)] md:max-w-2xl lg:max-w-3xl aspect-[1/1.4]'
        }`}
        style={{ perspective: '3000px' }}
      >
        {/* The static back part of the book cover (visible on the left when book is open) */}
        <div className="absolute w-1/2 h-full bg-white shadow-md left-0 rounded-l-lg" />
        
        {/* The book sheets that flip */}
        {sheets.map((sheet, index) => {
          const isFlipped = index < flippedCount;
          const zIndex = isFlipped ? 10 + index : 10 + numSheets - index;
          return (
            <div
              key={index}
              className="absolute w-1/2 h-full right-0 transition-transform duration-1000 ease-in-out"
              style={{
                transformOrigin: 'left center',
                transform: `rotateY(${isFlipped ? -180 : 0}deg)`,
                zIndex: zIndex,
                transformStyle: 'preserve-3d',
              }}
            >
              {/* Front of the sheet */}
              <div className="absolute w-full h-full rounded-r-lg" style={{ backfaceVisibility: 'hidden' }}>
                <div className="w-full h-full p-2 sm:p-4 md:p-6 bg-gray-100 flex items-center justify-center">
                    <PageContent pageUrl={sheet.front} pageNumber={index * 2 + 1} />
                </div>
              </div>
              {/* Back of the sheet */}
              <div className="absolute w-full h-full rounded-l-lg" style={{ backfaceVisibility: 'hidden', transform: 'rotateY(180deg)' }}>
                <div className="w-full h-full p-2 sm:p-4 md:p-6 bg-gray-100 flex items-center justify-center">
                    <PageContent pageUrl={sheet.back} pageNumber={index * 2 + 2} />
                </div>
              </div>
            </div>
          );
        })}
      </div>
      
      {/* Navigation */}
      <div className="flex items-center gap-8 mt-4">
        <button
          onClick={handlePrevPage}
          disabled={flippedCount === 0}
          className="p-3 rounded-full bg-gray-800 text-white hover:bg-gray-700 disabled:opacity-30 disabled:cursor-not-allowed transition-all"
          aria-label="Previous page"
        >
          {ICONS.CHEVRON_LEFT}
        </button>
        <div className="text-gray-300 text-sm md:text-base font-medium tabular-nums w-48 text-center">
            {getPageNumberText()}
        </div>
        <button
          onClick={handleNextPage}
          disabled={flippedCount === numSheets}
          className="p-3 rounded-full bg-gray-800 text-white hover:bg-gray-700 disabled:opacity-30 disabled:cursor-not-allowed transition-all"
          aria-label="Next page"
        >
          {ICONS.CHEVRON_RIGHT}
        </button>
      </div>
    </div>
  );
};
