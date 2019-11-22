import { Entity, BaseEntity } from 'typeorm';
import { Column, PrimaryGeneratedColumn } from 'typeorm/browser';
import { TaskStatus } from './task.model';

@Entity()
export class TaskEntity extends BaseEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  title: string;

  @Column()
  description: string;

  @Column()
  status: TaskStatus;
}
