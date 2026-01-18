import { IsString, IsOptional, IsNumber, IsUUID } from 'class-validator';

export class CreateInventoryCategoryDto {
    @IsString()
    name: string;
    @IsString()
    branchId?: string;
}

export class CreateInventoryStoreDto {
    @IsString()
    name: string;
    @IsOptional()
    @IsString()
    code?: string;
    @IsString()
    branchId?: string;
}

export class CreateInventorySupplierDto {
    @IsString()
    name: string;
    @IsOptional()
    @IsString()
    contactPerson?: string;
    @IsOptional()
    @IsString()
    phone?: string;
    @IsOptional()
    @IsString()
    email?: string;
    @IsOptional()
    @IsString()
    address?: string;
    @IsString()
    branchId?: string;
}

export class CreateInventoryUnitDto {
    @IsString()
    name: string;
    @IsString()
    branchId?: string;
}

export class CreateInventoryProductDto {
    @IsString()
    name: string;
    @IsOptional()
    @IsString()
    code?: string;
    @IsOptional()
    @IsString()
    description?: string;
    @IsUUID()
    categoryId: string;
    @IsUUID()
    unitId: string;
    @IsOptional()
    @IsUUID()
    storeId?: string;
    @IsString()
    branchId?: string;
}

export class CreateInventoryPurchaseDto {
    @IsOptional()
    @IsString()
    voucherNo?: string;
    @IsNumber()
    quantity: number;
    @IsNumber()
    unitPrice: number;
    @IsUUID()
    productId: string;
    @IsUUID()
    supplierId: string;
    @IsString()
    branchId?: string;
}

export class IssueItemDto {
    @IsNumber()
    quantity: number;
    @IsUUID()
    productId: string;
    @IsString()
    issuedTo: string;
    @IsOptional()
    @IsUUID()
    staffId?: string;
    @IsOptional()
    @IsUUID()
    studentId?: string;
    @IsString()
    branchId?: string;
}

export class CreateInventorySaleDto {
    @IsOptional()
    @IsString()
    invoiceNo?: string;
    @IsNumber()
    quantity: number;
    @IsNumber()
    unitPrice: number;
    @IsUUID()
    productId: string;
    @IsOptional()
    @IsString()
    customerName?: string;
    @IsString()
    branchId?: string;
}

export class UpdateInventoryProductDto {
    @IsOptional()
    @IsString()
    name?: string;
    @IsOptional()
    @IsString()
    code?: string;
    @IsOptional()
    @IsString()
    description?: string;
    @IsOptional()
    @IsUUID()
    categoryId?: string;
    @IsOptional()
    @IsUUID()
    unitId?: string;
    @IsOptional()
    @IsUUID()
    storeId?: string;
}

export class UpdateInventoryCategoryDto {
    @IsString()
    name: string;
}

export class UpdateInventoryStoreDto {
    @IsOptional()
    @IsString()
    name?: string;
    @IsOptional()
    @IsString()
    code?: string;
}

export class UpdateInventorySupplierDto {
    @IsOptional()
    @IsString()
    name?: string;
    @IsOptional()
    @IsString()
    contactPerson?: string;
    @IsOptional()
    @IsString()
    phone?: string;
    @IsOptional()
    @IsString()
    email?: string;
    @IsOptional()
    @IsString()
    address?: string;
}

export class UpdateInventoryUnitDto {
    @IsString()
    name: string;
}
