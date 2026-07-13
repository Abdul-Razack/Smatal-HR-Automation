export interface Mapper<DomainEntity, DTO, PersistenceModel = any> {
  toDomain(raw: PersistenceModel | any): DomainEntity;
  toDTO(entity: DomainEntity): DTO;
  toPersistence(entity: DomainEntity): PersistenceModel;
}
