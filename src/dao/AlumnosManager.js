import { alumnosModelo } from "./models/alumnosModelo.js"

export class AlumnosManager{

    static async getAlumnos(){
        return await alumnosModelo.find().lean()
    }

    static async createAlumno(alumno={}){
        let nuevoAlumno=await alumnosModelo.create(alumno)
        return nuevoAlumno.toJSON()
    }

    static async midificaAlumno(id, alumno){

        return await alumnosModelo.updateOne({_id:id}, alumno).lean()

    }

} // fin class