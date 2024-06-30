import { Priority } from '@prisma/client';
import { Transform } from 'class-transformer';
import { IsOptional, IsString, IsBoolean, IsEnum } from 'class-validator';

export class TaskDto {
	@IsString()
	@IsOptional()
	name: string;

	@IsBoolean()
	@IsOptional()
	isCompleted?: boolean;

	@IsOptional()
	@IsString()
	createdAt?: string;

	@IsEnum(Priority)
	@IsOptional()
	@Transform(({ value }) => ('' + value).toLowerCase())
	priority?: Priority;
}
