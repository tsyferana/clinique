import { UserEntity, UserDTO } from '../types/index.js';

export const userView = {
  async render(user: UserEntity): Promise<UserDTO> {
    return {
      id: user.id,
      email: user.email,
      role: user.role,
      firstName: user.first_name,
      lastName: user.last_name,
      phone: user.phone,
      isActive: user.is_active,
    } as unknown as UserDTO;
  },

  async renderMany(users: UserEntity[]): Promise<UserDTO[]> {
    return Promise.all(users.map((u) => this.render(u)));
  },
};
