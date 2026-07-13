/**
 * Defines a contract for entities that expose a human-readable, immutable business ID (e.g. EMP_000001)
 * instead of exposing internal UUIDs to clients.
 */
export interface IBusinessIdentifiable {
  /**
   * The human-readable business identifier for external API exposure.
   * e.g., CAND_0001, EMP_0012, DOC_0055
   */
  readonly businessId: string;
}
