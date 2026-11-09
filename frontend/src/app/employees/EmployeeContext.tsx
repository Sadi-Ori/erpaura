'use client';

import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { Employee, AttendanceRecord, LeaveBalance, PayrollEntry, TimeOffRequest } from '@/lib/types';
import { getEmployees, getEmployee, getAttendanceRecords, clockInOut, getLeaveBalances, getPayrollEntries, getTimeOffRequests } from '@/lib/hr-payroll-api';

interface EmployeeContextType {
  employees: Employee[];
  selectedEmployee: Employee | null;
  selectedEmployeeId: number;
  setSelectedEmployeeId: (id: number) => void;
  loading: boolean;
  todayAttendance: AttendanceRecord | null;
  leaveBalances: LeaveBalance | null;
  recentPayroll: PayrollEntry[];
  recentLeaves: TimeOffRequest[];
  recentAttendance: AttendanceRecord[];
  punchClock: () => Promise<{ success: boolean; message: string }>;
  refreshData: () => Promise<void>;
}

const EmployeeContext = createContext<EmployeeContextType | undefined>(undefined);

export function EmployeeProvider({ children }: { children: React.ReactNode }) {
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [selectedEmployeeId, setSelectedEmployeeIdState] = useState<number>(1);
  const [selectedEmployee, setSelectedEmployee] = useState<Employee | null>(null);
  const [todayAttendance, setTodayAttendance] = useState<AttendanceRecord | null>(null);
  const [leaveBalances, setLeaveBalances] = useState<LeaveBalance | null>(null);
  const [recentPayroll, setRecentPayroll] = useState<PayrollEntry[]>([]);
  const [recentLeaves, setRecentLeaves] = useState<TimeOffRequest[]>([]);
  const [recentAttendance, setRecentAttendance] = useState<AttendanceRecord[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  // Initialize selectedEmployeeId from localStorage if available
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('aura_ess_employee_id');
      if (saved) {
        setSelectedEmployeeIdState(parseInt(saved, 10));
      }
    }
  }, []);

  const setSelectedEmployeeId = (id: number) => {
    setSelectedEmployeeIdState(id);
    if (typeof window !== 'undefined') {
      localStorage.setItem('aura_ess_employee_id', String(id));
    }
  };

  const loadData = useCallback(async () => {
    try {
      const empList = await getEmployees();
      setEmployees(empList);

      const targetId: number = selectedEmployeeId || (empList.length > 0 && empList[0].id ? empList[0].id : 1);
      const emp = await getEmployee(targetId);
      setSelectedEmployee(emp || (empList.length > 0 ? empList[0] : null));

      const todayStr = new Date().toISOString().split('T')[0];
      const [todayAttList, allAttList, balancesList, payrollList, leavesList] = await Promise.all([
        getAttendanceRecords({ employee: targetId, date: todayStr }),
        getAttendanceRecords({ employee: targetId }),
        getLeaveBalances(targetId),
        getPayrollEntries({ employee: targetId }),
        getTimeOffRequests({ employee: targetId }),
      ]);

      setTodayAttendance(todayAttList.length > 0 ? todayAttList[0] : null);
      setRecentAttendance(allAttList);
      setLeaveBalances(balancesList.length > 0 ? balancesList[0] : (emp?.leave_balance || null));
      setRecentPayroll(payrollList);
      setRecentLeaves(leavesList);
    } catch (err) {
      console.error('Error loading ESS data:', err);
    } finally {
      setLoading(false);
    }
  }, [selectedEmployeeId]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const punchClock = async (): Promise<{ success: boolean; message: string }> => {
    if (!selectedEmployee || !selectedEmployee.id) return { success: false, message: 'No employee selected' };
    const res = await clockInOut(selectedEmployee.id);
    if (res && res.status) {
      await loadData();
      return { success: true, message: res.message || `Successfully recorded ${res.action}` };
    }
    return { success: false, message: 'Punch clock registration failed' };
  };

  return (
    <EmployeeContext.Provider
      value={{
        employees,
        selectedEmployee,
        selectedEmployeeId,
        setSelectedEmployeeId,
        loading,
        todayAttendance,
        leaveBalances,
        recentPayroll,
        recentLeaves,
        recentAttendance,
        punchClock,
        refreshData: loadData,
      }}
    >
      {children}
    </EmployeeContext.Provider>
  );
}

export function useEmployee() {
  const context = useContext(EmployeeContext);
  if (!context) {
    throw new Error('useEmployee must be used within an EmployeeProvider');
  }
  return context;
}
