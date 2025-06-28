import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
} from 'typeorm';

@Entity('frontend_logs')
export class FrontendLog {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ default: 'info' })
  level: string;

  @Column('text')
  message: string;

  @Column('jsonb', { nullable: true })
  context: any;

  @Column('text', { nullable: true })
  error_stack: string;

  @Column({ nullable: true })
  user_id: number;

  @Column({ nullable: true })
  session_id: string;

  @Column({ nullable: true })
  url: string;

  @Column({ nullable: true })
  user_agent: string;

  @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  timestamp: Date;

  @CreateDateColumn()
  created_at: Date;
}
