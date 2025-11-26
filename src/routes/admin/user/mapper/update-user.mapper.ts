import { User } from '../entities/user.entity';
import { UpdateUserDto } from '../dtos/update-user.dto';

export class UpdateUserMapper {
  static toEntity(dto: UpdateUserDto, existingUser: User): User {
    if (dto.email !== undefined) {
      existingUser.email = dto.email;
    }
    if (dto.password !== undefined) {
      existingUser.password = dto.password;
    }
    if (dto.role !== undefined) {
      existingUser.role = dto.role;
    }
    if (dto.isActive !== undefined) {
      existingUser.isActive = dto.isActive;
    }
    if (dto.profile !== undefined && existingUser.profile) {
      if (dto.profile.firstName !== undefined) {
        existingUser.profile.firstName = dto.profile.firstName;
      }
      if (dto.profile.lastName !== undefined) {
        existingUser.profile.lastName = dto.profile.lastName;
      }
      if (dto.profile.pseudo !== undefined) {
        existingUser.profile.pseudo = dto.profile.pseudo;
      }
    }
    return existingUser;
  }
}
