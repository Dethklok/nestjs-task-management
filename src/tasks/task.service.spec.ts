import { Test } from '@nestjs/testing';
import { TasksService } from './tasks.service';
import { TaskRepository } from './task.repository';
import { GetTasksFilterDto } from './dto/get-tasks-filter.dto';
import { TaskStatus } from './task-status.enum';
import { NotFoundException } from '@nestjs/common';
import { CreateTaskDto } from './dto/create-task.dto';

const mockUser = {
  id: 12,
  username: 'Test user',
};

const mockTaskRepository = () => ({
  getTasks: jest.fn(),
  findOne: jest.fn(),
  createTask: jest.fn(),
  delete: jest.fn(),
});

describe('TaskService', () => {
  let tasksService;
  let taskRepository;

  beforeEach(async () => {
    const module = await Test.createTestingModule({
      providers: [
        TasksService,
        { provide: TaskRepository, useFactory: mockTaskRepository },
      ],
    }).compile();

    tasksService = module.get<TasksService>(TasksService);
    taskRepository = module.get<TaskRepository>(TaskRepository);
  });

  describe('getTasks', () => {
    it('get all tasks from repository', async () => {
      taskRepository.getTasks.mockResolvedValue('someValue');

      expect(taskRepository.getTasks).not.toHaveBeenCalled();

      const filters: GetTasksFilterDto = {
        status: TaskStatus.IN_PROGRESS,
        search: 'Some search query',
      };

      const result = await tasksService.getTasks(filters, mockUser);
      expect(taskRepository.getTasks).toHaveBeenCalled();
      expect(result).toEqual('someValue');
    });
  });

  describe('getTaskById', () => {
    it('calls taskRepository.findOne() and successfully retrieve and return the task', async () => {
      const mockTask = { title: 'test title', description: 'test description' };

      taskRepository.findOne.mockResolvedValue(mockTask);
      const result = await tasksService.getTaskById(1, mockUser);
      expect(result).toEqual(mockTask);

      expect(taskRepository.findOne).toHaveBeenCalledWith({
        where: {
          id: 1,
          userId: mockUser.id,
        },
      });
    });

    it('throws an error as task is not found', () => {
      taskRepository.findOne.mockResolvedValue(null);

      expect(tasksService.getTaskById(1, mockUser)).rejects.toThrow(NotFoundException);
    });
  });

  describe('createTask', () => {
    it('calls taskRepository.createTask() and successfully create and return the task', async () => {
      const createTaskDto: CreateTaskDto = {
        title: 'Test title',
        description: 'Test description',
      };

      const mockTask = {
        title : 'Test title',
        description: 'Test description',
      };

      taskRepository.createTask.mockResolvedValue(mockTask);
      const result = await tasksService.createTask(createTaskDto, mockUser);
      expect(taskRepository.createTask).toHaveBeenCalledWith(createTaskDto, mockUser);
      expect(result).toEqual(mockTask);
    });
  });

  describe('deleteTask', () => {
    it('calls taskRepository.deleteTask() and successfully delete the task', async () => {
      taskRepository.delete.mockResolvedValue({ affected: 1 });
      await tasksService.deleteTask(1, mockUser);
      expect(taskRepository.delete).toHaveBeenCalledWith({ id: 1, userId: mockUser.id });
    });

    it('throws an error as task could not be found', () => {
      taskRepository.delete.mockResolvedValue({ affected: 0 });
      expect(tasksService.deleteTask(1, mockUser)).rejects.toThrow(NotFoundException);
    });
  });

  describe('updateTaskStatus', () => {
    it('calls taskRepository.getTaskById() then update task\'s status and return the task', async () => {
      const newStatus = TaskStatus.DONE;
      const save = jest.fn().mockResolvedValue(true);
      tasksService.getTaskById = jest.fn().mockResolvedValue({
        status: TaskStatus.OPEN,
        save,
      });

      const result = await tasksService.updateTaskStatus(1, newStatus, mockUser);
      expect(tasksService.getTaskById).toHaveBeenCalledWith(1, mockUser);
      expect(save).toHaveBeenCalled();
      expect(result.status).toEqual(newStatus);
    });
  });
});
