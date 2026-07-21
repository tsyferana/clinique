import React from 'react';
import { TicketDTO } from '../../types/index.js';
import { X, Printer, Download, Calendar, Clock, User, Stethoscope, Building, QrCode } from 'lucide-react';
import jsPDF from 'jspdf';

interface TicketModalProps {
  ticket: TicketDTO | null;
  onClose: () => void;
}

export const TicketModal: React.FC<TicketModalProps> = ({ ticket, onClose }) => {
  if (!ticket) return null;

  const handlePrint = () => {
    window.print();
  };

  const handleDownloadPDF = () => {
    const doc = new jsPDF();
    doc.setFontSize(18);
    doc.text(ticket.clinicName, 20, 20);
    doc.setFontSize(10);
    doc.text(ticket.clinicAddress, 20, 27);
    doc.text(`Tél: ${ticket.clinicPhone}`, 20, 32);

    doc.line(20, 37, 190, 37);

    doc.setFontSize(14);
    doc.text('TICKET DE RENDEZ-VOUS', 20, 47);
    doc.setFontSize(16);
    doc.text(`N° Ticket: ${ticket.ticketNumber}`, 20, 57);

    doc.setFontSize(11);
    doc.text(`Code RDV: ${ticket.ticketCode}`, 20, 67);
    doc.text(`Patient: ${ticket.patientName}`, 20, 77);
    doc.text(`Téléphone: ${ticket.patientPhone}`, 20, 84);
    doc.text(`Service: ${ticket.serviceName}`, 20, 91);
    doc.text(`Médecin: ${ticket.doctorName}`, 20, 98);
    doc.text(`Cabinet: ${ticket.cabinetNumber}`, 20, 105);
    doc.text(`Date & Heure: ${ticket.appointmentDate} à ${ticket.appointmentTime}`, 20, 112);
    doc.text(`Statut: ${ticket.status}`, 20, 119);

    doc.line(20, 126, 190, 126);
    doc.setFontSize(9);
    doc.text('Merci de vous présenter 10 minutes avant l horaire indiqué.', 20, 134);

    doc.save(`Ticket-${ticket.ticketNumber}.pdf`);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4 overflow-y-auto">
      <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full border border-slate-100 overflow-hidden print:shadow-none print:max-w-none print:w-full">
        {/* Header */}
        <div className="bg-slate-900 text-white p-6 relative print:bg-white print:text-black">
          <button
            onClick={onClose}
            className="absolute top-4 right-4 text-slate-400 hover:text-white p-1 rounded-lg transition-colors print:hidden"
            id="close-ticket-btn"
          >
            <X className="w-5 h-5" />
          </button>
          <div className="text-center">
            <h3 className="text-xs font-semibold tracking-wider text-teal-400 uppercase print:text-slate-600">
              {ticket.clinicName}
            </h3>
            <p className="text-2xl font-bold mt-1 text-white print:text-slate-900">Ticket de Rendez-vous</p>
            <p className="text-xs text-slate-300 mt-1 print:text-slate-500">{ticket.clinicAddress}</p>
          </div>
        </div>

        {/* Ticket Body */}
        <div className="p-6 space-y-5 bg-gradient-to-b from-slate-50 to-white">
          <div className="bg-teal-50 border border-teal-200/80 rounded-xl p-4 text-center">
            <p className="text-xs font-medium text-teal-800 uppercase tracking-wider">Numéro de Passage</p>
            <p className="text-3xl font-extrabold text-teal-900 mt-0.5 tracking-tight">{ticket.ticketNumber}</p>
            <div className="inline-block mt-2 px-3 py-1 bg-white border border-teal-200 rounded-full text-xs font-mono font-semibold text-teal-700">
              Code de validation : {ticket.ticketCode}
            </div>
          </div>

          <div className="space-y-3 divide-y divide-slate-100 text-sm">
            <div className="pt-2 flex justify-between items-center">
              <span className="text-slate-500 flex items-center gap-2">
                <User className="w-4 h-4 text-slate-400" /> Patient
              </span>
              <span className="font-semibold text-slate-900">{ticket.patientName}</span>
            </div>

            <div className="pt-2 flex justify-between items-center">
              <span className="text-slate-500 flex items-center gap-2">
                <Stethoscope className="w-4 h-4 text-slate-400" /> Service
              </span>
              <span className="font-medium text-slate-900">{ticket.serviceName}</span>
            </div>

            <div className="pt-2 flex justify-between items-center">
              <span className="text-slate-500 flex items-center gap-2">
                <Building className="w-4 h-4 text-slate-400" /> Médecin / Cabinet
              </span>
              <span className="font-medium text-slate-900 text-right">
                {ticket.doctorName}
                <br />
                <span className="text-xs text-slate-500 font-normal">{ticket.cabinetNumber}</span>
              </span>
            </div>

            <div className="pt-2 flex justify-between items-center">
              <span className="text-slate-500 flex items-center gap-2">
                <Calendar className="w-4 h-4 text-slate-400" /> Date
              </span>
              <span className="font-semibold text-slate-900">{ticket.appointmentDate}</span>
            </div>

            <div className="pt-2 flex justify-between items-center">
              <span className="text-slate-500 flex items-center gap-2">
                <Clock className="w-4 h-4 text-slate-400" /> Heure
              </span>
              <span className="font-bold text-teal-700">{ticket.appointmentTime}</span>
            </div>
          </div>

          {/* QR Code section */}
          <div className="flex items-center justify-between p-3 bg-slate-100/70 rounded-xl border border-slate-200/60">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-white rounded-lg border border-slate-200 flex items-center justify-center">
                <QrCode className="w-8 h-8 text-slate-700" />
              </div>
              <div>
                <p className="text-xs font-semibold text-slate-800">Scanner à l entrée</p>
                <p className="text-[11px] text-slate-500">Présentez ce QR code à la borne d accueil</p>
              </div>
            </div>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="p-4 bg-slate-50 border-t border-slate-100 flex items-center justify-end gap-3 print:hidden">
          <button
            onClick={handleDownloadPDF}
            className="px-4 py-2 bg-white border border-slate-200 hover:bg-slate-100 text-slate-700 rounded-xl text-sm font-medium transition-colors flex items-center gap-2 shadow-xs"
            id="download-ticket-pdf-btn"
          >
            <Download className="w-4 h-4" /> PDF
          </button>
          <button
            onClick={handlePrint}
            className="px-4 py-2 bg-teal-600 hover:bg-teal-700 text-white rounded-xl text-sm font-medium transition-colors flex items-center gap-2 shadow-sm"
            id="print-ticket-btn"
          >
            <Printer className="w-4 h-4" /> Imprimer
          </button>
        </div>
      </div>
    </div>
  );
};
