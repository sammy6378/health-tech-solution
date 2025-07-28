import { useUserData } from '@/hooks/useDashboard'
import { detectQueryFromPrompt } from './intent'
import type { DetectedQuery } from './interfaces/query-kinds'
import {
  AppointmentStatus,
  PaymentStatus,
  DeliveryStatus,
  type TAppointment,
  type TMedication,
} from '@/types/api-types'
import { useGetDoctors } from '@/hooks/useUserHook'
import { useGetMedications } from '@/hooks/useMedication'
import type { TUser } from '@/types/Tuser'

function summarizeEntity(entity: Record<string, any>): string {
  return Object.entries(entity)
    .filter(([, v]) => typeof v !== 'object' && v !== undefined && v !== null)
    .map(([k, v]) => `${k}: ${v}`)
    .join(', ')
}

export function useDashboardAiQueryService() {
  const dashboard = useUserData()
  const { data: doctors } = useGetDoctors()
  const { data: stocks } = useGetMedications()

  const summarizeAppointments = (
    appts: TAppointment[],
    label: string,
  ): string => {
    if (!appts.length) return `No ${label} appointments found.`
    const first = appts[0]

    // Extract doctor info if available
    let doctorInfo = ''
    if (first.doctor) {
      const docName = [first.doctor.first_name, first.doctor.last_name]
        .filter(Boolean)
        .join(' ')
      const docSpec = first.doctor.doctorProfile?.specialization
      doctorInfo = ` with Dr. ${docName}${docSpec ? ' (' + docSpec + ')' : ''}`
    }

    // Extract appointment time if available
    const startTime = first.start_time ? ` at ${first.start_time}` : ''
    const endTime = first.end_time ? ` - ${first.end_time}` : ''
    const time = startTime || endTime ? ` from ${startTime}${endTime}` : ''

    return `You have ${appts.length} ${label} appointment${appts.length > 1 ? 's' : ''}. Your next appointment is scheduled for ${first.appointment_date}${time}${doctorInfo}.`
  }

  // doctors
  const searchDoctors = (query: string): any[] => {
  if (!doctors?.data) return []

  const searchTerm = query.toLowerCase()

  return doctors.data.filter(
    (doctor) =>
      doctor.first_name?.toLowerCase().includes(searchTerm) ||
      doctor.last_name?.toLowerCase().includes(searchTerm) ||
      `${doctor.first_name} ${doctor.last_name}`.toLowerCase().includes(searchTerm) ||
      doctor.doctorProfile?.specialization?.toLowerCase().includes(searchTerm)
  )
}

const summarizeDoctors = (docs: TUser[], searchTerm?: string): string => {
  if (!docs.length) {
    return searchTerm
      ? `No doctors found matching "${searchTerm}". Try searching by first name, last name, or specialization.`
      : 'No doctors found in our network.'
  }

  if (docs.length === 1) {
    const doctor = docs[0]
    console.log('doctor', doctor)
    // Fix: Use doctor.first_name instead of just doctor
    const fullName = `${doctor.first_name || 'Unknown'} ${doctor.last_name || 'Unknown'}`
    const specialization =
      doctor.doctorProfile?.specialization || 'General Practice'
    const experience = doctor.doctorProfile?.years_of_experience

    // Debug log for single doctor
    console.log('Single doctor summary:', { doctor, fullName, specialization })

    const availability =
      Array.isArray(doctor.doctorProfile?.days) &&
      doctor.doctorProfile.days.length > 0
        ? `Available: ${doctor.doctorProfile.days
            .map((d: any) => (typeof d === 'object' && 'day' in d ? d.day : d))
            .join(', ')}`
        : 'Availability not specified'

    return `Dr. ${fullName} - ${specialization}${experience ? ` (${experience} years experience)` : ''}. ${availability}.`
  }

  // Multiple doctors - list them all with correct names from your actual data
  const doctorList = docs.map((doctor) => {
    const fullName = `${doctor.first_name || 'Unknown'} ${doctor.last_name || 'Unknown'}`
    const specialization =
      doctor.doctorProfile?.specialization || 'General Practice'

    // Format availability
    let availabilityText = ''
    if (
      Array.isArray(doctor.doctorProfile?.days) &&
      doctor.doctorProfile.days.length > 0
    ) {
      const days = doctor.doctorProfile.days
        .map((d: any) => (typeof d === 'object' && 'day' in d ? d.day : d))
        .join(', ')
      availabilityText = ` (Available: ${days})`
    }

    return `Dr. ${fullName}, specializing in ${specialization}${availabilityText}`
  })

  return `We have ${docs.length} doctors available in our network: ${doctorList.join('. ')}.`
}

  // stocks
 const summarizeStocks = (stocks: TMedication[], label?: string): string => {
   if (!stocks.length)
     return `No ${label ?? ''} medications found in our pharmacy.`.trim()

   const totalCount = stocks.length
   const first = stocks[0]
   const categories = [...new Set(stocks.map((s) => s.category))].slice(0, 3)

   let summary = `Our pharmacy has ${totalCount} medication${totalCount > 1 ? 's' : ''} available. `

   if (categories.length > 0) {
     summary += `Categories include: ${categories.join(', ')}. `
   }

   summary += `For example: ${first.name} (${first.category}) - ${first.stock_quantity} units in stock.`

   return summary
 }

  // Add a more comprehensive stock search
  const searchStocks = (query: string): TMedication[] => {
    if (!stocks?.data) {
      console.log('No stock data available')
      return []
    }

    console.log('Searching stocks for:', query)
    console.log('Total stocks available:', stocks.data.length)

    const searchTerm = query.toLowerCase().trim()

    const results = stocks.data.filter(
      (stock) =>
        stock.name.toLowerCase().includes(searchTerm) ||
        stock.category.toLowerCase().includes(searchTerm) ||
        stock.manufacturer.toLowerCase().includes(searchTerm) ||
        stock.medication_type.toLowerCase().includes(searchTerm) ||
        stock.description?.toLowerCase().includes(searchTerm) ||
        // Add more flexible matching
        stock.name.toLowerCase().startsWith(searchTerm) ||
        stock.name.toLowerCase().endsWith(searchTerm),
    )

    console.log('Search results:', results.length, 'found')
    return results
  }

  const summarizeOrders = (orders: any[], label?: string): string => {
    if (!orders.length) return `No ${label ?? ''} orders found.`.trim()
    const first = orders[0]
    return `You have ${orders.length} ${label ? label + ' ' : ''}order${orders.length > 1 ? 's' : ''}. Latest order details: ${summarizeEntity(first)}`
  }

  const summarizePayments = (payments: any[], status?: string): string => {
    if (!payments.length)
      return `No ${status ? status.toLowerCase() + ' ' : ''}payments found.`
    const first = payments[0]
    return `Found ${payments.length} ${status ? status.toLowerCase() + ' ' : ''}payment${payments.length > 1 ? 's' : ''}. Latest payment details: ${summarizeEntity(first)}`
  }

  const summarizeDiagnoses = (diagnoses: any[]): string => {
    if (!diagnoses.length) return 'No diagnoses found.'
    const first = diagnoses[0]
    return `Found ${diagnoses.length} diagnosis${diagnoses.length > 1 ? 'es' : ''}. Latest diagnosis details: ${summarizeEntity(first)}`
  }

  const summarizePrescriptions = (
    prescriptions: any[],
    status?: string,
  ): string => {
    if (!prescriptions.length)
      return `No ${status ? status + ' ' : ''}prescriptions found.`
    const first = prescriptions[0]
    return `You have ${prescriptions.length} ${status ? status + ' ' : ''}prescription${prescriptions.length > 1 ? 's' : ''}. Latest prescription details: ${summarizeEntity(first)}`
  }

  const executeQuery = (detected: DetectedQuery) => {
    try {
      switch (detected.kind) {
        // ----------------------------------------------------------------
        // stocks
        // ----------------------------------------------------------------
        // all stocks
        case 'stock:all':
          const allStocks = stocks?.data ?? []
          return {
            summary: summarizeStocks(allStocks, 'all'),
            data: allStocks,
          }

        case 'stock:search': {
          const searchTerm = detected.args.query as string
          const searchResults = searchStocks(searchTerm)
          return {
            summary:
              searchResults.length > 0
                ? `Found ${searchResults.length} medication${searchResults.length > 1 ? 's' : ''} matching "${searchTerm}": ${searchResults
                    .slice(0, 3)
                    .map((s) => s.name)
                    .join(
                      ', ',
                    )}${searchResults.length > 3 ? ` and ${searchResults.length - 3} more` : ''}.`
                : `No medications found matching "${searchTerm}". Try searching by category, manufacturer, or medication type.`,
            data: searchResults,
          }
        }

        case 'stock:available': {
          const availableStocks =
            stocks?.data?.filter((s) => s.stock_quantity > 0) ?? []
          return {
            summary:
              availableStocks.length > 0
                ? `${availableStocks.length} medication${availableStocks.length > 1 ? 's' : ''} currently available in stock. Categories: ${[...new Set(availableStocks.map((s) => s.category))].slice(0, 5).join(', ')}.`
                : 'No medications currently available in stock.',
            data: availableStocks,
          }
        }
        // by id
        case 'stock:oneById':
          const stockId = detected.args.id as string
          const stock = stocks?.data.find((s) => s.medication_id === stockId)
          if (!stock) {
            return {
              summary: `No stock found with ID ${stockId}.`,
              data: [],
            }
          }
          return {
            summary: `Stock details: ${summarizeEntity(stock)}`,
            data: [stock],
          }
        // by name
        case 'stock:byName': {
          const name = detected.args.name as string
          console.log('Searching for medication by name:', name)

          if (!name) {
            return {
              summary: 'Please specify a medication name to search for.',
              data: [],
            }
          }

          const filteredStocks =
            stocks?.data?.filter((s) =>
              s.name.toLowerCase().includes(name.toLowerCase()),
            ) ?? []

          console.log('Found stocks by name:', filteredStocks.length)

          if (filteredStocks.length === 0) {
            const broaderSearch = searchStocks(name)
            if (broaderSearch.length > 0) {
              return {
                summary: `Our pharmacy has ${broaderSearch.length} medication${broaderSearch.length > 1 ? 's' : ''} similar to "${name}": ${broaderSearch
                  .slice(0, 3)
                  .map((s) => s.name)
                  .join(', ')}.`,
                data: broaderSearch,
              }
            }

            return {
              summary: `No medications matching "${name}" found in our pharmacy. Try checking the spelling or search by category.`,
              data: [],
            }
          }

          return {
            summary: `Our pharmacy has ${filteredStocks.length} medication${filteredStocks.length > 1 ? 's' : ''} matching "${name}": ${filteredStocks.map((s) => `${s.name} (${s.stock_quantity} units available)`).join(', ')}.`,
            data: filteredStocks,
          }
        }
        // by category
        case 'stock:byCategory': {
          const category = detected.args.category as string
          const filteredStocks = stocks?.data.filter(
            (s) => s.category.toLowerCase() === category.toLowerCase(),
          )
          if (!filteredStocks || filteredStocks.length === 0) {
            return {
              summary: `No stocks found in category "${category}".`,
              data: [],
            }
          }
          return {
            summary: `Found ${filteredStocks.length} stock${filteredStocks.length > 1 ? 's' : ''} in category "${category}". Latest stock details: ${summarizeEntity(filteredStocks[0])}`,
            data: filteredStocks,
          }
        }
        // by type
        case 'stock:byType': {
          const type = detected.args.type as string
          const filteredStocks = stocks?.data.filter(
            (s) => s.medication_type.toLowerCase() === type.toLowerCase(),
          )
          if (!filteredStocks || filteredStocks.length === 0) {
            return {
              summary: `No stocks found of type "${type}".`,
              data: [],
            }
          }
          return {
            summary: `Found ${filteredStocks.length} stock${filteredStocks.length > 1 ? 's' : ''} of type "${type}". Latest stock details: ${summarizeEntity(filteredStocks[0])}`,
            data: filteredStocks,
          }
        }
        // by manufacturer
        case 'stock:byManufacturer': {
          const manufacturer = detected.args.manufacturer as string
          const filteredStocks = stocks?.data.filter(
            (s) => s.manufacturer.toLowerCase() === manufacturer.toLowerCase(),
          )
          if (!filteredStocks || filteredStocks.length === 0) {
            return {
              summary: `No stocks found from manufacturer "${manufacturer}".`,
              data: [],
            }
          }
          return {
            summary: `Found ${filteredStocks.length} stock${filteredStocks.length > 1 ? 's' : ''} from manufacturer "${manufacturer}". Latest stock details: ${summarizeEntity(filteredStocks[0])}`,
            data: filteredStocks,
          }
        }

        // ----------------------------------------------------------------
        // ORDERS
        // ----------------------------------------------------------------
        case 'orders:all':
          return {
            summary: summarizeOrders(dashboard.orders),
            data: dashboard.orders,
          }

        case 'orders:paymentStatus': {
          const status = detected.args.status as PaymentStatus
          const filteredOrders = dashboard.orders.filter(
            (o) => o.payment_status === status,
          )
          return {
            summary: summarizeOrders(filteredOrders, `payment ${status}`),
            data: filteredOrders,
          }
        }

        case 'orders:deliveryStatus': {
          const status = detected.args.status as DeliveryStatus
          const filteredOrders = dashboard.orders.filter(
            (o) => o.delivery_status === status,
          )
          return {
            summary: summarizeOrders(filteredOrders, `delivery ${status}`),
            data: filteredOrders,
          }
        }

        // ----------------------------------------------------------------
        // APPOINTMENTS
        // ----------------------------------------------------------------
        case 'appointments:all':
          return {
            summary: summarizeAppointments(dashboard.appointments, 'total'),
            data: dashboard.appointments,
          }

        case 'appointments:upcoming':
          return {
            summary: summarizeAppointments(
              dashboard.upcomingAppointments,
              'upcoming',
            ),
            data: dashboard.upcomingAppointments,
          }

        case 'appointments:status': {
          const status = detected.args.status as AppointmentStatus
          const filteredAppointments = dashboard.appointments.filter(
            (a) => a.status === status,
          )
          return {
            summary: summarizeAppointments(filteredAppointments, `${status}`),
            data: filteredAppointments,
          }
        }

        case 'appointments:consultationType': {
          const consultationType = detected.args.consultationType
          const filteredAppointments = dashboard.appointments.filter(
            (a) => a.consultation_type === consultationType,
          )
          return {
            summary: summarizeAppointments(
              filteredAppointments,
              `${consultationType}`,
            ),
            data: filteredAppointments,
          }
        }

        // ----------------------------------------------------------------
        // PAYMENTS
        // ----------------------------------------------------------------
        case 'payments:all':
          return {
            summary: summarizePayments(dashboard.payments),
            data: dashboard.payments,
          }

        case 'payments:status': {
          const status = detected.args.status as PaymentStatus
          const filteredPayments = dashboard.payments.filter(
            (p) => p.payment_status === status,
          )
          return {
            summary: summarizePayments(filteredPayments, status),
            data: filteredPayments,
          }
        }

        // ----------------------------------------------------------------
        // DIAGNOSES & PRESCRIPTIONS
        // ----------------------------------------------------------------
        case 'diagnoses:all':
          return {
            summary: summarizeDiagnoses(dashboard.diagnoses),
            data: dashboard.diagnoses,
          }

        case 'diagnoses:latest': {
          const latestDiagnosis = dashboard.diagnoses[0] // Assuming sorted by date
          return {
            summary: latestDiagnosis
              ? `Latest diagnosis: ${summarizeEntity(latestDiagnosis)}`
              : 'No recent diagnosis found.',
            data: latestDiagnosis ? [latestDiagnosis] : [],
          }
        }

        // Prescriptions
        case 'prescriptions:all':
          return {
            summary: summarizePrescriptions(dashboard.prescriptions),
            data: dashboard.prescriptions,
          }

        case 'prescriptions:active':
          return {
            summary: summarizePrescriptions(
              dashboard.activePrescriptions,
              'active',
            ),
            data: dashboard.activePrescriptions,
          }

        case 'prescriptions:pending':
          return {
            summary: summarizePrescriptions(
              dashboard.pendingPrescriptions,
              'pending',
            ),
            data: dashboard.pendingPrescriptions,
          }

        // ----------------------------------------------------------------
        // DOCTORS
        // ----------------------------------------------------------------
        case 'doctor:all': {
          const allDoctors = doctors?.data ?? []

          // Debug: Log the actual doctor names
          if (allDoctors.length > 0) {
            console.log(
              'Doctor names:',
              allDoctors.map((d) => `${d.first_name} ${d.last_name}`),
            )
          }

          return {
            summary: allDoctors.length
              ? summarizeDoctors(allDoctors) // Use the summarizeDoctors function instead of generic text
              : 'No doctors found in our network.',
            data: allDoctors,
          }
        }
        case 'doctor:search': {
          const query = detected.args.query as string
          const searchResults = searchDoctors(query)
          return {
            summary: summarizeDoctors(searchResults, query),
            data: searchResults,
          }
        }

        case 'doctor:availableToday': {
          const today = new Date().getDay()
          const availableDoctors =
            doctors?.data?.filter((doc) =>
              doc.doctorProfile?.days?.some(
                (slot: any) => slot.day === today && slot.available,
              ),
            ) ?? []
          return {
            summary: availableDoctors.length
              ? `${availableDoctors.length} doctor${availableDoctors.length > 1 ? 's are' : ' is'} available today.`
              : 'No doctors are available today.',
            data: availableDoctors,
          }
        }

        case 'doctor:byName': {
          const name = detected.args.name as string
          const filteredDoctors =
            doctors?.data?.filter(
              (d) =>
                d?.first_name?.toLowerCase().includes(name.toLowerCase()) ||
                d?.last_name?.toLowerCase().includes(name.toLowerCase()) ||
                `${d.first_name} ${d.last_name}`
                  .toLowerCase()
                  .includes(name.toLowerCase()),
            ) ?? []

          return {
            summary: summarizeDoctors(filteredDoctors, name),
            data: filteredDoctors,
          }
        }

        case 'doctor:bySpecialization': {
          const specialization = detected.args.specialization as string
          if (!specialization) {
            return {
              summary: 'Please specify a specialization to search for.',
              data: [],
            }
          }
          const filteredDoctors =
            doctors?.data?.filter((doc) =>
              doc.doctorProfile?.specialization
                ?.toLowerCase()
                .includes(specialization.toLowerCase()),
            ) ?? []
          return {
            summary: filteredDoctors.length
              ? `Found ${filteredDoctors.length} doctor${filteredDoctors.length > 1 ? 's' : ''} specialized in "${specialization}".`
              : `No doctors found with specialization "${specialization}".`,
            data: filteredDoctors,
          }
        }

        // ----------------------------------------------------------------
        // MEDICAL RECORDS
        // ----------------------------------------------------------------
        case 'records:all':
          return {
            summary: dashboard.medicalRecords.length
              ? `You have ${dashboard.medicalRecords.length} medical record${dashboard.medicalRecords.length > 1 ? 's' : ''}.`
              : 'No medical records found.',
            data: dashboard.medicalRecords,
          }

        default:
          return {
            summary:
              "I couldn't find relevant information for your request in your dashboard data.",
            data: null,
          }
      }
    } catch (error) {
      console.error('Error executing dashboard query:', error)
      return {
        summary:
          'I encountered an issue while processing your request. Please try again.',
        data: null,
      }
    }
  }

  const handleQuery = (prompt: string) => {
    console.log('Processing dashboard query:', prompt)

    const detected = detectQueryFromPrompt(prompt)
    console.log('Detected intent:', detected)

    let result = executeQuery(detected)

    // If primary fails and confidence is low, try fallbacks
    if (
      (!result.data ||
        (Array.isArray(result.data) && result.data.length === 0)) &&
      detected.confidence < 0.6 &&
      detected.fallbackQueries
    ) {
      console.log('Primary query failed, trying fallbacks...')

      for (const fallbackKind of detected.fallbackQueries) {
        const fallbackResult = executeQuery({
          kind: fallbackKind,
          args: detected.args,
          confidence: 0.3,
        })

        if (
          fallbackResult.data &&
          (!Array.isArray(fallbackResult.data) ||
            fallbackResult.data.length > 0)
        ) {
          result = {
            ...fallbackResult,
            summary: `I found this related information: ${fallbackResult.summary}`,
          }
          break
        }
      }
    }

    // If still no results, provide suggestions based on available data
    if (
      !result.data ||
      (Array.isArray(result.data) && result.data.length === 0)
    ) {
      result = provideSuggestions(prompt, detected)
    }

    return result
  }

  const provideSuggestions = (_prompt: string, detected: DetectedQuery) => {
    const suggestions: string[] = []

    // Based on the failed query type and available data, suggest alternatives
    if (detected.kind.includes('doctor') && dashboard.myDoctors.length > 0) {
      suggestions.push(
        `You have ${dashboard.myDoctors.length} doctors in your network. You can ask about their availability or schedule an appointment.`,
      )
    }
    // stocks
    if (detected.kind.includes('stock') && (stocks?.data?.length ?? 0) > 0) {
      suggestions.push(
        `You have ${stocks?.data?.length ?? 0} stocks available. You can ask about specific stocks or categories.`,
      )
    }
    if (
      detected.kind.includes('appointment') &&
      dashboard.appointments.length > 0
    ) {
      suggestions.push(
        `You have ${dashboard.appointments.length} appointments total. ${dashboard.upcomingAppointments.length} are upcoming.`,
      )
    }

    if (detected.kind.includes('order') && dashboard.orders.length > 0) {
      suggestions.push(
        `You have ${dashboard.orders.length} orders. ${dashboard.pendingOrders.length} are pending payment.`,
      )
    }

    if (detected.kind.includes('payment') && dashboard.payments.length > 0) {
      suggestions.push(`You have ${dashboard.payments.length} payment records.`)
    }

    if (detected.kind.includes('diagnosis') && dashboard.diagnoses.length > 0) {
      suggestions.push(
        `You have ${dashboard.diagnoses.length} diagnosis records.`,
      )
    }

    if (
      detected.kind.includes('prescription') &&
      dashboard.prescriptions.length > 0
    ) {
      suggestions.push(
        `You have ${dashboard.prescriptions.length} prescriptions. ${dashboard.activePrescriptions.length} are active.`,
      )
    }

    const finalSummary =
      suggestions.length > 0
        ? `I couldn't find exactly what you were looking for, but here's what I can help with: ${suggestions.join(' ')}`
        : "I couldn't understand your request. You can ask me about your appointments, orders, payments, diagnoses, or prescriptions."

    return {
      summary: finalSummary,
      data: null,
    }
  }

  return {
    handleQuery,
    dashboard, // Expose dashboard data if needed
  }
}
