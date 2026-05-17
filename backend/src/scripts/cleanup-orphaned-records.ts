import { PrismaClient } from '../generated/client';

const prisma = new PrismaClient();

async function main() {
  console.log('=== Orphaned Record Cleanup Script ===\n');

  // Get all existing branches
  const branches = await prisma.branch.findMany({
    select: { id: true, name: true, code: true },
  });
  const branchIds = new Set(branches.map((b) => b.id));

  console.log(`Found ${branches.length} branches:\n`);
  branches.forEach((b) => console.log(`  - ${b.name} (${b.code}) [${b.id}]`));
  console.log('');

  // Define tables to check (model name -> table name mapping)
  // Focus on tenant-scoped tables with non-nullable branchId
  const tablesToCheck = [
    { model: 'inventoryCategory', label: 'Inventory Categories' },
    { model: 'inventoryStore', label: 'Inventory Stores' },
    { model: 'inventorySupplier', label: 'Inventory Suppliers' },
    { model: 'inventoryUnit', label: 'Inventory Units' },
    { model: 'inventoryProduct', label: 'Inventory Products' },
    { model: 'inventoryPurchase', label: 'Inventory Purchases' },
    { model: 'inventorySale', label: 'Inventory Sales' },
    { model: 'inventoryIssue', label: 'Inventory Issues' },
    { model: 'student', label: 'Students' },
    { model: 'studentCategory', label: 'Student Categories' },
    { model: 'employee', label: 'Employees' },
    { model: 'department', label: 'Departments' },
    { model: 'designation', label: 'Designations' },
    { model: 'academicClass', label: 'Academic Classes' },
    { model: 'academicSection', label: 'Academic Sections' },
    { model: 'subject', label: 'Subjects' },
    { model: 'exam', label: 'Exams' },
    { model: 'examType', label: 'Exam Types' },
    { model: 'examComponent', label: 'Exam Components' },
    { model: 'examSchedule', label: 'Exam Schedules' },
    { model: 'assessment', label: 'Assessments' },
    { model: 'attendance', label: 'Attendance' },
    { model: 'attendanceSession', label: 'Attendance Sessions' },
    { model: 'hostel', label: 'Hostels' },
    { model: 'hostelRoom', label: 'Hostel Rooms' },
    { model: 'libraryBook', label: 'Library Books' },
    { model: 'borrowRecord', label: 'Borrow Records' },
    { model: 'transportRoute', label: 'Transport Routes' },
    { model: 'transportVehicle', label: 'Transport Vehicles' },
    { model: 'transportAssignment', label: 'Transport Assignments' },
    { model: 'event', label: 'Events' },
    { model: 'certificateTemplate', label: 'Certificate Templates' },
    { model: 'idCardTemplate', label: 'ID Card Templates' },
    { model: 'admitCardTemplate', label: 'Admit Card Templates' },
    { model: 'reportTemplate', label: 'Report Templates' },
    { model: 'financeFee', label: 'Finance Fees' },
    { model: 'financeInvoice', label: 'Finance Invoices' },
    { model: 'financeExpense', label: 'Finance Expenses' },
    { model: 'financeDiscount', label: 'Finance Discounts' },
    { model: 'hrPayroll', label: 'HR Payroll' },
    { model: 'hrLeave', label: 'HR Leave' },
    { model: 'hrAward', label: 'HR Awards' },
    { model: 'hrAttendance', label: 'HR Attendance' },
    { model: 'liveClass', label: 'Live Classes' },
    { model: 'onlineExam', label: 'Online Exams' },
    { model: 'questionGroup', label: 'Question Groups' },
    { model: 'enquiry', label: 'Enquiries' },
    { model: 'callLog', label: 'Call Logs' },
    { model: 'visitorLog', label: 'Visitor Logs' },
    { model: 'complaint', label: 'Complaints' },
    { model: 'postalRecord', label: 'Postal Records' },
    { model: 'bulkCommunication', label: 'Bulk Communications' },
    { model: 'emailTemplate', label: 'Email Templates' },
    { model: 'smsTemplate', label: 'SMS Templates' },
    { model: 'notification', label: 'Notifications' },
    { model: 'attachment', label: 'Attachments' },
    { model: 'alumni', label: 'Alumni' },
    { model: 'alumniEvent', label: 'Alumni Events' },
    { model: 'transcript', label: 'Transcripts' },
    { model: 'transcriptVerification', label: 'Transcript Verifications' },
    { model: 'accessControlRule', label: 'Access Control Rules' },
  ];

  let totalOrphaned = 0;
  const orphanedByTable: { table: string; count: number; ids: string[] }[] = [];

  for (const { model, label } of tablesToCheck) {
    try {
      // @ts-ignore - dynamic model access
      const records = await prisma[model].findMany({
        select: { id: true, branchId: true },
      });

      const orphaned = records.filter(
        (r: { branchId: string | null }) =>
          !r.branchId || !branchIds.has(r.branchId),
      );

      if (orphaned.length > 0) {
        console.log(
          `⚠️  ${label}: ${orphaned.length} orphaned record(s) found`,
        );
        orphaned.forEach((r: { id: string; branchId: string | null }) => {
          console.log(
            `    - ID: ${r.id}, branchId: ${r.branchId || 'NULL'}`,
          );
        });
        orphanedByTable.push({
          table: label,
          count: orphaned.length,
          ids: orphaned.map((r: { id: string }) => r.id),
        });
        totalOrphaned += orphaned.length;
      }
    } catch (error: any) {
      // Model might not exist or have different schema
      if (error.code !== 'P2021' && error.code !== 'P2010') {
        console.log(`❌ Error checking ${label}: ${error.message}`);
      }
    }
  }

  console.log(`\n=== Summary ===`);
  console.log(`Total orphaned records found: ${totalOrphaned}`);

  if (totalOrphaned === 0) {
    console.log('\n✅ No orphaned records found. Database is clean.');
    return;
  }

  // Ask user what to do
  console.log('\n=== Options ===');
  console.log('1. Delete all orphaned records');
  console.log('2. Reassign to a specific branch');
  console.log('3. Do nothing (exit)');

  // For automated run, default to showing report only
  // To actually delete/reassign, pass --delete or --reassign <branchId> as args
  const args = process.argv.slice(2);
  const action = args[0];

  if (action === '--delete') {
    console.log('\n⚠️  DELETING orphaned records...\n');
    for (const { model } of tablesToCheck) {
      try {
        // @ts-ignore
        const records = await prisma[model].findMany({
          select: { id: true, branchId: true },
        });
        const orphanedIds = records
          .filter(
            (r: { branchId: string | null }) =>
              !r.branchId || !branchIds.has(r.branchId),
          )
          .map((r: { id: string }) => r.id);

        if (orphanedIds.length > 0) {
          // @ts-ignore
          await prisma[model].deleteMany({ where: { id: { in: orphanedIds } } });
          console.log(`  Deleted ${orphanedIds.length} from ${model}`);
        }
      } catch {
        // Skip models that don't exist
      }
    }
    console.log('\n✅ Deletion complete.');
  } else if (action === '--reassign' && args[1]) {
    const targetBranchId = args[1];
    if (!branchIds.has(targetBranchId)) {
      console.error(`\n❌ Branch ${targetBranchId} does not exist.`);
      return;
    }
    const targetBranch = branches.find((b) => b.id === targetBranchId);
    console.log(
      `\n⚠️  Reassigning all orphaned records to ${targetBranch?.name}...\n`,
    );
    for (const { model } of tablesToCheck) {
      try {
        // @ts-ignore
        const records = await prisma[model].findMany({
          select: { id: true, branchId: true },
        });
        const orphanedIds = records
          .filter(
            (r: { branchId: string | null }) =>
              !r.branchId || !branchIds.has(r.branchId),
          )
          .map((r: { id: string }) => r.id);

        if (orphanedIds.length > 0) {
          // @ts-ignore
          await prisma[model].updateMany({
            where: { id: { in: orphanedIds } },
            data: { branchId: targetBranchId },
          });
          console.log(`  Reassigned ${orphanedIds.length} in ${model}`);
        }
      } catch {
        // Skip models that don't exist
      }
    }
    console.log('\n✅ Reassignment complete.');
  } else {
    console.log('\n📋 Run with --delete to remove orphaned records');
    console.log(
      '📋 Run with --reassign <branchId> to reassign to a specific branch',
    );
  }
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
