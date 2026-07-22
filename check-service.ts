import { consultationService } from './backend/src/services/consultation.service.js';

async function check() {
  try {
    const list = await consultationService.getPatientConsultations('cf56e38f-da87-4236-95bc-5ecce861bb79');
    console.log(JSON.stringify(list, null, 2));
    process.exit(0);
  } catch (error) {
    console.error(error);
    process.exit(1);
  }
}

check();
