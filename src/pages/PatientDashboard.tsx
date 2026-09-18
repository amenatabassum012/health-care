import { useEffect, useState } from 'react';
import { supabase } from '../lib/supabaseClient';

type PatientData = {
  id?: string;
  name?: string;
  full_name?: string;
  patient_name?: string;
  age?: number;
  gender?: string;
  phone?: string;
  email?: string;
};

function PatientDashboard() {
  const [patient, setPatient] = useState<PatientData | null>(null);

  const [doctorCount, setDoctorCount] = useState(0);
  const [appointmentCount, setAppointmentCount] = useState(0);
  const [referralCount, setReferralCount] = useState(0);
  const [followUpCount, setFollowUpCount] = useState(0);

  const [loading, setLoading] = useState(true);
  const [realtimeStatus, setRealtimeStatus] = useState('Connecting...');

  /*
   * Load current data from Supabase
   */
  const loadPatientDashboard = async () => {
    try {
      /*
       * PATIENT
       */
      const { data: patientData, error: patientError } = await supabase
        .from('patients')
        .select('*')
        .limit(1);

      console.log('PATIENT DATA:', patientData);
      console.log('PATIENT ERROR:', patientError);

      if (!patientError && patientData && patientData.length > 0) {
        setPatient(patientData[0] as PatientData);
      }

      /*
       * DOCTORS
       */
      const { data: doctorsData, error: doctorsError } = await supabase
        .from('doctors')
        .select('*');

      console.log('DOCTORS DATA:', doctorsData);
      console.log('DOCTORS ERROR:', doctorsError);

      if (!doctorsError) {
        setDoctorCount(doctorsData?.length ?? 0);
      }

      /*
       * APPOINTMENTS
       */
      const { data: appointmentsData, error: appointmentsError } =
        await supabase
          .from('appointments')
          .select('*');

      console.log('APPOINTMENTS DATA:', appointmentsData);
      console.log('APPOINTMENTS ERROR:', appointmentsError);

      if (!appointmentsError) {
        setAppointmentCount(appointmentsData?.length ?? 0);
      }

      /*
       * REFERRALS
       */
      const { data: referralsData, error: referralsError } = await supabase
        .from('referrals')
        .select('*');

      console.log('REFERRALS DATA:', referralsData);
      console.log('REFERRALS ERROR:', referralsError);

      if (!referralsError) {
        setReferralCount(referralsData?.length ?? 0);
      }

      /*
       * FOLLOW UPS
       */
      const { data: followUpsData, error: followUpsError } = await supabase
        .from('follow_ups')
        .select('*');

      console.log('FOLLOW UPS DATA:', followUpsData);
      console.log('FOLLOW UPS ERROR:', followUpsError);

      if (!followUpsError) {
        setFollowUpCount(followUpsData?.length ?? 0);
      }

      setLoading(false);
    } catch (error) {
      console.error('Dashboard loading error:', error);
      setLoading(false);
    }
  };

  /*
   * Initial loading + REALTIME
   */
  useEffect(() => {
    loadPatientDashboard();

    /*
     * One realtime channel listening to all required tables
     */
    const channel = supabase
      .channel('patient-dashboard-live')

      /*
       * Patients
       */
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'patients',
        },
        (payload) => {
          console.log('LIVE PATIENT UPDATE:', payload);

          /*
           * Reload dashboard after database change
           */
          loadPatientDashboard();
        }
      )

      /*
       * Doctors
       */
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'doctors',
        },
        (payload) => {
          console.log('LIVE DOCTOR UPDATE:', payload);

          loadPatientDashboard();
        }
      )

      /*
       * Appointments
       */
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'appointments',
        },
        (payload) => {
          console.log('LIVE APPOINTMENT UPDATE:', payload);

          loadPatientDashboard();
        }
      )

      /*
       * Referrals
       */
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'referrals',
        },
        (payload) => {
          console.log('LIVE REFERRAL UPDATE:', payload);

          loadPatientDashboard();
        }
      )

      /*
       * Follow Ups
       */
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'follow_ups',
        },
        (payload) => {
          console.log('LIVE FOLLOW-UP UPDATE:', payload);

          loadPatientDashboard();
        }
      )

      /*
       * Subscribe
       */
      .subscribe((status) => {
        console.log('Realtime connection:', status);

        setRealtimeStatus(status);
      });

    /*
     * Cleanup
     */
    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  /*
   * Loading screen
   */
  if (loading) {
    return (
      <div
        style={{
          padding: '30px',
          fontFamily: 'Arial, sans-serif',
        }}
      >
        <h2>Loading Patient Dashboard...</h2>
      </div>
    );
  }

  /*
   * Get patient name from whichever column exists
   */
  const patientName =
    patient?.name ??
    patient?.full_name ??
    patient?.patient_name ??
    'Patient';

  return (
    <div
      style={{
        minHeight: '100vh',
        padding: '30px',
        background: '#f4f8f7',
        fontFamily: 'Arial, sans-serif',
      }}
    >
      {/* Header */}
      <div
        style={{
          marginBottom: '25px',
        }}
      >
        <h1
          style={{
            marginBottom: '5px',
            color: '#0f766e',
          }}
        >
          SwasthyaSetu AI
        </h1>

        <h2>Patient Dashboard</h2>

        <p>
          Welcome, <strong>{patientName}</strong>
        </p>

        {/* Realtime status */}
        <p
          style={{
            display: 'inline-block',
            padding: '8px 12px',
            borderRadius: '20px',
            background:
              realtimeStatus === 'SUBSCRIBED'
                ? '#dcfce7'
                : '#fef3c7',
            color:
              realtimeStatus === 'SUBSCRIBED'
                ? '#166534'
                : '#92400e',
            fontSize: '14px',
          }}
        >
          🟢 Realtime: {realtimeStatus}
        </p>
      </div>

      {/* Patient Information */}
      <div
        style={{
          background: 'white',
          padding: '20px',
          borderRadius: '12px',
          marginBottom: '20px',
          boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
        }}
      >
        <h3>Patient Information</h3>

        <p>
          <strong>Name:</strong> {patientName}
        </p>

        <p>
          <strong>Age:</strong>{' '}
          {patient?.age ?? 'Not available'}
        </p>

        <p>
          <strong>Gender:</strong>{' '}
          {patient?.gender ?? 'Not available'}
        </p>

        <p>
          <strong>Phone:</strong>{' '}
          {patient?.phone ?? 'Not available'}
        </p>

        <p>
          <strong>Email:</strong>{' '}
          {patient?.email ?? 'Not available'}
        </p>
      </div>

      {/* Realtime Data */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns:
            'repeat(auto-fit, minmax(200px, 1fr))',
          gap: '20px',
        }}
      >
        {/* Doctors */}
        <div
          style={{
            background: 'white',
            padding: '20px',
            borderRadius: '12px',
            boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
          }}
        >
          <h3>👨‍⚕️ Doctors</h3>

          <h2
            style={{
              color: '#0f766e',
              fontSize: '32px',
            }}
          >
            {doctorCount}
          </h2>

          <p>Doctors available in the system</p>
        </div>

        {/* Appointments */}
        <div
          style={{
            background: 'white',
            padding: '20px',
            borderRadius: '12px',
            boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
          }}
        >
          <h3>📅 Appointments</h3>

          <h2
            style={{
              color: '#0f766e',
              fontSize: '32px',
            }}
          >
            {appointmentCount}
          </h2>

          <p>Total appointments</p>
        </div>

        {/* Referrals */}
        <div
          style={{
            background: 'white',
            padding: '20px',
            borderRadius: '12px',
            boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
          }}
        >
          <h3>🔄 Referrals</h3>

          <h2
            style={{
              color: '#0f766e',
              fontSize: '32px',
            }}
          >
            {referralCount}
          </h2>

          <p>Referral records</p>
        </div>

        {/* Follow Ups */}
        <div
          style={{
            background: 'white',
            padding: '20px',
            borderRadius: '12px',
            boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
          }}
        >
          <h3>🔔 Follow-ups</h3>

          <h2
            style={{
              color: '#0f766e',
              fontSize: '32px',
            }}
          >
            {followUpCount}
          </h2>

          <p>Follow-up records</p>
        </div>
      </div>

      {/* Realtime information */}
      <div
        style={{
          marginTop: '25px',
          padding: '18px',
          background: '#ecfdf5',
          border: '1px solid #a7f3d0',
          borderRadius: '12px',
        }}
      >
        <strong>🟢 Live Data Enabled</strong>

        <p style={{ marginBottom: 0 }}>
          This dashboard listens for changes in patients,
          doctors, appointments, referrals and follow-ups.
          When data changes in Supabase, the dashboard
          automatically reloads the latest information.
        </p>
      </div>
    </div>
  );
}

export default PatientDashboard;