import { Injectable } from '@nestjs/common';
import { hash } from 'argon2';
import { startOfDay, subDays } from 'date-fns';
import { AuthDto } from 'src/auth/dto/auth.dto';
import { PrismaService } from 'src/prisma.service';
import { UserDto } from 'src/user/dto/user.dto';

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

	async update(id: string, dto: UserDto) {
		let data = dto;

		if (dto?.password) {
			data = {
				...dto,
				password: await hash(dto.password),
			};
		}

		return this.prisma.user.update({
			where: { id },
			data,
			select: {
				name: true,
				email: true,
			},
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

	async getProfile(id: string) {
		const profile = await this.getById(id);

		const totalTasks = profile.tasks.length;
		const completedTasks = profile.tasks.filter(
			task => task.isCompleted === true,
		).length;

		// TODO: check if that will work better
		// const completedTasks1 = await this.prisma.task.count({
		// 	where: {
		// 		isCompleted: true,
		// 		userId: id,
		// 	},
		// });

		const todayStart = startOfDay(new Date());
		const weekStart = startOfDay(subDays(new Date(), 7));

		// const todayTasks = profile.tasks.filter(
		// 	task => task.createdAt >= todayStart,
		// ).length;

		const todayTasks = await this.prisma.task.count({
			where: {
				userId: id,
				createdAt: {
					gte: todayStart.toISOString(),
				},
			},
		});

		const weekTasks = await this.prisma.task.count({
			where: {
				userId: id,
				createdAt: {
					gte: weekStart.toISOString(),
				},
			},
		});

		const { password, ...user } = profile;

		return {
			user,
			statics: [
				{ label: 'Total tasks', value: totalTasks },
				{ label: 'Completed tasks', value: completedTasks },
				{ label: 'Tasks today', value: todayTasks },
				{ label: 'Tasks this week', value: weekTasks },
			],
		};
	}
}
