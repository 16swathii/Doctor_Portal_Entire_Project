export const mockPatients = [
  {
    id: 'HB-PAT-00123', abhaId: '43-7821-5566-9021', name: 'Rajesh Kumar',
    age: '52M', gender: 'Male', lastVisit: 'Apr 10, 2026',
    dept: 'Cardiology', doctor: 'Dr Vedasree',
    tags: ['Hypertension', 'Type 2 Diabetes']
  },
  {
    id: 'HB-PAT-00124', abhaId: '43-8934-2211-4422', name: 'Priya Sharma',
    age: '45F', gender: 'Female', lastVisit: 'Apr 8, 2026',
    dept: 'Internal Medicine', doctor: 'Dr. Anita Shah',
    tags: ['Hypothyroidism']
  }
];

export const mockCases = [
  {
    id: 'HB-2024-00412', match: 96,
    title: 'Anterior STEMI, elevated troponin — 52M',
    desc: 'Primary PCI, LAD stenting. Troponin I 18.4. Discharged day 9 on DAPT.',
    hospital: 'Fortis Escorts, Delhi', date: 'Nov 2023', source: 'Internal',
    tags: ['STEMI', 'PCI', 'I21.0'],
    timeline: [
      { event: 'Admitted — chest pain, diaphoresis', time: 'Day 0 · Emergency' },
      { event: 'ECG: ST elevation V1–V4 · Troponin I 18.4', time: 'Day 0 · Labs' },
      { event: 'Primary PCI — LAD stenting', time: 'Day 0 · Intervention' },
      { event: 'Discharged on DAPT + statin', time: 'Day 9 · Discharge' }
    ]
  },
  {
    id: 'HB-2023-07891', match: 91,
    title: 'Anterior STEMI, diabetic comorbidity — 48M',
    desc: 'Thrombolysis + rescue PCI. HbA1c 9.1. Extended stay.',
    hospital: 'Kokilaben, Mumbai', date: 'Aug 2023', source: 'Internal',
    tags: ['STEMI', 'T2DM', 'I21.0'],
    timeline: [
      { event: 'Admitted — acute chest pain', time: 'Day 0' },
      { event: 'Thrombolysis initiated', time: 'Day 0' },
      { event: 'Rescue PCI', time: 'Day 1' },
      { event: 'Discharged', time: 'Day 13' }
    ]
  }
];