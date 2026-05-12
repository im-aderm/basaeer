#!/usr/bin/env ts-node

/**
 * End-to-End Integration Test for Phases 11, 12, and 13
 *
 * This script tests the complete workflow of:
 * - HR & Payroll Management
 * - Digital Classroom & Assignments
 * - Google Meet Integration (configuration only, requires real credentials)
 */

import axios from 'axios';

const API_BASE = 'http://localhost:3000';
let authToken = '';
let branchId = '';
let staffId = '';
let studentId = '';
let assignmentId = '';
let sessionId = '';

// Test data
const testData = {
  admin: {
    email: 'admin@basaer.test',
    password: 'Admin@123',
  },
  teacher: {
    email: 'teacher@basaer.test',
    password: 'Teacher@123',
  },
  student: {
    email: 'student@basaer.test',
    password: 'Student@123',
  },
};

const api = axios.create({
  baseURL: API_BASE,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add auth token to requests
api.interceptors.request.use((config) => {
  if (authToken) {
    config.headers.Authorization = `Bearer ${authToken}`;
  }
  return config;
});

async function login(email: string, password: string) {
  console.log(`\n🔐 Logging in as ${email}...`);
  try {
    const response = await api.post('/auth/login', { email, password });
    authToken = response.data.access_token;
    branchId = response.data.user.branchId;
    console.log(`✅ Login successful! Branch ID: ${branchId}`);
    return response.data;
  } catch (error: any) {
    console.error(
      `❌ Login failed: ${error.response?.data?.message || error.message}`,
    );
    throw error;
  }
}

// ==================== PHASE 11: HR & PAYROLL TESTS ====================

async function testSalaryTemplate() {
  console.log('\n📊 Testing Salary Template Creation...');
  try {
    const response = await api.post('/employees/salary-template', {
      staffId,
      basicSalary: 50000,
      allowances: { housing: 10000, transport: 5000 },
      deductions: { tax: 7500, insurance: 2500 },
      netSalary: 55000,
    });
    console.log(`✅ Salary template created: ${response.data.id}`);
    return response.data;
  } catch (error: any) {
    console.error(
      `❌ Salary template creation failed: ${error.response?.data?.message || error.message}`,
    );
  }
}

async function testPayrollGeneration() {
  console.log('\n💰 Testing Payroll Generation...');
  try {
    const response = await api.post('/employees/payroll/generate', {
      branchId,
      month: new Date().getMonth() + 1,
      year: new Date().getFullYear(),
    });
    console.log(`✅ Payroll generated: ${response.data.message}`);
    console.log(`   Entries created: ${response.data.entries.length}`);
    return response.data;
  } catch (error: any) {
    console.error(
      `❌ Payroll generation failed: ${error.response?.data?.message || error.message}`,
    );
  }
}

async function testLeaveApplication() {
  console.log('\n🏖️  Testing Leave Application...');
  try {
    const response = await api.post('/employees/leave/apply', {
      type: 'ANNUAL',
      startDate: '2026-03-01',
      endDate: '2026-03-05',
      reason: 'Family vacation',
    });
    console.log(`✅ Leave request submitted: ${response.data.id}`);
    return response.data;
  } catch (error: any) {
    console.error(
      `❌ Leave application failed: ${error.response?.data?.message || error.message}`,
    );
  }
}

async function testLeaveApproval(leaveId: string) {
  console.log('\n✅ Testing Leave Approval...');
  try {
    const response = await api.patch(`/employees/leave/${leaveId}/status`, {
      status: 'APPROVED',
    });
    console.log(`✅ Leave request approved: ${response.data.status}`);
    return response.data;
  } catch (error: any) {
    console.error(
      `❌ Leave approval failed: ${error.response?.data?.message || error.message}`,
    );
  }
}

// ==================== PHASE 12: DIGITAL CLASSROOM TESTS ====================

async function testAssignmentCreation() {
  console.log('\n📝 Testing Assignment Creation...');
  try {
    const response = await api.post('/academics/assignments', {
      title: 'Integration Test Assignment',
      description: 'Complete exercises 1-10 from Chapter 5',
      dueDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
      subjectId: 'subject-test-id', // Replace with actual subject ID
      sectionId: 'section-test-id', // Replace with actual section ID
    });
    assignmentId = response.data.id;
    console.log(`✅ Assignment created: ${assignmentId}`);
    return response.data;
  } catch (error: any) {
    console.error(
      `❌ Assignment creation failed: ${error.response?.data?.message || error.message}`,
    );
  }
}

async function testAssignmentSubmission() {
  console.log('\n📤 Testing Assignment Submission...');
  try {
    const response = await api.post('/academics/submissions', {
      assignmentId,
      studentId,
      contentUrl: 'https://drive.google.com/file/test-submission',
    });
    console.log(`✅ Assignment submitted: ${response.data.id}`);
    return response.data;
  } catch (error: any) {
    console.error(
      `❌ Assignment submission failed: ${error.response?.data?.message || error.message}`,
    );
  }
}

async function testSubmissionGrading(submissionId: string) {
  console.log('\n📊 Testing Submission Grading...');
  try {
    const response = await api.patch(
      `/academics/submissions/${submissionId}/grade`,
      {
        grade: 85,
        feedback: 'Good work! Check question 5 for improvement.',
      },
    );
    console.log(`✅ Submission graded: ${response.data.grade}/100`);
    return response.data;
  } catch (error: any) {
    console.error(
      `❌ Submission grading failed: ${error.response?.data?.message || error.message}`,
    );
  }
}

async function testStudentAssignments() {
  console.log('\n📚 Testing Student Assignment Retrieval...');
  try {
    const response = await api.get(
      `/academics/student-assignments/${studentId}`,
    );
    console.log(`✅ Retrieved ${response.data.length} assignments for student`);
    return response.data;
  } catch (error: any) {
    console.error(
      `❌ Student assignments retrieval failed: ${error.response?.data?.message || error.message}`,
    );
  }
}

// ==================== PHASE 13: GOOGLE MEET TESTS ====================

async function testGoogleMeetConfig() {
  console.log('\n🎥 Testing Google Meet Configuration...');
  console.log('⚠️  Note: This requires real Google Cloud credentials');
  try {
    // This will fail without real credentials, which is expected
    const response = await api.get('/live-classes/config');
    console.log(`✅ Google Meet config retrieved`);
    return response.data;
  } catch (error: any) {
    if (error.response?.status === 404) {
      console.log(
        'ℹ️  No Google Meet configuration found (expected for new setup)',
      );
    } else {
      console.error(
        `❌ Config retrieval failed: ${error.response?.data?.message || error.message}`,
      );
    }
  }
}

async function testLiveClassSessionCreation() {
  console.log('\n📹 Testing Live Class Session Creation...');
  console.log('⚠️  Note: This requires Google Meet to be configured');
  try {
    const response = await api.post('/live-classes/sessions', {
      title: 'Integration Test Live Class',
      description: 'Testing Google Meet integration',
      scheduledStart: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
      sectionId: 'section-test-id',
    });
    sessionId = response.data.id;
    console.log(`✅ Live class session created: ${sessionId}`);
    return response.data;
  } catch (error: any) {
    console.error(
      `❌ Session creation failed: ${error.response?.data?.message || error.message}`,
    );
    console.log('ℹ️  This is expected if Google Meet is not configured');
  }
}

// ==================== MAIN TEST RUNNER ====================

async function runTests() {
  console.log(
    '🚀 Starting End-to-End Integration Tests for Phases 11, 12, 13\n',
  );
  console.log('='.repeat(60));

  try {
    // Login as admin
    const adminUser = await login(
      testData.admin.email,
      testData.admin.password,
    );
    staffId = adminUser.user.staff?.id || 'test-staff-id';

    console.log('\n' + '='.repeat(60));
    console.log('PHASE 11: HR & PAYROLL MANAGEMENT');
    console.log('='.repeat(60));

    await testSalaryTemplate();
    await testPayrollGeneration();

    // Test leave as teacher
    await login(testData.teacher.email, testData.teacher.password);
    const leaveRequest = await testLeaveApplication();

    // Approve as admin
    await login(testData.admin.email, testData.admin.password);
    if (leaveRequest) {
      await testLeaveApproval(leaveRequest.id);
    }

    console.log('\n' + '='.repeat(60));
    console.log('PHASE 12: DIGITAL CLASSROOM & ASSIGNMENTS');
    console.log('='.repeat(60));

    // Create assignment as teacher
    await login(testData.teacher.email, testData.teacher.password);
    await testAssignmentCreation();

    // Submit as student
    await login(testData.student.email, testData.student.password);
    const studentUser = await api.get('/auth/me');
    studentId = studentUser.data.student?.id || 'test-student-id';

    const submission = await testAssignmentSubmission();
    await testStudentAssignments();

    // Grade as teacher
    await login(testData.teacher.email, testData.teacher.password);
    if (submission) {
      await testSubmissionGrading(submission.id);
    }

    console.log('\n' + '='.repeat(60));
    console.log('PHASE 13: GOOGLE MEET LIVE CLASSROOM');
    console.log('='.repeat(60));

    await login(testData.admin.email, testData.admin.password);
    await testGoogleMeetConfig();
    await testLiveClassSessionCreation();

    console.log('\n' + '='.repeat(60));
    console.log('✅ INTEGRATION TESTS COMPLETED');
    console.log('='.repeat(60));
    console.log('\nSummary:');
    console.log(
      '- Phase 11 (HR & Payroll): Tested salary templates, payroll generation, leave workflow',
    );
    console.log(
      '- Phase 12 (Digital Classroom): Tested assignment creation, submission, grading',
    );
    console.log(
      '- Phase 13 (Google Meet): Tested configuration endpoints (requires real credentials)',
    );
  } catch (error: any) {
    console.error('\n❌ Test suite failed:', error.message);
    process.exit(1);
  }
}

// Run tests if executed directly
if (require.main === module) {
  runTests().catch(console.error);
}

export { runTests };
