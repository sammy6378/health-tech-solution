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

export enum Role {
  ADMIN = 'Admin',
  DOCTOR = 'Doctor',
  PATIENT = 'Patient',
  PHARMACY = 'Pharmacy',
}

export const checkRole = (role: Role) => {
  switch (role) {
    case Role.ADMIN:
      return navGroups.filter((group) => ['Admin'].includes(group.label))
    case Role.DOCTOR:
      return navGroups.filter((group) => ['Doctor'].includes(group.label))
    case Role.PATIENT:
      return navGroups.filter((group) => ['User'].includes(group.label))
    case Role.PHARMACY:
      return navGroups.filter((group) => ['Pharmacy'].includes(group.label))
    default:
      return []
  }
}

// Navigation groups for different roles
export const navGroups = [
  {
    label: 'User',
    links: [
      { title: 'Home', url: '/dashboard/home', icon: Home },
      {
        title: 'Appointments',
        url: '/dashboard/appointments',
        icon: ClipboardList,
      },
      { title: 'Calendar', url: '/dashboard/my-calendar', icon: Calendar },
      {
        title: 'Prescriptions',
        url: '/dashboard/my-prescriptions',
        icon: FilePlus,
      },
      { title: 'Pharmacy', url: '/pharmacy', icon: Warehouse },
      { title: 'My Orders', url: '/orders', icon: ClipboardList },
      { title: 'My Profile', url: '/profile', icon: User2 },
    ],
  },
  {
    label: 'Doctor',
    links: [
      { title: 'Dashboard', url: '/doctor/dashboard', icon: LayoutDashboard },
      { title: 'Patients', url: '/doctor/patients', icon: BriefcaseMedical },
      { title: 'Prescriptions', url: '/doctor/prescriptions', icon: FilePlus },
      { title: 'Calendar', url: '/doctor/calendar', icon: Calendar },
      { title: 'Pharmacy', url: '/doctor/pharmacy', icon: Warehouse },
    ],
  },
  {
    label: 'Pharmacy',
    links: [
      { title: 'Dashboard', url: '/pharmacy/dashboard', icon: LayoutDashboard },
      { title: 'Inventory', url: '/pharmacy/inventory', icon: Warehouse },
      { title: 'Orders', url: '/pharmacy/orders', icon: ClipboardList },
      { title: 'Medicines', url: '/pharmacy/medicines', icon: Pill },
      { title: 'Calendar', url: '/pharmacy/calendar', icon: Calendar },
      {
        title: 'Prescriptions',
        url: '/pharmacy/prescriptions',
        icon: FilePlus,
      },
    ],
  },
  {
    label: 'Admin',
    links: [
      { title: 'Dashboard', url: '/admin/dashboard', icon: LayoutDashboard },
      { title: 'Manage Users', url: '/admin/users', icon: Users },
      { title: 'Settings', url: '/admin/settings', icon: Settings },
      { title: 'Calendar', url: '/admin/calendar', icon: Calendar },
      { title: 'Prescriptions', url: '/admin/prescriptions', icon: FilePlus },
      { title: 'Pharmacy', url: '/admin/pharmacy', icon: Warehouse },
      { title: 'Orders', url: '/admin/orders', icon: ClipboardList },
    ],
  },
  {
    label: 'General',
    links: [
      { title: 'Search', url: '/search', icon: Search },
      { title: 'Help', url: '/help', icon: HelpCircle },
    ],
  },
]
