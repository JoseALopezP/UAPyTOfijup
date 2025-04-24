import { listFiscal } from "./resuelvoUtils";
import { listDefensa } from "./resuelvoUtils";
import { listImputado } from "./resuelvoUtils";
import { listPartes } from "./resuelvoUtils";
import React from "react";

export function capitalizeFirst(sentence) {
    if (!sentence) return sentence;
    return sentence.split(' ').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ');
}
export function getMonthName(number) {
    const date = new Date(0, number - 1);
    return date.toLocaleString('es-AR', { month: 'long' });
}
function safeRender(fnResult) {
    if (!fnResult) return '';
    if (typeof fnResult === 'string' || typeof fnResult === 'number') return fnResult;
    if (Array.isArray(fnResult)) return fnResult.join(', ');
    if (React.isValidElement(fnResult)) return fnResult;
    return '';
}
  

export const caratulaGenerator = (item, date) =>{
    return(<>
        Lugar y Fecha: San Juan, {date.slice(0, 2)} de {capitalizeFirst(getMonthName(date.slice(2, 4)))} de {date.slice(4, 8)}.<br/>
        Tipo de Audiencia: {item.tipo} {item.tipo2 ? ' - ' + item.tipo2 : ''} {item.tipo3 ? ' - ' + item.tipo3 : ''}.<br/>
        Legajo: N° {item.numeroLeg}{item.saeNum ? ` / ${item.saeNum}` : ''} Caratulado {item.caratula}.<br/>
        Sala de Audiencias: {item.sala}.<br/>
        Hora programada: {item.hora} horas.<br/>
        Hora real de inicio: {item.hitos[0].split(' | ')[0]} horas.<br/>
        Juez Interviniente: {item.juez}<br/>
        {safeRender(listFiscal(item.mpf, item.ufi))}<br/>
        {safeRender(listDefensa(item.defensa))}<br/>
        {safeRender(listImputado(item.imputado))}<br/>
        {safeRender(listPartes(item.partes))}<br/>
        </>);
}