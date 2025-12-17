import { IsNotEmpty, IsString } from 'class-validator';

export class GoogleAuthMobileDto {
  @IsString()
  @IsNotEmpty()
  idToken: string;
}
