export class CreateStudentDto {
  email: string;
  password?: string;
  firstName: string;
  lastName: string;
  branchId: string;
  classId?: string;
  sectionId?: string;
  dob?: string; // ISO Date string
  phone?: string;
  parentId?: string;
}
