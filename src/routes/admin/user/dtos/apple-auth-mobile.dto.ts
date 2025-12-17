import { IsNotEmpty, IsString } from 'class-validator';

export class AppleAuthMobileDto {
  @IsString()
  @IsNotEmpty()
  identityToken: string;
}
