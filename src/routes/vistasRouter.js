import { Router } from 'express';
import { AlumnosManager } from '../dao/AlumnosManager.js';
import { CursosManager } from '../dao/CursosManager.js';
import { procesaErrores } from '../utils.js';
import { isValidObjectId } from 'mongoose';
export const router=Router()

router.get("/alumnos", async(req, res)=>{
    try {
        let alumnos=await AlumnosManager.getAlumnos()
        res.render("alumnos", {alumnos})
    } catch (error) {
        procesaErrores(res, error)
    }
})

router.get('/alumno/:aid',async(req,res)=>{
    let {aid}=req.params
    if(!isValidObjectId(aid)){
        res.setHeader('Content-Type','application/json');
        return res.status(400).json({error:`El id debe ser un ObjectId de MongoDB`})
    }
    try {
        let alumnos=await AlumnosManager.getAlumnos()
        let alumno=alumnos.find(a=>a._id==aid)
        if(!alumno){
            res.setHeader('Content-Type','application/json');
            return res.status(400).json({error:`Error con alumno id ${aid}`})
        }
        // recorrer alumno.cursando y completar nombre del curso
        let cursos=await CursosManager.getCursos()
        // console.log(alumno.cursando)
        // console.log(cursos)
        alumno.cursando.forEach(c=>{
            // console.log(`busca ${c.id}`)
            let dataCurso=cursos.find(curso=>String(curso._id)==String(c.id))
            if(dataCurso){
                // console.log(`Encontro...!!!`)
                c.nombre=dataCurso.nombre
            }
        })
        
        res.render("alumno",{
            cursos, alumno, cursando: alumno.cursando
        })
        
    } catch (error) {
        procesaErrores(res, error)
    }
})