import {
  IsArray, IsEnum, IsNumber, IsOptional, IsString, IsUrl
} from "class-validator";
import { ApiPropertyOptional } from '@nestjs/swagger';
import { Gender } from "@/common/entities/gender.enum";

export class UpdateCatDto {
  // Docs Start
  @ApiPropertyOptional({
    example: 'Whiskers',
    description: 'The new name of the cat, if updating',
    type: 'string'
  })
  // Docs End
  @IsOptional()
  @IsString()
  name: string;

  // Docs Start
  @ApiPropertyOptional({
    example: 5,
    description: 'The new age of the cat in years, if updating',
    type: 'number'
  })
  // Docs End
  @IsOptional()
  @IsNumber()
  age?: number;

  // Docs Start
  @ApiPropertyOptional({
    example: 'Persian',
    description: 'The new breed of the cat, if updating',
    type: 'string'
  })
  // Docs End
  @IsOptional()
  @IsString()
  breed?: string;

  // Docs Start
  @ApiPropertyOptional({
    example: Gender.Female,
    description: 'The new gender of the cat, if updating',
    enum: Gender,
  })
  // Docs End
  @IsOptional()
  @IsEnum(Gender)
  gender?: Gender;

  // Docs Start
  @ApiPropertyOptional({
    example: ['http://example.com/cat1_updated.jpg', 'http://example.com/cat2_updated.jpg'],
    description: 'Updated list of URLs to images of the cat, if updating',
    type: 'string',
    isArray: true
  })
  // Docs End
  @IsArray()
  @IsOptional()
  @IsUrl({}, { each: true })
  images?: string[];
}
