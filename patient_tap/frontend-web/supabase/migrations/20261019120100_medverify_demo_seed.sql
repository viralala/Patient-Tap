-- MedVerify demo registry.
--
-- Brand names, manufacturers, licences, GTINs, batches and serials are all
-- FICTIONAL. GTINs use the GS1 restricted-circulation prefix (04x), which is
-- never assigned to a real trade item, so a demo code can't collide with a
-- real medicine. The generic drug information (uses, side effects, warnings,
-- interactions) is general public information, not medical advice.

insert into public.medicines
  (gtin, brand_name, generic_name, composition, dosage_form, pack_size, manufacturer, mfg_licence,
   rx_required, drug_class, uses, side_effects, warnings, interactions, storage)
values
(
  '00400000000015', 'Pyrexa 650 (demo)', 'Paracetamol', 'Paracetamol IP 650 mg', 'Tablet', 'Strip of 15 tablets',
  'Demo Pharma Labs Pvt. Ltd. (fictional)', 'DEMO/MFG/2024/0001', false, 'Analgesic & antipyretic',
  array['Fever', 'Mild to moderate pain such as headache, toothache and body ache'],
  array['Usually well tolerated at normal doses', 'Rarely: skin rash or allergic reaction'],
  array['Do not take more than the label dose or more than 4 g of paracetamol in 24 hours (adults)',
        'Overdose can cause serious liver damage even if you feel well — seek help immediately',
        'Check other medicines for hidden paracetamol to avoid a double dose',
        'Ask a doctor first if you have liver disease or drink alcohol regularly'],
  array['Other paracetamol-containing products (risk of overdose)',
        'Warfarin — regular use may increase its effect'],
  'Store below 30°C in a dry place, away from children'
),
(
  '00400000000022', 'Amoxa 500 (demo)', 'Amoxicillin', 'Amoxicillin trihydrate IP eq. to amoxicillin 500 mg', 'Capsule', 'Strip of 10 capsules',
  'Demo Pharma Labs Pvt. Ltd. (fictional)', 'DEMO/MFG/2024/0001', true, 'Penicillin-class antibiotic',
  array['Bacterial infections of the ear, nose, throat, chest, urinary tract and skin'],
  array['Diarrhoea', 'Nausea', 'Skin rash'],
  array['Do NOT take if you are allergic to penicillin or other beta-lactam antibiotics',
        'Seek urgent help for swelling of the face or throat, wheezing or a severe rash',
        'Finish the full course prescribed, even if you feel better',
        'Antibiotics do not work against viral infections such as colds or flu'],
  array['Methotrexate — levels may rise', 'Warfarin — bleeding risk may increase',
        'Allopurinol — higher chance of skin rash'],
  'Store below 25°C in a dry place'
),
(
  '00400000000039', 'Glucora 500 (demo)', 'Metformin', 'Metformin hydrochloride IP 500 mg', 'Tablet', 'Strip of 10 tablets',
  'Sample Remedies Pvt. Ltd. (fictional)', 'DEMO/MFG/2023/0042', true, 'Biguanide (antidiabetic)',
  array['Type 2 diabetes, alongside diet and exercise'],
  array['Stomach upset, nausea or diarrhoea (often settles)', 'Metallic taste', 'Rarely: lactic acidosis'],
  array['Take with or after meals',
        'Your doctor may pause it before surgery or a scan that uses iodinated contrast dye',
        'Tell your doctor about kidney problems',
        'Long-term use can lower vitamin B12'],
  array['Alcohol — raises lactic acidosis risk', 'Iodinated contrast agents'],
  'Store below 30°C'
),
(
  '00400000000046', 'Statora 10 (demo)', 'Atorvastatin', 'Atorvastatin calcium IP eq. to atorvastatin 10 mg', 'Tablet', 'Strip of 10 tablets',
  'Sample Remedies Pvt. Ltd. (fictional)', 'DEMO/MFG/2023/0042', true, 'Statin (lipid-lowering)',
  array['Lowers LDL ("bad") cholesterol', 'Reduces the risk of heart attack and stroke'],
  array['Muscle aches', 'Headache', 'Indigestion'],
  array['Report unexplained muscle pain, tenderness or weakness to your doctor',
        'Not for use in pregnancy or while breastfeeding',
        'Your doctor may check liver function'],
  array['Clarithromycin and some antifungals (e.g. itraconazole) — raise statin levels',
        'Large amounts of grapefruit juice', 'Ciclosporin'],
  'Store below 30°C'
),
(
  '00400000000053', 'Azitra 500 (demo)', 'Azithromycin', 'Azithromycin dihydrate IP eq. to azithromycin 500 mg', 'Tablet', 'Strip of 3 tablets',
  'Demo Pharma Labs Pvt. Ltd. (fictional)', 'DEMO/MFG/2024/0001', true, 'Macrolide antibiotic',
  array['Bacterial infections of the chest, throat, ear and skin'],
  array['Diarrhoea', 'Nausea', 'Abdominal pain'],
  array['Can affect heart rhythm (QT prolongation) — tell your doctor about heart conditions',
        'Finish the full course prescribed',
        'Antibiotics do not work against viral infections'],
  array['Antacids containing aluminium or magnesium — take at a different time',
        'Other medicines that prolong the QT interval', 'Warfarin'],
  'Store below 30°C'
),
(
  '00400000000060', 'Cetrix 10 (demo)', 'Cetirizine', 'Cetirizine hydrochloride IP 10 mg', 'Tablet', 'Strip of 10 tablets',
  'Sample Remedies Pvt. Ltd. (fictional)', 'DEMO/MFG/2023/0042', false, 'Antihistamine',
  array['Allergic rhinitis (hay fever)', 'Itchy skin and hives'],
  array['Drowsiness', 'Dry mouth', 'Headache'],
  array['May cause drowsiness — take care when driving or operating machinery',
        'Ask a doctor first if you have kidney disease'],
  array['Alcohol and other sedating medicines — increased drowsiness'],
  'Store below 30°C'
),
(
  '00400000000077', 'Pantora 40 (demo)', 'Pantoprazole', 'Pantoprazole sodium IP eq. to pantoprazole 40 mg (gastro-resistant)', 'Tablet', 'Strip of 15 tablets',
  'Demo Pharma Labs Pvt. Ltd. (fictional)', 'DEMO/MFG/2024/0001', true, 'Proton-pump inhibitor',
  array['Acid reflux (GERD) and heartburn', 'Stomach and duodenal ulcers'],
  array['Headache', 'Diarrhoea', 'Nausea'],
  array['Swallow whole before a meal; do not crush or chew',
        'Long-term use can lower magnesium and vitamin B12 levels'],
  array['Atazanavir and some other HIV medicines', 'Ketoconazole / itraconazole — absorption reduced',
        'High-dose methotrexate'],
  'Store below 30°C'
),
(
  '00400000000084', 'Amlora 5 (demo)', 'Amlodipine', 'Amlodipine besilate IP eq. to amlodipine 5 mg', 'Tablet', 'Strip of 15 tablets',
  'Sample Remedies Pvt. Ltd. (fictional)', 'DEMO/MFG/2023/0042', true, 'Calcium-channel blocker',
  array['High blood pressure', 'Angina (chest pain)'],
  array['Ankle swelling', 'Flushing', 'Headache', 'Dizziness'],
  array['Stand up slowly if you feel dizzy',
        'Keep taking it unless your doctor tells you to stop'],
  array['Simvastatin — dose limit applies', 'Strong CYP3A4 inhibitors such as clarithromycin',
        'Other blood-pressure medicines — additive effect'],
  'Store below 30°C'
);

-- Batches: one per demo scenario.
insert into public.medicine_batches (medicine_id, batch_no, mfg_date, expiry_date, status, status_note)
select m.id, b.batch_no, b.mfg_date::date, b.expiry_date::date, b.status, b.status_note
from (values
  ('00400000000015', 'PX26A04', '2026-04-01', '2029-03-31', 'ok', null),
  ('00400000000022', 'AMX2507', '2025-07-01', '2027-06-30', 'nsq',
     'Demo scenario: this batch is listed as Not of Standard Quality after failing a dissolution test. Do not use it — return it to the pharmacy.'),
  ('00400000000022', 'AMX2602', '2026-02-01', '2028-01-31', 'ok', null),
  ('00400000000039', 'GL2311', '2023-11-01', '2025-10-31', 'ok', null),
  ('00400000000046', 'ST2602', '2026-02-01', '2028-01-31', 'ok', null),
  ('00400000000053', 'AZ2605', '2026-05-01', '2028-04-30', 'ok', null),
  ('00400000000060', 'CT2604', '2026-04-01', '2029-03-31', 'ok', null),
  ('00400000000077', 'PN2601', '2026-01-01', '2028-12-31', 'ok', null),
  ('00400000000084', 'AL2603', '2026-03-01', '2029-02-28', 'ok', null)
) as b(gtin, batch_no, mfg_date, expiry_date, status, status_note)
join public.medicines m on m.gtin = b.gtin;

-- Serialised packs. track_scans = false keeps the stable demo packs stable.
insert into public.medicine_units (serial, batch_id, scan_count, track_scans, first_scanned_at, last_scanned_at)
select u.serial, b.id, u.scan_count, u.track_scans, u.first_scanned_at::timestamptz, u.last_scanned_at::timestamptz
from (values
  ('PTGEN0001', '00400000000015', 'PX26A04', 0, false, null, null),
  ('PTGEN0002', '00400000000015', 'PX26A04', 0, true, null, null),
  ('PTNSQ0001', '00400000000022', 'AMX2507', 0, false, null, null),
  ('PTAMX0001', '00400000000022', 'AMX2602', 0, false, null, null),
  ('PTEXP0001', '00400000000039', 'GL2311', 0, false, null, null),
  ('PTCLN0001', '00400000000046', 'ST2602', 147, true, '2026-03-02 10:14:00+05:30', '2026-10-18 19:02:00+05:30'),
  ('PTAZI0001', '00400000000053', 'AZ2605', 0, false, null, null),
  ('PTCET0001', '00400000000060', 'CT2604', 0, false, null, null),
  ('PTPAN0001', '00400000000077', 'PN2601', 0, false, null, null),
  ('PTAML0001', '00400000000084', 'AL2603', 0, false, null, null)
) as u(serial, gtin, batch_no, scan_count, track_scans, first_scanned_at, last_scanned_at)
join public.medicines m on m.gtin = u.gtin
join public.medicine_batches b on b.medicine_id = m.id and b.batch_no = u.batch_no;
