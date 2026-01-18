import { HostelType } from '../../generated/client/client';

export class CreateHostelDto {
    name: string;
    type: HostelType;
    address?: string;
    branchId: string;
}
