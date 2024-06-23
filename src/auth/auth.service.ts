import {
	Injectable,
	NotFoundException,
	UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { verify } from 'argon2';
import { Response } from 'express';
import { AuthDto } from 'src/auth/dto/auth.dto';
import { UserService } from 'src/user/user.service';

@Injectable()
export class AuthService {
	REFRESH_TOKEN_DAYS_TO_EXPIRE = 1;
	REFRESH_TOKEN_NAME = 'refreshToken';
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

	addRefreshTokenToResponse(res: Response, refreshToken: string) {
		const expiresIn = new Date();
		expiresIn.setDate(expiresIn.getDate() + this.REFRESH_TOKEN_DAYS_TO_EXPIRE);
		res.cookie(this.REFRESH_TOKEN_NAME, refreshToken, {
			httpOnly: true,
			domain: 'localhost', // change this to your domain
			secure: true,
			sameSite: 'none', //better to use lux in production
			expires: expiresIn,
		});
	}

	removeRefreshTokenForResponse(res: Response) {
		res.cookie(this.REFRESH_TOKEN_NAME, '', {
			httpOnly: true,
			domain: 'localhost', // change this to your domain
			secure: true,
			sameSite: 'none', //better to use lux in production
			expires: new Date(0),
		});
	}

	async getNewTokens(refreshToken: string) {
		const result = await this.jwt.verifyAsync(refreshToken);

		if (!result) throw new UnauthorizedException('Invalid refresh token');

		const { password, ...user } = await this.userService.getById(result.id);

		const tokens = this.issueToken(user.id);

		return { user, ...tokens };
	}
}
