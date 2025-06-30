"use client"
import styles from './audiencia.module.css'
import { useState, useContext, useEffect } from 'react'
import { DataContext } from '@/context/DataContext';

export function AddBlock ({date}) {
    const {updateTiposAudiencias, updateByDate, tiposAudiencias, jueces, updateJueces, addAudiencia, updateAños, años, bydate} = useContext(DataContext);
    const [hora, setHora] = useState(null)
    const [horaProgramada, setHoraProgramada] = useState(45)
    const [hora2, setHora2] = useState(null)
    const [sala, setSala] = useState(null)
    const [legajo1, setLegajo1] = useState('MPF-SJ')
    const [legajo2, setLegajo2] = useState('')
    const [legajo3, setLegajo3] = useState('')
    const [tipo, setTipo] = useState('-')
    const [tipo2, setTipo2] = useState('-')
    const [tipo3, setTipo3] = useState('-')
    const [colegiado, setColegiado] = useState(false)
    const [juez, setJuez] = useState(null)
    const [juez2, setJuez2] = useState(null)
    const [juez3, setJuez3] = useState(null)

    const [situacion, setSituacion] = useState(null)
    const [horaProgramadaError, setHoraProgramadaError] = useState(false)
    const [horaError, setHoraError] = useState(false)
    const [salaError, setSalaError] = useState(false)
    const [legajo2Error, setLegajo2Error] = useState(false)
    const [legajo3Error, setLegajo3Error] = useState(false)
    const [tipoError, setTipoError] = useState(false)
    const [juezError, setJuezError] = useState(false)
    const [dupliCheck, setDupliCheck] = useState(false)

    const errorChecking = () =>{
        (hora && hora2) ? setHoraError(false) : setHoraError(true);
        (sala || sala=='-') ? setSalaError(false) : setSalaError(true);
        (legajo2 && (`${legajo2}`.length < 6)) ? setLegajo2Error(false) : setLegajo2Error(true);
        (legajo3 || legajo3 =='-') ? setLegajo3Error(false) : setLegajo3Error(true);    
        (tipo || tipo == '-') ? setTipoError(false) : setTipoError(true);
        (horaProgramada || horaProgramada === 0) ? setHoraProgramadaError(false) : setHoraProgramadaError(true);
        if(colegiado){
            ((juez || juez == '-' ) && (juez2 || juez == '-') && (juez3 || juez == '-')) ? setJuezError(false) : setJuezError(true);
        }else{
            (juez || juez == '-') ? setJuezError(false) : setJuezError(true);
        }
        if(colegiado){
            ((jueces.includes(juez)) && (jueces.includes(juez2)) && (jueces.includes(juez3))) ? setJuezError(false) : setJuezError(true);
        }else{
            jueces.includes(juez) ? setJuezError(false) : setJuezError(true);
        }
        const formattedHora = `${hora.padStart(2,'0')}:${hora2.padStart(2,'0')}`;
        const formattedNumeroLeg = `${legajo1}-${legajo2.padStart(5,'0')}-${legajo3}`;
        const isDuplicate = bydate.some(el => el.hora === formattedHora && el.numeroLeg === formattedNumeroLeg);
        setDupliCheck(isDuplicate);
    }
    const addToFirebase = async() =>{
        const newAudiencia = {
            hora: `${hora.padStart(2,'0')}:${hora2.padStart(2,'0')}`,
            horaProgramada: horaProgramada,
            sala: sala,
            numeroLeg: (legajo1 + "-" + legajo2.padStart(5,'0') + "-" + legajo3),
            tipo: tipo,
            tipo2: ((tipo2 == '-') ? '' : tipo2),
            tipo3: ((tipo3 == '-' | tipo2 == '-') ? '' : tipo3),
            juez: (colegiado ? (juez + "+" + juez2 + "+" + juez3) : juez),
            estado: "PROGRAMADA",
            situacion: (situacion ? situacion : '')
        }
        await addAudiencia(newAudiencia, `${date}`)
        await updateByDate(date)
        document.getElementById('addingForm').reset();
    }
    const restore = () =>{
        setHora(null);
        setSala(null);
        setLegajo1('MPF-SJ');
        setLegajo2('');
        setLegajo3('');
        setTipo('-')
        setTipo2('-')
        setTipo3('-')
        setColegiado(false)
        setJuez(null)
        setJuez2(null)
        setJuez3(null)
        setHoraProgramada(45)
        setSituacion(null)
    }
    const handleSubmit = async(event) =>{
        event.preventDefault();
        errorChecking()
        if(!(horaError || salaError || legajo2Error || legajo3Error || tipoError || juezError || dupliCheck || horaProgramadaError)){
            await addToFirebase()
            await restore()
        }
    }
    useEffect(() => {
        updateTiposAudiencias()
        updateJueces()
        updateAños()
    }, [])
    return(
        <>
        </>
    )
}
