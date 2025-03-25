import { listFiscal } from "./resuelvoUtils";
import { listDefensa } from "./resuelvoUtils";
import { listImputado } from "./resuelvoUtils";
import { listPartes } from "./resuelvoUtils";

export function capitalizeFirst(sentence) {
    if (!sentence) return sentence;
    return sentence.split(' ').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ');
}
export function getMonthName(number) {
    const date = new Date(0, number - 1);
    return date.toLocaleString('es-AR', { month: 'long' });
}

export const caratulaGenerator = (item, date) =>{
    return(<>
        Lugar y Fecha: San Juan, {date.slice(0, 2)} de {capitalizeFirst(getMonthName(date.slice(2, 4)))} de {date.slice(4, 8)}.<br/>
        Tipo de Audiencia: {item.tipo} {item.tipo2 ? ' - ' + item.tipo2 : ''} {item.tipo3 ? ' - ' + item.tipo3 : ''}.<br/>
        Legajo: N° {item.numeroLeg}{item.sae && ` / ${sae}`} Caratulado {item.caratula}.<br/>
        Sala de Audiencias: {item.sala}.<br/>
        Hora programada: {item.hora} horas.<br/>
        Hora real de inicio: {item.hitos[0].split(' | ')[0]} horas.<br/>
        Juez Interviniente: {item.juez}<br/>
        {item.tipo === "TRÁMITES DE EJECUCIÓN" ? <></> : <>{listFiscal(item.mpf, item.ufi)}<br/></>}
        {listDefensa(item.defensa)}<br/>
        {listImputado(item.imputado)}<br/>
        {listPartes(item.partes)}<br/>
        </>);
}