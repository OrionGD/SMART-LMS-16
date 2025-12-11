import React from 'react';
import { AwardIcon, XCircleIcon } from './icons';

interface CertificateModalProps {
  studentName: string;
  courseTitle: string;
  completionDate: string;
  instructors: string[];
  onClose: () => void;
}

const CertificateModal: React.FC<CertificateModalProps> = ({ studentName, courseTitle, completionDate, instructors, onClose }) => {
  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 p-4 print:p-0 print:bg-white print:absolute print:inset-0 print:block">
      {/* Print Styles Injection */}
      <style>
        {`
          @media print {
            body * {
              visibility: hidden;
            }
            #printable-certificate, #printable-certificate * {
              visibility: visible;
            }
            #printable-certificate {
              position: absolute;
              left: 0;
              top: 0;
              width: 100%;
              height: 100%;
              margin: 0;
              padding: 20px;
              border: 5px double #e5e7eb; /* Tailwind gray-200 */
              box-shadow: none;
            }
            @page {
                size: landscape;
                margin: 0;
            }
            /* Hide browser default headers/footers if possible */
            header, footer { display: none; }
          }
        `}
      </style>

      <div id="printable-certificate" className="bg-white relative max-w-4xl w-full rounded-lg shadow-2xl overflow-hidden bg-[url('https://www.transparenttextures.com/patterns/cream-paper.png')] animate-scale-in">
        
        {/* Close Button - Hidden when printing */}
        <button 
            onClick={onClose} 
            className="absolute top-4 right-4 text-gray-500 hover:text-gray-700 print:hidden z-10"
        >
          <XCircleIcon className="w-8 h-8" />
        </button>

        {/* Certificate Content */}
        <div className="p-10 text-center border-8 double border-gray-200 m-4 h-full flex flex-col justify-center relative">
          
          {/* Decorative Header */}
          <div className="mb-8">
             <div className="flex justify-center">
                <AwardIcon className="w-20 h-20 text-indigo-600 mb-4 animate-bounce-slow" />
             </div>
             <h1 className="text-5xl font-serif font-bold text-gray-900 uppercase tracking-widest mb-2">Certificate</h1>
             <p className="text-xl font-serif italic text-gray-600">of Completion</p>
          </div>

          {/* Dynamic Data */}
          <div className="space-y-6">
              <p className="text-lg text-gray-600">This is to certify that</p>
              
              <div className="py-2">
                  <h2 className="text-4xl font-bold text-indigo-900 font-serif border-b-2 border-gray-300 inline-block px-10 pb-2 min-w-[300px]">
                      {studentName}
                  </h2>
              </div>
              
              <p className="text-lg text-gray-600">has successfully completed the course</p>
              
              <div className="py-2">
                  <h3 className="text-3xl font-bold text-gray-800 font-serif">
                      {courseTitle}
                  </h3>
              </div>
              
              <p className="text-md text-gray-500 mt-8 italic">
                  Demonstrating dedication to learning, mastery of the subject matter,<br/> and successful fulfillment of all course requirements.
              </p>
          </div>

          {/* Signatures & Date */}
          <div className="mt-16 flex flex-col md:flex-row justify-between items-end px-10 gap-8 md:gap-0">
              <div className="text-center w-full md:w-auto">
                  <p className="text-lg font-semibold text-gray-800 border-t border-gray-400 pt-2 px-6 inline-block min-w-[200px]">
                      {completionDate}
                  </p>
                  <p className="text-xs text-gray-500 uppercase tracking-wider mt-1">Date Awarded</p>
              </div>
              
              <div className="text-center w-full md:w-auto">
                  <p className="text-lg font-semibold text-gray-800 border-t border-gray-400 pt-2 px-6 inline-block min-w-[200px] font-serif italic">
                      {instructors.slice(0, 2).join(' & ')}
                  </p>
                  <p className="text-xs text-gray-500 uppercase tracking-wider mt-1">Instructor Signature</p>
              </div>
          </div>

           <div className="mt-12 text-xs text-gray-400">
               Verified by Smart LMS AI-Enhanced Platform • ID: {Math.random().toString(36).substr(2, 9).toUpperCase()}
           </div>
        </div>
        
        {/* Actions - Hidden when printing */}
        <div className="bg-gray-50 p-4 flex justify-center space-x-4 print:hidden border-t border-gray-100">
            <button 
                onClick={handlePrint}
                className="px-6 py-2 bg-indigo-600 text-white font-semibold rounded-md shadow hover:bg-indigo-700 transition-colors flex items-center"
            >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M5 4v3H4a2 2 0 00-2 2v3a2 2 0 002 2h1v2a2 2 0 002 2h6a2 2 0 002-2v-2h1a2 2 0 002-2V9a2 2 0 00-2-2h-1V4a2 2 0 00-2-2H7a2 2 0 00-2 2zm8 0H7v3h6V4zm0 8H7v4h6v-4z" clipRule="evenodd" />
                </svg>
                Print / Download PDF
            </button>
        </div>

      </div>
    </div>
  );
};

export default CertificateModal;