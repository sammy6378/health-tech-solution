import { Role } from '@/types/Tuser'
import {
  Home,
  ClipboardList,
  User2,
  BriefcaseMedical,
  FilePlus,
  Warehouse,
  Pill,
  Users,
  Settings,
  HelpCircle,
  Search,
  LayoutDashboard,
  Calendar
} from 'lucide-react'
import { FaMoneyBill } from 'react-icons/fa'

export const checkRole = (role: Role) => {
  switch (role) {
    case Role.ADMIN:
      return navGroups.filter((group) => ['Admin'].includes(group.label))
    case Role.DOCTOR:
      return navGroups.filter((group) => ['Doctor'].includes(group.label))
    case Role.PATIENT:
      return navGroups.filter((group) => ['Patient'].includes(group.label))
    case Role.PHARMACY:
      return navGroups.filter((group) => ['Pharmacy'].includes(group.label))
    default:
      return []
  }
}

// Navigation groups for different roles
export const navGroups = [
  {
    label: 'Patient',
    links: [
      { title: 'Home', to: '/dashboard/home', icon: Home },
      {
        title: 'Appointments',
        to: '/dashboard/appointments',
        icon: ClipboardList,
      },
      { title: 'Calendar', to: '/dashboard/my-calendar', icon: Calendar },
      { title: 'Doctors', to: '/dashboard/doctors', icon: BriefcaseMedical },
      {
        title: 'Prescriptions',
        to: '/dashboard/my-prescriptions',
        icon: FilePlus,
      },
      { title: 'Pharmacy', to: '/dashboard/pharmacy', icon: Warehouse },
      { title: 'My Orders', to: '/dashboard/orders', icon: ClipboardList },
      { title: 'Billing', to: '/dashboard/billing', icon: FaMoneyBill },
      { title: 'My Profile', to: '/dashboard/profile', icon: User2 },
    ],
  },
  {
    label: 'Doctor',
    links: [
      { title: 'Dashboard', to: '/dashboard/doctor', icon: LayoutDashboard },
      { title: 'Calendar', to: '/dashboard/doctor/calendar', icon: Calendar },
      {
        title: 'Appointments',
        to: '/dashboard/doctor/appointments',
        icon: ClipboardList,
      },
      { title: 'Diagnoses', to: '/dashboard/doctor/diagnoses', icon: Pill },
      { title: 'Patients', to: '/dashboard/doctor/patients', icon: BriefcaseMedical },
      { title: 'Prescriptions', to: '/dashboard/doctor/prescriptions', icon: FilePlus },
      { title: 'Pharmacy', to: '/dashboard/doctor/pharmacy', icon: Warehouse },
      { title: 'My Profile', to: '/dashboard/doctor/profile', icon: User2 },
    ],
  },
  {
    label: 'Pharmacy',
    links: [
      { title: 'Dashboard', to: '/dashboard/pharmacy-dashboard', icon: LayoutDashboard },
      { title: 'Inventory', to: '/pharmacy/inventory', icon: Warehouse },
      { title: 'Orders', to: '/pharmacy/orders', icon: ClipboardList },
      { title: 'Medicines', to: '/pharmacy/medicines', icon: Pill },
      { title: 'Calendar', to: '/pharmacy/calendar', icon: Calendar },
      {
        title: 'Prescriptions',
        to: '/pharmacy/prescriptions',
        icon: FilePlus,
      },
    ],
  },
  {
    label: 'Admin',
    links: [
      { title: 'Dashboard', to: '/admin/dashboard', icon: LayoutDashboard },
      { title: 'Manage Users', to: '/admin/users', icon: Users },
      { title: 'Settings', to: '/admin/settings', icon: Settings },
      { title: 'Calendar', to: '/admin/calendar', icon: Calendar },
      { title: 'Prescriptions', to: '/admin/prescriptions', icon: FilePlus },
      { title: 'Pharmacy', to: '/admin/pharmacy', icon: Warehouse },
      { title: 'Orders', to: '/admin/orders', icon: ClipboardList },
    ],
  },
  {
    label: 'General',
    links: [
      { title: 'Search', to: '/search', icon: Search },
      { title: 'Help', to: '/help', icon: HelpCircle },
    ],
  },
]
