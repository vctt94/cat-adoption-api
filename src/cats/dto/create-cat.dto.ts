import {
  IsNotEmpty, IsNumber, IsString, IsEnum, IsArray, ArrayNotEmpty, IsUrl, ValidateIf
} from "class-validator";
import { ApiProperty } from '@nestjs/swagger';
import { Gender } from "@/common/entities/gender.enum";

export class CreateCatDto {
  // Docs Start
  @ApiProperty({
    example: 'Whiskers',
    description: 'The name of the cat',
    type: 'string'
  })
  // Docs End
  @IsNotEmpty()
  @IsString()
  name: string;

  // Docs Start
  @ApiProperty({
    example: 3,
    description: 'The age of the cat in years, optional',
    type: 'number',
    required: false
  })
  // Docs End
  @ValidateIf(o => o.age != null)
  @IsNumber()
  age?: number;

  // Docs Start
  @ApiProperty({
    example: 'Siamese',
    description: 'The breed of the cat',
    type: 'string'
  })
  // Docs End
  @IsNotEmpty()
  @IsString()
  breed: string;

  // Docs Start
  @ApiProperty({
    example: Gender.Male,
    description: 'The gender of the cat',
    enum: Gender,
  })
  // Docs End
  @IsNotEmpty()
  @IsEnum(Gender)
  gender: Gender;

  // Docs Start
  @ApiProperty({
    example: ['http://example.com/cat1.jpg', 'http://example.com/cat2.jpg'],
    description: 'List of URLs to images of the cat',
    type: 'string',
    isArray: true
  })
  // Docs End
  @IsArray()
  @ArrayNotEmpty()
  @IsUrl({}, { each: true })
  images: string[];
}
