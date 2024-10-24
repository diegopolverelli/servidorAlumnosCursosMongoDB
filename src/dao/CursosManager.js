import { cursosModelo } from "./models/cursosModelo.js"

export class CursosManager{

    static async getCursos(){
        return await cursosModelo.find().lean()
    }

    static async createCurso(curso={}){
        let nuevoCurso=await cursosModelo.create(curso)        
        return nuevoCurso.toJSON()
    }
}