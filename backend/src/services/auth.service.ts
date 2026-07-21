import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { userModel } from '../models/user.model.js';
import { patientModel } from '../models/patient.model.js';
import { doctorModel } from '../models/doctor.model.js';
import { userView } from '../../../src/views/user.view.js';
import { patientView } from '../../../src/views/patient.view.js';
import { JWT_SECRET, JWT_EXPIRES_IN } from '../config/jwt.js';
import { AuthResponseDTO, UserRole } from '../../../src/types/index.js';

export class AuthService {
  async register(data: {
    email: string;
    password: string;
    firstName: string;
    lastName: string;
    phone: string;
    gender: 'M' | 'F' | 'OTHER';
    birthDate: string;
    address?: string;
  }): Promise<AuthResponseDTO> {
    const existing = await userModel.findByEmail(data.email);
    if (existing) {
      throw new Error('Un compte existe déjà avec cette adresse email.');
    }

    const passwordHash = await bcrypt.hash(data.password, 10);
    const user = await userModel.create({
      email: data.email,
      password_hash: passwordHash,
      role: 'PATIENT',
      first_name: data.firstName,
      last_name: data.lastName,
      phone: data.phone,
      is_active: true,
    });

    const patient = await patientModel.create({
      user_id: user.id,
      first_name: data.firstName,
      last_name: data.lastName,
      gender: data.gender,
      birth_date: data.birthDate,
      phone: data.phone,
      email: data.email,
      address: data.address,
    });

    const token = jwt.sign(
      { id: user.id, email: user.email, role: user.role },
      JWT_SECRET,
      { expiresIn: JWT_EXPIRES_IN }
    );

    return {
      token,
      user: await userView.render(user),
      patientProfile: await patientView.render(patient),
    };
  }

  async login(email: string, password: string): Promise<AuthResponseDTO> {
    const user = await userModel.findByEmail(email);
    if (!user || !user.is_active) {
      throw new Error('Identifiants invalides ou compte désactivé.');
    }

    const isValid = await bcrypt.compare(password, user.password_hash);
    if (!isValid) {
      throw new Error('Identifiants invalides.');
    }

    const token = jwt.sign(
      { id: user.id, email: user.email, role: user.role },
      JWT_SECRET,
      { expiresIn: JWT_EXPIRES_IN }
    );

    let patientProfile;
    let doctorProfile;

    if (user.role === 'PATIENT') {
      const p = await patientModel.findByUserId(user.id);
      if (p) patientProfile = patientView.render(p);
    } else if (user.role === 'DOCTOR') {
      const d = await doctorModel.findByUserId(user.id);
      if (d) {
        doctorProfile = {
          id: d.id,
          userId: d.user_id,
          firstName: d.first_name,
          lastName: d.last_name,
          fullName: `Dr. ${d.first_name} ${d.last_name}`,
          specialty: d.specialty,
          licenseNumber: d.license_number,
          cabinetNumber: d.cabinet_number,
          serviceId: d.service_id,
          phone: d.phone,
          email: d.email,
          isAvailable: d.is_available,
        };
      }
    }

    return {
      token,
      user: await userView.render(user),
      patientProfile,
      doctorProfile,
    };
  }

  async getMe(userId: string): Promise<AuthResponseDTO> {
    const user = await userModel.findById(userId);
    if (!user) {
      throw new Error('Utilisateur non trouvé.');
    }

    const token = jwt.sign(
      { id: user.id, email: user.email, role: user.role },
      JWT_SECRET,
      { expiresIn: JWT_EXPIRES_IN }
    );

    let patientProfile;
    let doctorProfile;

    if (user.role === 'PATIENT') {
      const p = await patientModel.findByUserId(user.id);
      if (p) patientProfile = patientView.render(p);
    } else if (user.role === 'DOCTOR') {
      const d = await doctorModel.findByUserId(user.id);
      if (d) {
        doctorProfile = {
          id: d.id,
          userId: d.user_id,
          firstName: d.first_name,
          lastName: d.last_name,
          fullName: `Dr. ${d.first_name} ${d.last_name}`,
          specialty: d.specialty,
          licenseNumber: d.license_number,
          cabinetNumber: d.cabinet_number,
          serviceId: d.service_id,
          phone: d.phone,
          email: d.email,
          isAvailable: d.is_available,
        };
      }
    }

    return {
      token,
      user: await userView.render(user),
      patientProfile,
      doctorProfile,
    };
  }

  async changePassword(userId: string, currentPass: string, newPass: string): Promise<void> {
    const user = await userModel.findById(userId);
    if (!user) throw new Error('Utilisateur non trouvé.');

    const isValid = await bcrypt.compare(currentPass, user.password_hash);
    if (!isValid) throw new Error('Mot de passe actuel incorrect.');

    const newHash = await bcrypt.hash(newPass, 10);
    await userModel.update(userId, { password_hash: newHash });
  }
}

export const authService = new AuthService();
