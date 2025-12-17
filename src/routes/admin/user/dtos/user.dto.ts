import { UserRole } from '../enums/user-role.enum';
import { ProfileDto } from '../../profile/dtos/profile.dto';
import { SsoProviderDto } from './sso-provider.dto';

export class UserDto {
  id: string;
  email: string;
  role: UserRole;
  isActive: boolean;
  profile: ProfileDto | null;
  ssoProviders?: SsoProviderDto[];
  createdAt: Date;
  updatedAt: Date;
}
