import { db } from "hatchable";
export const access = "user";
export default async function(req,res){
  const id=req.params.id;
  const patient=await db.query("SELECT id,external_ref,display_name,date_of_birth,sex,status,photo_url,blood_group,preferred_name,created_at,updated_at FROM patients WHERE id=$1",[id]);
  if(!patient.rows.length) return res.status(404).json({error:"Patient not found"});
  const [signals,diagnoses,medications,attributes,documents]=await Promise.all([
    db.query("SELECT signal_type,value_numeric,unit,observed_at,quality,source_id FROM patient_signals WHERE patient_id=$1 ORDER BY observed_at DESC LIMIT 300",[id]),
    db.query("SELECT diagnosis_name,clinical_status,diagnosed_at,source_id FROM patient_diagnoses WHERE patient_id=$1 ORDER BY diagnosed_at DESC NULLS LAST,created_at DESC LIMIT 100",[id]),
    db.query("SELECT medication_name,dose,frequency,status,started_at,ended_at,source_id FROM patient_medications WHERE patient_id=$1 ORDER BY started_at DESC NULLS LAST,created_at DESC LIMIT 100",[id]),
    db.query("SELECT attribute_key,attribute_value,data_type,observed_at,source_id FROM patient_attributes WHERE patient_id=$1 ORDER BY created_at DESC LIMIT 200",[id]),
    db.query("SELECT file_name,file_type,extracted_summary,created_at FROM patient_documents WHERE patient_id=$1 ORDER BY created_at DESC LIMIT 50",[id])
  ]);
  res.json({patient:patient.rows[0],signals:signals.rows,diagnoses:diagnoses.rows,medications:medications.rows,attributes:attributes.rows,documents:documents.rows});
}