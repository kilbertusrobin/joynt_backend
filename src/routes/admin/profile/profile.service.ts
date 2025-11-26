import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Profile } from './entities/profile.entity';
import { User } from '../user/entities/user.entity';
import { CreateProfileDto } from './dtos/create-profile.dto';
import { UpdateProfileDto } from './dtos/update-profile.dto';
import { ProfileDto } from './dtos/profile.dto';
import { ProfileMapper } from './mapper/profile.mapper';

@Injectable()
export class ProfileService {
  constructor(
    @InjectRepository(Profile)
    private readonly profileRepository: Repository<Profile>,
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
  ) {}

  async findAll(): Promise<(ProfileDto | null)[]> {
    const profiles = await this.profileRepository.find({ relations: ['user'] });
    return profiles.map((profile) => ProfileMapper.toDto(profile));
  }

  async findOne(id: string): Promise<ProfileDto | null> {
    const profile = await this.profileRepository.findOne({
      where: { id },
      relations: ['user'],
    });

    if (!profile) {
      throw new NotFoundException(`Profile with ID ${id} not found`);
    }

    return ProfileMapper.toDto(profile);
  }

  async findByUserId(userId: string): Promise<ProfileDto | null> {
    const profile = await this.profileRepository.findOne({
      where: { user: { id: userId } },
      relations: ['user'],
    });

    return profile ? ProfileMapper.toDto(profile) : null;
  }

  async update(id: string, updateProfileDto: UpdateProfileDto): Promise<ProfileDto | null> {
    const profile = await this.profileRepository.findOne({ where: { id } });

    if (!profile) {
      throw new NotFoundException(`Profile with ID ${id} not found`);
    }

    if (updateProfileDto.pseudo && updateProfileDto.pseudo !== profile.pseudo) {
      const existingProfile = await this.profileRepository.findOne({
        where: { pseudo: updateProfileDto.pseudo },
      });

      if (existingProfile) {
        throw new ConflictException('Pseudo already exists');
      }
    }

    if (updateProfileDto.firstName !== undefined) {
      profile.firstName = updateProfileDto.firstName;
    }
    if (updateProfileDto.lastName !== undefined) {
      profile.lastName = updateProfileDto.lastName;
    }
    if (updateProfileDto.pseudo !== undefined) {
      profile.pseudo = updateProfileDto.pseudo;
    }

    const savedProfile = await this.profileRepository.save(profile);
    return ProfileMapper.toDto(savedProfile);
  }

  async remove(id: string): Promise<void> {
    const profile = await this.profileRepository.findOne({
      where: { id },
      relations: ['user'],
    });

    if (!profile) {
      throw new NotFoundException(`Profile with ID ${id} not found`);
    }

    if (profile.user) {
      await this.userRepository.remove(profile.user);
    } else {
      await this.profileRepository.remove(profile);
    }
  }
}
