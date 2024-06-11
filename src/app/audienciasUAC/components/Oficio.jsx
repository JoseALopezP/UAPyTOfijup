import { useState, useContext, useEffect } from 'react'
import { DataContext } from '@/context/DataContext';
import styles from './audiencia.module.css'
import { generateResuelvoSection } from '@/utils/resuelvoUtils';

export function Oficio ({item, date}) {
    const {updateDesplegables, desplegables} = useContext(DataContext);
    const [traslado, setTraslado] = useState(`Se informa que la fecha de detención del Sr. XXX fue el día XXXX, habiendo intervenido Comisaría XXX; por lo que se solicita que cuando se efectivice el traslado del mencionado al SERVICIO PENITENCIARIO PROVINCIAL, se informe dicha circunstancia a la Oficina Judicial Penal al correo: casosofijup@jussanjuan.gov.ar y/o al teléfono 2644554725 de la Unidad de Administración de Casos.`)
    const [inputList, setInputList] = useState([]);
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
            e.preventDefault();
            
        };
    useEffect(() => {
        updateDesplegables()
    }, []);
    return (
        <div className={`${styles.oficioBlock}`}>
          <div className={`${styles.resuelvoBlock}`}>
            {generateResuelvoSection(item, date).map(el=>(
              <>{el.title ? <p><strong>{el.title}</strong> {el.text}</p> : <p>{el.text}</p>}</>
            ))}
          </div>
        <form className={`${styles.oficiadosBlock}`} onSubmit={submitHandler}>
          {inputList.map((input, index) => (
            <div key={index} style={{ display: 'flex', alignItems: 'center', marginBottom: '10px' }}>
              <input className={`${styles.oficioInput}`}
                list={`options-${index}`}
                value={input.value}
                onChange={(e) => handleInputChange(e, index)}
                style={{ marginRight: '10px' }}
              />
              <datalist id={`options-${index}`}>
                {desplegables.oficios && desplegables.oficios.map((option, i) => (
                  <option key={i} value={option} />
                ))}
              </datalist>
              <button className={`${styles.controlButton} ${styles.controlButtonQuitar}`} onClick={() => handleRemoveInput(index)} style={{ marginLeft: '10px' }}>
                QUITAR
              </button>
            </div>
          ))}
          <button className={`${styles.controlButton} ${styles.controlButtonAgregar}`} onClick={handleAddInput}>+ AGREGAR</button>
          <textarea className={`${styles.textAreaTraslado}`} rows={12} value={traslado} onChange={(e) => setTraslado(e.target.value)}/>
          <button className={`${styles.controlButton} ${styles.controlButtonDescargar}`} type="submit">DESCARGAR</button>
        </form>
        </div>
      );
}