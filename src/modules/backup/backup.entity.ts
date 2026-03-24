import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn } from 'typeorm';

@Entity('backup_record')
export class BackupRecord {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column()
  databaseName!: string;

  @Column()
  location!: string;

  @CreateDateColumn()
  createdAt!: Date;

  @Column({ type: 'datetime', nullable: true })
  updatedAt!: Date | null;
}
