import ExcelJS from 'exceljs';
import { saveAs } from 'file-saver';

export const cuartoCalculator = (aud) =>{
    let aux = 0
    aud.hitos.forEach((el, index) =>{
        if(el.split(' | ')[1] === 'CUARTO_INTERMEDIO'){
            const inicio = (parseInt(el.split(' | ')[0].split(':')[0]) * 60 + parseInt(el.split(' | ')[0].split(':')[1]))
            const fin = (parseInt(aud.hitos[index + 1].split(' | ')[0].split(':')[0]) * 60 + parseInt(aud.hitos[index + 1].split(' | ')[0].split(':')[1]))
            aux = aux + (fin - inicio)
        }
    })
    return(aux)
}
export const generateExcel = async (data, date) => {
    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet(`${date}`);
    worksheet.columns = [
        { header: 'NUMERO DE LEGAJO', key: 'numeroLeg', width: 128 },
        { header: 'CANTIDAD DE AUDIENCIAS POR LEGAJO', key: 'cantAud', width: 70 },
        { header: 'TIPO DE AUDIENCIA', key: 'tipoAud', width: 382 },
        { header: 'UFI', key: 'ufi', width: 74 },
        { header: 'DÍA Y HORA SOLICITUD DE AUDIENCIA', key: 'solicitud', width: 100 }, 
        { header: 'DÍA Y HORA AGENDAMIENTO DE AUDIENCIA', key: 'agendamiento', width: 103 },
        { header: 'TIEMPO DESDE SOLICITUD HASTA AGENDAMIENTO', key: 'solAgen', width: 80 },
        { header: 'DÍA Y HORA DE NOTIFICACIÓN AUDIENCIA', key: 'noti', width: 108 },
        { header: 'DÍA Y HORA PROGRAMADA DE AUDIENCIA', key: 'program', width: 118 },
        { header: 'DÍA Y HORA INICIO REAL DE AUDIENCIA', key: 'inicioReal', width: 113 },
        { header: 'DEMORA (TIEMPO EN MINUTOS)', key: 'demora', width: 122 },
        { header: 'MOTIVO DEMORA', key: 'motivoDem', width: 145 },
        { header: 'OBSERVACIONES DEMORA OFIJUP', key: 'observDem', width: 103 },
        { header: 'DURACIÓN PROGRAMADA DE AUDIENCIA', key: 'durProg', width: 103 },
        { header: 'DURACIÓN REAL DE AUDIENCIA', key: 'durReal', width: 101 },
        { header: 'CUARTO INTERMEDIO TEORICO (EN TIEMPO)', key: 'cuartoTeo', width: 95 },
        { header: 'CUARTO INTERMEDIO REAL (EN TIEMPO)', key: 'cuartoReal', width: 80 },
        { header: '1/4 INTERMEDIO REAL OTRAS PARTES (min)', key: 'cuartoRealOtr', width: 77 },
        { header: 'DÍA Y HORA FINALIZACIÓN DE AUDIENCIA', key: 'final', width: 128 },
        { header: 'HORARIO ENTREGA RESUELVO', key: 'horaResuelvo', width: 84 },
        { header: 'HORARIO ENTREGA DE MINUTA', key: 'horaMinuta', width: 115 },
        { header: 'TIEMPO DE DEMORA MINUTA', key: 'demoraMinuta', width: 96 },
        { header: 'CANTIDAD DE IMPUTADOS', key: 'cantidadImp', width: 81 },
        { header: 'TIPO DE VÍCTIMA', key: 'tipoVict', width: 124 },
        { header: 'SALA', key: 'sala', width: 78 },
        { header: 'OPERADOR/A', key: 'operador', width: 121 },
        { header: 'FISCAL INTERVINIENTE', key: 'fiscal', width: 233 },
        { header: 'DEFENSOR INTERVINIENTE', key: 'defensor', width: 163 },
        { header: 'JUEZ', key: 'juez', width: 171 }
    ];
    data.forEach((item, i) => {
        worksheet.addRow({
            id: `${i}`
            ,numeroLeg: `${item.numeroLeg}`
            ,cantAud: ''
            ,tipoAud: `${item.tipo}${item.tipo2 && ' + ' + item.tipo2}${item.tipo3 && ' + ' + item.tipo3}`
            ,ufi: item.mpf ? item.mpf[0].nombre.split(' - ')[1] : ''
            ,solicitud: ''
            ,agendamiento: ''
            ,solAgen: ''
            ,noti: ''
            ,program: `${date.split('').splice(0,2).join('')}/${date.split('').splice(2,2).join('')}/${date.split('').splice(4,4).join('')} ${item.hora}`
            ,inicioReal: `${date.split('').splice(0,2).join('')}/${date.split('').splice(2,2).join('')}/${date.split('').splice(4,4).join('')} ${item.hitos[0].split(' | ')[0]}`
            ,demora: `${(parseInt(item.hitos[0].split(' | ')[0].split(':')[0]) * 60 + parseInt(item.hitos[0].split(' | ')[0].split(':')[1])) - (parseInt(item.hora.split(':')[0]) * 60 + parseInt(item.hora.split(':')[1]))}`
            ,motivoDem: ''
            ,observDem: ''
            ,durProg: ''
            ,durReal: `${(parseInt(item.hitos[0].split(' | ')[0].split(':')[0]) * 60 + parseInt(item.hitos[0].split(' | ')[0].split(':')[1])) - (parseInt(item.hitos[item.hitos.length - 1].split(' | ')[0].split(':')[0]) * 60 + parseInt(item.hitos[item.hitos.length - 1].split(' | ')[0].split(':')[1]))}`
            ,cuartoTeo: ''
            ,cuartoReal: cuartoCalculator(item)
            ,cuartoRealOtr: ''
            ,final: ''
            ,horaResuelvo: ''
            ,horaMinuta: ''
            ,demoraMinuta: ''
            ,cantidadImp: item.imputado ? `${item.imputado.length}` : ''
            ,tipoVict: ''
            ,sala: `${item.sala}`
            ,operador: `${item.operador}`
            ,fiscal: item.fiscal ? `${item.fiscal[0].nombre}` : ''
            ,defensor: item.defensa ? `${item.defensa[0].nombre}` : ''
            ,juez: `${item.juez}`
        });
    });
    const buffer = await workbook.xlsx.writeBuffer();
    const blob = new Blob([buffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
    saveAs(blob, `${date}.xlsx`);
};