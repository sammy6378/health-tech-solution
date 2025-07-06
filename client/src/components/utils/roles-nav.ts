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
  USER = 'user',
  PHARMACY = 'Pharmacy',
}

export const checkRole = (role: Role) => {
  switch (role) {
    case Role.ADMIN:
      return navGroups.filter((group) => ['Admin'].includes(group.label))
    case Role.DOCTOR:
      return navGroups.filter((group) => ['Doctor'].includes(group.label))
    case Role.USER:
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
      { title: 'My Profile', to: '/dashboard/profile', icon: User2 },
    ],
  },
  {
    label: 'Doctor',
    links: [
      { title: 'Dashboard', to: '/doctor/dashboard', icon: LayoutDashboard },
      { title: 'Patients', to: '/doctor/patients', icon: BriefcaseMedical },
      { title: 'Prescriptions', to: '/doctor/prescriptions', icon: FilePlus },
      { title: 'Calendar', to: '/doctor/calendar', icon: Calendar },
      { title: 'Pharmacy', to: '/doctor/pharmacy', icon: Warehouse },
    ],
  },
  {
    label: 'Pharmacy',
    links: [
      { title: 'Dashboard', to: '/pharmacy/dashboard', icon: LayoutDashboard },
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
