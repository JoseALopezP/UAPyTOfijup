import ExcelJS from 'exceljs';
import { saveAs } from 'file-saver';

export function formatDate(date) {
  const day = String(date.getDate()).padStart(2, '0');
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const year = date.getFullYear();
  return `${day}${month}${year}`;
}
export async function getValuesInDateRange(startDateStr, endDateStr, getByDate) {
    function parseDate(dateStr) {
      const day = parseInt(dateStr.substring(0, 2), 10);
      const month = parseInt(dateStr.substring(2, 4), 10) - 1;
      const year = parseInt(dateStr.substring(4, 8), 10);
      return new Date(year, month, day);
    }
    const startDate = parseDate(startDateStr);
    const endDate = parseDate(endDateStr);
    if (isNaN(startDate.getTime()) || isNaN(endDate.getTime())) {
      return "Invalid date format";
    }
    if (startDate > endDate) {
      return "Start date must be before end date.";
    }
    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet(`acumulado`);
    worksheet.columns = [
        { header: 'NUMERO DE LEGAJO', key: 'numeroLeg', width: 20 },
        { header: 'CANTIDAD DE AUDIENCIAS POR LEGAJO', key: 'cantAud', width: 20 },
        { header: 'TIPO DE AUDIENCIA', key: 'tipoAud', width: 20 },
        { header: 'UFI', key: 'ufi', width: 20 },
        { header: 'DÍA Y HORA SOLICITUD DE AUDIENCIA', key: 'solicitud', width: 20 }, 
        { header: 'DÍA Y HORA AGENDAMIENTO DE AUDIENCIA', key: 'agendamiento', width: 20 },
        { header: 'TIEMPO DESDE SOLICITUD HASTA AGENDAMIENTO', key: 'solAgen', width: 20 },
        { header: 'DÍA Y HORA DE NOTIFICACIÓN AUDIENCIA', key: 'noti', width: 20 },
        { header: 'DÍA Y HORA PROGRAMADA DE AUDIENCIA', key: 'program', width: 20 },
        { header: 'DÍA Y HORA INICIO REAL DE AUDIENCIA', key: 'inicioReal', width: 20 },
        { header: 'DEMORA (TIEMPO EN MINUTOS)', key: 'demora', width: 20 },
        { header: 'MOTIVO DEMORA', key: 'motivoDem', width: 20 },
        { header: 'OBSERVACIONES DEMORA OFIJUP', key: 'observDem', width: 20 },
        { header: 'DURACIÓN PROGRAMADA DE AUDIENCIA', key: 'durProg', width: 20 },
        { header: 'DURACIÓN REAL DE AUDIENCIA', key: 'durReal', width: 20 },
        { header: 'CUARTO INTERMEDIO TEORICO (EN TIEMPO)', key: 'cuartoTeo', width: 20 },
        { header: 'CUARTO INTERMEDIO REAL (EN TIEMPO)', key: 'cuartoReal', width: 20 },
        { header: '1/4 INTERMEDIO REAL OTRAS PARTES (min)', key: 'cuartoRealOtr', width: 20 },
        { header: 'DÍA Y HORA FINALIZACIÓN DE AUDIENCIA', key: 'final', width: 20 },
        { header: 'HORARIO ENTREGA RESUELVO', key: 'horaResuelvo', width: 20 },
        { header: 'HORARIO ENTREGA DE MINUTA', key: 'horaMinuta', width: 20 },
        { header: 'TIEMPO DE DEMORA MINUTA', key: 'demoraMinuta', width: 20 },
        { header: 'CANTIDAD DE IMPUTADOS', key: 'cantidadImp', width: 20 },
        { header: 'TIPO DE VÍCTIMA', key: 'tipoVict', width: 20 },
        { header: 'SALA', key: 'sala', width: 20 },
        { header: 'OPERADOR/A', key: 'operador', width: 20 },
        { header: 'FISCAL INTERVINIENTE', key: 'fiscal', width: 20 },
        { header: 'DEFENSOR INTERVINIENTE', key: 'defensor', width: 20 },
        { header: 'JUEZ', key: 'juez', width: 20 }
    ];
    let currentDate = new Date(startDate);
    while (currentDate <= endDate) {
      const formattedDate = formatDate(currentDate)
      const aux = await getByDate(formattedDate)
      await aux.forEach((item, i) => {
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
            ,program: `${formattedDate.split('').splice(0,2).join('')}/${formattedDate.split('').splice(2,2).join('')}/${formattedDate.split('').splice(4,4).join('')} ${item.hora}`
            ,inicioReal: `${formattedDate.split('').splice(0,2).join('')}/${formattedDate.split('').splice(2,2).join('')}/${formattedDate.split('').splice(4,4).join('')} ${item.hitos ? item.hitos[0].split(' | ')[0] : ''}`
            ,demora: `${item.hitos ? ((parseInt(item.hitos[0].split(' | ')[0].split(':')[0]) * 60 + parseInt(item.hitos[0].split(' | ')[0].split(':')[1])) - (parseInt(item.hora.split(':')[0]) * 60 + parseInt(item.hora.split(':')[1]))) : ''}`
            ,motivoDem: `${item.razonDemora ? (item.razonDemora) : 'JUEZ'}`
            ,observDem: ''
            ,durProg: ''
            ,durReal: `${item.hitos ? ((parseInt(item.hitos[0].split(' | ')[0].split(':')[0]) * 60 + parseInt(item.hitos[0].split(' | ')[0].split(':')[1])) - (parseInt(item.hitos[item.hitos.length - 1].split(' | ')[0].split(':')[0]) * 60 + parseInt(item.hitos[item.hitos.length - 1].split(' | ')[0].split(':')[1]))) : ''}`
            ,cuartoTeo: ''
            ,cuartoReal: (item.hitos ? cuartoCalculator(item) : '')
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
      currentDate.setDate(currentDate.getDate() + 1);
    }
    const buffer = await workbook.xlsx.writeBuffer();
      const blob = new Blob([buffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
      saveAs(blob, `planillaUAL.xlsx`);
}

export const cuartoCalculator = (aud) =>{
    let aux = 0
    aud.hitos && aud.hitos.forEach((el, index) =>{
        if(el.split(' | ')[1] === 'CUARTO_INTERMEDIO'){
            const inicio = (parseInt(el.split(' | ')[0].split(':')[0]) * 60 + parseInt(el.split(' | ')[0].split(':')[1]))
            const fin = (parseInt(aud.hitos[index + 1] ? (aud.hitos[index + 1].split(' | ')[0].split(':')[0]) * 60 + parseInt(aud.hitos[index + 1].split(' | ')[0].split(':')[1]) : 0))
            aux = aux + (fin - inicio)
        }
    })
    return(aux)
}

export const generateExcel = async (data, date) => {
    
    
    
};