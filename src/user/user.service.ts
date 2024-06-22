import { Injectable } from '@nestjs/common';
import { hash } from 'argon2';
import { AuthDto } from 'src/auth/dto/auth.dto';
// import { CreateUserDto } from './dto/create-user.dto';
// import { UpdateUserDto } from './dto/update-user.dto';
// import { Prisma } from '@prisma/client';
import { PrismaService } from 'src/prisma.service';

@Injectable()
export class UserService {
	constructor(private prisma: PrismaService) {}

	async create(dto: AuthDto) {
		const user = {
			name: '',
			email: dto.email,
			password: await hash(dto.password),
		};

		return this.prisma.user.create({
			data: user,
		});
	}

	getById(id: string) {
		return this.prisma.user.findUnique({
			where: { id },
			include: { tasks: true },
		});
	}

	getByEmail(email: string) {
		return this.prisma.user.findUnique({
			where: { email },
		});
	}
}
