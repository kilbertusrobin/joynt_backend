import {
  Injectable,
  NotFoundException,
  ConflictException,
  UnauthorizedException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { JwtService } from '@nestjs/jwt';
import { User } from './entities/user.entity';
import { Profile } from '../profile/entities/profile.entity';
import { CreateUserDto } from './dtos/create-user.dto';
import { UpdateUserDto } from './dtos/update-user.dto';
import { LoginDto } from './dtos/login.dto';
import { RegisterDto } from './dtos/register.dto';
import { UserDto } from './dtos/user.dto';
import { UserMapper } from './mapper/user.mapper';
import { CreateUserMapper } from './mapper/create-user.mapper';
import { UpdateUserMapper } from './mapper/update-user.mapper';

@Injectable()
export class UserService {
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    @InjectRepository(Profile)
    private readonly profileRepository: Repository<Profile>,
    private readonly jwtService: JwtService,
  ) {}

  async create(createUserDto: CreateUserDto): Promise<UserDto> {
    const existingUser = await this.userRepository.findOne({
      where: { email: createUserDto.email },
    });

    if (existingUser) {
      throw new ConflictException('Email already exists');
    }

    const existingProfile = await this.profileRepository.findOne({
      where: { pseudo: createUserDto.profile.pseudo },
    });

    if (existingProfile) {
      throw new ConflictException('Pseudo already exists');
    }

    const user = CreateUserMapper.toEntity(createUserDto);
    const savedUser = await this.userRepository.save(user);
    return UserMapper.toDto(savedUser);
  }

  async findAll(): Promise<UserDto[]> {
    const users = await this.userRepository.find();
    return UserMapper.toDtoArray(users);
  }

  async findOne(id: string): Promise<UserDto> {
    const user = await this.userRepository.findOne({ where: { id } });

    if (!user) {
      throw new NotFoundException(`User with ID ${id} not found`);
    }

    return UserMapper.toDto(user);
  }

  async update(id: string, updateUserDto: UpdateUserDto): Promise<UserDto> {
    const user = await this.userRepository.findOne({ where: { id } });

    if (!user) {
      throw new NotFoundException(`User with ID ${id} not found`);
    }

    if (updateUserDto.email && updateUserDto.email !== user.email) {
      const existingUser = await this.userRepository.findOne({
        where: { email: updateUserDto.email },
      });

      if (existingUser) {
        throw new ConflictException('Email already exists');
      }
    }

    const updatedUser = UpdateUserMapper.toEntity(updateUserDto, user);
    const savedUser = await this.userRepository.save(updatedUser);
    return UserMapper.toDto(savedUser);
  }

  async remove(id: string): Promise<void> {
    const user = await this.userRepository.findOne({ where: { id } });

    if (!user) {
      throw new NotFoundException(`User with ID ${id} not found`);
    }

    await this.userRepository.remove(user);
  }

  async register(registerDto: RegisterDto): Promise<{ user: UserDto; token: string }> {
    const existingUser = await this.userRepository.findOne({
      where: { email: registerDto.email },
    });

    if (existingUser) {
      throw new ConflictException('Email already exists');
    }

    const existingProfile = await this.profileRepository.findOne({
      where: { pseudo: registerDto.profile.pseudo },
    });

    if (existingProfile) {
      throw new ConflictException('Pseudo already exists');
    }

    const user = CreateUserMapper.toEntity(registerDto);
    const savedUser = await this.userRepository.save(user);
    const userDto = UserMapper.toDto(savedUser);
    const token = this.generateToken(savedUser);

    return { user: userDto, token };
  }

  async login(loginDto: LoginDto): Promise<{ user: UserDto; token: string }> {
    const user = await this.userRepository.findOne({
      where: { email: loginDto.email },
    });

    if (!user) {
      throw new UnauthorizedException('Invalid credentials');
    }

    const isPasswordValid = await user.comparePassword(loginDto.password);

    if (!isPasswordValid) {
      throw new UnauthorizedException('Invalid credentials');
    }

    const userDto = UserMapper.toDto(user);
    const token = this.generateToken(user);

    return { user: userDto, token };
  }

  async validateUser(userId: string): Promise<User> {
    const user = await this.userRepository.findOne({ where: { id: userId } });

    if (!user) {
      throw new UnauthorizedException('User not found');
    }

    return user;
  }

  async validateLocalUser(email: string, password: string): Promise<User | null> {
    const user = await this.userRepository.findOne({
      where: { email },
    });

    if (!user || !user.password) {
      return null;
    }

    const isPasswordValid = await user.comparePassword(password);
    return isPasswordValid ? user : null;
  }

  private generateToken(user: User): string {
    const payload = { sub: user.id, email: user.email };
    return this.jwtService.sign(payload);
  }
}
