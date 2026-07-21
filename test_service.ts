import { userService } from './backend/src/services/user.service.js';

async function run() {
  try {
    console.log('Testing createService...');
    const result = await userService.createService({
      name: 'Test Service',
      description: 'Desc',
      durationMinutes: 30,
      price: 50
    });
    console.log('SUCCESS:', result);
  } catch (err) {
    console.error('ERROR:', err);
  } finally {
    process.exit(0);
  }
}

run();
