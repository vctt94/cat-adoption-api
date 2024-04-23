// cat.entity.ts
import { Entity, PrimaryGeneratedColumn, Column, ManyToMany, JoinTable } from 'typeorm';
import { IsNotEmpty, IsInt, Min, Max, ValidateIf } from 'class-validator';
import { Gender } from "@/common/entities/gender.enum";
import { User } from "@/users/entities/user.entity";

@Entity()
export class Cat {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  @IsNotEmpty()
  name: string;

  @Column()
  breed: string;

  @Column({ nullable: true })
  @ValidateIf(o => o.age !== null)
  @IsInt()
  @Min(0)
  @Max(30)
  age?: number;

  @Column({
    type: "enum",
    enum: Gender,
  })
  gender: Gender;

  @Column({ nullable: true })
  description?: string;

  @Column("text", { array: true })
  images: string[];

  @ManyToMany(() => User, user => user.favoritedCats)
  @JoinTable()
  favoritedBy?: User[];
}
