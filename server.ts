import express from 'express';
import path from 'path';
import { createServer as createViteServer } from 'vite';

import authRoutes from './backend/src/routes/auth.routes.js';
import patientRoutes from './backend/src/routes/patient.routes.js';
import appointmentRoutes from './backend/src/routes/appointment.routes.js';
import queueRoutes from './backend/src/routes/queue.routes.js';
import consultationRoutes from './backend/src/routes/consultation.routes.js';
import prescriptionRoutes from './backend/src/routes/prescription.routes.js';
import userRoutes from './backend/src/routes/user.routes.js';
import dashboardRoutes from './backend/src/routes/dashboard.routes.js';
import scheduleRoutes from './backend/src/routes/schedule.routes.js';
import { errorHandler } from './backend/src/middlewares/error.middleware.js';

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json());

  // API Health Check
  app.get('/api/health', (_req, res) => {
    res.json({ status: 'ok', service: 'Clinique Saint-Luc API', timestamp: new Date() });
  });

  // REST API Routes
  app.use('/api/auth', authRoutes);
  app.use('/api/patients', patientRoutes);
  app.use('/api/appointments', appointmentRoutes);
  app.use('/api/queue', queueRoutes);
  app.use('/api/consultations', consultationRoutes);
  app.use('/api/prescriptions', prescriptionRoutes);
  app.use('/api/users', userRoutes);
  app.use('/api/dashboard', dashboardRoutes);
  app.use('/api/schedule', scheduleRoutes);

  // API Error Handler
  app.use('/api', errorHandler);

  // Vite development middleware or production static server
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (_req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server listening on http://0.0.0.0:${PORT}`);
  });
}

startServer().catch((err) => {
  console.error('Failed to start server:', err);
});
