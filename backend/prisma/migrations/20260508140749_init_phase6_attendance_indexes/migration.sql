-- CreateIndex
CREATE INDEX "Attendance_studentId_date_idx" ON "Attendance"("studentId", "date");

-- CreateIndex
CREATE INDEX "Attendance_branchId_date_idx" ON "Attendance"("branchId", "date");

-- CreateIndex
CREATE INDEX "AttendanceScan_studentId_scanTime_idx" ON "AttendanceScan"("studentId", "scanTime");

-- CreateIndex
CREATE INDEX "AttendanceSession_teacherId_date_idx" ON "AttendanceSession"("teacherId", "date");

-- CreateIndex
CREATE INDEX "AttendanceSession_classId_date_idx" ON "AttendanceSession"("classId", "date");

-- CreateIndex
CREATE INDEX "AttendanceSession_subjectId_date_idx" ON "AttendanceSession"("subjectId", "date");

-- CreateIndex
CREATE INDEX "StaffAttendance_branchId_date_idx" ON "StaffAttendance"("branchId", "date");

-- CreateIndex
CREATE INDEX "StaffAttendance_staffId_date_idx" ON "StaffAttendance"("staffId", "date");
