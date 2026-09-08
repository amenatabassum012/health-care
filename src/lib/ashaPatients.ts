export interface ASHAPatient {
  id: string;
  name: string;
  age: number;
  gender: string;
  phone: string;
  village: string;
  address: string;
  condition: string;
  symptoms: string;
  emergencyContact: string;
  status: string;
  priority: string;
  registeredDate: string;
}

const STORAGE_KEY = "swasthyaSetu_asha_patients";

const defaultPatients: ASHAPatient[] = [
  {
    id: "patient-001",
    name: "Anita Devi",
    age: 42,
    gender: "Female",
    phone: "9876543210",
    village: "Rampur Village",
    address: "Main Road, Rampur Village",
    condition: "Hypertension",
    symptoms: "High blood pressure",
    emergencyContact: "9876500001",
    status: "Follow-up",
    priority: "Normal",
    registeredDate: "05 Sep 2026",
  },
  {
    id: "patient-002",
    name: "Ramesh Kumar",
    age: 55,
    gender: "Male",
    phone: "9876543211",
    village: "Rampur Village",
    address: "Temple Road, Rampur Village",
    condition: "Diabetes",
    symptoms: "Increased thirst and weakness",
    emergencyContact: "9876500002",
    status: "Stable",
    priority: "Normal",
    registeredDate: "04 Sep 2026",
  },
  {
    id: "patient-003",
    name: "Sita Devi",
    age: 29,
    gender: "Female",
    phone: "9876543212",
    village: "Lakshmipur",
    address: "Lakshmipur Main Street",
    condition: "High Blood Pressure",
    symptoms: "Severe headache and dizziness",
    emergencyContact: "9876500003",
    status: "Urgent",
    priority: "High",
    registeredDate: "08 Sep 2026",
  },
  {
    id: "patient-004",
    name: "Mohammed Rahim",
    age: 63,
    gender: "Male",
    phone: "9876543213",
    village: "Rampur Village",
    address: "Market Road, Rampur Village",
    condition: "Diabetes",
    symptoms: "High sugar and weakness",
    emergencyContact: "9876500004",
    status: "Follow-up",
    priority: "High",
    registeredDate: "07 Sep 2026",
  },
  {
    id: "patient-005",
    name: "Lakshmi Rao",
    age: 51,
    gender: "Female",
    phone: "9876543214",
    village: "Lakshmipur",
    address: "School Road, Lakshmipur",
    condition: "Hypertension",
    symptoms: "Chest discomfort and fatigue",
    emergencyContact: "9876500005",
    status: "Stable",
    priority: "High",
    registeredDate: "05 Sep 2026",
  },
];

/* =========================================================
   GET PATIENTS
========================================================= */

export function getASHAPatients(): ASHAPatient[] {
  try {
    const storedPatients = localStorage.getItem(STORAGE_KEY);

    if (!storedPatients) {
      localStorage.setItem(
        STORAGE_KEY,
        JSON.stringify(defaultPatients),
      );

      return defaultPatients;
    }

    const parsedPatients = JSON.parse(storedPatients);

    if (!Array.isArray(parsedPatients)) {
      return defaultPatients;
    }

    return parsedPatients;
  } catch (error) {
    console.error("Unable to load ASHA patients:", error);

    return defaultPatients;
  }
}

/* =========================================================
   SAVE ALL PATIENTS
========================================================= */

export function saveASHAPatients(
  patients: ASHAPatient[],
): void {
  try {
    localStorage.setItem(
      STORAGE_KEY,
      JSON.stringify(patients),
    );
  } catch (error) {
    console.error("Unable to save ASHA patients:", error);
  }
}

/* =========================================================
   ADD NEW PATIENT
========================================================= */

export function addASHAPatient(
  patient: Omit<
    ASHAPatient,
    "id" | "registeredDate" | "status" | "priority"
  >,
): ASHAPatient {
  const existingPatients = getASHAPatients();

  const newPatient: ASHAPatient = {
    ...patient,
    id: `patient-${Date.now()}`,
    registeredDate: new Date().toLocaleDateString(
      "en-GB",
      {
        day: "2-digit",
        month: "short",
        year: "numeric",
      },
    ),
    status: "New",
    priority: "Normal",
  };

  const updatedPatients = [
    newPatient,
    ...existingPatients,
  ];

  saveASHAPatients(updatedPatients);

  return newPatient;
}

/* =========================================================
   DELETE PATIENT
========================================================= */

export function deleteASHAPatient(
  patientId: string,
): void {
  const patients = getASHAPatients();

  const updatedPatients = patients.filter(
    (patient) => patient.id !== patientId,
  );

  saveASHAPatients(updatedPatients);
}