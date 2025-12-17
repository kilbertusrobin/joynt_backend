import { SsoProvider } from '../entities/sso-provider.entity';
import { SsoProviderDto } from '../dtos/sso-provider.dto';

export class SsoProviderMapper {
  static toDto(provider: SsoProvider): SsoProviderDto {
    const dto = new SsoProviderDto();
    dto.id = provider.id;
    dto.provider = provider.provider;
    dto.providerId = provider.providerId;
    dto.createdAt = provider.createdAt;
    return dto;
  }

  static toDtoArray(providers: SsoProvider[]): SsoProviderDto[] {
    return providers.map((provider) => this.toDto(provider));
  }
}
