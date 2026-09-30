export const access="user";
export const methods=["GET"];

const first=["Aarav","Aadhya","Arjun","Ananya","Advik","Diya","Ishaan","Meera","Vihaan","Nila","Rohan","Kavya","Kabir","Tara","Reyansh","Ira","Aditya","Maya","Vivaan","Anika"];
const last=["Sharma","Iyer","Nair","Rao","Menon","Patel","Das","Khan","Joseph","Pillai","Reddy","Krishnan"];
const diagnoses=["Type 2 diabetes","Hypertension","Asthma","Dyslipidemia","Iron deficiency","Migraine","COPD","Hypothyroidism"];
const medications=["Metformin","Amlodipine","Atorvastatin","Levothyroxine","Salbutamol inhaler","Ferrous sulfate","Paracetamol","Insulin glargine","Losartan","Montelukast"];
const signalDefs=[
 {type:"heart_rate",unit:"bpm",base:72},
 {type:"glucose",unit:"mg/dL",base:108},
 {type:"spo2",unit:"%",base:97},
 {type:"systolic_bp",unit:"mmHg",base:124},
 {type:"steps",unit:"steps",base:6200}
];

const patients=Array.from({length:60},(_,i)=>{
 const display_name=first[i%first.length]+" "+last[Math.floor(i/first.length)%last.length];
 const age=18+(i*7)%63;
 const year=new Date().getFullYear()-age;
 const dx=[diagnoses[i%diagnoses.length],diagnoses[(i+2)%diagnoses.length]];
 if(i%5===0)dx.push(diagnoses[(i+4)%diagnoses.length]);
 const meds=[medications[i%medications.length],medications[(i+3)%medications.length]];
 if(i%4===0)meds.push(medications[(i+6)%medications.length]);
 const signals=signalDefs.slice(0,3+(i%3)).map((s,j)=>({
   type:s.type,signal_type:s.type,unit:s.unit,
   value_numeric:s.base+((i*3+j*5)%11)-5,
   observed_at:new Date(Date.now()-j*3600000).toISOString(),
   source_id:"demo-clinical"
 }));
 return {
   id:"demo-patient-"+String(i+1).padStart(3,"0"),
   external_ref:"SYN-PT-"+String(i+1).padStart(3,"0"),
   display_name,date_of_birth:year+"-"+String((i%12)+1).padStart(2,"0")+"-"+String((i%27)+1).padStart(2,"0"),
   sex:i%2===0?"female":"male",status:"active",
   source:"CARE & CTRL Synthetic Clinical Test Dataset",
   dataType:"SYNTHETIC / TEST",
   conditions:dx.map(name=>({name,clinical_status:"recorded"})),diagnoses:dx,
   medications:meds.map(name=>({name,status:"active"})),
   signals,latest_signals:signals,signal_count:signals.length,last_signal_at:signals[0].observed_at,
   encounters:[{id:"demo-enc-"+i,status:"finished"}]
 };
});

export default async function(req,res){
 res.json({
   mode:"SYNTHETIC CLINICAL TEST DATASET",generated_at:new Date().toISOString(),patients,
   resource_counts:{
     Patient:patients.length,
     Observation:patients.reduce((n,p)=>n+p.signals.length,0),
     Condition:patients.reduce((n,p)=>n+p.diagnoses.length,0),
     MedicationRequest:patients.reduce((n,p)=>n+p.medications.length,0),
     Encounter:patients.length
   },
   note:"All patient records are synthetic test records for product demonstration. They are not real people and are not associated with any real hospital."
 });
}