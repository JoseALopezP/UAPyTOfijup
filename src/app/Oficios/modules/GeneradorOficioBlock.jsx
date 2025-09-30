import { useContext, useEffect, useState } from 'react';
import styles from '../Oficios.module.css'
import { DataContext } from '@/context/DataContext';
import { generateOficioSection } from '@/utils/resuelvoUtils';

export default function GeneradorOficioBlock({item, date, resuelvo}) {
    const {desplegables} = useContext(DataContext)
    const [traslado, setTraslado] = useState(`Se informa que la fecha de detención del Sr. XXX fue el día XXXX, habiendo intervenido Comisaría XXX; por lo que se solicita que cuando se efectivice el traslado del mencionado al SERVICIO PENITENCIARIO PROVINCIAL, se informe dicha circunstancia a la Oficina Judicial Penal al correo: casosofijup@jussanjuan.gov.ar y/o al teléfono 2644554725 de la Unidad de Administración de Casos.`)
    const [inputList, setInputList] = useState([]);
    const [imputadoList, setImputadoList] = useState([])
    const handleInputChange = (e, index) => {
        const { value } = e.target;
        const list = [...inputList];
        list[index].value = value;
        setInputList(list);
    };
    const handleAddInput = () => {
        setInputList([...inputList, { value: '' }]);
    };
    const handleRemoveInput = (index) => {
        const list = [...inputList];
        list.splice(index, 1);
        setInputList(list);
    };
    const submitHandler = (e) => {
      let errorM = 'Falta:'
      item.numeroLeg ? errorM+='' : errorM+=' número de legajo,'
      item.caratula ? errorM+='' : errorM+=' carátula,'
      item.tipo ? errorM+='' : errorM+=' tipo,'
      item.juez ? errorM+='' : errorM+=' juez,'
      item.resuelvoText ? errorM+='' : errorM+=' resuelvo,'
      item.mpf ? errorM+='' : errorM+=' mpf,'
      item.defensa ? errorM+='' : errorM+=' defensa,'
      item.imputado ? errorM+='' : errorM+=' imputado,'
      item.operador ? errorM+='' : errorM+=' operador,'
      if(errorM === 'Falta:'){
        e.preventDefault();
        generateOficioSection(item,date,traslado,inputList, resuelvo, imputadoList.filter(item => item.selected === true))
      }else{
        alert(errorM)
      }
    };
    function editarPropiedad(arr, idBuscado, nuevoValor) {
      const nuevoArray = arr.map((item, i) => {
        if (i === idBuscado) {
            return { ...item,
              selected: nuevoValor
            };
          }
          return item;
        });
      return nuevoArray;
    }
    useEffect(()=>{
      setImputadoList(item.imputado.map(el=>({...el,selected: true})))
    },[item.imputado])
    return (
        <form className={styles.generadorOficioForm} onSubmit={(event) => submitHandler(event)}>
            {inputList.map((input, index) => (
            <div key={index}>
              <input className={`${styles.oficioInput}`}
                list={`options-${index}`}
                value={input.value}
                onChange={(e) => handleInputChange(e, index)}
              />
              <datalist id={`options-${index}`}>
                {desplegables.oficios && desplegables.oficios.map((option, i) => (
                  <option key={i} value={option} />
                ))}
              </datalist>
              <button type='button' className={`${styles.controlButton} ${styles.controlButtonQuitar}`} onClick={() => handleRemoveInput(index)}>
                QUITAR
              </button>
            </div>
          ))}
          <button type='button' className={`${styles.controlButton} ${styles.controlButtonAgregar}`} onClick={handleAddInput}>+ AGREGAR</button>
          <textarea spellCheck='true' className={`${styles.textAreaTraslado}`} rows={12} value={traslado} onChange={(e) => setTraslado(e.target.value)}/>
          <div className={`${styles.selectImputadoBlock}`}>
            {imputadoList.length > 0 ? <>{imputadoList.map((el, i) =>(
              <span className={`${styles.selectImputadoIndiv}`}>
              <button type='button' onClick={() => setImputadoList(editarPropiedad(imputadoList,i,!el.selected))}>{el.selected ? "🗹" : "☐"}</button>
              <p>{el.nombre} - {el.dni}{el.detenido && '- ' + el.detenido}</p>
              </span>
            ))}</>:
            <p>No hay imputados cargados</p>}
          </div>
          <button className={`${styles.controlButton} ${styles.controlButtonDescargar}`} type="submit">DESCARGAR</button>
        </form>
    )
}