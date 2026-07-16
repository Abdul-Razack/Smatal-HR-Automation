export interface DispatchResult {
  jobId: string;
  status: 'PENDING' | 'COMPLETED' | 'FAILED';
}

export interface IGenerationDispatcher {
  dispatch(command: any): Promise<DispatchResult>;
}
