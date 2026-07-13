import { Result } from '../../result/Result';

export interface UseCase<IRequest, IResponse> {
  execute(request?: IRequest): Promise<Result<IResponse>> | Result<IResponse>;
}
