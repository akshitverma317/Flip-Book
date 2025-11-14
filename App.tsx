import React, { useState, useEffect } from 'react';
import { Flipbook } from './components/Flipbook';
import { SAMPLE_PAGES, ICONS } from './constants';
import useSound from './hooks/useSound';

// Since pdf.js is loaded from a CDN, we declare it to TypeScript.
declare const pdfjsLib: any;

const App: React.FC = () => {
  const [pages, setPages] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isSoundOn, setIsSoundOn] = useState(true);
  const { play: playFlipSound } = useSound();
  const [conversionProgress, setConversionProgress] = useState<string | null>(null);


  const loadSampleBook = () => {
    setIsLoading(true);
    setConversionProgress('Loading sample book...');
    setPages(SAMPLE_PAGES);
    setTimeout(() => {
        setIsLoading(false)
        setConversionProgress(null);
    }, 500);
  };
  
  const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file || file.type !== 'application/pdf') {
      alert("Please select a valid PDF file.");
      return;
    }

    setIsLoading(true);
    setPages([]);
    setConversionProgress('Preparing to convert...');

    try {
      const arrayBuffer = await file.arrayBuffer();
      const pdf = await pdfjsLib.getDocument(arrayBuffer).promise;
      const numPages = pdf.numPages;
      const pageDataUrls: string[] = [];

      for (let i = 1; i <= numPages; i++) {
        setConversionProgress(`Converting page ${i} of ${numPages}...`);
        const page = await pdf.getPage(i);
        const viewport = page.getViewport({ scale: 1.5 }); // High-quality rendering
        
        const canvas = document.createElement('canvas');
        const context = canvas.getContext('2d');
        canvas.height = viewport.height;
        canvas.width = viewport.width;

        if (context) {
          const renderContext = {
            canvasContext: context,
            viewport: viewport,
          };
          await page.render(renderContext).promise;
          pageDataUrls.push(canvas.toDataURL('image/jpeg', 0.9)); // JPEG for performance
        }
      }
      setPages(pageDataUrls);
    } catch (error) {
      console.error("Error processing PDF:", error);
      alert("Sorry, there was an error processing your PDF file. It might be corrupted or in an unsupported format.");
    } finally {
      setIsLoading(false);
      setConversionProgress(null);
      // Reset file input to allow uploading the same file again
      event.target.value = '';
    }
  };

  const toggleSound = () => {
      setIsSoundOn(!isSoundOn);
  }

  useEffect(() => {
    // Set the worker source for pdf.js, which is required for it to run in the browser.
    if (typeof pdfjsLib !== 'undefined') {
      pdfjsLib.GlobalWorkerOptions.workerSrc = `https://cdnjs.cloudflare.com/ajax/libs/pdf.js/4.4.168/pdf.worker.min.mjs`;
    }

    // Preload images for the sample book for a smoother experience
    SAMPLE_PAGES.forEach(src => {
      const img = new Image();
      img.src = src;
    });
  }, []);

  return (
    <div className="min-h-screen bg-gray-900 text-white flex flex-col items-center justify-center p-4 font-sans">
      <header className="w-full max-w-5xl mx-auto text-center mb-4 md:mb-8">
        <h1 className="text-3xl md:text-5xl font-bold text-gray-100 tracking-tight">Interactive Flipbook Experience</h1>
        <p className="text-gray-400 mt-2 text-md md:text-lg">Turn static documents into engaging content.</p>
      </header>

      <main className="flex-grow w-full flex items-center justify-center">
        {pages.length === 0 ? (
          <div className="text-center">
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
               <label
                htmlFor="pdf-upload"
                className={`inline-block cursor-pointer px-8 py-4 bg-indigo-600 text-white font-semibold rounded-lg shadow-lg hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-opacity-75 transition-all duration-300 ${isLoading ? 'bg-gray-500 !cursor-not-allowed opacity-70' : ''}`}
              >
                {isLoading ? conversionProgress || 'Loading...' : 'Upload PDF'}
              </label>
              <input id="pdf-upload" type="file" accept="application/pdf" className="hidden" onChange={handleFileChange} disabled={isLoading} />
              
              <button
                onClick={loadSampleBook}
                disabled={isLoading}
                className="px-6 py-3 bg-gray-700 text-white font-semibold rounded-lg shadow-md hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-opacity-75 transition-all duration-300 disabled:bg-gray-500 disabled:cursor-not-allowed"
              >
                Try a Sample
              </button>
            </div>
            <p className="text-gray-500 mt-4">Upload a PDF to convert it into an interactive flipbook.</p>
          </div>
        ) : (
          <Flipbook pages={pages} onFlip={isSoundOn ? playFlipSound : undefined} />
        )}
      </main>
      
      <div className="absolute top-4 right-4 flex items-center gap-4">
         <button 
           onClick={toggleSound}
           className="p-2 rounded-full bg-gray-800 hover:bg-gray-700 transition-colors"
           aria-label={isSoundOn ? 'Mute sound' : 'Unmute sound'}
         >
           {isSoundOn ? ICONS.SOUND_ON : ICONS.SOUND_OFF}
         </button>
      </div>

      <footer className="w-full text-center text-gray-500 py-4 mt-4 md:mt-8 text-sm">
        
      </footer>
    </div>
  );
};

export default App;