import { useEffect, useContext, useState } from 'react';
import styles from './AddAudiencia.module.css';

export function AddAudienciaIndiv() {
    const [show, setShow] = useState(false)
    return(
        <form onClick={() => setShow(!show)}>
            <input ></input>
            <button type='button'>{show ? '↑':'↓'}</button>
        </form>
    )
}