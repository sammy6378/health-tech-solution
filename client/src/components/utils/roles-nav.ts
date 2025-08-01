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
  Calendar,
  BriefcaseBusiness
} from 'lucide-react'

export const checkRole = (role: Role) => {
  switch (role) {
    case Role.ADMIN:
    case Role.PHARMACY:
      return navGroups.filter((group) => ['Admin', 'Pharmacy'].includes(group.label))
    case Role.DOCTOR:
      return navGroups.filter((group) => ['Doctor'].includes(group.label))
    case Role.PATIENT:
      return navGroups.filter((group) => ['Patient'].includes(group.label))
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
      { title: 'Messages', to: '/dashboard/chat', icon: Users },
      { title: 'Doctors', to: '/dashboard/doctors', icon: BriefcaseMedical },
      {
        title: 'Prescriptions',
        to: '/dashboard/my-prescriptions',
        icon: FilePlus,
      },
      { title: 'Pharmacy', to: '/dashboard/pharmacy', icon: Warehouse },
      { title: 'My Orders', to: '/dashboard/orders', icon: ClipboardList },
      { title: 'Billing', to: '/dashboard/billing', icon: BriefcaseBusiness },
      { title: 'My Profile', to: '/dashboard/profile', icon: User2 },
    ],
  },
  {
    label: 'Doctor',
    links: [
      { title: 'Dashboard', to: '/dashboard/doctor', icon: LayoutDashboard },
      { title: 'Calendar', to: '/dashboard/doctor/calendar', icon: Calendar },
      { title: 'Messages', to: '/dashboard/doctor/chat', icon: Users },
      {
        title: 'Appointments',
        to: '/dashboard/doctor/appointments',
        icon: ClipboardList,
      },
      { title: 'Diagnoses', to: '/dashboard/doctor/diagnoses', icon: Pill },
      {
        title: 'Patients',
        to: '/dashboard/doctor/patients',
        icon: BriefcaseMedical,
      },
      {
        title: 'Prescriptions',
        to: '/dashboard/doctor/prescriptions',
        icon: FilePlus,
      },
      { title: 'Pharmacy', to: '/dashboard/doctor/pharmacy', icon: Warehouse },
      { title: 'My Profile', to: '/dashboard/doctor/profile', icon: User2 },
    ],
  },
  // {
  //   label: 'Pharmacy',
  //   links: [
  //     {
  //       title: 'Dashboard',
  //       to: '/dashboard/pharmacy-dashboard',
  //       icon: LayoutDashboard,
  //     },
  //     {
  //       title: 'Inventory',
  //       to: '/dashboard/pharmacy-dashboard/inventory',
  //       icon: Warehouse,
  //     },
  //     {
  //       title: 'Orders',
  //       to: '/dashboard/pharmacy-dashboard/orders',
  //       icon: ClipboardList,
  //     },
  //     {
  //       title: 'Billing',
  //       to: '/dashboard/pharmacy-dashboard/billing',
  //       icon: BriefcaseBusiness,
  //     },
  //     {
  //       title: 'Prescriptions',
  //       to: '/dashboard/pharmacy-dashboard/patient-prescriptions',
  //       icon: FilePlus,
  //     },
  //   ],
  // },
  {
    label: 'Admin',
    links: [
      { title: 'Dashboard', to: '/dashboard/admin', icon: LayoutDashboard },
      { title: 'Manage Users', to: '/dashboard/admin/patients', icon: Users },
      { title: 'Manage Doctors', to: '/dashboard/admin/doctor', icon: Users },
      { title: 'Pharmacy', to: '/dashboard/admin/pharmacy', icon: Warehouse },
      {
        title: 'Inventory',
        to: '/dashboard/admin/inventory',
        icon: Warehouse,
      },
      {
        title: 'Prescriptions',
        to: '/dashboard/admin/prescriptions',
        icon: FilePlus,
      },
      { title: 'Orders', to: '/dashboard/admin/orders', icon: ClipboardList },
      {
        title: 'Billing',
        to: '/dashboard/admin/billing',
        icon: BriefcaseBusiness,
      },
      { title: 'Settings', to: '/dashboard/admin/settings', icon: Settings },
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
