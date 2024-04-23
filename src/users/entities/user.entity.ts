import { Cat } from "@/cats/entities/cat.entity";
import { Role } from "@/common/entities/role.entity";
import { Exclude } from "class-transformer";
import {
  Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, ManyToMany
} from "typeorm";

@Entity()
export class User {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  name: string;

  @Column({ unique: true })
  email: string;

  @Exclude()
  @Column()
  password?: string;

  @Column({ type: "enum", enum: Role, default: Role.User })
  role: Role;

  @CreateDateColumn({ type: "timestamp", default: () => "CURRENT_TIMESTAMP" })
  createdAt: Date;

  @ManyToMany(() => Cat, cat => cat.favoritedBy)
  favoritedCats?: Cat[];
}
