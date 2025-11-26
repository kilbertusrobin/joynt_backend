import { Profile } from '../entities/profile.entity';
import { ProfileDto } from '../dtos/profile.dto';

export class ProfileMapper {
  static toDto(profile: Profile): ProfileDto | null {
    if (!profile) return null;

    const dto = new ProfileDto();
    dto.id = profile.id;
    dto.firstName = profile.firstName;
    dto.lastName = profile.lastName;
    dto.pseudo = profile.pseudo;
    dto.createdAt = profile.createdAt;
    dto.updatedAt = profile.updatedAt;
    return dto;
  }
}
