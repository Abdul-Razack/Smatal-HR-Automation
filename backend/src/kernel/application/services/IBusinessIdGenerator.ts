export interface IBusinessIdGenerator {
  generate(prefix: string): Promise<string>;
}
