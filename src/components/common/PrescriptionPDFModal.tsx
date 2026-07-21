import React from 'react';
import { PrescriptionDTO } from '../../types/index.js';
import { X, Printer, Download, Pill, Stethoscope, User, Calendar, FileText } from 'lucide-react';
import jsPDF from 'jspdf';

interface PrescriptionPDFModalProps {
  prescription: PrescriptionDTO | null;
  onClose: () => void;
}

export const PrescriptionPDFModal: React.FC<PrescriptionPDFModalProps> = ({ prescription, onClose }) => {
  if (!prescription) return null;

  const handlePrint = () => {
    window.print();
  };

  const handleDownloadPDF = () => {
    const doc = new jsPDF();
    doc.setFontSize(18);
    doc.text('CLINIQUE MÉDICALE SAINT-LUC', 20, 20);
    doc.setFontSize(10);
    doc.text('15 Boulevard de la Santé, 75013 Paris | Tél: 01 40 50 60 70', 20, 26);

    doc.line(20, 30, 190, 30);

    doc.setFontSize(12);
    doc.text(`Médecin: ${prescription.doctorName}`, 20, 40);
    doc.text(`Spécialité: ${prescription.doctorSpecialty}`, 20, 46);
    doc.text(`N° RPPS: ${prescription.doctorLicense}`, 20, 52);

    doc.text(`Date: ${prescription.date}`, 130, 40);
    doc.text(`Patient: ${prescription.patientName}`, 130, 46);

    doc.setFontSize(16);
    doc.text('ORDONNANCE MÉDICALE', 70, 68);

    doc.line(20, 74, 190, 74);

    let y = 84;
    prescription.items.forEach((item, idx) => {
      doc.setFontSize(11);
      doc.text(`${idx + 1}. ${item.medicationName} - ${item.dosage}`, 20, y);
      doc.setFontSize(10);
      doc.text(`Posologie: ${item.frequency} pendant ${item.duration}`, 25, y + 6);
      if (item.instructions) {
        doc.text(`Note: ${item.instructions}`, 25, y + 11);
        y += 18;
      } else {
        y += 14;
      }
    });

    if (prescription.recommendations) {
      y += 5;
      doc.setFontSize(11);
      doc.text('Recommandations particulières:', 20, y);
      doc.setFontSize(10);
      doc.text(prescription.recommendations, 20, y + 6);
      y += 15;
    }

    doc.line(130, y + 10, 180, y + 10);
    doc.setFontSize(10);
    doc.text('Signature du Médecin', 135, y + 16);

    doc.save(`Ordonnance-${prescription.patientName.replace(/\s+/g, '_')}-${prescription.date}.pdf`);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4 overflow-y-auto">
      <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full border border-slate-100 overflow-hidden print:shadow-none print:max-w-none print:w-full">
        {/* Header */}
        <div className="bg-slate-900 text-white p-6 relative flex justify-between items-start print:bg-white print:text-black print:border-b">
          <div>
            <h3 className="text-xl font-bold tracking-wide">CLINIQUE MÉDICALE SAINT-LUC</h3>
            <p className="text-xs text-slate-300 mt-1 print:text-slate-600">
              15 Boulevard de la Santé, 75013 Paris — Tél: 01 40 50 60 70
            </p>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-white p-1 rounded-lg transition-colors print:hidden"
            id="close-prescription-btn"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Prescription Metadata */}
        <div className="p-6 space-y-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 p-4 bg-slate-50 rounded-xl border border-slate-200/80">
            <div>
              <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Médecin Prescripteur</p>
              <p className="font-bold text-slate-900 mt-0.5">{prescription.doctorName}</p>
              <p className="text-xs text-slate-600">{prescription.doctorSpecialty}</p>
              <p className="text-[11px] text-slate-400 font-mono">RPPS: {prescription.doctorLicense}</p>
            </div>
            <div>
              <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Patient</p>
              <p className="font-bold text-slate-900 mt-0.5">{prescription.patientName}</p>
              <p className="text-xs text-slate-600">Date de l ordonnance: {prescription.date}</p>
              <p className="text-xs text-slate-500">Diagnostic: {prescription.diagnosis}</p>
            </div>
          </div>

          <div className="border-t border-b border-slate-200 py-4">
            <h4 className="text-center font-extrabold text-lg text-slate-800 tracking-wider uppercase mb-4 flex items-center justify-center gap-2">
              <Pill className="w-5 h-5 text-teal-600" /> Ordonnance Médicale
            </h4>

            <div className="space-y-4">
              {prescription.items.map((item, index) => (
                <div key={item.id || index} className="p-3 bg-teal-50/50 rounded-lg border border-teal-100">
                  <div className="flex justify-between items-start">
                    <span className="font-bold text-teal-950 text-base">
                      {index + 1}. {item.medicationName}
                    </span>
                    <span className="px-2 py-0.5 bg-teal-100 text-teal-800 rounded-md text-xs font-semibold">
                      {item.dosage}
                    </span>
                  </div>
                  <div className="mt-1 text-xs text-slate-700 flex flex-wrap gap-x-4 gap-y-1">
                    <span>
                      <strong>Fréquence:</strong> {item.frequency}
                    </span>
                    <span>
                      <strong>Durée:</strong> {item.duration}
                    </span>
                  </div>
                  {item.instructions && (
                    <p className="mt-1 text-xs text-slate-500 italic">Instruction: {item.instructions}</p>
                  )}
                </div>
              ))}
            </div>
          </div>

          {prescription.recommendations && (
            <div className="p-4 bg-amber-50 rounded-xl border border-amber-200/80">
              <p className="text-xs font-bold text-amber-800 uppercase tracking-wider mb-1">
                Recommandations particulières
              </p>
              <p className="text-xs text-amber-900 leading-relaxed">{prescription.recommendations}</p>
            </div>
          )}

          {/* Doctor Signature Stamp */}
          <div className="flex justify-end pt-4">
            <div className="text-center border-t-2 border-slate-300 pt-2 w-48">
              <p className="text-xs font-bold text-slate-800">{prescription.doctorName}</p>
              <p className="text-[10px] text-slate-400 font-mono mt-1">Signature Numérique & Cachet</p>
            </div>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="p-4 bg-slate-50 border-t border-slate-100 flex items-center justify-end gap-3 print:hidden">
          <button
            onClick={handleDownloadPDF}
            className="px-4 py-2 bg-white border border-slate-200 hover:bg-slate-100 text-slate-700 rounded-xl text-sm font-medium transition-colors flex items-center gap-2 shadow-xs"
            id="download-prescription-pdf-btn"
          >
            <Download className="w-4 h-4" /> Télécharger PDF
          </button>
          <button
            onClick={handlePrint}
            className="px-4 py-2 bg-teal-600 hover:bg-teal-700 text-white rounded-xl text-sm font-medium transition-colors flex items-center gap-2 shadow-sm"
            id="print-prescription-btn"
          >
            <Printer className="w-4 h-4" /> Imprimer
          </button>
        </div>
      </div>
    </div>
  );
};
