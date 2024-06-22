import { Injectable, NotFoundException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { verify } from 'argon2';
import { AuthDto } from 'src/auth/dto/auth.dto';
import { UserService } from 'src/user/user.service';

@Injectable()
export class AuthService {
	constructor(
		private jwt: JwtService,
		private userService: UserService,
	) {}

	async login(dto: AuthDto) {
		const { password, ...user } = await this.validateUser(dto);
		const tokens = this.issueToken(user.id);

		return {
			...tokens,
			user,
		};
	}

	async register(dto: AuthDto) {
		const existingUser = await this.userService.getByEmail(dto.email);
		if (existingUser) {
			throw new NotFoundException('User already exists');
		}
		const { password, ...user } = await this.userService.create(dto);
		const tokens = this.issueToken(user.id);

		return {
			user,
			...tokens,
		};
	}

	private issueToken(userId: string) {
		const data = { id: userId };
		const accessToken = this.jwt.sign(data, {
			expiresIn: '1h',
		});
		const refreshToken = this.jwt.sign(data, {
			expiresIn: '7d',
		});

		return { accessToken, refreshToken };
	}

	private async validateUser(dto: AuthDto) {
		const user = await this.userService.getByEmail(dto.email);

		if (!user) {
			throw new NotFoundException('User not found');
		}

		const isValidPassword = await verify(user.password, dto.password);

		if (!isValidPassword) {
			throw new NotFoundException('Password is wrong');
		}
		return user;
	}
}
