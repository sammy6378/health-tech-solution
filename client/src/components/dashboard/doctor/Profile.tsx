
import { CreateDoctorForm } from "@/components/modals/NewDoctor"
import { useGetDoctorProfileByUserId } from "@/hooks/useDoctorProfile"
import { useAuthStore } from "@/store/store"

const DoctorProfile = () => {
  const {user} = useAuthStore()
  const userId = user?.userId || ''
    const { doctorProfile } = useGetDoctorProfileByUserId(userId)
    


  return (
    <div>
      {doctorProfile? (
        <DoctorProfile />
      ) : ( 
        <CreateDoctorForm />
      )}
    </div>
  )
}

export default DoctorProfile
