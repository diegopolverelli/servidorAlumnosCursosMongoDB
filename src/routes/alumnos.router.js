import { Router } from 'express';
import { procesaErrores } from '../utils.js';
import { AlumnosManager } from '../dao/AlumnosManager.js';
import { CursosManager } from '../dao/CursosManager.js';
import { isValidObjectId } from 'mongoose';
export const router=Router()

router.get('/',async(req,res)=>{
    try {
        let alumnos=await AlumnosManager.getAlumnos()  
    
        res.setHeader('Content-Type','application/json')
        res.status(200).json({alumnos})
    } catch (error) {
        procesaErrores(res, error)
    }
})

router.get('/:aid',async(req,res)=>{
    let {aid}=req.params
    if(!isValidObjectId(aid)){
        res.setHeader('Content-Type','application/json');
        return res.status(400).json({error:`El id debe ser un ObjectId de MongoDB`})
    }
    try {
        let alumnos=await AlumnosManager.getAlumnos()
        
        let alumno=alumnos.find(a=>a.id===aid) 
        if(!alumno){
            res.setHeader('Content-Type','application/json');
            return res.status(400).json({error:`No existen alumnos con id ${aid}`})
        }
    
        res.setHeader('Content-Type','application/json')
        res.status(200).json({alumno})
    } catch (error) {
        procesaErrores(res, error)
    }
})

router.post("/", async(req, res)=>{
    let {nombre, email}=req.body
    if(!nombre || !email){
        res.setHeader('Content-Type','application/json');
        return res.status(400).json({error:`Complete nombre | email`})
    }
    let regExNombre=/[0-9]/
    if(regExNombre.test(nombre)){
        res.setHeader('Content-Type','application/json');
        return res.status(400).json({error:`Nombre no puede contener números`})
    }

    // validaciones 
    let regExMail = /^(([^<>()\[\]\\.,;:\s@”]+(\.[^<>()\[\]\\.,;:\s@”]+)*)|(“.+”))@((\[[0–9]{1,3}\.[0–9]{1,3}\.[0–9]{1,3}\.[0–9]{1,3}])|(([a-zA-Z\-0–9]+\.)+[a-zA-Z]{2,}))$/
    if(!regExMail.test(email)){
        res.setHeader('Content-Type','application/json');
        return res.status(400).json({error:`email formato inválido`})
    }

    try {
        let alumnos=await AlumnosManager.getAlumnos() 
        let existe=alumnos.find(a=>a.email===email)
        if(existe){
            res.setHeader('Content-Type','application/json');
            return res.status(400).json({error:`Ya existe un alumno con email ${email}`})
        }

        let nuevoUsuario=await AlumnosManager.createAlumno({nombre, email})
        res.setHeader('Content-Type','application/json');
        return res.status(201).json({nuevoUsuario});
    } catch (error) {
        procesaErrores(res, error)
    }

})

router.post("/:aid/curso/:cid", async(req, res)=>{
    let {aid, cid}=req.params
    if(!isValidObjectId(aid) || !isValidObjectId(cid)){
        res.setHeader('Content-Type','application/json');
        return res.status(400).json({error:`Los id deben ser ObjectId de MongoDB válidos`})
    }

    try {
        let alumnos=await AlumnosManager.getAlumnos()
        console.log(alumnos)
        console.log(aid)
        let alumno=alumnos.find(a=>a._id==aid)
        if(!alumno){
            res.setHeader('Content-Type','application/json');
            return res.status(400).json({error:`No existen alumnos con id ${aid}`})
        }

        let cursos=await CursosManager.getCursos()
        let curso=cursos.find(c=>c._id==cid)
        if(!curso){
            res.setHeader('Content-Type','application/json');
            return res.status(400).json({error:`No existen cursos con id ${cid}`})
        }

        let indiceCursando=alumno.cursando.findIndex(c=>c.id==cid)
        if(indiceCursando===-1){
            alumno.cursando.push({id: cid, reinscripciones:0})
        }else{
            alumno.cursando[indiceCursando].reinscripciones++
        }

        let alumnoModificado=await AlumnosManager.midificaAlumno(aid, alumno)
        res.setHeader('Content-Type','application/json');
        return res.status(200).json({alumnoModificado});
    } catch (error) {
        procesaErrores(res, error)
    }
})

router.put("/:aid", async(req, res)=>{
    let {aid}=req.params
    if(!isValidObjectId(aid)){
        res.setHeader('Content-Type','application/json');
        return res.status(400).json({error:`Ingrese un id de MongoDB válido`})
    }

    let alumnos=await AlumnosManager.getAlumnos()
    let alumno=alumnos.find(a=>a._id==aid)
    if(!alumno){
        res.setHeader('Content-Type','application/json');
        return res.status(400).json({error:`No existe alumno con id ${aid}`})
    }

    let cursando=req.body
    if(!Array.isArray(cursando)){
        res.setHeader('Content-Type','application/json');
        return res.status(400).json({error:`Debe ingresar un array con cursos en el body`})
    }

    let cursos
    try {
        cursos=await CursosManager.getCursos()
    } catch (error) {
        return procesaErrores(res, error)
    }

    let error=false
    cursando.forEach(c=>{
        if(!c.id){
            error=true
        }

        let cursoOK=cursos.find(curso=>String(curso._id)==String(c.id))
        if(!cursoOK){
            error=true
        }

        if(!c.reinscripciones){
            c.reinscripciones=0
        }
    })

    if(error){
        res.setHeader('Content-Type','application/json');
        return res.status(400).json({error:`Existen errores en los cursos del body`})
    }

    alumno.cursando=cursando

    try {
        let alumnoModificado=await AlumnosManager.midificaAlumno(aid, alumno)
        if(alumnoModificado.modifiedCount>0){
            res.setHeader('Content-Type','application/json');
            return res.status(200).json({message:"Modificacion realizada...!!!"});
        }else{
            res.setHeader('Content-Type','application/json');
            return res.status(500).json({error:`No se pudo concretar la modificacion`})
        }
    } catch (error) {
        procesaErrores(res, error)
    }
})