import { db } from "hatchable";
export const access="user";
export const methods=["GET"];
export default async function(req,res){
 const ws=String(req.headers?.["x-workspace-id"]||"").trim();
 const hm=await db.query("SELECT hospital_id FROM hospital_members WHERE user_id=$1 AND ($2='' OR hospital_id::text=$2) LIMIT 1",[req.user.id,ws]);
 if(!hm.rows.length)return res.json({patients:0,age_groups:[],diagnoses:[],medications:[],name_clusters:[]});
 const h=hm.rows[0].hospital_id;
 const [p,d,m,n]=await Promise.all([
  db.query("SELECT id,display_name,date_of_birth,sex,status FROM patients WHERE hospital_id=$1 ORDER BY display_name",[h]),
  db.query("SELECT d.diagnosis_name,COUNT(*)::int count FROM patient_diagnoses d JOIN patients p ON p.id=d.patient_id WHERE p.hospital_id=$1 GROUP BY d.diagnosis_name ORDER BY count DESC,d.diagnosis_name LIMIT 30",[h]),
  db.query("SELECT m.medication_name,COUNT(*)::int count FROM patient_medications m JOIN patients p ON p.id=m.patient_id WHERE p.hospital_id=$1 GROUP BY m.medication_name ORDER BY count DESC,m.medication_name LIMIT 30",[h]),
  db.query("SELECT lower(trim(display_name)) name,COUNT(*)::int count FROM patients WHERE hospital_id=$1 GROUP BY lower(trim(display_name)) HAVING COUNT(*)>1 ORDER BY count DESC,name LIMIT 20",[h])
 ]);
 const now=new Date();
 const bucket=x=>{if(!x)return"Unknown age";const d=new Date(x);let age=now.getUTCFullYear()-d.getUTCFullYear();const m=now.getUTCMonth()-d.getUTCMonth();if(m<0||(m===0&&now.getUTCDate()<d.getUTCDate()))age--;if(age<18)return"0–17";if(age<30)return"18–29";if(age<45)return"30–44";if(age<60)return"45–59";if(age<75)return"60–74";return"75+"};
 const counts={};p.rows.forEach(x=>{const b=bucket(x.date_of_birth);counts[b]=(counts[b]||0)+1});
 res.json({generated_at:new Date().toISOString(),patients:p.rows.length,age_groups:Object.entries(counts).map(([label,count])=>({label,count})),diagnoses:d.rows,medications:m.rows,name_clusters:n.rows,note:"Dashboard aggregates only records in the signed-in user's hospital workspace."});
}