import { useState, useContext, useEffect } from 'react'
import { DataContext } from '@/context/DataContext';
import styles from './audiencia.module.css'

export function Oficio ({item, date}) {
    const {updateDesplegables, desplegables} = useContext(DataContext);
    const [inputList, setInputList] = useState([{ value: '' }]);
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
          <button className={`${styles.controlButton} ${styles.controlButtonDescargar}`} type="submit" style={{ marginTop: '10px' }}>DESCARGAR</button>
        </form>
        <div className={`${styles.resuelvoBlock}`}>

        </div>
        </div>
      );
}