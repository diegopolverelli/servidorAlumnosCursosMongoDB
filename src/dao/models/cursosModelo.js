import mongoose from "mongoose";

export const cursosModelo=mongoose.model(
    "cursos", 
    new mongoose.Schema(
        {
            nombre:{type:String, unique:true}, 
            horas: Number, 
            docente: String
        },
        {
            timestamps:true
        }
    )
)