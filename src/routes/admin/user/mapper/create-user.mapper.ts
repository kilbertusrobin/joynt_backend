import { User } from '../entities/user.entity';
import { Profile } from '../../profile/entities/profile.entity';
import { CreateUserDto } from '../dtos/create-user.dto';
import { UserRole } from '../enums/user-role.enum';

export class CreateUserMapper {
  static toEntity(dto: CreateUserDto): User {
    const user = new User();
    user.email = dto.email;
    user.password = dto.password;
    user.role = dto.role || UserRole.USER;

    const profile = new Profile();
    profile.firstName = dto.profile.firstName;
    profile.lastName = dto.profile.lastName;
    profile.pseudo = dto.profile.pseudo;

    user.profile = profile;

    return user;
  }
}
