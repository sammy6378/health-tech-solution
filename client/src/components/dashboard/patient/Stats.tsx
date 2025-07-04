
import {
  Calendar,
  Clock,
  Pill,
  ClipboardList,
  HeartPulse,
  Activity,
  ChevronRight,
  MoreHorizontal,
  Plus
} from 'lucide-react';

const PatientStatsPage = () => {

  // Sample data
  const upcomingAppointments = [
    { id: 1, doctor: 'Dr. Smith', date: '2023-06-15', time: '10:00 AM', type: 'General Checkup' },
    { id: 2, doctor: 'Dr. Johnson', date: '2023-06-20', time: '2:30 PM', type: 'Dermatology' }
  ];

  const prescriptions = [
    { id: 1, name: 'Amoxicillin', dosage: '500mg', frequency: 'Twice daily', remaining: '10 days' },
    { id: 2, name: 'Lisinopril', dosage: '10mg', frequency: 'Once daily', remaining: '30 days' }
  ];

  const recentOrders = [
    { id: 1, test: 'Blood Work', date: '2023-06-01', status: 'Completed' },
    { id: 2, test: 'X-Ray - Chest', date: '2023-06-05', status: 'Pending' }
  ];

  return (
    <div className="min-h-screen text-gray-900 dark:text-gray-100 transition-colors duration-300">
      <main className="container mx-auto p-4">
        {/* Stats Overview */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          {/* Appointments Card */}
          <div className="p-4 rounded-lg shadow bg-white dark:bg-gray-800">
            <div className="flex justify-between items-center">
              <div>
                <p className="text-sm text-gray-500 dark:text-gray-400">Upcoming</p>
                <h3 className="text-2xl font-bold">3</h3>
              </div>
              <div className="p-3 rounded-full bg-blue-100 dark:bg-blue-900 text-blue-600 dark:text-blue-300">
                <Calendar size={24} />
              </div>
            </div>
            <p className="text-sm mt-2 text-gray-500 dark:text-gray-400">Appointments</p>
          </div>

          {/* BMI Card */}
          <div className="p-4 rounded-lg shadow bg-white dark:bg-gray-800">
            <div className="flex justify-between items-center">
              <div>
                <p className="text-sm text-gray-500 dark:text-gray-400">Current</p>
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
                <p className="text-sm text-gray-500 dark:text-gray-400">Active</p>
                <h3 className="text-2xl font-bold">5</h3>
              </div>
              <div className="p-3 rounded-full bg-purple-100 dark:bg-purple-900 text-purple-600 dark:text-purple-300">
                <Pill size={24} />
              </div>
            </div>
            <p className="text-sm mt-2 text-gray-500 dark:text-gray-400">Prescriptions</p>
          </div>

          {/* Health Status Card */}
          <div className="p-4 rounded-lg shadow bg-white dark:bg-gray-800">
            <div className="flex justify-between items-center">
              <div>
                <p className="text-sm text-gray-500 dark:text-gray-400">Overall</p>
                <h3 className="text-2xl font-bold">Good</h3>
              </div>
              <div className="p-3 rounded-full bg-yellow-100 dark:bg-yellow-900 text-yellow-600 dark:text-yellow-300">
                <HeartPulse size={24} />
              </div>
            </div>
            <p className="text-sm mt-2 text-gray-500 dark:text-gray-400">Health Status</p>
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
                <p className="text-gray-500 dark:text-gray-400">Calendar widget would go here</p>
              </div>
            </div>

            {/* Recent Orders Section */}
            <div className="rounded-lg shadow bg-white dark:bg-gray-800 p-4">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-semibold flex items-center">
                  <ClipboardList className="mr-2" size={20} />
                  Recent Orders
                </h2>
                <button className="text-sm flex items-center text-blue-600 dark:text-blue-400">
                  View All <ChevronRight size={16} />
                </button>
              </div>
              <div className="space-y-4">
                {recentOrders.map(order => (
                  <div key={order.id} className="flex justify-between items-center p-3 border-b border-gray-200 dark:border-gray-700">
                    <div>
                      <p className="font-medium">{order.test}</p>
                      <p className="text-sm text-gray-500 dark:text-gray-400">{order.date}</p>
                    </div>
                    <span className={`px-2 py-1 text-xs rounded-full ${
                      order.status === 'Completed' 
                        ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200' 
                        : 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200'
                    }`}>
                      {order.status}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Right Column */}
          <div className="space-y-6">
            {/* Upcoming Appointments */}
            <div className="rounded-lg shadow bg-white dark:bg-gray-800 p-4">
              <div className="flex justify-between items-center mb-4">
                <h2 className=" font-semibold flex items-center">
                  <Clock className="mr-2" size={20} />
                  Upcoming Appointments
                </h2>
                <button className="text-blue-600 dark:text-blue-400">
                  <Plus size={20} />
                </button>
              </div>
              <div className="space-y-4">
                {upcomingAppointments.map(appointment => (
                  <div key={appointment.id} className="p-3 rounded-lg bg-gray-50 dark:bg-gray-700">
                    <div className="flex justify-between items-start">
                      <div>
                        <p className="font-medium">{appointment.doctor}</p>
                        <p className="text-sm text-gray-500 dark:text-gray-400">{appointment.type}</p>
                      </div>
                      <button className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200">
                        <MoreHorizontal size={16} />
                      </button>
                    </div>
                    <div className="flex items-center mt-2 text-sm">
                      <Calendar size={14} className="mr-1 text-gray-500 dark:text-gray-400" />
                      <span className="text-gray-500 dark:text-gray-400 mr-3">{appointment.date}</span>
                      <Clock size={14} className="mr-1 text-gray-500 dark:text-gray-400" />
                      <span className="text-gray-500 dark:text-gray-400">{appointment.time}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Prescriptions */}
            <div className="rounded-lg shadow bg-white dark:bg-gray-800 p-4">
              <div className="flex justify-between items-center mb-4">
                <h2 className="font-semibold flex items-center">
                  <Pill className="mr-2" size={20} />
                  Active Prescriptions
                </h2>
                <button className="text-sm flex items-center text-blue-600 dark:text-blue-400">
                  View All <ChevronRight size={16} />
                </button>
              </div>
              <div className="space-y-4">
                {prescriptions.map(prescription => (
                  <div key={prescription.id} className="p-3 rounded-lg bg-gray-50 dark:bg-gray-700">
                    <div className="flex justify-between items-start">
                      <div>
                        <p className="font-medium">{prescription.name}</p>
                        <p className="text-sm text-gray-500 dark:text-gray-400">{prescription.dosage}</p>
                      </div>
                      <button className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200">
                        <MoreHorizontal size={16} />
                      </button>
                    </div>
                    <div className="mt-2 text-sm text-gray-500 dark:text-gray-400">
                      <p>{prescription.frequency}</p>
                      <p>Remaining: {prescription.remaining}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* BMI Tracker */}
            <div className="rounded-lg shadow bg-white dark:bg-gray-800 p-4">
              <div className="flex justify-between items-center mb-4">
                <h2 className="font-semibold flex items-center">
                  <Activity className="mr-2" size={20} />
                  BMI Tracker
                </h2>
                <button className="text-sm text-blue-600 dark:text-blue-400">Add Record</button>
              </div>
              <div className="bg-gray-100 dark:bg-gray-700 rounded-lg p-4 h-48 flex flex-col items-center justify-center">
                <div className="relative w-full h-32">
                  {/* BMI chart would go here */}
                  <div className="absolute bottom-0 left-0 right-0 bg-blue-500 dark:bg-blue-600 rounded-t-lg" style={{ height: '60%' }}></div>
                  <div className="absolute bottom-0 left-1/4 right-0 bg-blue-400 dark:bg-blue-500 rounded-t-lg" style={{ height: '75%' }}></div>
                  <div className="absolute bottom-0 left-2/4 right-0 bg-blue-300 dark:bg-blue-400 rounded-t-lg" style={{ height: '50%' }}></div>
                  <div className="absolute bottom-0 left-3/4 right-0 bg-blue-200 dark:bg-blue-300 rounded-t-lg" style={{ height: '65%' }}></div>
                </div>
                <p className="mt-2 text-gray-500 dark:text-gray-400 text-sm">Last 4 months</p>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default PatientStatsPage;