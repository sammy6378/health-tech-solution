
import { useAppointmentMetrics } from '@/hooks/useAppointments';
import { useGetPrescriptionMetrics } from '@/hooks/usePrescriptions';
import {
  Calendar,
  Pill,
  HeartPulse,
  Activity,
  ChevronRight,
} from 'lucide-react';
import { UiStats } from '@/components/utils/uiStats';

const PatientStatsPage = () => {
  const {scheduled} = useAppointmentMetrics();
  const {activePrescriptions} = useGetPrescriptionMetrics();


  return (
    <div className="min-h-screen text-gray-900 dark:text-gray-100 transition-colors duration-300">
      <main className="container mx-auto p-4">
        {/* Stats Overview */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          {/* Appointments Card */}
          <div className="p-4 rounded-lg shadow bg-white dark:bg-gray-800">
            <div className="flex justify-between items-center">
              <div>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  Upcoming
                </p>
                <h3 className="text-2xl font-bold">{scheduled}</h3>
              </div>
              <div className="p-3 rounded-full bg-blue-100 dark:bg-blue-900 text-blue-600 dark:text-blue-300">
                <Calendar size={24} />
              </div>
            </div>
            <p className="text-sm mt-2 text-gray-500 dark:text-gray-400">
              Appointments
            </p>
          </div>

          {/* BMI Card */}
          <div className="p-4 rounded-lg shadow bg-white dark:bg-gray-800">
            <div className="flex justify-between items-center">
              <div>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  Current
                </p>
                <h3 className="text-2xl font-bold">22.4</h3>
              </div>
              <div className="p-3 rounded-full bg-green-100 dark:bg-green-900 text-green-600 dark:text-green-300">
                <Activity size={24} />
              </div>
            </div>
            <p className="text-sm mt-2 text-gray-500 dark:text-gray-400">BMI</p>
          </div>

          {/* Prescriptions Card */}
          <div className="p-4 rounded-lg shadow bg-white dark:bg-gray-800">
            <div className="flex justify-between items-center">
              <div>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  Active
                </p>
                <h3 className="text-2xl font-bold">{activePrescriptions}</h3>
              </div>
              <div className="p-3 rounded-full bg-purple-100 dark:bg-purple-900 text-purple-600 dark:text-purple-300">
                <Pill size={24} />
              </div>
            </div>
            <p className="text-sm mt-2 text-gray-500 dark:text-gray-400">
              Prescriptions
            </p>
          </div>

          {/* Health Status Card */}
          <div className="p-4 rounded-lg shadow bg-white dark:bg-gray-800">
            <div className="flex justify-between items-center">
              <div>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  Overall
                </p>
                <h3 className="text-2xl font-bold">Good</h3>
              </div>
              <div className="p-3 rounded-full bg-yellow-100 dark:bg-yellow-900 text-yellow-600 dark:text-yellow-300">
                <HeartPulse size={24} />
              </div>
            </div>
            <p className="text-sm mt-2 text-gray-500 dark:text-gray-400">
              Health Status
            </p>
          </div>
        </div>

        {/* Main Content */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Column */}
          <div className="lg:col-span-2 space-y-6">
            {/* Calendar Section */}
            <div className="rounded-lg shadow bg-white dark:bg-gray-800 p-4">
              <div className="flex justify-between items-center mb-4">
                <h2 className="font-semibold flex items-center">
                  <Calendar className="mr-2" size={20} />
                  Calendar
                </h2>
                <button className="text-sm flex items-center text-blue-600 dark:text-blue-400">
                  View All <ChevronRight size={16} />
                </button>
              </div>
              <div className="bg-gray-100 dark:bg-gray-700 rounded-lg p-4 h-64 flex items-center justify-center">
                <p className="text-gray-500 dark:text-gray-400">
                  Calendar widget would go here
                </p>
              </div>
            </div>

            {/* Recent Orders Section */}
           <UiStats.RecentOrders />
          </div>

          {/* Right Column */}
          <div className="space-y-6">
            {/* Upcoming Appointments */}
           <UiStats.upcomingAppointments />

            {/* Prescriptions */}
           <UiStats.ActivePrescriptions />

            {/* BMI Tracker */}
            <div className="rounded-lg shadow bg-white dark:bg-gray-800 p-4">
              <div className="flex justify-between items-center mb-4">
                <h2 className="font-semibold flex items-center">
                  <Activity className="mr-2" size={20} />
                  BMI Tracker
                </h2>
                <button className="text-sm text-blue-600 dark:text-blue-400">
                  Add Record
                </button>
              </div>
              <div className="bg-gray-100 dark:bg-gray-700 rounded-lg p-4 h-48 flex flex-col items-center justify-center">
                <div className="relative w-full h-32">
                  {/* BMI chart would go here */}
                  <div
                    className="absolute bottom-0 left-0 right-0 bg-blue-500 dark:bg-blue-600 rounded-t-lg"
                    style={{ height: '60%' }}
                  ></div>
                  <div
                    className="absolute bottom-0 left-1/4 right-0 bg-blue-400 dark:bg-blue-500 rounded-t-lg"
                    style={{ height: '75%' }}
                  ></div>
                  <div
                    className="absolute bottom-0 left-2/4 right-0 bg-blue-300 dark:bg-blue-400 rounded-t-lg"
                    style={{ height: '50%' }}
                  ></div>
                  <div
                    className="absolute bottom-0 left-3/4 right-0 bg-blue-200 dark:bg-blue-300 rounded-t-lg"
                    style={{ height: '65%' }}
                  ></div>
                </div>
                <p className="mt-2 text-gray-500 dark:text-gray-400 text-sm">
                  Last 4 months
                </p>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  )
};

export default PatientStatsPage;