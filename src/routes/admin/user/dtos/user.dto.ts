import { UserRole } from '../enums/user-role.enum';
import { ProfileDto } from '../../profile/dtos/profile.dto';

export class UserDto {
  id: string;
  email: string;
  role: UserRole;
  isActive: boolean;
  profile: ProfileDto | null;
  createdAt: Date;
  updatedAt: Date;
}
