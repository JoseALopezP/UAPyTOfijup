import ExcelJS from 'exceljs';
import { saveAs } from 'file-saver';

export const generateExcel = async (data, date) => {
    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet('Sheet 1');
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
    data.forEach((item) => {
        worksheet.addRow(item);
    });
    const buffer = await workbook.xlsx.writeBuffer();
    const blob = new Blob([buffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
    saveAs(blob, `${date}.xlsx`);
};