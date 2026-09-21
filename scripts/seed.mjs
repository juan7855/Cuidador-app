// Seed de datos de demostración para "app cuidador".
// Uso: node scripts/seed.mjs
//
// IMPORTANTE: esta base de datos es compartida con otra app. Este script
// NUNCA hace TRUNCATE ni borra filas existentes: solo inserta pacientes de
// demo nuevos (si ya existe un paciente con el mismo nombre, se omite por
// completo, incluidos sus datos de las últimas semanas).
import "dotenv/config";
import pg from "pg";

const pool = new pg.Pool({
  connectionString:
    process.env.DATABASE_URL ||
    "postgresql://postgres:postgres@127.0.0.1:5432/app_db",
});

const dKey = (offset = 0) => {
  const d = new Date();
  d.setDate(d.getDate() - offset);
  return d.toISOString().slice(0, 10);
};
const daysAgo = (n, hour = 12) => {
  const d = new Date();
  d.setDate(d.getDate() - n);
  d.setHours(hour, 0, 0, 0);
  return d.toISOString();
};
const slugify = (s) =>
  s
    .toLowerCase()
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");

async function uniquePin(client) {
  for (let i = 0; i < 20; i++) {
    const pin = String(Math.floor(1000 + Math.random() * 9000));
    const { rows } = await client.query("SELECT 1 FROM patients WHERE pin = $1", [pin]);
    if (!rows.length) return pin;
  }
  throw new Error("No se pudo generar un PIN único");
}

// Patrones de 7 días (el último es hoy)
const vitalsSeries = {
  maria: {
    hr: [76, 74, 78, 73, 75, 77, 74],
    sys: [132, 129, 134, 126, 130, 128, 126],
    dia: [84, 82, 85, 80, 83, 82, 80],
    steps: [4200, 3800, 5100, 2900, 4600, 3400, 3120],
    sleep: [7.1, 6.8, 7.4, 6.5, 7.2, 7.6, 7.2],
    oxy: [97, 96, 97, 96, 98, 97, 97],
    weight: [68.4, 68.3, 68.3, 68.2, 68.2, 68.1, 68.1],
    mood: ["Tranquila", "Cansada", "Animada", "Tranquila", "Contenta", "Tranquila", "Tranquila"],
  },
  carlos: {
    hr: [80, 78, 82, 79, 77, 81, 78],
    sys: [140, 136, 142, 134, 138, 139, 138],
    dia: [88, 86, 90, 84, 87, 88, 86],
    steps: [6100, 5400, 7200, 4800, 6600, 5900, 4250],
    sleep: [6.6, 7.0, 6.2, 7.2, 6.8, 6.5, 6.9],
    oxy: [97, 98, 97, 98, 97, 97, 97],
    weight: [84.9, 84.8, 84.7, 84.6, 84.5, 84.4, 84.4],
    mood: ["Activo", "Irritable", "Activo", "Cansado", "Contento", "Activo", "Activo"],
  },
  ana: {
    hr: [72, 70, 74, 69, 71, 73, 70],
    sys: [120, 118, 122, 116, 119, 121, 118],
    dia: [78, 76, 79, 75, 77, 78, 76],
    steps: [8800, 9200, 7400, 10200, 8600, 9800, 6400],
    sleep: [7.6, 7.2, 7.9, 7.4, 7.8, 7.5, 7.5],
    oxy: [98, 98, 99, 98, 98, 99, 98],
    weight: [64.2, 64.1, 64.1, 64.0, 63.9, 63.9, 63.8],
    mood: ["Animada", "Contenta", "Animada", "Relajada", "Contenta", "Animada", "Animada"],
  },
};

const patientsSeed = [
  {
    key: "maria",
    name: "María González",
    relation: "Madre",
    gender: "F",
    age: 72,
    birthDate: "1953-04-12",
    bloodType: "O+",
    heightCm: 158,
    weightKg: 68.1,
    avatarFrom: "#2F80ED",
    avatarTo: "#56CCF2",
    conditions: ["Hipertensión arterial", "Artrosis de rodilla"],
    allergies: ["Penicilina"],
    chronicMeds: ["Losartán", "Atorvastatina", "Calcio + Vitamina D"],
    phone: "+34 612 345 678",
    insurance: "Sanitas · Póliza 8841-2203",
    address: "Calle de Alcalá 92, 3ºB, Madrid",
    emergencyContact: { name: "Lucía González (hija)", phone: "+34 600 111 222", relation: "Hija" },
    doctors: [
      { name: "Dra. Laura Méndez", specialty: "Medicina interna", phone: "+34 910 222 333" },
      { name: "Dr. Pablo Serrano", specialty: "Cardiología", phone: "+34 910 444 555" },
    ],
    labs: [
      { name: "Glucosa en ayunas", value: "92 mg/dL", status: "normal", date: "2026-01-18" },
      { name: "Colesterol LDL", value: "142 mg/dL", status: "high", date: "2026-01-18" },
      { name: "Creatinina", value: "0.9 mg/dL", status: "normal", date: "2026-01-18" },
      { name: "Hemoglobina", value: "13.2 g/dL", status: "normal", date: "2026-01-18" },
    ],
    notes:
      "Debe reducir la sal y mantener una hidratación constante. Revisar tensión arterial cada tarde. Prefiere caminar acompañada.",
    goals: { calories: 1700, waterGlasses: 8, exerciseMin: 30, steps: 6000 },
  },
  {
    key: "carlos",
    name: "Carlos Ruiz",
    relation: "Padre",
    gender: "M",
    age: 68,
    birthDate: "1957-09-30",
    bloodType: "A+",
    heightCm: 172,
    weightKg: 84.4,
    avatarFrom: "#5B86E5",
    avatarTo: "#36D1DC",
    conditions: ["Diabetes tipo 2", "Hipertensión arterial"],
    allergies: ["Sulfonamidas"],
    chronicMeds: ["Metformina", "Ácido acetilsalicílico", "Atorvastatina"],
    phone: "+34 633 221 098",
    insurance: "Sanitas · Póliza 7712-0098",
    address: "Calle de Alcalá 92, 3ºB, Madrid",
    emergencyContact: { name: "Sara Ruiz (hija)", phone: "+34 611 333 444", relation: "Hija" },
    doctors: [
      { name: "Dra. Laura Méndez", specialty: "Medicina interna", phone: "+34 910 222 333" },
      { name: "Dra. Elena Núñez", specialty: "Endocrinología", phone: "+34 910 666 777" },
    ],
    labs: [
      { name: "Glucosa en ayunas", value: "126 mg/dL", status: "high", date: "2026-01-20" },
      { name: "Hemoglobina glicosilada (HbA1c)", value: "7.1 %", status: "high", date: "2026-01-20" },
      { name: "Colesterol total", value: "201 mg/dL", status: "high", date: "2026-01-20" },
      { name: "TSH", value: "2.1 mUI/L", status: "normal", date: "2026-01-20" },
    ],
    notes:
      "Dieta baja en hidratos refinados. La metformina se toma siempre junto a las comidas. Revisar los pies a diario.",
    goals: { calories: 1900, waterGlasses: 8, exerciseMin: 30, steps: 7000 },
  },
  {
    key: "ana",
    name: "Ana Torres",
    relation: "Tía",
    gender: "F",
    age: 54,
    birthDate: "1971-06-08",
    bloodType: "B+",
    heightCm: 164,
    weightKg: 63.8,
    avatarFrom: "#EE6FB3",
    avatarTo: "#8E5CF6",
    conditions: ["Asma leve"],
    allergies: ["Ácaros del polvo", "Polen"],
    chronicMeds: ["Budesonida (inhalador)", "Vitamina D3"],
    phone: "+34 677 889 001",
    insurance: "Adeslas · Póliza 4490-7712",
    address: "Calle Serrano 15, 5ºA, Madrid",
    emergencyContact: { name: "Marta Torres (hermana)", phone: "+34 622 555 666", relation: "Hermana" },
    doctors: [
      { name: "Dr. Javier Ortiz", specialty: "Neumología", phone: "+34 910 888 999" },
      { name: "Dra. Rosa Campos", specialty: "Medicina de familia", phone: "+34 910 100 200" },
    ],
    labs: [
      { name: "Glucosa en ayunas", value: "88 mg/dL", status: "normal", date: "2026-01-15" },
      { name: "Colesterol total", value: "176 mg/dL", status: "normal", date: "2026-01-15" },
      { name: "Hemoglobina", value: "14.1 g/dL", status: "normal", date: "2026-01-15" },
      { name: "Ferritina", value: "42 ng/mL", status: "normal", date: "2026-01-15" },
    ],
    notes:
      "Llevar siempre encima el salbutamol. Evitar hacer ejercicio intenso en días con alto índice de polen.",
    goals: { calories: 2000, waterGlasses: 8, exerciseMin: 45, steps: 9000 },
  },
];

const medsByPatient = {
  maria: [
    ["Losartán potásico", "Losartán", "50 mg", "Tableta", "08:00", "Mañana", true, 24, "tabletas", 7, "Tomar con el desayuno. No tomar suplementos de potasio.", "blue"],
    ["Calcio + Vitamina D", "Carbonato de calcio / colecalciferol", "1 comprimido", "Comprimido", "13:00", "Tarde", true, 30, "comprimidos", 8, "Tomar junto al almuerzo para mejor absorción.", "emerald"],
    ["Atorvastatina", "Atorvastatina", "20 mg", "Tableta", "21:00", "Noche", false, 15, "tabletas", 7, "Tomar durante la cena.", "violet"],
    ["Paracetamol", "Paracetamol", "500 mg", "Tableta", "—", "Noche", false, 40, "tabletas", 10, "Solo si aparece dolor articular. Máximo 2 al día.", "amber"],
  ],
  carlos: [
    ["Metformina", "Clorhidrato de metformina", "850 mg", "Tableta", "08:00", "Mañana", true, 40, "tabletas", 10, "Tomar durante el desayuno.", "blue"],
    ["Ácido acetilsalicílico", "Aspirina", "100 mg", "Tableta", "09:00", "Mañana", false, 28, "tabletas", 7, "Con un poco de comida. No masticar si es entérica.", "rose"],
    ["Metformina", "Clorhidrato de metformina", "850 mg", "Tableta", "20:00", "Noche", true, 40, "tabletas", 10, "Tomar durante la cena.", "blue"],
    ["Atorvastatina", "Atorvastatina", "40 mg", "Tableta", "21:30", "Noche", false, 8, "tabletas", 10, "Tomar durante la cena. Stock bajo: renovar receta.", "violet"],
  ],
  ana: [
    ["Budesonida", "Budesonida en inhalador", "200 mcg", "Inhalador", "08:30", "Mañana", false, 9, "dosis", 10, "1 inhalación por la mañana. Enjuagarse la boca después.", "teal"],
    ["Vitamina D3", "Colecalciferol", "2000 UI", "Cápsula", "09:00", "Mañana", true, 20, "cápsulas", 7, "Tomar con el desayuno.", "amber"],
    ["Multivitamínico", "Complejo vitamínico", "1 comprimido", "Comprimido", "13:30", "Tarde", true, 26, "comprimidos", 8, "Junto al almuerzo.", "emerald"],
    ["Salbutamol", "Salbutamol en inhalador", "100 mcg", "Inhalador", "—", "Mañana", false, 120, "dosis", 20, "De rescate: solo si aparece falta de aire. Llevar siempre encima.", "rose"],
  ],
};

const mealsByPatient = {
  maria: [
    ["Desayuno", "08:30", "Avena con fruta", "Copos de avena, leche desnatada, medio plátano y 3 nueces", 320, 12, 48, 9, "amber"],
    ["Media mañana", "11:00", "Yogur natural", "Yogur desnatado sin azúcar con fresas", 120, 7, 15, 2, "emerald"],
    ["Almuerzo", "14:00", "Pollo con verduras", "Pechuga a la plancha, brócoli, zanahoria y patata cocida (poca sal)", 480, 38, 40, 16, "emerald"],
    ["Merienda", "17:00", "Tostada integral", "Pan integral con aceite de oliva y zumo de naranja natural", 210, 5, 28, 9, "amber"],
    ["Cena", "21:00", "Crema de calabaza y merluza", "Crema casera de calabaza y merluza al horno", 350, 28, 24, 14, "indigo"],
  ],
  carlos: [
    ["Desayuno", "08:00", "Tostadas con huevo", "2 rebanadas de pan integral, huevo pochado y un trozo pequeño de aguacate", 380, 16, 34, 18, "amber"],
    ["Media mañana", "11:00", "Manzana y almendras", "1 manzana y 10 almendras", 160, 5, 16, 10, "emerald"],
    ["Almuerzo", "14:00", "Lentejas y ensalada", "Lentejas estofadas con verduras y ensalada con atún al natural", 520, 32, 54, 16, "emerald"],
    ["Merienda", "17:30", "Yogur griego", "Yogur griego natural con 4 nueces", 200, 14, 10, 12, "amber"],
    ["Cena", "20:30", "Pavo con verduras", "Pechuga de pavo al vapor con calabacín y champiñones", 420, 36, 20, 16, "indigo"],
  ],
  ana: [
    ["Desayuno", "08:30", "Batido y tostada", "Batido de plátano y frutos rojos con leche y tostada con aceite de oliva", 340, 10, 46, 12, "amber"],
    ["Media mañana", "11:00", "Pieza de fruta", "1 pera y una taza de té verde", 90, 1, 22, 0, "emerald"],
    ["Almuerzo", "14:30", "Quinoa con salmón", "Quinoa, salmón al horno y espinacas salteadas", 560, 34, 48, 24, "emerald"],
    ["Merienda", "17:30", "Yogur con cereales", "Yogur natural con cereales integrales sin azúcar", 220, 9, 30, 6, "amber"],
    ["Cena", "21:00", "Tortilla y ensalada", "Tortilla francesa de 2 huevos con tomate y pepino", 330, 22, 12, 18, "indigo"],
  ],
};

const exByPatient = {
  maria: [
    [1, "Caminata suave", 25, 90, "Suave", "Footprints", "Paseo tranquilo por el barrio, preferiblemente con compañía.", [["Calentamiento", "5 minutos de movilidad articular"], ["Caminata", "15 minutos a paso tranquilo"], ["Vuelta a la calma", "5 minutos de estiramientos suaves"]]],
    [2, "Movilidad y estiramientos", 20, 60, "Suave", "Wind", "Sesión de movilidad articular en casa.", [["Movilidad de cuello", "Giros lentos, 1 minuto"], ["Hombros y muñecas", "5 minutos"], ["Estiramiento de piernas", "10 minutos sentada"], ["Respiración", "4 minutos de respiración profunda"]]],
    [3, "Caminata y equilibrio", 30, 120, "Moderada", "PersonStanding", "Caminata con pequeños ejercicios de equilibrio.", [["Caminata", "20 minutos a paso ligero"], ["Equilibrio", "Apoyo en un pie, 30 s con cada pierna"], ["Estiramientos", "5 minutos"]]],
    [4, "Fuerza con banda", 20, 80, "Suave", "Dumbbell", "Ejercicios suaves con banda elástica sentada.", [["Apertura de hombros", "2 series de 12 repeticiones"], ["Empuje de pecho", "2 series de 12 repeticiones"], ["Extensión de pierna", "2 series de 10 repeticiones por pierna"]]],
    [5, "Caminata suave", 25, 90, "Suave", "Footprints", "Paseo relajado, evitando las horas de sol.", [["Calentamiento", "5 minutos"], ["Caminata", "15 minutos"], ["Estiramientos", "5 minutos"]]],
    [6, "Yoga en silla", 30, 100, "Suave", "HeartHandshake", "Estiramientos y posturas adaptadas a una silla.", [["Respiración", "5 minutos"], ["Movilidad de columna", "10 minutos"], ["Posturas en silla", "10 minutos"], ["Relajación", "5 minutos"]]],
    [0, "Descanso activo", 15, 40, "Suave", "Coffee", "Día de descanso con movimiento ligero.", [["Estiramientos suaves", "10 minutos al levantarse"], ["Paseo corto", "5 minutos si el tiempo acompaña"]]],
  ],
  carlos: [
    [1, "Caminata rápida", 35, 180, "Moderada", "Footprints", "Caminata a paso vivo después del desayuno ayuda a controlar la glucosa.", [["Calentamiento", "5 minutos de marcha lenta"], ["Caminata rápida", "25 minutos sin jadear"], ["Estiramientos", "5 minutos"]]],
    [2, "Fuerza con pesas ligeras", 25, 120, "Moderada", "Dumbbell", "Ejercicios de brazos y piernas con mancuernas de 1-2 kg.", [["Bíceps", "2 series de 12 repeticiones"], ["Sentadilla asistida", "2 series de 10 repeticiones"], ["Press de hombros", "2 series de 10 repeticiones"]]],
    [3, "Caminata y escaleras", 30, 200, "Moderada", "PersonStanding", "Recorrido con unas cuantas escaleras.", [["Caminata", "20 minutos"], ["Escaleras", "2-3 tramos bajando en ascensor"], ["Vuelta a la calma", "5 minutos"]]],
    [4, "Gimnasia suave", 20, 70, "Suave", "Wind", "Movilidad articular y estiramientos.", [["Movilidad general", "10 minutos"], ["Estiramientos", "10 minutos"]]],
    [5, "Caminata rápida", 35, 180, "Moderada", "Footprints", "Paseo a paso vivo, mejor antes de la cena.", [["Calentamiento", "5 minutos"], ["Marcha rápida", "25 minutos"], ["Estiramientos", "5 minutos"]]],
    [6, "Baile en casa", 30, 180, "Moderada", "Music", "Movimiento continuo con música, sin saltos.", [["Calentamiento", "5 minutos"], ["Baile suave", "20 minutos"], ["Relajación", "5 minutos"]]],
    [0, "Descanso", 10, 30, "Descanso", "Coffee", "Día de descanso.", [["Estiramientos", "10 minutos"], ["Paseo ligero", "opcional, 10 minutos"]]],
  ],
  ana: [
    [1, "Carrera suave", 40, 300, "Moderada", "Footprints", "Trote continuo por el parque, evitando días de polen alto.", [["Calentamiento", "8 minutos"], ["Carrera suave", "25 minutos"], ["Estiramientos", "7 minutos"]]],
    [2, "Fuerza funcional", 35, 220, "Moderada", "Dumbbell", "Circuito de fuerza corporal.", [["Sentadillas", "3 series de 12 repeticiones"], ["Flexiones en pared", "3 series de 10 repeticiones"], ["Plancha", "3 series de 30 segundos"], ["Zancadas", "2 series de 10 por pierna"]]],
    [3, "Natación", 45, 320, "Moderada", "Waves", "Nado continuo estilo crol y espalda.", [["Calentamiento", "10 minutos"], ["Nado continuo", "30 minutos"], ["Vuelta a la calma", "5 minutos"]]],
    [4, "Yoga", 30, 150, "Suave", "HeartHandshake", "Sesión de yoga y respiración.", [["Saludos", "10 minutos"], ["Posturas de pie", "10 minutos"], ["Relajación", "10 minutos"]]],
    [5, "Bicicleta", 40, 280, "Moderada", "Bike", "Ruta en bicicleta por el carril bici.", [["Calentamiento", "8 minutos"], ["Recorrido", "27 minutos"], ["Enfriamiento", "5 minutos"]]],
    [6, "Senderismo", 60, 380, "Moderada", "Mountain", "Ruta de senderismo suave fuera de la ciudad.", [["Marcha", "50 minutos por terreno llano"], ["Pausa e hidratación", "5 minutos"], ["Estiramientos", "5 minutos"]]],
    [0, "Estiramientos", 15, 50, "Descanso", "Wind", "Recuperación activa.", [["Estiramientos generales", "15 minutos"]]],
  ],
};

const routine = [
  ["Amanecer", "07:00", "Despertar y estiramientos", "3 minutos de estiramientos suaves en la cama.", "Sunrise"],
  ["Amanecer", "07:30", "Vaso de agua", "Beber un vaso grande de agua al levantarse.", "Droplets"],
  ["Mañana", "08:00", "Medicación de la mañana", "Tomar la medicación con el desayuno si corresponde.", "Pill"],
  ["Mañana", "08:30", "Desayuno saludable", "Desayuno según el plan de alimentación.", "UtensilsCrossed"],
  ["Mañana", "09:30", "Paseo y movimiento", "Salir a caminar el tiempo indicado en el plan.", "Footprints"],
  ["Mediodía", "12:00", "Ejercicio cognitivo", "10 minutos con un juego de Mente Activa.", "Brain"],
  ["Mediodía", "14:00", "Almuerzo equilibrado", "Comer despacio y recordar la medicación del almuerzo.", "Salad"],
  ["Tarde", "17:00", "Lectura o pasatiempos", "Leer un capítulo o hacer un pasatiempo.", "BookOpen"],
  ["Tarde", "18:00", "Control de constantes", "Anotar tensión arterial, pulso y sensaciones.", "Activity"],
  ["Noche", "20:30", "Cena ligera", "Cena según el plan, evitando comidas pesadas.", "Soup"],
  ["Noche", "21:00", "Medicación de la noche", "Tomar la medicación nocturna.", "MoonStar"],
  ["Noche", "22:30", "Dormir 7-8 horas", "Evitar pantallas 30 minutos antes de acostarse.", "BedDouble"],
];

const waterToday = { maria: 3, carlos: 4, ana: 5 };
const bestScores = {
  maria: { memory: 650, math: 70, sequence: 400 },
  carlos: { memory: 850, math: 100, sequence: 600 },
  ana: { memory: 1150, math: 160, sequence: 900 },
};

async function main() {
  const client = await pool.connect();
  try {
    for (let pi = 0; pi < patientsSeed.length; pi++) {
      const p = patientsSeed[pi];

      const already = await client.query("SELECT id FROM patients WHERE name = $1", [p.name]);
      if (already.rows.length) {
        console.log(`↷ ${p.name} ya existe (id ${already.rows[0].id}), se omite por completo.`);
        continue;
      }

      await client.query("BEGIN");

      const pin = await uniquePin(client);
      const pRes = await client.query(
        `INSERT INTO patients
          (name, pin, relation, gender, age, birth_date, blood_type, height_cm, weight_kg,
           avatar_from, avatar_to, phone, insurance, address, emergency_contact)
         VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,$15)
         RETURNING id`,
        [p.name, pin, p.relation, p.gender, p.age, p.birthDate, p.bloodType, p.heightCm, p.weightKg,
         p.avatarFrom, p.avatarTo, p.phone, p.insurance, p.address, JSON.stringify(p.emergencyContact)]
      );
      const pid = pRes.rows[0].id;

      await client.query(
        `INSERT INTO clinical_profiles
          (patient_id, conditions, allergies, chronic_meds, doctors, labs, goals, notes)
         VALUES ($1,$2,$3,$4,$5,$6,$7,$8)`,
        [pid, p.conditions, p.allergies, p.chronicMeds, JSON.stringify(p.doctors),
         JSON.stringify(p.labs), JSON.stringify(p.goals), p.notes]
      );

      // Vitals de 7 días
      const s = vitalsSeries[p.key];
      for (let i = 0; i < 7; i++) {
        const offset = 6 - i; // i=0 -> hace 6 días; i=6 -> hoy
        await client.query(
          `INSERT INTO daily_vitals
            (patient_id, date, heart_rate, systolic, diastolic, steps, sleep_hours, oxygen, weight_kg, mood)
           VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10)`,
          [pid, dKey(offset), s.hr[i], s.sys[i], s.dia[i], s.steps[i], s.sleep[i], s.oxy[i], s.weight[i], s.mood[i]]
        );
      }

      // Medicación (dose = "dosage")
      const medIds = [];
      for (const m of medsByPatient[p.key]) {
        const [name, activeSubstance, dosage, form, time, period, withFood, stock, unit, lowAt, instructions, tone] = m;
        const r = await client.query(
          `INSERT INTO medications
            (patient_id, name, active_substance, dose, form, time, period, with_food, stock, stock_unit, low_stock_at, instructions, tone, active)
           VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,true) RETURNING id`,
          [pid, name, activeSubstance, dosage, form, time, period, withFood, stock, unit, lowAt, instructions, tone]
        );
        medIds.push(r.rows[0].id);
      }
      // Logs de medicación de los últimos 6 días (hoy se crea al interactuar)
      for (const [mi, mid] of medIds.entries()) {
        for (let off = 6; off >= 1; off--) {
          const taken = (off * 7 + mi * 3 + pi) % 11 !== 0;
          await client.query(
            `INSERT INTO medication_logs (medication_id, patient_id, date, taken, taken_at)
             VALUES ($1,$2,$3,$4,$5)`,
            [mid, pid, dKey(off), taken, taken ? daysAgo(off, 9) : null]
          );
        }
      }

      // Comidas (name = "title"; slug/article/emoji/accent/items son
      // columnas de la otra app, NOT NULL: se rellenan con valores mínimos)
      const mealIds = [];
      for (const [idx, meal] of mealsByPatient[p.key].entries()) {
        const [slot, time, title, foods, calories, protein, carbs, fat, tone] = meal;
        const slug = `${slugify(p.name)}-${slugify(title)}-${pid}-${idx}`;
        const r = await client.query(
          `INSERT INTO meals
            (patient_id, slug, name, article, time, emoji, accent, items, slot, foods, calories, protein, carbs, fat, tone)
           VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,$15) RETURNING id`,
          [pid, slug, title, foods, time, "🍽️", tone, [foods], slot, foods, calories, protein, carbs, fat, tone]
        );
        mealIds.push(r.rows[0].id);
      }
      for (const [mi, mid] of mealIds.entries()) {
        for (let off = 6; off >= 1; off--) {
          const done = (off * 5 + mi) % 9 !== 0;
          await client.query(
            `INSERT INTO meal_logs (meal_id, patient_id, date, eaten)
             VALUES ($1,$2,$3,$4)`,
            [mid, pid, dKey(off), done]
          );
        }
      }

      // Ejercicio semanal (name = "title"; level/emoji/duration_seconds/
      // steps/tip son columnas de la otra app, NOT NULL)
      const exIds = [];
      for (const e of exByPatient[p.key]) {
        const [dayOfWeek, title, durationMin, calories, intensity, icon, description, items] = e;
        const steps = items.map(([name, detail]) => `${name}: ${detail}`);
        const r = await client.query(
          `INSERT INTO exercises
            (patient_id, name, level, emoji, duration_seconds, description, steps, tip,
             day_of_week, duration_min, calories, intensity, icon, items)
           VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14) RETURNING id`,
          [pid, title, intensity, "🏃", durationMin * 60, description, steps,
           "Detente si aparecen mareos, dolor en el pecho o falta de aire.",
           dayOfWeek, durationMin, calories, intensity, icon,
           JSON.stringify(items.map(([name, detail]) => ({ name, detail })))]
        );
        exIds.push({ id: r.rows[0].id, dayOfWeek, durationMin, title });
      }
      // Logs de ejercicio de los últimos 6 días
      for (let off = 6; off >= 1; off--) {
        const date = new Date();
        date.setDate(date.getDate() - off);
        const dow = date.getDay();
        const ex = exIds.find((x) => x.dayOfWeek === dow);
        if (ex) {
          const done = (off * 3 + pi) % 8 !== 0;
          await client.query(
            `INSERT INTO exercise_logs (exercise_id, exercise_name, patient_id, date, completed, minutes)
             VALUES ($1,$2,$3,$4,$5,$6)`,
            [ex.id, ex.title, pid, dKey(off), done, done ? ex.durationMin : 0]
          );
        }
      }

      // Rutina (time_of_day = "phase", scheduled_time = "time", description = "detail")
      const taskIds = [];
      for (const t of routine) {
        const [phase, time, title, detail, icon] = t;
        const r = await client.query(
          `INSERT INTO routine_activities (patient_id, time_of_day, scheduled_time, title, description, icon)
           VALUES ($1,$2,$3,$4,$5,$6) RETURNING id`,
          [pid, phase, time, title, detail, icon]
        );
        taskIds.push(r.rows[0].id);
      }
      for (const [ti, tid] of taskIds.entries()) {
        for (let off = 6; off >= 1; off--) {
          const done = (off * 4 + ti) % 13 !== 0;
          await client.query(
            `INSERT INTO routine_logs (activity_id, patient_id, date, completed)
             VALUES ($1,$2,$3,$4)`,
            [tid, pid, dKey(off), done]
          );
        }
      }

      // Agua (6 días atrás + hoy)
      for (let off = 6; off >= 1; off--) {
        const glasses = Math.max(3, Math.min(9, ((off * 3 + pi * 2) % 9) + 2));
        await client.query(
          `INSERT INTO water_logs (patient_id, date, glasses) VALUES ($1,$2,$3)`,
          [pid, dKey(off), glasses]
        );
      }
      await client.query(
        `INSERT INTO water_logs (patient_id, date, glasses) VALUES ($1,$2,$3)`,
        [pid, dKey(0), waterToday[p.key]]
      );

      // Puntuaciones de juegos
      for (const [game, score] of Object.entries(bestScores[p.key])) {
        await client.query(
          `INSERT INTO game_scores (patient_id, game, score, detail, played_at)
           VALUES ($1,$2,$3,$4,$5)`,
          [pid, game, score, "Mejor marca registrada", daysAgo(1 + (pi % 3), 18)]
        );
      }

      await client.query("COMMIT");
      console.log(`✓ ${p.name} creado (id ${pid}, PIN ${pin}).`);
    }

    console.log("✅ Seed completado.");
  } catch (err) {
    await client.query("ROLLBACK").catch(() => {});
    console.error("❌ Error en el seed:", err);
    process.exitCode = 1;
  } finally {
    client.release();
    await pool.end();
  }
}

main();
