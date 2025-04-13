import { Injectable, ConflictException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from './entities/user.entity';
import { CreateUserDto } from './dto/create-user.dto';
import { CreateAdminDto } from './dto/create-admin.dto';
import * as bcrypt from 'bcrypt';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private userRepository: Repository<User>,
  ) {}

  async createAdmin(createAdminDto: CreateAdminDto) {
    const existingUser = await this.userRepository.findOne({ 
      where: { email: createAdminDto.email } 
    });
    
    if (existingUser) {
      throw new ConflictException('Email already exists');
    }

    const hashedPassword = await bcrypt.hash(createAdminDto.password, 10);
    const user = this.userRepository.create({
      ...createAdminDto,
      password: hashedPassword,
      isAdmin: true,
    });
    
    const savedUser = await this.userRepository.save(user);
    const { password, ...result } = savedUser;
    return result;
  }
} 