import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AuthModule } from './auth/auth.module';
import { UserModule } from './user/user.module';
import { ConfigModule } from '@nestjs/config';
import { TaskModule } from 'src/task/task.module';
import { TimeBlockModule } from 'src/time-block/time-block.module';
import { PomodoroModule } from 'src/pomodoro/pomodoro.module';

@Module({
	imports: [
		AuthModule,
		UserModule,
		TaskModule,
		TimeBlockModule,
		PomodoroModule,
		ConfigModule.forRoot(),
	],
	controllers: [AppController],
	providers: [AppService],
})
export class AppModule {}
