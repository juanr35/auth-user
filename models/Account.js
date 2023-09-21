import { Schema, model, models } from "mongoose"

const accountSchema = new Schema({
  primer_nombre: {
    type: String,
    trim:true,
  },
  segundo_nombre: {
    type: String,
    trim:true,
  },
  primer_apellido: {
    type: String,
    trim:true,
  },
  segundo_apellido: {
    type: String,
    trim:true,
  },
  cedula: {
    select: {
      type: String
    },
    input: {
      type: String
    }
  },
  nacionalidad: {
    type: String,
    trim:true,
  },
  sexo: {
    type: String,
  },
  fecha_nacimiento: {
    type: Date
  },
  category: {
    type: String
  },
  edad: {
    type: String,
    min: [4,"La edad minima no esta en el grado de instruccion"],
    max:[45,'La edad no es coherente'],
  },
  posicion: {
    type: String, 
    trim:true,
  },
  grupo_sanguineo:{
    type: String,
  },  
  estatura_m: {
    type: String
  },
  peso_kg: {
    type: String
  },
  pierna_dominante: {
    type: String
  },
  telefono: {
    type: String,
    trim:true,
    maxLength: [20,"El telefono no es coherente"]
  },
  telefono_habitacion: {
    type: String
  },  
  alergias_operaciones:{
    checked: {
      type: Boolean
    },
    descripcion: {
      type: String
    }
  },
  direccion_habitacion: {
    type: String,
    trim:true
  },
  institucion: {
    type: String,
    trim:true
  },
  año_grado: {
    type: String,
    trim:true
  },
  lugar_nacimiento: {
    type: String,
    trim:true
  },
  partida_nacimiento: {
    type: String
  },
  pasaporte: {
    type: String,
    trim:true
  },
  image_1: {
    public_id: String,
    secure_url: String
  },
  image_2: {
    public_id: String,
    secure_url: String
  },
  image_3: {
    public_id: String,
    secure_url: String
  },
  parentsId: [{ 
    type: Schema.Types.ObjectId, 
    ref: 'Parent' 
  }],
  medicalHistoryId: { 
    type: Schema.Types.ObjectId, 
    ref: 'MedicalHistory' 
  },}, {
    //timestamps: true,
    //versionKey: false
})

export default accountSchema