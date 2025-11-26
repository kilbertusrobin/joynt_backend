import { User } from '../entities/user.entity';
import { UserDto } from '../dtos/user.dto';
import { ProfileMapper } from '../../profile/mapper/profile.mapper';

export class UserMapper {
  static toDto(user: User): UserDto {
    const dto = new UserDto();
    dto.id = user.id;
    dto.email = user.email;
    dto.role = user.role;
    dto.isActive = user.isActive;
    dto.profile = ProfileMapper.toDto(user.profile);
    dto.createdAt = user.createdAt;
    dto.updatedAt = user.updatedAt;
    return dto;
  }

  static toDtoArray(users: User[]): UserDto[] {
    return users.map((user) => this.toDto(user));
  }
}
