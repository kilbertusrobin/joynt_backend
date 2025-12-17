import { IsEnum, IsNotEmpty } from 'class-validator';
import { AuthProviderType } from '../enums/auth-provider-type.enum';

export class LinkProviderDto {
  @IsEnum(AuthProviderType)
  @IsNotEmpty()
  provider: AuthProviderType;
}
