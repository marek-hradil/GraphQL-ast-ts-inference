import { Column, CreateDateColumn, Entity, PrimaryGeneratedColumn, UpdateDateColumn } from 'typeorm'

export enum UserRole {
  Admin = 'Admin',
  Editor = 'Editor',
}

@Entity('users')
export class User {
  @PrimaryGeneratedColumn()
  id: number

  @Column({
    nullable: true,
  })
  email: string

  @Column({
    nullable: true,
  })
  firstName: string

  @Column({ nullable: true })
  lastName: string

  @Column({
    nullable: true,
  })
  profileImgUrl: string

  @Column({
    nullable: true,
  })
  age: number

  @Column({
    type: 'enum',
    enum: UserRole,
    nullable: true,
  })
  role: UserRole

  @CreateDateColumn()
  createdAt: Date

  @UpdateDateColumn()
  updatedAt: Date
}
