import { userModel } from '../models/user.model.js';
import { patientModel } from '../models/patient.model.js';
import { doctorModel } from '../models/doctor.model.js';
import { staffModel } from '../models/staff.model.js';
import { serviceModel } from '../models/service.model.js';
import { userView } from '../../../src/views/user.view.js';
import { patientView } from '../../../src/views/patient.view.js';
import { UserDTO, UserRole, DoctorDTO, ServiceDTO } from '../../../src/types/index.js';
import bcrypt from 'bcryptjs';

export class UserService {
  async getAllUsers(): Promise<UserDTO[]> {
    const users = await userModel.findAll();
    return userView.renderMany(users);
  }

  async createUser(data: {
    email: string;
    password: string;
    role: UserRole;
    firstName: string;
    lastName: string;
    phone: string;
    specialty?: string;
    licenseNumber?: string;
    cabinetNumber?: string;
    serviceId?: string;
    department?: string;
  }): Promise<UserDTO> {
    const existing = await userModel.findByEmail(data.email);
    if (existing) {
      throw new Error('Cet email est déjà utilisé.');
    }

    const passwordHash = await bcrypt.hash(data.password, 10);
    const user = await userModel.create({
      email: data.email,
      password_hash: passwordHash,
      role: data.role,
      first_name: data.firstName,
      last_name: data.lastName,
      phone: data.phone,
      is_active: true,
    });

    if (data.role === 'DOCTOR') {
      await doctorModel.create({
        user_id: user.id,
        first_name: data.firstName,
        last_name: data.lastName,
        specialty: data.specialty || 'Médecine Générale',
        license_number: data.licenseNumber || `RPPS-${Math.floor(10000000 + Math.random() * 90000000)}`,
        cabinet_number: data.cabinetNumber || 'Cabinet A-101',
        service_id: data.serviceId || 'srv-1',
        phone: data.phone,
        email: data.email,
        is_available: true,
      });
    } else if (data.role === 'STAFF') {
      await staffModel.create({
        user_id: user.id,
        first_name: data.firstName,
        last_name: data.lastName,
        phone: data.phone,
        email: data.email,
        department: data.department || 'Accueil',
      });
    } else if (data.role === 'PATIENT') {
      await patientModel.create({
        user_id: user.id,
        first_name: data.firstName,
        last_name: data.lastName,
        gender: 'M',
        birth_date: '1990-01-01',
        phone: data.phone,
        email: data.email,
      });
    }

    return await userView.render(user);
  }

  async updateUser(id: string, updates: Partial<UserDTO>): Promise<UserDTO> {
    const updated = await userModel.update(id, {
      first_name: updates.firstName,
      last_name: updates.lastName,
      phone: updates.phone,
      is_active: updates.isActive,
    });
    if (!updated) throw new Error('Utilisateur non trouvé.');
    return await userView.render(updated);
  }

  async deleteUser(id: string): Promise<boolean> {
    return await userModel.delete(id);
  }

  async getAllDoctors(): Promise<DoctorDTO[]> {
    const doctors = await doctorModel.findAll();
    const services = await serviceModel.findAll();
    return doctors.map((d) => {
      const s = services.find((srv) => srv.id === d.service_id);
      return {
        id: d.id,
        userId: d.user_id,
        firstName: d.first_name,
        lastName: d.last_name,
        fullName: `Dr. ${d.first_name} ${d.last_name}`,
        specialty: d.specialty,
        licenseNumber: d.license_number,
        cabinetNumber: d.cabinet_number,
        serviceId: d.service_id,
        serviceName: s?.name,
        phone: d.phone,
        email: d.email,
        isAvailable: d.is_available,
      };
    });
  }

  async getAllServices(): Promise<ServiceDTO[]> {
    const services = await serviceModel.findAll();
    return services.map((s) => ({
      id: s.id,
      name: s.name,
      description: s.description,
      durationMinutes: s.duration_minutes,
      price: s.price,
      isActive: s.is_active,
    }));
  }

  async createService(data: {
    name: string;
    description: string;
    durationMinutes: number;
    price: number;
    isActive?: boolean;
  }): Promise<ServiceDTO> {
    const service = await serviceModel.create({
      name: data.name,
      description: data.description,
      duration_minutes: data.durationMinutes,
      price: data.price,
      is_active: data.isActive ?? true,
    });
    return {
      id: service.id,
      name: service.name,
      description: service.description,
      durationMinutes: service.duration_minutes,
      price: service.price,
      isActive: service.is_active,
    };
  }

  async updateService(
    id: string,
    updates: {
      name?: string;
      description?: string;
      durationMinutes?: number;
      price?: number;
      isActive?: boolean;
    }
  ): Promise<ServiceDTO> {
    const updated = await serviceModel.update(id, {
      name: updates.name,
      description: updates.description,
      duration_minutes: updates.durationMinutes,
      price: updates.price,
      is_active: updates.isActive,
    });
    if (!updated) throw new Error('Service introuvable.');
    return {
      id: updated.id,
      name: updated.name,
      description: updated.description,
      durationMinutes: updated.duration_minutes,
      price: updated.price,
      isActive: updated.is_active,
    };
  }

  async deleteService(id: string): Promise<boolean> {
    const success = await serviceModel.delete(id);
    if (!success) throw new Error('Service introuvable ou impossible à supprimer.');
    return true;
  }

  async updateDoctorProfile(
    userId: string,
    data: {
      firstName?: string;
      lastName?: string;
      phone?: string;
      email?: string;
      specialty?: string;
      cabinetNumber?: string;
      serviceId?: string;
    }
  ): Promise<{ user: UserDTO; doctorProfile: DoctorDTO }> {
    const user = await userModel.findById(userId);
    if (!user) throw new Error('Utilisateur non trouvé.');

    const doctor = await doctorModel.findByUserId(userId);
    if (!doctor) throw new Error('Profil médecin non trouvé.');

    if (data.email && data.email.toLowerCase() !== user.email.toLowerCase()) {
      const existing = await userModel.findByEmail(data.email);
      if (existing) {
        throw new Error('Cet email est déjà utilisé par un autre compte.');
      }
    }

    const updatedUser = await userModel.update(userId, {
      first_name: data.firstName || user.first_name,
      last_name: data.lastName || user.last_name,
      phone: data.phone || user.phone,
      email: data.email || user.email,
    });

    const updatedDoctor = await doctorModel.update(doctor.id, {
      first_name: data.firstName || doctor.first_name,
      last_name: data.lastName || doctor.last_name,
      phone: data.phone || doctor.phone,
      email: data.email || doctor.email,
      specialty: data.specialty || doctor.specialty,
      cabinet_number: data.cabinetNumber || doctor.cabinet_number,
      service_id: data.serviceId || doctor.service_id,
    });

    const services = await serviceModel.findAll();
    const service = services.find((s) => s.id === updatedDoctor!.service_id);

    return {
      user: await userView.render(updatedUser!),
      doctorProfile: {
        id: updatedDoctor!.id,
        userId: updatedDoctor!.user_id,
        firstName: updatedDoctor!.first_name,
        lastName: updatedDoctor!.last_name,
        fullName: `Dr. ${updatedDoctor!.first_name} ${updatedDoctor!.last_name}`,
        specialty: updatedDoctor!.specialty,
        licenseNumber: updatedDoctor!.license_number,
        cabinetNumber: updatedDoctor!.cabinet_number,
        serviceId: updatedDoctor!.service_id,
        serviceName: service?.name,
        phone: updatedDoctor!.phone,
        email: updatedDoctor!.email,
        isAvailable: updatedDoctor!.is_available,
      },
    };
  }

  async updateDoctorProfileByAdmin(
    userId: string,
    data: {
      specialty?: string;
      cabinetNumber?: string;
      serviceId?: string;
      isAvailable?: boolean;
    }
  ): Promise<DoctorDTO> {
    const doctor = await doctorModel.findByUserId(userId);
    if (!doctor) throw new Error('Profil médecin non trouvé pour cet utilisateur.');

    const updatedDoctor = await doctorModel.update(doctor.id, {
      ...(data.specialty !== undefined && { specialty: data.specialty }),
      ...(data.cabinetNumber !== undefined && { cabinet_number: data.cabinetNumber }),
      ...(data.serviceId !== undefined && { service_id: data.serviceId }),
      ...(data.isAvailable !== undefined && { is_available: data.isAvailable }),
    });

    if (!updatedDoctor) throw new Error('Impossible de mettre à jour le profil médecin.');

    const services = await serviceModel.findAll();
    const service = services.find((s) => s.id === updatedDoctor.service_id);

    return {
      id: updatedDoctor.id,
      userId: updatedDoctor.user_id,
      firstName: updatedDoctor.first_name,
      lastName: updatedDoctor.last_name,
      fullName: `Dr. ${updatedDoctor.first_name} ${updatedDoctor.last_name}`,
      specialty: updatedDoctor.specialty,
      licenseNumber: updatedDoctor.license_number,
      cabinetNumber: updatedDoctor.cabinet_number,
      serviceId: updatedDoctor.service_id,
      serviceName: service?.name,
      phone: updatedDoctor.phone,
      email: updatedDoctor.email,
      isAvailable: updatedDoctor.is_available,
    };
  }

  async getAllPatients(query?: string) {
    const patients = query ? await patientModel.search(query) : await patientModel.findAll();
    return patientView.renderMany(patients);
  }

  async getPatientById(id: string) {
    const patient = await patientModel.findById(id);
    if (!patient) throw new Error('Patient introuvable.');
    return patientView.render(patient);
  }
}

export const userService = new UserService();
