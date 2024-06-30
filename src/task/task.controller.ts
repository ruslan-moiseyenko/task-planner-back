import {
	Body,
	Controller,
	Delete,
	Get,
	HttpCode,
	Param,
	Post,
	Put,
	UsePipes,
	ValidationPipe,
} from '@nestjs/common';
import { TaskService } from './task.service';
import { TaskDto } from 'src/task/dto/task.dto';
import { Auth } from 'src/auth/decorators/auth.decorator';
import { CurrentUser } from 'src/auth/decorators/user.decorator';

@Controller('user/tasks')
export class TaskController {
	constructor(private readonly taskService: TaskService) {}

	@Get()
	@Auth()
	async getAll(@CurrentUser('id') userId: string) {
		return await this.taskService.getAll(userId);
	}

	@UsePipes(new ValidationPipe())
	@HttpCode(200)
	@Post()
	@Auth()
	async create(@Body() dto: TaskDto, @CurrentUser('id') userId: string) {
		return this.taskService.create(dto, userId);
	}

	@UsePipes(new ValidationPipe())
	@HttpCode(200)
	@Put(':id') // user/tasks/:id
	@Auth()
	async update(
		@Body() dto: TaskDto,
		@CurrentUser('id') userId: string,
		@Param('id') id: string,
	) {
		return this.taskService.update(dto, id, userId);
	}

	@HttpCode(200)
	@Delete(':id') // user/tasks/:id
	@Auth()
	async delete(@Param('id') id: string) {
		return this.taskService.delete(id);
	}
}
