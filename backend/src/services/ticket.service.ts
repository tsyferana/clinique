import { appointmentModel } from '../models/appointment.model.js';
import { ticketView } from '../../../src/views/ticket.view.js';
import { TicketDTO } from '../../../src/types/index.js';

export class TicketService {
  generateTicketCode(): string {
    const code = Math.floor(1000 + Math.random() * 9000);
    return `TK-${code}`;
  }

  generateTicketNumber(sequence: number): string {
    const year = new Date().getFullYear();
    const seqStr = sequence.toString().padStart(5, '0');
    return `RDV-${year}-${seqStr}`;
  }

  async getTicketByAppointmentId(appointmentId: string): Promise<TicketDTO> {
    const apt = await appointmentModel.findById(appointmentId);
    if (!apt) {
      throw new Error('Rendez-vous non trouvé.');
    }
    return ticketView.render(apt);
  }
}

export const ticketService = new TicketService();
