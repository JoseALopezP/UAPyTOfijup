'use client'
import React, { useState, useContext, useEffect } from 'react';
import styles from '../administracionLogistica.module.css';
import { DataContext } from '@/context New/DataContext';

export default function PatchAudienceData() {
    const { updateByDateView, bydateView, updateData, updateByDate } = useContext(DataContext);
    const [date, setDate] = useState('');
    const [audiences, setAudiences] = useState([]);
    const [selectedAudience, setSelectedAudience] = useState('');
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState('');

    useEffect(() => {
        if (date && date.length === 8) { // format DDMMYYYY or YYYYMMDD? Assuming YYYYMMDD based on typical cases, or DDMMYYYY
            updateByDateView(date);
        }
    }, [date, updateByDateView]);

    useEffect(() => {
        if (bydateView && bydateView.audiencias) {
            setAudiences(bydateView.audiencias);
        } else if (Array.isArray(bydateView)) {
            setAudiences(bydateView);
        } else if (bydateView && typeof bydateView === 'object') {
            setAudiences(Object.values(bydateView));
        } else {
             setAudiences([]);
        }
    }, [bydateView]);

    const handleSave = async () => {
        if (!date || !selectedAudience) {
            setMessage('Debe seleccionar fecha y audiencia.');
            return;
        }

        setLoading(true);
        setMessage('');

        // ==========================================
        // DATO HARDCODEADO A SOBREESCRIBIR
        // ==========================================
        const hardcodedData = {
            partes: [
          {
                    "id": "p1",
                    "role": "Denunciante",
                    "name": "Aballay Fernandez Maria Jose",
                    "dni": "36034887",
                    "asistencia": true,
                    "presencial": false
          },
          {
                    "id": "p2",
                    "role": "Denunciante",
                    "name": "Aballay Romero Nadia Martina",
                    "dni": "47891662",
                    "asistencia": true,
                    "presencial": false
          },
          {
                    "id": "p3",
                    "role": "Denunciante",
                    "name": "Aciar Maximmiliano Damian",
                    "dni": "32084459",
                    "asistencia": true,
                    "presencial": false
          },
          {
                    "id": "p4",
                    "role": "Denunciante",
                    "name": "Acosta Miranda Martín",
                    "dni": "46,071,980",
                    "asistencia": true,
                    "presencial": false
          },
          {
                    "id": "p5",
                    "role": "Denunciante",
                    "name": "Acosta Oscar Alfredo",
                    "dni": "14,791,811",
                    "asistencia": true,
                    "presencial": false
          },
          {
                    "id": "p6",
                    "role": "Denunciante",
                    "name": "Aguero Cuello Enzo Agustin",
                    "dni": "40728949",
                    "asistencia": true,
                    "presencial": false
          },
          {
                    "id": "p7",
                    "role": "Denunciante",
                    "name": "Aguilera Nahuel Natanael",
                    "dni": "46983659",
                    "asistencia": true,
                    "presencial": false
          },
          {
                    "id": "p8",
                    "role": "Denunciante",
                    "name": "Aguilera Tejada Antonio",
                    "dni": "43220974",
                    "asistencia": true,
                    "presencial": false
          },
          {
                    "id": "p9",
                    "role": "Denunciante",
                    "name": "Aguirre Cuello Marcelo Adrian",
                    "dni": "46071761",
                    "asistencia": true,
                    "presencial": false
          },
          {
                    "id": "p10",
                    "role": "Denunciante",
                    "name": "Aguirre Eduardo Daniel",
                    "dni": "45634904",
                    "asistencia": true,
                    "presencial": false
          },
          {
                    "id": "p11",
                    "role": "Denunciante",
                    "name": "Aguirre Juan Nicolas",
                    "dni": "35,851,891",
                    "asistencia": true,
                    "presencial": false
          },
          {
                    "id": "p12",
                    "role": "Denunciante",
                    "name": "Aguirre Ramon Fernando",
                    "dni": "33,337,715",
                    "asistencia": true,
                    "presencial": false
          },
          {
                    "id": "p13",
                    "role": "Denunciante",
                    "name": "Ahumada Bernales Brisa Ainara",
                    "dni": "48683701",
                    "asistencia": true,
                    "presencial": false
          },
          {
                    "id": "p14",
                    "role": "Denunciante",
                    "name": "Alcaraz Galleguillo Melani Giselle",
                    "dni": "45,377,805",
                    "asistencia": true,
                    "presencial": false
          },
          {
                    "id": "p15",
                    "role": "Denunciante",
                    "name": "Alcaraz Mercado Sofia Del Carmen",
                    "dni": "46,071,712",
                    "asistencia": true,
                    "presencial": false
          },
          {
                    "id": "p16",
                    "role": "Denunciante",
                    "name": "Allendez Gines Medea Abigail",
                    "dni": "46,258,769",
                    "asistencia": true,
                    "presencial": false
          },
          {
                    "id": "p17",
                    "role": "Denunciante",
                    "name": "Almonacid Figueroa Juan Ignacio",
                    "dni": "41054219",
                    "asistencia": true,
                    "presencial": false
          },
          {
                    "id": "p18",
                    "role": "Denunciante",
                    "name": "Amarfil Bazan Damian Esteban",
                    "dni": "32,572,943",
                    "asistencia": true,
                    "presencial": false
          },
          {
                    "id": "p19",
                    "role": "Denunciante",
                    "name": "Amarfil Reinoso Fabiana",
                    "dni": "37,005,467",
                    "asistencia": true,
                    "presencial": false
          },
          {
                    "id": "p20",
                    "role": "Denunciante",
                    "name": "Amata Videla Juan Ignacio",
                    "dni": "47,124,582",
                    "asistencia": true,
                    "presencial": false
          },
          {
                    "id": "p21",
                    "role": "Denunciante",
                    "name": "Amato Yesica Mabel",
                    "dni": "27639288",
                    "asistencia": true,
                    "presencial": false
          },
          {
                    "id": "p22",
                    "role": "Denunciante",
                    "name": "Amaya Gema Del Carmen",
                    "dni": "32034036",
                    "asistencia": true,
                    "presencial": false
          },
          {
                    "id": "p23",
                    "role": "Denunciante",
                    "name": "Andrara Federico Nicolas",
                    "dni": "46070585",
                    "asistencia": true,
                    "presencial": false
          },
          {
                    "id": "p24",
                    "role": "Denunciante",
                    "name": "Aranda Aymara",
                    "dni": "46616039",
                    "asistencia": true,
                    "presencial": false
          },
          {
                    "id": "p25",
                    "role": "Denunciante",
                    "name": "Araujo Isaias Lautaro",
                    "dni": "46616003",
                    "asistencia": true,
                    "presencial": false
          },
          {
                    "id": "p26",
                    "role": "Denunciante",
                    "name": "Ariza Aravena Yamile Noemi",
                    "dni": "35923843",
                    "asistencia": true,
                    "presencial": false
          },
          {
                    "id": "p27",
                    "role": "Denunciante",
                    "name": "Arriola Videla Nroma Anotnia",
                    "dni": "28645087",
                    "asistencia": true,
                    "presencial": false
          },
          {
                    "id": "p28",
                    "role": "Denunciante",
                    "name": "Avila Andres Ernesto",
                    "dni": "38218423",
                    "asistencia": true,
                    "presencial": false
          },
          {
                    "id": "p29",
                    "role": "Denunciante",
                    "name": "Avila Nahuel Alejandro",
                    "dni": "42163339",
                    "asistencia": true,
                    "presencial": false
          },
          {
                    "id": "p30",
                    "role": "Denunciante",
                    "name": "Axel Valentin Sosa Pellaitay",
                    "dni": "46332257",
                    "asistencia": true,
                    "presencial": false
          },
          {
                    "id": "p31",
                    "role": "Denunciante",
                    "name": "Balderramo Femenia Leandro Nicolas",
                    "dni": "45378785",
                    "asistencia": true,
                    "presencial": false
          },
          {
                    "id": "p32",
                    "role": "Denunciante",
                    "name": "Balderramo Liliana Andrea",
                    "dni": "23943852",
                    "asistencia": true,
                    "presencial": false
          },
          {
                    "id": "p33",
                    "role": "Denunciante",
                    "name": "Balmaceda Alfredo",
                    "dni": "11142845",
                    "asistencia": true,
                    "presencial": false
          },
          {
                    "id": "p34",
                    "role": "Denunciante",
                    "name": "Balmaceda Calderon Gabriel Fernando",
                    "dni": "44766780",
                    "asistencia": true,
                    "presencial": false
          },
          {
                    "id": "p35",
                    "role": "Denunciante",
                    "name": "Balmaceda Gisella Daiana",
                    "dni": "40469402",
                    "asistencia": true,
                    "presencial": false
          },
          {
                    "id": "p36",
                    "role": "Denunciante",
                    "name": "Balmaceda Nicolas Ignacio",
                    "dni": "40266048",
                    "asistencia": true,
                    "presencial": false
          },
          {
                    "id": "p37",
                    "role": "Denunciante",
                    "name": "Bamba Cristan Jose",
                    "dni": "35189088",
                    "asistencia": true,
                    "presencial": false
          },
          {
                    "id": "p38",
                    "role": "Denunciante",
                    "name": "Bamba Julian Nahuel",
                    "dni": "44730233",
                    "asistencia": true,
                    "presencial": false
          },
          {
                    "id": "p39",
                    "role": "Denunciante",
                    "name": "Barahona Esther Narcisa",
                    "dni": "20132579",
                    "asistencia": true,
                    "presencial": false
          },
          {
                    "id": "p40",
                    "role": "Denunciante",
                    "name": "Barboza Lujan Guadalupe",
                    "dni": "47239861",
                    "asistencia": true,
                    "presencial": false
          },
          {
                    "id": "p41",
                    "role": "Denunciante",
                    "name": "Barzola Solange",
                    "dni": "43763459",
                    "asistencia": true,
                    "presencial": false
          },
          {
                    "id": "p42",
                    "role": "Denunciante",
                    "name": "Bazan Gonzalez Sebastian Adrian",
                    "dni": "29149090",
                    "asistencia": true,
                    "presencial": false
          },
          {
                    "id": "p43",
                    "role": "Denunciante",
                    "name": "Benegas Aguero Horacio Walter",
                    "dni": "12697296",
                    "asistencia": true,
                    "presencial": false
          },
          {
                    "id": "p44",
                    "role": "Denunciante",
                    "name": "Bilbao Celedon Rodrigo Garbiel",
                    "dni": "41,270,612",
                    "asistencia": true,
                    "presencial": false
          },
          {
                    "id": "p45",
                    "role": "Denunciante",
                    "name": "Blanco Ezequiel Anibal",
                    "dni": "34,193,635",
                    "asistencia": true,
                    "presencial": false
          },
          {
                    "id": "p46",
                    "role": "Denunciante",
                    "name": "Blanco Jorge Adrian",
                    "dni": "24,244,353",
                    "asistencia": true,
                    "presencial": false
          },
          {
                    "id": "p47",
                    "role": "Denunciante",
                    "name": "Boiteux Fajardo Cinthia Janet",
                    "dni": "43,220,834",
                    "asistencia": true,
                    "presencial": false
          },
          {
                    "id": "p48",
                    "role": "Denunciante",
                    "name": "Bravo Oscar Adrian",
                    "dni": "42,455,196",
                    "asistencia": true,
                    "presencial": false
          },
          {
                    "id": "p49",
                    "role": "Denunciante",
                    "name": "Bravo Zeballos Samanta",
                    "dni": "39,995,602",
                    "asistencia": true,
                    "presencial": false
          },
          {
                    "id": "p50",
                    "role": "Denunciante",
                    "name": "Bustos Caceres Cintia Soledad",
                    "dni": "36,911,035",
                    "asistencia": true,
                    "presencial": false
          },
          {
                    "id": "p51",
                    "role": "Denunciante",
                    "name": "Bustos Paez Rosalva Elizabth",
                    "dni": "43078524",
                    "asistencia": true,
                    "presencial": false
          },
          {
                    "id": "p52",
                    "role": "Denunciante",
                    "name": "Bustos Silva Marcela Vanesa",
                    "dni": "25118624",
                    "asistencia": true,
                    "presencial": false
          },
          {
                    "id": "p53",
                    "role": "Denunciante",
                    "name": "Caballero Maria Valeria",
                    "dni": "31,129,535",
                    "asistencia": true,
                    "presencial": false
          },
          {
                    "id": "p54",
                    "role": "Denunciante",
                    "name": "Cadin Suarez Daniela Beatriz",
                    "dni": "39533715",
                    "asistencia": true,
                    "presencial": false
          },
          {
                    "id": "p55",
                    "role": "Denunciante",
                    "name": "Camila Milagros Carrasco",
                    "dni": "43123423",
                    "asistencia": true,
                    "presencial": false
          },
          {
                    "id": "p56",
                    "role": "Denunciante",
                    "name": "Camila Pereyra",
                    "dni": "43,058,691",
                    "asistencia": true,
                    "presencial": false
          },
          {
                    "id": "p57",
                    "role": "Denunciante",
                    "name": "Campillay Gabriel Angel",
                    "dni": "29,594,137",
                    "asistencia": true,
                    "presencial": false
          },
          {
                    "id": "p58",
                    "role": "Denunciante",
                    "name": "Cardozo Sosa Francsco Marin",
                    "dni": "41,053,876",
                    "asistencia": true,
                    "presencial": false
          },
          {
                    "id": "p59",
                    "role": "Denunciante",
                    "name": "Carla Rodriguez Celina Daniela",
                    "dni": "44634649",
                    "asistencia": true,
                    "presencial": false
          },
          {
                    "id": "p60",
                    "role": "Denunciante",
                    "name": "Carpio Lian Amin",
                    "dni": "41,682,632",
                    "asistencia": true,
                    "presencial": false
          },
          {
                    "id": "p61",
                    "role": "Denunciante",
                    "name": "Carrera Baigorria Oscar David",
                    "dni": "35,318,061",
                    "asistencia": true,
                    "presencial": false
          },
          {
                    "id": "p62",
                    "role": "Denunciante",
                    "name": "Carrion Molina Marcos David Alejandro",
                    "dni": "34194678",
                    "asistencia": true,
                    "presencial": false
          },
          {
                    "id": "p63",
                    "role": "Denunciante",
                    "name": "Carrizo Martinez Facundo Rodolfo",
                    "dni": "39009905",
                    "asistencia": true,
                    "presencial": false
          },
          {
                    "id": "p64",
                    "role": "Denunciante",
                    "name": "Carrizo Riveros Esteban Joaquin",
                    "dni": "44991532",
                    "asistencia": true,
                    "presencial": false
          },
          {
                    "id": "p65",
                    "role": "Denunciante",
                    "name": "Carrizo Roberto Carlos",
                    "dni": "23,029,187",
                    "asistencia": true,
                    "presencial": false
          },
          {
                    "id": "p66",
                    "role": "Denunciante",
                    "name": "Caseres Santiago Agustin",
                    "dni": "34,920,081",
                    "asistencia": true,
                    "presencial": false
          },
          {
                    "id": "p67",
                    "role": "Denunciante",
                    "name": "Casibar Lucero Manuel Benjamin",
                    "dni": "46932414",
                    "asistencia": true,
                    "presencial": false
          },
          {
                    "id": "p68",
                    "role": "Denunciante",
                    "name": "Castañeda Anabel",
                    "dni": "42451692",
                    "asistencia": true,
                    "presencial": false
          },
          {
                    "id": "p69",
                    "role": "Denunciante",
                    "name": "Castillo Cristian",
                    "dni": "40,779,023",
                    "asistencia": true,
                    "presencial": false
          },
          {
                    "id": "p70",
                    "role": "Denunciante",
                    "name": "Castro Eduardo Emanuel",
                    "dni": "37,005,049",
                    "asistencia": true,
                    "presencial": false
          },
          {
                    "id": "p71",
                    "role": "Denunciante",
                    "name": "Castro Gonzalo Emiliano",
                    "dni": "46803836",
                    "asistencia": true,
                    "presencial": false
          },
          {
                    "id": "p72",
                    "role": "Denunciante",
                    "name": "Castro Maria Isabel",
                    "dni": "37641199",
                    "asistencia": true,
                    "presencial": false
          },
          {
                    "id": "p73",
                    "role": "Denunciante",
                    "name": "Castro Romina Yanel",
                    "dni": "43,764,337",
                    "asistencia": true,
                    "presencial": false
          },
          {
                    "id": "p74",
                    "role": "Denunciante",
                    "name": "Castro Sanchez Aldana",
                    "dni": "46,932,087",
                    "asistencia": true,
                    "presencial": false
          },
          {
                    "id": "p75",
                    "role": "Denunciante",
                    "name": "Castro Solange Jazmin",
                    "dni": "36033771",
                    "asistencia": true,
                    "presencial": false
          },
          {
                    "id": "p76",
                    "role": "Denunciante",
                    "name": "Castro Thomas Brandon",
                    "dni": "44,761,449",
                    "asistencia": true,
                    "presencial": false
          },
          {
                    "id": "p77",
                    "role": "Denunciante",
                    "name": "Cepeda Cristian Exequiel",
                    "dni": "38076411",
                    "asistencia": true,
                    "presencial": false
          },
          {
                    "id": "p78",
                    "role": "Denunciante",
                    "name": "Cesped Guadalupe Ailen",
                    "dni": "39533715",
                    "asistencia": true,
                    "presencial": false
          },
          {
                    "id": "p79",
                    "role": "Denunciante",
                    "name": "Cesped Guadalupe Ailen",
                    "dni": "44915899",
                    "asistencia": true,
                    "presencial": false
          },
          {
                    "id": "p80",
                    "role": "Denunciante",
                    "name": "Chacon Romina Soledad",
                    "dni": "35,510,580",
                    "asistencia": true,
                    "presencial": false
          },
          {
                    "id": "p81",
                    "role": "Denunciante",
                    "name": "Chirino Elizondo Camila De Los Angeles",
                    "dni": "43,157,683",
                    "asistencia": true,
                    "presencial": false
          },
          {
                    "id": "p82",
                    "role": "Denunciante",
                    "name": "Contrera Mauricio Alfredo",
                    "dni": "36377347",
                    "asistencia": true,
                    "presencial": false
          },
          {
                    "id": "p83",
                    "role": "Denunciante",
                    "name": "Contrera Peralta Maria Angel Emils",
                    "dni": "38590738",
                    "asistencia": true,
                    "presencial": false
          },
          {
                    "id": "p84",
                    "role": "Denunciante",
                    "name": "Cordoba Ramiro Nahuel",
                    "dni": "47046333",
                    "asistencia": true,
                    "presencial": false
          },
          {
                    "id": "p85",
                    "role": "Denunciante",
                    "name": "Correa Carlos Gustavo",
                    "dni": "22997871",
                    "asistencia": true,
                    "presencial": false
          },
          {
                    "id": "p86",
                    "role": "Denunciante",
                    "name": "Cortez Marisol Abril",
                    "dni": "47239828",
                    "asistencia": true,
                    "presencial": false
          },
          {
                    "id": "p87",
                    "role": "Denunciante",
                    "name": "Cortez Sonia Marisel",
                    "dni": "31871536",
                    "asistencia": true,
                    "presencial": false
          },
          {
                    "id": "p88",
                    "role": "Denunciante",
                    "name": "Cortinez Brenda Ayelen",
                    "dni": "41468468",
                    "asistencia": true,
                    "presencial": false
          },
          {
                    "id": "p89",
                    "role": "Denunciante",
                    "name": "Cortinez Corbalan Santigao Nicolas",
                    "dni": "42453289",
                    "asistencia": true,
                    "presencial": false
          },
          {
                    "id": "p90",
                    "role": "Denunciante",
                    "name": "Corzo Perez Rocio Del Valle",
                    "dni": "41157132",
                    "asistencia": true,
                    "presencial": false
          },
          {
                    "id": "p91",
                    "role": "Denunciante",
                    "name": "Costa Maria Florencia",
                    "dni": "41468728",
                    "asistencia": true,
                    "presencial": false
          },
          {
                    "id": "p92",
                    "role": "Denunciante",
                    "name": "Cuevas Morales Franco German",
                    "dni": "36250896",
                    "asistencia": true,
                    "presencial": false
          },
          {
                    "id": "p93",
                    "role": "Denunciante",
                    "name": "De La Colina Moron Brenda Ayelen",
                    "dni": "43,340,328",
                    "asistencia": true,
                    "presencial": false
          },
          {
                    "id": "p94",
                    "role": "Denunciante",
                    "name": "De La Fuenta Gonzalez Safira Micaela",
                    "dni": "40,264,459",
                    "asistencia": true,
                    "presencial": false
          },
          {
                    "id": "p95",
                    "role": "Denunciante",
                    "name": "Decimo Daniel Osvaldo",
                    "dni": "25,590,249",
                    "asistencia": true,
                    "presencial": false
          },
          {
                    "id": "p96",
                    "role": "Denunciante",
                    "name": "Dias Juan Marcelo",
                    "dni": "26204446",
                    "asistencia": true,
                    "presencial": false
          },
          {
                    "id": "p97",
                    "role": "Denunciante",
                    "name": "Diaz Agustin",
                    "dni": "45378100",
                    "asistencia": true,
                    "presencial": false
          },
          {
                    "id": "p98",
                    "role": "Denunciante",
                    "name": "Diaz Eduardo Daniel",
                    "dni": "24660321",
                    "asistencia": true,
                    "presencial": false
          },
          {
                    "id": "p99",
                    "role": "Denunciante",
                    "name": "Diaz Franco Ceferino",
                    "dni": "25573099",
                    "asistencia": true,
                    "presencial": false
          },
          {
                    "id": "p100",
                    "role": "Denunciante",
                    "name": "Díaz Johana Beatriz",
                    "dni": "34,698,648",
                    "asistencia": true,
                    "presencial": false
          },
          {
                    "id": "p101",
                    "role": "Denunciante",
                    "name": "Diaz Leonel Ivan",
                    "dni": "43,058,629",
                    "asistencia": true,
                    "presencial": false
          },
          {
                    "id": "p102",
                    "role": "Denunciante",
                    "name": "Díaz Poblete Oriana Ailen Milagros",
                    "dni": "45,635,256",
                    "asistencia": true,
                    "presencial": false
          },
          {
                    "id": "p103",
                    "role": "Denunciante",
                    "name": "Diaz Uñac Thiago",
                    "dni": "48,271,569",
                    "asistencia": true,
                    "presencial": false
          },
          {
                    "id": "p104",
                    "role": "Denunciante",
                    "name": "Dominguez Algañarez Nelida Del Valle",
                    "dni": "24362857",
                    "asistencia": true,
                    "presencial": false
          },
          {
                    "id": "p105",
                    "role": "Denunciante",
                    "name": "Echenique Francisco Antonio",
                    "dni": "35510569",
                    "asistencia": true,
                    "presencial": false
          },
          {
                    "id": "p106",
                    "role": "Denunciante",
                    "name": "Elisondo Angel Agustin",
                    "dni": "42990366",
                    "asistencia": true,
                    "presencial": false
          },
          {
                    "id": "p107",
                    "role": "Denunciante",
                    "name": "Elizondo Cortez Fatima Macarena",
                    "dni": "37924039",
                    "asistencia": true,
                    "presencial": false
          },
          {
                    "id": "p108",
                    "role": "Denunciante",
                    "name": "Ermelinda Rosario Romero",
                    "dni": "32125944",
                    "asistencia": true,
                    "presencial": false
          },
          {
                    "id": "p109",
                    "role": "Denunciante",
                    "name": "Escudero Alexis Ariel",
                    "dni": "35849651",
                    "asistencia": true,
                    "presencial": false
          },
          {
                    "id": "p110",
                    "role": "Denunciante",
                    "name": "Escudero Analía Del Valle",
                    "dni": "25995082",
                    "asistencia": true,
                    "presencial": false
          },
          {
                    "id": "p111",
                    "role": "Denunciante",
                    "name": "Escudero Navea Emiliano Mario",
                    "dni": "34697756",
                    "asistencia": true,
                    "presencial": false
          },
          {
                    "id": "p112",
                    "role": "Denunciante",
                    "name": "Espejo Jose Guillermo",
                    "dni": "31633344",
                    "asistencia": true,
                    "presencial": false
          },
          {
                    "id": "p113",
                    "role": "Denunciante",
                    "name": "Espósito Alejandro Tomas",
                    "dni": "45,472,293",
                    "asistencia": true,
                    "presencial": false
          },
          {
                    "id": "p114",
                    "role": "Denunciante",
                    "name": "Esquivel Nelida Matilde",
                    "dni": "26,135,532",
                    "asistencia": true,
                    "presencial": false
          },
          {
                    "id": "p115",
                    "role": "Denunciante",
                    "name": "Estevez Alejandra Lorena",
                    "dni": "23922178",
                    "asistencia": true,
                    "presencial": false
          },
          {
                    "id": "p116",
                    "role": "Denunciante",
                    "name": "Facundo Esequiel Sarmiento",
                    "dni": "44248733",
                    "asistencia": true,
                    "presencial": false
          },
          {
                    "id": "p117",
                    "role": "Denunciante",
                    "name": "Farias Millan Dario Alexander",
                    "dni": "44062002",
                    "asistencia": true,
                    "presencial": false
          },
          {
                    "id": "p118",
                    "role": "Denunciante",
                    "name": "Felipuche Jose Anibal",
                    "dni": "41809485",
                    "asistencia": true,
                    "presencial": false
          },
          {
                    "id": "p119",
                    "role": "Denunciante",
                    "name": "Fernandez Monica Silvana",
                    "dni": "35185010",
                    "asistencia": true,
                    "presencial": false
          },
          {
                    "id": "p120",
                    "role": "Denunciante",
                    "name": "Fernandez Quiroga Michel Joaquin",
                    "dni": "47286012",
                    "asistencia": true,
                    "presencial": false
          },
          {
                    "id": "p121",
                    "role": "Denunciante",
                    "name": "Ferrer Luciana Abigail",
                    "dni": "40,265,664",
                    "asistencia": true,
                    "presencial": false
          },
          {
                    "id": "p122",
                    "role": "Denunciante",
                    "name": "Ferreyra Luciana",
                    "dni": "33,183,861",
                    "asistencia": true,
                    "presencial": false
          },
          {
                    "id": "p123",
                    "role": "Denunciante",
                    "name": "Flores Castro Nahuel Omar",
                    "dni": "33,236,643",
                    "asistencia": true,
                    "presencial": false
          },
          {
                    "id": "p124",
                    "role": "Denunciante",
                    "name": "Flores Enzo Gabriel",
                    "dni": "35848245",
                    "asistencia": true,
                    "presencial": false
          },
          {
                    "id": "p125",
                    "role": "Denunciante",
                    "name": "Flores Pedro Daniel",
                    "dni": "26,740,553",
                    "asistencia": true,
                    "presencial": false
          },
          {
                    "id": "p126",
                    "role": "Denunciante",
                    "name": "Font Laciar Maria De Los Angeles",
                    "dni": "38,460,023",
                    "asistencia": true,
                    "presencial": false
          },
          {
                    "id": "p127",
                    "role": "Denunciante",
                    "name": "Frias Rey Agustina Micaela",
                    "dni": "43221233",
                    "asistencia": true,
                    "presencial": false
          },
          {
                    "id": "p128",
                    "role": "Denunciante",
                    "name": "Fuentes Kevin Alexis",
                    "dni": "41,958,388",
                    "asistencia": true,
                    "presencial": false
          },
          {
                    "id": "p129",
                    "role": "Denunciante",
                    "name": "Gaitan Agustina",
                    "dni": "37999458",
                    "asistencia": true,
                    "presencial": false
          },
          {
                    "id": "p130",
                    "role": "Denunciante",
                    "name": "Garcia Maria Laura",
                    "dni": "28,218,863",
                    "asistencia": true,
                    "presencial": false
          },
          {
                    "id": "p131",
                    "role": "Denunciante",
                    "name": "Garcia Maza Celeste Ariadna",
                    "dni": "44,127,445",
                    "asistencia": true,
                    "presencial": false
          },
          {
                    "id": "p132",
                    "role": "Denunciante",
                    "name": "Garcia Norma",
                    "dni": "21,666,940",
                    "asistencia": true,
                    "presencial": false
          },
          {
                    "id": "p133",
                    "role": "Denunciante",
                    "name": "Gil Daniela Fernanda",
                    "dni": "27043531",
                    "asistencia": true,
                    "presencial": false
          },
          {
                    "id": "p134",
                    "role": "Denunciante",
                    "name": "Gil Salinas Lourdes Leonela",
                    "dni": "43689383",
                    "asistencia": true,
                    "presencial": false
          },
          {
                    "id": "p135",
                    "role": "Denunciante",
                    "name": "Gimenez Maturano Juan Cruz",
                    "dni": "39,524,274",
                    "asistencia": true,
                    "presencial": false
          },
          {
                    "id": "p136",
                    "role": "Denunciante",
                    "name": "Gomes Iris Mariana De Los Angeles",
                    "dni": "43177573",
                    "asistencia": true,
                    "presencial": false
          },
          {
                    "id": "p137",
                    "role": "Denunciante",
                    "name": "Gomez Alfonso Jesus",
                    "dni": "38,592,384",
                    "asistencia": true,
                    "presencial": false
          },
          {
                    "id": "p138",
                    "role": "Denunciante",
                    "name": "Gomez Gabriela Del Valle",
                    "dni": "31005559",
                    "asistencia": true,
                    "presencial": false
          },
          {
                    "id": "p139",
                    "role": "Denunciante",
                    "name": "Gómez Mercado Johana Claribel",
                    "dni": "44,061,125",
                    "asistencia": true,
                    "presencial": false
          },
          {
                    "id": "p140",
                    "role": "Denunciante",
                    "name": "Gonzalez Claudio German",
                    "dni": "35508023",
                    "asistencia": true,
                    "presencial": false
          },
          {
                    "id": "p141",
                    "role": "Denunciante",
                    "name": "Gonzalez Pedro Pablo",
                    "dni": "16995070",
                    "asistencia": true,
                    "presencial": false
          },
          {
                    "id": "p142",
                    "role": "Denunciante",
                    "name": "Gonzalez Reyna Octavio",
                    "dni": "46619917",
                    "asistencia": true,
                    "presencial": false
          },
          {
                    "id": "p143",
                    "role": "Denunciante",
                    "name": "Gonzalez Rodriguez Cristian Sebastian",
                    "dni": "40591523",
                    "asistencia": true,
                    "presencial": false
          },
          {
                    "id": "p144",
                    "role": "Denunciante",
                    "name": "Gonzalo Ezeqiel Muñoz Figueroa",
                    "dni": "45636547",
                    "asistencia": true,
                    "presencial": false
          },
          {
                    "id": "p145",
                    "role": "Denunciante",
                    "name": "Gordillo Julieta Micaela",
                    "dni": "46726533",
                    "asistencia": true,
                    "presencial": false
          },
          {
                    "id": "p146",
                    "role": "Denunciante",
                    "name": "Guallama Angela Milagros",
                    "dni": "41830896",
                    "asistencia": true,
                    "presencial": false
          },
          {
                    "id": "p147",
                    "role": "Denunciante",
                    "name": "Guerra Mabel",
                    "dni": "44665751",
                    "asistencia": true,
                    "presencial": false
          },
          {
                    "id": "p148",
                    "role": "Denunciante",
                    "name": "Guerra Sosa Lucas Ismael",
                    "dni": "38,076,403",
                    "asistencia": true,
                    "presencial": false
          },
          {
                    "id": "p149",
                    "role": "Denunciante",
                    "name": "Guerrero Sergio Javier",
                    "dni": "26590926",
                    "asistencia": true,
                    "presencial": false
          },
          {
                    "id": "p150",
                    "role": "Denunciante",
                    "name": "Gustavo Roman Flores Colarte",
                    "dni": "47046125",
                    "asistencia": true,
                    "presencial": false
          },
          {
                    "id": "p151",
                    "role": "Denunciante",
                    "name": "Gutierrez Gabriel Alejandro",
                    "dni": "38464097",
                    "asistencia": true,
                    "presencial": false
          },
          {
                    "id": "p152",
                    "role": "Denunciante",
                    "name": "Guzman Brizuela Gonzo Isaac",
                    "dni": "39,008,252",
                    "asistencia": true,
                    "presencial": false
          },
          {
                    "id": "p153",
                    "role": "Denunciante",
                    "name": "Guzman Campillay Celina Del Rosario",
                    "dni": "45545899",
                    "asistencia": true,
                    "presencial": false
          },
          {
                    "id": "p154",
                    "role": "Denunciante",
                    "name": "Guzman Claudia Evelina",
                    "dni": "32938130",
                    "asistencia": true,
                    "presencial": false
          },
          {
                    "id": "p155",
                    "role": "Denunciante",
                    "name": "Herrera Rodolfo Fernando",
                    "dni": "35857645",
                    "asistencia": true,
                    "presencial": false
          },
          {
                    "id": "p156",
                    "role": "Denunciante",
                    "name": "Hidalgo Virginia Deolinda",
                    "dni": "36033280",
                    "asistencia": true,
                    "presencial": false
          },
          {
                    "id": "p157",
                    "role": "Denunciante",
                    "name": "Ibaceta Luis Ernesto",
                    "dni": "21610565",
                    "asistencia": true,
                    "presencial": false
          },
          {
                    "id": "p158",
                    "role": "Denunciante",
                    "name": "Iñon Marina Jimena",
                    "dni": "44,844,246",
                    "asistencia": true,
                    "presencial": false
          },
          {
                    "id": "p159",
                    "role": "Denunciante",
                    "name": "Jofre Nievas Laura Carina",
                    "dni": "24,826,280",
                    "asistencia": true,
                    "presencial": false
          },
          {
                    "id": "p160",
                    "role": "Denunciante",
                    "name": "Jofre Rolando Mario",
                    "dni": "32782404",
                    "asistencia": true,
                    "presencial": false
          },
          {
                    "id": "p161",
                    "role": "Denunciante",
                    "name": "Juarez Ezequiel Matias",
                    "dni": "42005731",
                    "asistencia": true,
                    "presencial": false
          },
          {
                    "id": "p162",
                    "role": "Denunciante",
                    "name": "Lautaro Alexis Arguello Huerta",
                    "dni": "48,415,753",
                    "asistencia": true,
                    "presencial": false
          },
          {
                    "id": "p163",
                    "role": "Denunciante",
                    "name": "Leyes Martin Esteban",
                    "dni": "41,814,115",
                    "asistencia": true,
                    "presencial": false
          },
          {
                    "id": "p164",
                    "role": "Denunciante",
                    "name": "Leyes Sanchez Tadeo Francisco",
                    "dni": "45213027",
                    "asistencia": true,
                    "presencial": false
          },
          {
                    "id": "p165",
                    "role": "Denunciante",
                    "name": "Lizzi Gonzalez Angela Ayelen",
                    "dni": "40711758",
                    "asistencia": true,
                    "presencial": false
          },
          {
                    "id": "p166",
                    "role": "Denunciante",
                    "name": "Lopez Agüero Sabrina Marianela",
                    "dni": "40469421",
                    "asistencia": true,
                    "presencial": false
          },
          {
                    "id": "p167",
                    "role": "Denunciante",
                    "name": "Lopez Solares Alejandra Lorena",
                    "dni": "32,653,052",
                    "asistencia": true,
                    "presencial": false
          },
          {
                    "id": "p168",
                    "role": "Denunciante",
                    "name": "Lopez Vargas Tobias Benjamin",
                    "dni": "46,932,362",
                    "asistencia": true,
                    "presencial": false
          },
          {
                    "id": "p169",
                    "role": "Denunciante",
                    "name": "Lucero Avila Benjaminn",
                    "dni": "47,815,667",
                    "asistencia": true,
                    "presencial": false
          },
          {
                    "id": "p170",
                    "role": "Denunciante",
                    "name": "Lucero Bravo Maria Lourdes",
                    "dni": "41909503",
                    "asistencia": true,
                    "presencial": false
          },
          {
                    "id": "p171",
                    "role": "Denunciante",
                    "name": "Lujan Braian",
                    "dni": "39652383",
                    "asistencia": true,
                    "presencial": false
          },
          {
                    "id": "p172",
                    "role": "Denunciante",
                    "name": "Maldonado Gabriel Emanuel",
                    "dni": "44,761,370",
                    "asistencia": true,
                    "presencial": false
          },
          {
                    "id": "p173",
                    "role": "Denunciante",
                    "name": "Maldonado Lepez Jonathan Agustin",
                    "dni": "44,317,621",
                    "asistencia": true,
                    "presencial": false
          },
          {
                    "id": "p174",
                    "role": "Denunciante",
                    "name": "Mallea Garrido Alexis Daniel",
                    "dni": "39651308",
                    "asistencia": true,
                    "presencial": false
          },
          {
                    "id": "p175",
                    "role": "Denunciante",
                    "name": "Manrique Juan Antonio",
                    "dni": "22,998,352",
                    "asistencia": true,
                    "presencial": false
          },
          {
                    "id": "p176",
                    "role": "Denunciante",
                    "name": "Marcela Garcia",
                    "dni": "32034213",
                    "asistencia": true,
                    "presencial": false
          },
          {
                    "id": "p177",
                    "role": "Denunciante",
                    "name": "Martinez Echegaray Tatiana Nair",
                    "dni": "",
                    "asistencia": true,
                    "presencial": false
          },
          {
                    "id": "p178",
                    "role": "Denunciante",
                    "name": "Martinez Nancy Lorena",
                    "dni": "24,038,938",
                    "asistencia": true,
                    "presencial": false
          },
          {
                    "id": "p179",
                    "role": "Denunciante",
                    "name": "Martinez Ramon Cesar",
                    "dni": "11868046",
                    "asistencia": true,
                    "presencial": false
          },
          {
                    "id": "p180",
                    "role": "Denunciante",
                    "name": "Maturano Andino Carla Gergina",
                    "dni": "41321869",
                    "asistencia": true,
                    "presencial": false
          },
          {
                    "id": "p181",
                    "role": "Denunciante",
                    "name": "Medrano Espinosa Gabriela",
                    "dni": "95,166,075",
                    "asistencia": true,
                    "presencial": false
          },
          {
                    "id": "p182",
                    "role": "Denunciante",
                    "name": "Melian Mario Bernardo",
                    "dni": "22,754,177",
                    "asistencia": true,
                    "presencial": false
          },
          {
                    "id": "p183",
                    "role": "Denunciante",
                    "name": "Melisa Johana Vicentela",
                    "dni": "36,031,565",
                    "asistencia": true,
                    "presencial": false
          },
          {
                    "id": "p184",
                    "role": "Denunciante",
                    "name": "Mercado Balmaceda Mariano Pablo",
                    "dni": "44,761,249",
                    "asistencia": true,
                    "presencial": false
          },
          {
                    "id": "p185",
                    "role": "Denunciante",
                    "name": "Mercado Maria Elena",
                    "dni": "39,007,940",
                    "asistencia": true,
                    "presencial": false
          },
          {
                    "id": "p186",
                    "role": "Denunciante",
                    "name": "Mercado Moran Katherine Johanna",
                    "dni": "42163234",
                    "asistencia": true,
                    "presencial": false
          },
          {
                    "id": "p187",
                    "role": "Denunciante",
                    "name": "Mercado Ontiveros Ignacio Nicolas",
                    "dni": "47,047,348",
                    "asistencia": true,
                    "presencial": false
          },
          {
                    "id": "p188",
                    "role": "Denunciante",
                    "name": "Mercado Ulises",
                    "dni": "44,730,213",
                    "asistencia": true,
                    "presencial": false
          },
          {
                    "id": "p189",
                    "role": "Denunciante",
                    "name": "Mereles Chacon Silvia Edith",
                    "dni": "38463156",
                    "asistencia": true,
                    "presencial": false
          },
          {
                    "id": "p190",
                    "role": "Denunciante",
                    "name": "Molina Cristian Nahuel",
                    "dni": "44,634,162",
                    "asistencia": true,
                    "presencial": false
          },
          {
                    "id": "p191",
                    "role": "Denunciante",
                    "name": "Molina Echeverría Axel Lautaro",
                    "dni": "46,804,625",
                    "asistencia": true,
                    "presencial": false
          },
          {
                    "id": "p192",
                    "role": "Denunciante",
                    "name": "Molina Kevin Emanuel",
                    "dni": "42207036",
                    "asistencia": true,
                    "presencial": false
          },
          {
                    "id": "p193",
                    "role": "Denunciante",
                    "name": "Molina Leonela Elizabeth",
                    "dni": "32,718,862",
                    "asistencia": true,
                    "presencial": false
          },
          {
                    "id": "p194",
                    "role": "Denunciante",
                    "name": "Moncunill Veronica Liliana",
                    "dni": "25,195,225",
                    "asistencia": true,
                    "presencial": false
          },
          {
                    "id": "p195",
                    "role": "Denunciante",
                    "name": "Monfort Iglesias Nahuel Antonio",
                    "dni": "38,217,625",
                    "asistencia": true,
                    "presencial": false
          },
          {
                    "id": "p196",
                    "role": "Denunciante",
                    "name": "Monica Elizabeth Oropel",
                    "dni": "34,916,182",
                    "asistencia": true,
                    "presencial": false
          },
          {
                    "id": "p197",
                    "role": "Denunciante",
                    "name": "Montaña Fabiana Lorena",
                    "dni": "30635035",
                    "asistencia": true,
                    "presencial": false
          },
          {
                    "id": "p198",
                    "role": "Denunciante",
                    "name": "Montaña Marcela Edith",
                    "dni": "21,362,117",
                    "asistencia": true,
                    "presencial": false
          },
          {
                    "id": "p199",
                    "role": "Denunciante",
                    "name": "Montaña Marcela Fabiana",
                    "dni": "31454857",
                    "asistencia": true,
                    "presencial": false
          },
          {
                    "id": "p200",
                    "role": "Denunciante",
                    "name": "Montaña Ricardo Alfredo",
                    "dni": "23,922,239",
                    "asistencia": true,
                    "presencial": false
          },
          {
                    "id": "p201",
                    "role": "Denunciante",
                    "name": "Montaña Vázquez Cristian David",
                    "dni": "33,185,639",
                    "asistencia": true,
                    "presencial": false
          },
          {
                    "id": "p202",
                    "role": "Denunciante",
                    "name": "Montaño Alvarez Naira Daiana",
                    "dni": "39,955,300",
                    "asistencia": true,
                    "presencial": false
          },
          {
                    "id": "p203",
                    "role": "Denunciante",
                    "name": "Montivero Jorge Gabriel",
                    "dni": "41,054,974",
                    "asistencia": true,
                    "presencial": false
          },
          {
                    "id": "p204",
                    "role": "Denunciante",
                    "name": "Montivero Romina Lorenza",
                    "dni": "34182332",
                    "asistencia": true,
                    "presencial": false
          },
          {
                    "id": "p205",
                    "role": "Denunciante",
                    "name": "Morales Caren Ailen",
                    "dni": "45,264,463",
                    "asistencia": true,
                    "presencial": false
          },
          {
                    "id": "p206",
                    "role": "Denunciante",
                    "name": "Morales Gustavo Anibal",
                    "dni": "33,429,616",
                    "asistencia": true,
                    "presencial": false
          },
          {
                    "id": "p207",
                    "role": "Denunciante",
                    "name": "Morales Rivero Ariel Agustin",
                    "dni": "39184047",
                    "asistencia": true,
                    "presencial": false
          },
          {
                    "id": "p208",
                    "role": "Denunciante",
                    "name": "Moran Estela Carolina",
                    "dni": "37833281",
                    "asistencia": true,
                    "presencial": false
          },
          {
                    "id": "p209",
                    "role": "Denunciante",
                    "name": "Moran Pelayes Lorena Del Valle",
                    "dni": "22995982",
                    "asistencia": true,
                    "presencial": false
          },
          {
                    "id": "p210",
                    "role": "Denunciante",
                    "name": "Moreno Quiroga Tomas Ezequiel",
                    "dni": "41,909,870",
                    "asistencia": true,
                    "presencial": false
          },
          {
                    "id": "p211",
                    "role": "Denunciante",
                    "name": "Moreno Yoselie Micaela",
                    "dni": "44018529",
                    "asistencia": true,
                    "presencial": false
          },
          {
                    "id": "p212",
                    "role": "Denunciante",
                    "name": "Moscheni Oscar Samuel",
                    "dni": "40593178",
                    "asistencia": true,
                    "presencial": false
          },
          {
                    "id": "p213",
                    "role": "Denunciante",
                    "name": "Muñoz Emiliano Ariel",
                    "dni": "25,995,949",
                    "asistencia": true,
                    "presencial": false
          },
          {
                    "id": "p214",
                    "role": "Denunciante",
                    "name": "Muñoz Karen Ayelen",
                    "dni": "38,076,784",
                    "asistencia": true,
                    "presencial": false
          },
          {
                    "id": "p215",
                    "role": "Denunciante",
                    "name": "Muñoz Laila Celina",
                    "dni": "42249773",
                    "asistencia": true,
                    "presencial": false
          },
          {
                    "id": "p216",
                    "role": "Denunciante",
                    "name": "Muñoz Lucia Denis",
                    "dni": "42,235,223",
                    "asistencia": true,
                    "presencial": false
          },
          {
                    "id": "p217",
                    "role": "Denunciante",
                    "name": "Mura Vega Marianela Fabiana",
                    "dni": "38216641",
                    "asistencia": true,
                    "presencial": false
          },
          {
                    "id": "p218",
                    "role": "Denunciante",
                    "name": "Naranjo Ignacio Angel",
                    "dni": "41,682,864",
                    "asistencia": true,
                    "presencial": false
          },
          {
                    "id": "p219",
                    "role": "Denunciante",
                    "name": "Naranjo Lucio Andres",
                    "dni": "25938006",
                    "asistencia": true,
                    "presencial": false
          },
          {
                    "id": "p220",
                    "role": "Denunciante",
                    "name": "Naranjo Sarmiendo Valentina Mailen",
                    "dni": "44675146",
                    "asistencia": true,
                    "presencial": false
          },
          {
                    "id": "p221",
                    "role": "Denunciante",
                    "name": "Narvaez Perez Jose Jesus",
                    "dni": "42249797",
                    "asistencia": true,
                    "presencial": false
          },
          {
                    "id": "p222",
                    "role": "Denunciante",
                    "name": "Natalia Paola Perez",
                    "dni": "29174757",
                    "asistencia": true,
                    "presencial": false
          },
          {
                    "id": "p223",
                    "role": "Denunciante",
                    "name": "Navarrete Braian Martin",
                    "dni": "39,424,197",
                    "asistencia": true,
                    "presencial": false
          },
          {
                    "id": "p224",
                    "role": "Denunciante",
                    "name": "Navarro Guevara Facundo Esteban",
                    "dni": "47,815,725",
                    "asistencia": true,
                    "presencial": false
          },
          {
                    "id": "p225",
                    "role": "Denunciante",
                    "name": "Neira Ramiro Martin",
                    "dni": "47633979",
                    "asistencia": true,
                    "presencial": false
          },
          {
                    "id": "p226",
                    "role": "Denunciante",
                    "name": "Nievas Murua Daniel",
                    "dni": "46,616,775",
                    "asistencia": true,
                    "presencial": false
          },
          {
                    "id": "p227",
                    "role": "Denunciante",
                    "name": "Nuñez Micaela Anabel",
                    "dni": "38459883",
                    "asistencia": true,
                    "presencial": false
          },
          {
                    "id": "p228",
                    "role": "Denunciante",
                    "name": "Olguin Sanchez Kevin Daniel",
                    "dni": "40,593,395",
                    "asistencia": true,
                    "presencial": false
          },
          {
                    "id": "p229",
                    "role": "Denunciante",
                    "name": "Oliva Flores Daiana Janet",
                    "dni": "39650838",
                    "asistencia": true,
                    "presencial": false
          },
          {
                    "id": "p230",
                    "role": "Denunciante",
                    "name": "Olivera Duran Eugenia Alejandra",
                    "dni": "43489793",
                    "asistencia": true,
                    "presencial": false
          },
          {
                    "id": "p231",
                    "role": "Denunciante",
                    "name": "Olmos Ausmendiz Cecilia Araceli",
                    "dni": "26709776",
                    "asistencia": true,
                    "presencial": false
          },
          {
                    "id": "p232",
                    "role": "Denunciante",
                    "name": "Olmos Kevin Emanuel",
                    "dni": "40,591,599",
                    "asistencia": true,
                    "presencial": false
          },
          {
                    "id": "p233",
                    "role": "Denunciante",
                    "name": "Ordoñe Naranjo Silvana Jaquelina",
                    "dni": "32374686",
                    "asistencia": true,
                    "presencial": false
          },
          {
                    "id": "p234",
                    "role": "Denunciante",
                    "name": "Orellano Guadalupe Agustina",
                    "dni": "42,163,976",
                    "asistencia": true,
                    "presencial": false
          },
          {
                    "id": "p235",
                    "role": "Denunciante",
                    "name": "Oro Susana Beatriz",
                    "dni": "22,063,404",
                    "asistencia": true,
                    "presencial": false
          },
          {
                    "id": "p236",
                    "role": "Denunciante",
                    "name": "Ortiz Daniel Alejandro",
                    "dni": "41,659,844",
                    "asistencia": true,
                    "presencial": false
          },
          {
                    "id": "p237",
                    "role": "Denunciante",
                    "name": "Ortiz Sergio Esteban",
                    "dni": "21935817",
                    "asistencia": true,
                    "presencial": false
          },
          {
                    "id": "p238",
                    "role": "Denunciante",
                    "name": "Ossan Maria Ines",
                    "dni": "30,095,421",
                    "asistencia": true,
                    "presencial": false
          },
          {
                    "id": "p239",
                    "role": "Denunciante",
                    "name": "Otiñano Buselo Juan Cruz",
                    "dni": "39954884",
                    "asistencia": true,
                    "presencial": false
          },
          {
                    "id": "p240",
                    "role": "Denunciante",
                    "name": "Paez Raissa Guadalupe",
                    "dni": "39,652,029",
                    "asistencia": true,
                    "presencial": false
          },
          {
                    "id": "p241",
                    "role": "Denunciante",
                    "name": "Paez Zeballos Tomas Ezequiel",
                    "dni": "43952360",
                    "asistencia": true,
                    "presencial": false
          },
          {
                    "id": "p242",
                    "role": "Denunciante",
                    "name": "Palacio Carrizo Luciana Valentina",
                    "dni": "47,197,149",
                    "asistencia": true,
                    "presencial": false
          },
          {
                    "id": "p243",
                    "role": "Denunciante",
                    "name": "Palacio Sofia",
                    "dni": "43555397",
                    "asistencia": true,
                    "presencial": false
          },
          {
                    "id": "p244",
                    "role": "Denunciante",
                    "name": "Pasten Andrada Mauricio Jabier",
                    "dni": "36,250,189",
                    "asistencia": true,
                    "presencial": false
          },
          {
                    "id": "p245",
                    "role": "Denunciante",
                    "name": "Paz Carolina Anabela",
                    "dni": "44,527,164",
                    "asistencia": true,
                    "presencial": false
          },
          {
                    "id": "p246",
                    "role": "Denunciante",
                    "name": "Pereyra Ludmila Ayelen",
                    "dni": "43,078,340",
                    "asistencia": true,
                    "presencial": false
          },
          {
                    "id": "p247",
                    "role": "Denunciante",
                    "name": "Perez Aballay Marcelo Nahuel",
                    "dni": "47,360,658",
                    "asistencia": true,
                    "presencial": false
          },
          {
                    "id": "p248",
                    "role": "Denunciante",
                    "name": "Perez Gabriel Alejandro",
                    "dni": "32168208",
                    "asistencia": true,
                    "presencial": false
          },
          {
                    "id": "p249",
                    "role": "Denunciante",
                    "name": "Petrizani Braian Ignacio",
                    "dni": "46407206",
                    "asistencia": true,
                    "presencial": false
          },
          {
                    "id": "p250",
                    "role": "Denunciante",
                    "name": "Poblete Jorge Luis",
                    "dni": "39182531",
                    "asistencia": true,
                    "presencial": false
          },
          {
                    "id": "p251",
                    "role": "Denunciante",
                    "name": "Ponce Gustavo Daniel",
                    "dni": "46,983,793",
                    "asistencia": true,
                    "presencial": false
          },
          {
                    "id": "p252",
                    "role": "Denunciante",
                    "name": "Quevedo Gonzalez Maria Jose",
                    "dni": "43422971",
                    "asistencia": true,
                    "presencial": false
          },
          {
                    "id": "p253",
                    "role": "Denunciante",
                    "name": "Quintana Carla Julieta",
                    "dni": "39,652,774",
                    "asistencia": true,
                    "presencial": false
          },
          {
                    "id": "p254",
                    "role": "Denunciante",
                    "name": "Quintero De La Fuente Mariela Beatriz",
                    "dni": "24244539",
                    "asistencia": true,
                    "presencial": false
          },
          {
                    "id": "p255",
                    "role": "Denunciante",
                    "name": "Quiroga Dante Miguel",
                    "dni": "23982742",
                    "asistencia": true,
                    "presencial": false
          },
          {
                    "id": "p256",
                    "role": "Denunciante",
                    "name": "Quiroz Jara Diego Exequiel",
                    "dni": "40,711,649",
                    "asistencia": true,
                    "presencial": false
          },
          {
                    "id": "p257",
                    "role": "Denunciante",
                    "name": "Ramirez Marianela Soledad",
                    "dni": "38,075,385",
                    "asistencia": true,
                    "presencial": false
          },
          {
                    "id": "p258",
                    "role": "Denunciante",
                    "name": "Ramos Rolando Bernardino",
                    "dni": "22,959,976",
                    "asistencia": true,
                    "presencial": false
          },
          {
                    "id": "p259",
                    "role": "Denunciante",
                    "name": "Rapaport Bazan Karen Valentina",
                    "dni": "44316076",
                    "asistencia": true,
                    "presencial": false
          },
          {
                    "id": "p260",
                    "role": "Denunciante",
                    "name": "Regalado Angalda Amriano Gabriel",
                    "dni": "43838024",
                    "asistencia": true,
                    "presencial": false
          },
          {
                    "id": "p261",
                    "role": "Denunciante",
                    "name": "Reinoso Avila Milagros",
                    "dni": "43,488,850",
                    "asistencia": true,
                    "presencial": false
          },
          {
                    "id": "p262",
                    "role": "Denunciante",
                    "name": "Reta Videla Franco Eduardo",
                    "dni": "41054320",
                    "asistencia": true,
                    "presencial": false
          },
          {
                    "id": "p263",
                    "role": "Denunciante",
                    "name": "Reta Videla Gonzalo Santiago",
                    "dni": "43,488,946",
                    "asistencia": true,
                    "presencial": false
          },
          {
                    "id": "p264",
                    "role": "Denunciante",
                    "name": "Ricardo Adolfo Cabrera",
                    "dni": "39955693",
                    "asistencia": true,
                    "presencial": false
          },
          {
                    "id": "p265",
                    "role": "Denunciante",
                    "name": "Ricorte Juan Marcelo",
                    "dni": "23922193",
                    "asistencia": true,
                    "presencial": false
          },
          {
                    "id": "p266",
                    "role": "Denunciante",
                    "name": "Riofrio Paez Satiago Javier",
                    "dni": "42,852,791",
                    "asistencia": true,
                    "presencial": false
          },
          {
                    "id": "p267",
                    "role": "Denunciante",
                    "name": "Rios Ayelen Gabriela",
                    "dni": "41721426",
                    "asistencia": true,
                    "presencial": false
          },
          {
                    "id": "p268",
                    "role": "Denunciante",
                    "name": "Rios José Antonio",
                    "dni": "20,530,515",
                    "asistencia": true,
                    "presencial": false
          },
          {
                    "id": "p269",
                    "role": "Denunciante",
                    "name": "Rivera Dayana Jesus",
                    "dni": "39792803",
                    "asistencia": true,
                    "presencial": false
          },
          {
                    "id": "p270",
                    "role": "Denunciante",
                    "name": "Riveros Osvaldo Diego",
                    "dni": "28238181",
                    "asistencia": true,
                    "presencial": false
          },
          {
                    "id": "p271",
                    "role": "Denunciante",
                    "name": "Roca Rivero Braian Manuel",
                    "dni": "39792245",
                    "asistencia": true,
                    "presencial": false
          },
          {
                    "id": "p272",
                    "role": "Denunciante",
                    "name": "Roca Rolando Esquiel",
                    "dni": "38,076,833",
                    "asistencia": true,
                    "presencial": false
          },
          {
                    "id": "p273",
                    "role": "Denunciante",
                    "name": "Rodriguez Brizuela Esteban Abel",
                    "dni": "46180277",
                    "asistencia": true,
                    "presencial": false
          },
          {
                    "id": "p274",
                    "role": "Denunciante",
                    "name": "Rodriguez Ezequiel Agustin",
                    "dni": "41,598,237",
                    "asistencia": true,
                    "presencial": false
          },
          {
                    "id": "p275",
                    "role": "Denunciante",
                    "name": "Rodriguez Gustavo Rolando",
                    "dni": "24660269",
                    "asistencia": true,
                    "presencial": false
          },
          {
                    "id": "p276",
                    "role": "Denunciante",
                    "name": "Rodriguez Icazati Enrique Nahuel",
                    "dni": "43952532",
                    "asistencia": true,
                    "presencial": false
          },
          {
                    "id": "p277",
                    "role": "Denunciante",
                    "name": "Rodriguez Icazati Matias",
                    "dni": "39994437",
                    "asistencia": true,
                    "presencial": false
          },
          {
                    "id": "p278",
                    "role": "Denunciante",
                    "name": "Rodriguez Olivera Alex",
                    "dni": "45,378,302",
                    "asistencia": true,
                    "presencial": false
          },
          {
                    "id": "p279",
                    "role": "Denunciante",
                    "name": "Rodriguez Pocchi Osmar",
                    "dni": "95371024",
                    "asistencia": true,
                    "presencial": false
          },
          {
                    "id": "p280",
                    "role": "Denunciante",
                    "name": "Rodriguez Ramon Marcelo",
                    "dni": "21182009",
                    "asistencia": true,
                    "presencial": false
          },
          {
                    "id": "p281",
                    "role": "Denunciante",
                    "name": "Rojas Carrizo Santiago Ezequiel",
                    "dni": "47,488,518",
                    "asistencia": true,
                    "presencial": false
          },
          {
                    "id": "p282",
                    "role": "Denunciante",
                    "name": "Rojas Perez Jorge Luis",
                    "dni": "44126925",
                    "asistencia": true,
                    "presencial": false
          },
          {
                    "id": "p283",
                    "role": "Denunciante",
                    "name": "Rojo Aldana",
                    "dni": "20056132",
                    "asistencia": true,
                    "presencial": false
          },
          {
                    "id": "p284",
                    "role": "Denunciante",
                    "name": "Rojo Gustavo Nicolas",
                    "dni": "40995580",
                    "asistencia": true,
                    "presencial": false
          },
          {
                    "id": "p285",
                    "role": "Denunciante",
                    "name": "Roman Kevin Gabriel",
                    "dni": "42516688",
                    "asistencia": true,
                    "presencial": false
          },
          {
                    "id": "p286",
                    "role": "Denunciante",
                    "name": "Romero Herrera Ramiro David",
                    "dni": "44,991,805",
                    "asistencia": true,
                    "presencial": false
          },
          {
                    "id": "p287",
                    "role": "Denunciante",
                    "name": "Romero Salinas Nahuel Eduardo",
                    "dni": "44431735",
                    "asistencia": true,
                    "presencial": false
          },
          {
                    "id": "p288",
                    "role": "Denunciante",
                    "name": "Rosa Del Carmen Aguirre",
                    "dni": "12,371,188",
                    "asistencia": true,
                    "presencial": false
          },
          {
                    "id": "p289",
                    "role": "Denunciante",
                    "name": "Rosa Lucia Cortez",
                    "dni": "39995589",
                    "asistencia": true,
                    "presencial": false
          },
          {
                    "id": "p290",
                    "role": "Denunciante",
                    "name": "Rueda Joel Guillermo",
                    "dni": "40,176,191",
                    "asistencia": true,
                    "presencial": false
          },
          {
                    "id": "p291",
                    "role": "Denunciante",
                    "name": "Ruiz Jonathan Rolando",
                    "dni": "34459427",
                    "asistencia": true,
                    "presencial": false
          },
          {
                    "id": "p292",
                    "role": "Denunciante",
                    "name": "Sabas Herrera Carlos Ismael",
                    "dni": "39652113",
                    "asistencia": true,
                    "presencial": false
          },
          {
                    "id": "p293",
                    "role": "Denunciante",
                    "name": "Saire Fernanda Ludmila",
                    "dni": "42852625",
                    "asistencia": true,
                    "presencial": false
          },
          {
                    "id": "p294",
                    "role": "Denunciante",
                    "name": "Salcedo Victor Manuel",
                    "dni": "35,848,373",
                    "asistencia": true,
                    "presencial": false
          },
          {
                    "id": "p295",
                    "role": "Denunciante",
                    "name": "Salina Cesar Daniel",
                    "dni": "22998674",
                    "asistencia": true,
                    "presencial": false
          },
          {
                    "id": "p296",
                    "role": "Denunciante",
                    "name": "Salinas Pedro Alberto",
                    "dni": "12394232",
                    "asistencia": true,
                    "presencial": false
          },
          {
                    "id": "p297",
                    "role": "Denunciante",
                    "name": "Salvat Facundo Thomas",
                    "dni": "48307062",
                    "asistencia": true,
                    "presencial": false
          },
          {
                    "id": "p298",
                    "role": "Denunciante",
                    "name": "Salvatierra Rodolfo Gustavo Del Valle",
                    "dni": "18207576",
                    "asistencia": true,
                    "presencial": false
          },
          {
                    "id": "p299",
                    "role": "Denunciante",
                    "name": "Sanchez Guevara Fernanda Georgina",
                    "dni": "42,356,011",
                    "asistencia": true,
                    "presencial": false
          },
          {
                    "id": "p300",
                    "role": "Denunciante",
                    "name": "Santos David Zarate Quiroga",
                    "dni": "28668691",
                    "asistencia": true,
                    "presencial": false
          },
          {
                    "id": "p301",
                    "role": "Denunciante",
                    "name": "Saruff Tolotto Agustin",
                    "dni": "44,844,445",
                    "asistencia": true,
                    "presencial": false
          },
          {
                    "id": "p302",
                    "role": "Denunciante",
                    "name": "Secotario Di Carlo David Leonel",
                    "dni": "43,763,997",
                    "asistencia": true,
                    "presencial": false
          },
          {
                    "id": "p303",
                    "role": "Denunciante",
                    "name": "Secotaro Angel Gabriel",
                    "dni": "38336457",
                    "asistencia": true,
                    "presencial": false
          },
          {
                    "id": "p304",
                    "role": "Denunciante",
                    "name": "Siderol Jorge Fabian",
                    "dni": "20,942,978",
                    "asistencia": true,
                    "presencial": false
          },
          {
                    "id": "p305",
                    "role": "Denunciante",
                    "name": "Silva Francisco Nicolas",
                    "dni": "46,331,022",
                    "asistencia": true,
                    "presencial": false
          },
          {
                    "id": "p306",
                    "role": "Denunciante",
                    "name": "Sosa Rosa Del Carmen",
                    "dni": "18202833",
                    "asistencia": true,
                    "presencial": false
          },
          {
                    "id": "p307",
                    "role": "Denunciante",
                    "name": "Suarez Alejandro Sebastian",
                    "dni": "39792249",
                    "asistencia": true,
                    "presencial": false
          },
          {
                    "id": "p308",
                    "role": "Denunciante",
                    "name": "Suarez Fatima Micaela",
                    "dni": "35875515",
                    "asistencia": true,
                    "presencial": false
          },
          {
                    "id": "p309",
                    "role": "Denunciante",
                    "name": "Tello Garay Alejandra Daniela",
                    "dni": "36253778",
                    "asistencia": true,
                    "presencial": false
          },
          {
                    "id": "p310",
                    "role": "Denunciante",
                    "name": "Tello Ibazeta Hugo Ezequiel",
                    "dni": "37,925,287",
                    "asistencia": true,
                    "presencial": false
          },
          {
                    "id": "p311",
                    "role": "Denunciante",
                    "name": "Tello Melisa Grisel",
                    "dni": "29709840",
                    "asistencia": true,
                    "presencial": false
          },
          {
                    "id": "p312",
                    "role": "Denunciante",
                    "name": "Tello Ramona Noemi",
                    "dni": "16,516,297",
                    "asistencia": true,
                    "presencial": false
          },
          {
                    "id": "p313",
                    "role": "Denunciante",
                    "name": "Tello Rodrigo Alejandro",
                    "dni": "43,838,876",
                    "asistencia": true,
                    "presencial": false
          },
          {
                    "id": "p314",
                    "role": "Denunciante",
                    "name": "Terrera Hernan Leandro",
                    "dni": "35202659",
                    "asistencia": true,
                    "presencial": false
          },
          {
                    "id": "p315",
                    "role": "Denunciante",
                    "name": "Tobar Alejandra Verónica",
                    "dni": "25,550,906",
                    "asistencia": true,
                    "presencial": false
          },
          {
                    "id": "p316",
                    "role": "Denunciante",
                    "name": "Toledo Diego Agustin",
                    "dni": "46,259,380",
                    "asistencia": true,
                    "presencial": false
          },
          {
                    "id": "p317",
                    "role": "Denunciante",
                    "name": "Tovares Pablo Andres",
                    "dni": "44,915,265",
                    "asistencia": true,
                    "presencial": false
          },
          {
                    "id": "p318",
                    "role": "Denunciante",
                    "name": "Trigo Cintia Daniela",
                    "dni": "32,007,563",
                    "asistencia": true,
                    "presencial": false
          },
          {
                    "id": "p319",
                    "role": "Denunciante",
                    "name": "Uliarte Mariana Ines",
                    "dni": "22875783",
                    "asistencia": true,
                    "presencial": false
          },
          {
                    "id": "p320",
                    "role": "Denunciante",
                    "name": "Urbano Gabriela Fabiola",
                    "dni": "32510508",
                    "asistencia": true,
                    "presencial": false
          },
          {
                    "id": "p321",
                    "role": "Denunciante",
                    "name": "Urbano Natalia Deolinda",
                    "dni": "24,259,918",
                    "asistencia": true,
                    "presencial": false
          },
          {
                    "id": "p322",
                    "role": "Denunciante",
                    "name": "Urbieta Ramos Bautista Valentino",
                    "dni": "47625875",
                    "asistencia": true,
                    "presencial": false
          },
          {
                    "id": "p323",
                    "role": "Denunciante",
                    "name": "Urqueta Miranda Sergio Franco",
                    "dni": "42,163,264",
                    "asistencia": true,
                    "presencial": false
          },
          {
                    "id": "p324",
                    "role": "Denunciante",
                    "name": "Valenzuela Santiago",
                    "dni": "42,287,503",
                    "asistencia": true,
                    "presencial": false
          },
          {
                    "id": "p325",
                    "role": "Denunciante",
                    "name": "Valverdi Rosana Del Valle",
                    "dni": "24526778",
                    "asistencia": true,
                    "presencial": false
          },
          {
                    "id": "p326",
                    "role": "Denunciante",
                    "name": "Vargas Algañaraz Wanda Lujan",
                    "dni": "48148428",
                    "asistencia": true,
                    "presencial": false
          },
          {
                    "id": "p327",
                    "role": "Denunciante",
                    "name": "Vega Dominguez Maria Jose",
                    "dni": "37742378",
                    "asistencia": true,
                    "presencial": false
          },
          {
                    "id": "p328",
                    "role": "Denunciante",
                    "name": "Vega Rodrigo Fabio",
                    "dni": "42,853,201",
                    "asistencia": true,
                    "presencial": false
          },
          {
                    "id": "p329",
                    "role": "Denunciante",
                    "name": "Vega Zalazar Horacio Alberto",
                    "dni": "22,663,842",
                    "asistencia": true,
                    "presencial": false
          },
          {
                    "id": "p330",
                    "role": "Denunciante",
                    "name": "Velazquez Gomez Melani Agustina",
                    "dni": "44316194",
                    "asistencia": true,
                    "presencial": false
          },
          {
                    "id": "p331",
                    "role": "Denunciante",
                    "name": "Vera Camargo Lucas Adrian",
                    "dni": "43763411",
                    "asistencia": true,
                    "presencial": false
          },
          {
                    "id": "p332",
                    "role": "Denunciante",
                    "name": "Vera Cortez Santiago Joel",
                    "dni": "47,361,810",
                    "asistencia": true,
                    "presencial": false
          },
          {
                    "id": "p333",
                    "role": "Denunciante",
                    "name": "Vera Diaz Lautaro Daniel",
                    "dni": "43078754",
                    "asistencia": true,
                    "presencial": false
          },
          {
                    "id": "p334",
                    "role": "Denunciante",
                    "name": "Vera Mercado Jesica Anabela",
                    "dni": "33321692",
                    "asistencia": true,
                    "presencial": false
          },
          {
                    "id": "p335",
                    "role": "Denunciante",
                    "name": "Vera Vargas Franco Jorge",
                    "dni": "44,915,414",
                    "asistencia": true,
                    "presencial": false
          },
          {
                    "id": "p336",
                    "role": "Denunciante",
                    "name": "Videla Cesar Emanuel",
                    "dni": "35181933",
                    "asistencia": true,
                    "presencial": false
          },
          {
                    "id": "p337",
                    "role": "Denunciante",
                    "name": "Von Clavel Alexis Nicolas",
                    "dni": "43157572",
                    "asistencia": true,
                    "presencial": false
          },
          {
                    "id": "p338",
                    "role": "Denunciante",
                    "name": "Yoel Ernesto Tello Ibazeta",
                    "dni": "42853453",
                    "asistencia": true,
                    "presencial": false
          },
          {
                    "id": "p339",
                    "role": "Denunciante",
                    "name": "Zalazar Mancuso Marcelo Leandro",
                    "dni": "39651139",
                    "asistencia": true,
                    "presencial": false
          },
          {
                    "id": "p340",
                    "role": "Denunciante",
                    "name": "Zanetti Guirado Lautaro Josue",
                    "dni": "46,933,063",
                    "asistencia": true,
                    "presencial": false
          },
          {
                    "id": "p341",
                    "role": "Denunciante",
                    "name": "Zuleta Laura Solange",
                    "dni": "29889085",
                    "asistencia": true,
                    "presencial": false
          },
          {
                    "id": "p342",
                    "role": "Denunciante",
                    "name": "Gamboa Nancy Fabiana",
                    "dni": "35735790",
                    "asistencia": true,
                    "presencial": false
          },
          {
                    "id": "p343",
                    "role": "Denunciante",
                    "name": "Perez Rodriguez Maximiliano Alfredo",
                    "dni": "47,815,379",
                    "asistencia": true,
                    "presencial": false
          },
          {
                    "id": "p344",
                    "role": "Denunciante",
                    "name": "Vera Muñoz Elias Santino",
                    "dni": "48,596,905",
                    "asistencia": true,
                    "presencial": false
          },
          {
                    "id": "p345",
                    "role": "Denunciante",
                    "name": "Videla Nicolas Facundo",
                    "dni": "43,556,255",
                    "asistencia": true,
                    "presencial": false
          },
          {
                    "id": "p346",
                    "role": "Denunciante",
                    "name": "Bravo Rodriguez Carlos Emanuel",
                    "dni": "34916982",
                    "asistencia": true,
                    "presencial": false
          },
          {
                    "id": "p347",
                    "role": "Denunciante",
                    "name": "Naveda Leonardo Raul",
                    "dni": "21608783",
                    "asistencia": true,
                    "presencial": false
          },
          {
                    "id": "p348",
                    "role": "Denunciante",
                    "name": "Barahona Adrian Cristian",
                    "dni": "46933395",
                    "asistencia": true,
                    "presencial": false
          },
          {
                    "id": "p349",
                    "role": "Denunciante",
                    "name": "Castro Gabriel David",
                    "dni": "38593622",
                    "asistencia": true,
                    "presencial": false
          },
          {
                    "id": "p350",
                    "role": "Denunciante",
                    "name": "Arancibia Jimena Soledad",
                    "dni": "41,830,386",
                    "asistencia": true,
                    "presencial": false
          },
          {
                    "id": "p351",
                    "role": "Denunciante",
                    "name": "Barrionuevo Caterina Aldana",
                    "dni": "44,634,964",
                    "asistencia": true,
                    "presencial": false
          },
          {
                    "id": "p352",
                    "role": "Denunciante",
                    "name": "Flores Moran Gonzalo Jesus",
                    "dni": "43,642,270",
                    "asistencia": true,
                    "presencial": false
          },
          {
                    "id": "p353",
                    "role": "Denunciante",
                    "name": "Gonzalez Guillermo Javier",
                    "dni": "28,668,585",
                    "asistencia": true,
                    "presencial": false
          },
          {
                    "id": "p354",
                    "role": "Denunciante",
                    "name": "Vera Videla Ariadna Yamila",
                    "dni": "47,124,358",
                    "asistencia": true,
                    "presencial": false
          },
          {
                    "id": "p355",
                    "role": "Denunciante",
                    "name": "Molina Pablo Dante",
                    "dni": "27268900",
                    "asistencia": true,
                    "presencial": false
          },
          {
                    "id": "q1",
                    "role": "Querella",
                    "name": "Dr. Fernando Sánchez Quiroga",
                    "dni": "",
                    "asistencia": true,
                    "presencial": true,
                    "representa": [
                              {
                                        "id": "p6",
                                        "nombre": "Aguero Cuello Enzo Agustin"
                              },
                              {
                                        "id": "p8",
                                        "nombre": "Aguilera Tejada Antonio"
                              },
                              {
                                        "id": "p10",
                                        "nombre": "Aguirre Eduardo Daniel"
                              },
                              {
                                        "id": "p21",
                                        "nombre": "Amato Yesica Mabel"
                              },
                              {
                                        "id": "p26",
                                        "nombre": "Ariza Aravena Yamile Noemi"
                              },
                              {
                                        "id": "p30",
                                        "nombre": "Axel Valentin Sosa Pellaitay"
                              },
                              {
                                        "id": "p34",
                                        "nombre": "Balmaceda Calderon Gabriel Fernando"
                              },
                              {
                                        "id": "p36",
                                        "nombre": "Balmaceda Nicolas Ignacio"
                              },
                              {
                                        "id": "p48",
                                        "nombre": "Bravo Oscar Adrian"
                              },
                              {
                                        "id": "p51",
                                        "nombre": "Bustos Paez Rosalva Elizabth"
                              },
                              {
                                        "id": "p60",
                                        "nombre": "Carpio Lian Amin"
                              },
                              {
                                        "id": "p68",
                                        "nombre": "Castañeda Anabel"
                              },
                              {
                                        "id": "p74",
                                        "nombre": "Castro Sanchez Aldana"
                              },
                              {
                                        "id": "p75",
                                        "nombre": "Castro Solange Jazmin"
                              },
                              {
                                        "id": "p77",
                                        "nombre": "Cepeda Cristian Exequiel"
                              },
                              {
                                        "id": "p97",
                                        "nombre": "Diaz Agustin"
                              },
                              {
                                        "id": "p99",
                                        "nombre": "Diaz Franco Ceferino"
                              },
                              {
                                        "id": "p100",
                                        "nombre": "Díaz Johana Beatriz"
                              },
                              {
                                        "id": "p116",
                                        "nombre": "Facundo Esequiel Sarmiento"
                              },
                              {
                                        "id": "p120",
                                        "nombre": "Fernandez Quiroga Michel Joaquin"
                              },
                              {
                                        "id": "p124",
                                        "nombre": "Flores Enzo Gabriel"
                              },
                              {
                                        "id": "p126",
                                        "nombre": "Font Laciar Maria De Los Angeles"
                              },
                              {
                                        "id": "p157",
                                        "nombre": "Ibaceta Luis Ernesto"
                              },
                              {
                                        "id": "p163",
                                        "nombre": "Leyes Martin Esteban"
                              },
                              {
                                        "id": "p166",
                                        "nombre": "Lopez Agüero Sabrina Marianela"
                              },
                              {
                                        "id": "p170",
                                        "nombre": "Lucero Bravo Maria Lourdes"
                              },
                              {
                                        "id": "p174",
                                        "nombre": "Mallea Garrido Alexis Daniel"
                              },
                              {
                                        "id": "p187",
                                        "nombre": "Mercado Ontiveros Ignacio Nicolas"
                              },
                              {
                                        "id": "p211",
                                        "nombre": "Moreno Yoselie Micaela"
                              },
                              {
                                        "id": "p217",
                                        "nombre": "Mura Vega Marianela Fabiana"
                              },
                              {
                                        "id": "p218",
                                        "nombre": "Naranjo Ignacio Angel"
                              },
                              {
                                        "id": "p264",
                                        "nombre": "Ricardo Adolfo Cabrera"
                              },
                              {
                                        "id": "p270",
                                        "nombre": "Riveros Osvaldo Diego"
                              },
                              {
                                        "id": "p278",
                                        "nombre": "Rodriguez Olivera Alex"
                              },
                              {
                                        "id": "p281",
                                        "nombre": "Rojas Carrizo Santiago Ezequiel"
                              },
                              {
                                        "id": "p288",
                                        "nombre": "Rosa Del Carmen Aguirre"
                              },
                              {
                                        "id": "p297",
                                        "nombre": "Salvat Facundo Thomas"
                              },
                              {
                                        "id": "p305",
                                        "nombre": "Silva Francisco Nicolas"
                              },
                              {
                                        "id": "p307",
                                        "nombre": "Suarez Alejandro Sebastian"
                              },
                              {
                                        "id": "p317",
                                        "nombre": "Tovares Pablo Andres"
                              },
                              {
                                        "id": "p321",
                                        "nombre": "Urbano Natalia Deolinda"
                              },
                              {
                                        "id": "p330",
                                        "nombre": "Velazquez Gomez Melani Agustina"
                              },
                              {
                                        "id": "p331",
                                        "nombre": "Vera Camargo Lucas Adrian"
                              },
                              {
                                        "id": "p340",
                                        "nombre": "Zanetti Guirado Lautaro Josue"
                              },
                              {
                                        "id": "p346",
                                        "nombre": "Bravo Rodriguez Carlos Emanuel"
                              }
                    ]
          },
          {
                    "id": "q2",
                    "role": "Querella",
                    "name": "Dr. Diego Germán López",
                    "dni": "",
                    "asistencia": true,
                    "presencial": true,
                    "representa": [
                              {
                                        "id": "p6",
                                        "nombre": "Aguero Cuello Enzo Agustin"
                              },
                              {
                                        "id": "p8",
                                        "nombre": "Aguilera Tejada Antonio"
                              },
                              {
                                        "id": "p10",
                                        "nombre": "Aguirre Eduardo Daniel"
                              },
                              {
                                        "id": "p21",
                                        "nombre": "Amato Yesica Mabel"
                              },
                              {
                                        "id": "p26",
                                        "nombre": "Ariza Aravena Yamile Noemi"
                              },
                              {
                                        "id": "p30",
                                        "nombre": "Axel Valentin Sosa Pellaitay"
                              },
                              {
                                        "id": "p34",
                                        "nombre": "Balmaceda Calderon Gabriel Fernando"
                              },
                              {
                                        "id": "p36",
                                        "nombre": "Balmaceda Nicolas Ignacio"
                              },
                              {
                                        "id": "p48",
                                        "nombre": "Bravo Oscar Adrian"
                              },
                              {
                                        "id": "p51",
                                        "nombre": "Bustos Paez Rosalva Elizabth"
                              },
                              {
                                        "id": "p60",
                                        "nombre": "Carpio Lian Amin"
                              },
                              {
                                        "id": "p68",
                                        "nombre": "Castañeda Anabel"
                              },
                              {
                                        "id": "p74",
                                        "nombre": "Castro Sanchez Aldana"
                              },
                              {
                                        "id": "p75",
                                        "nombre": "Castro Solange Jazmin"
                              },
                              {
                                        "id": "p77",
                                        "nombre": "Cepeda Cristian Exequiel"
                              },
                              {
                                        "id": "p97",
                                        "nombre": "Diaz Agustin"
                              },
                              {
                                        "id": "p99",
                                        "nombre": "Diaz Franco Ceferino"
                              },
                              {
                                        "id": "p100",
                                        "nombre": "Díaz Johana Beatriz"
                              },
                              {
                                        "id": "p116",
                                        "nombre": "Facundo Esequiel Sarmiento"
                              },
                              {
                                        "id": "p120",
                                        "nombre": "Fernandez Quiroga Michel Joaquin"
                              },
                              {
                                        "id": "p124",
                                        "nombre": "Flores Enzo Gabriel"
                              },
                              {
                                        "id": "p126",
                                        "nombre": "Font Laciar Maria De Los Angeles"
                              },
                              {
                                        "id": "p157",
                                        "nombre": "Ibaceta Luis Ernesto"
                              },
                              {
                                        "id": "p163",
                                        "nombre": "Leyes Martin Esteban"
                              },
                              {
                                        "id": "p166",
                                        "nombre": "Lopez Agüero Sabrina Marianela"
                              },
                              {
                                        "id": "p170",
                                        "nombre": "Lucero Bravo Maria Lourdes"
                              },
                              {
                                        "id": "p174",
                                        "nombre": "Mallea Garrido Alexis Daniel"
                              },
                              {
                                        "id": "p187",
                                        "nombre": "Mercado Ontiveros Ignacio Nicolas"
                              },
                              {
                                        "id": "p211",
                                        "nombre": "Moreno Yoselie Micaela"
                              },
                              {
                                        "id": "p217",
                                        "nombre": "Mura Vega Marianela Fabiana"
                              },
                              {
                                        "id": "p218",
                                        "nombre": "Naranjo Ignacio Angel"
                              },
                              {
                                        "id": "p264",
                                        "nombre": "Ricardo Adolfo Cabrera"
                              },
                              {
                                        "id": "p270",
                                        "nombre": "Riveros Osvaldo Diego"
                              },
                              {
                                        "id": "p278",
                                        "nombre": "Rodriguez Olivera Alex"
                              },
                              {
                                        "id": "p281",
                                        "nombre": "Rojas Carrizo Santiago Ezequiel"
                              },
                              {
                                        "id": "p288",
                                        "nombre": "Rosa Del Carmen Aguirre"
                              },
                              {
                                        "id": "p297",
                                        "nombre": "Salvat Facundo Thomas"
                              },
                              {
                                        "id": "p305",
                                        "nombre": "Silva Francisco Nicolas"
                              },
                              {
                                        "id": "p307",
                                        "nombre": "Suarez Alejandro Sebastian"
                              },
                              {
                                        "id": "p317",
                                        "nombre": "Tovares Pablo Andres"
                              },
                              {
                                        "id": "p321",
                                        "nombre": "Urbano Natalia Deolinda"
                              },
                              {
                                        "id": "p330",
                                        "nombre": "Velazquez Gomez Melani Agustina"
                              },
                              {
                                        "id": "p331",
                                        "nombre": "Vera Camargo Lucas Adrian"
                              },
                              {
                                        "id": "p340",
                                        "nombre": "Zanetti Guirado Lautaro Josue"
                              },
                              {
                                        "id": "p346",
                                        "nombre": "Bravo Rodriguez Carlos Emanuel"
                              }
                    ]
          },
          {
                    "id": "q3",
                    "role": "Querella",
                    "name": "Dra. Alejandra Iragorre",
                    "dni": "",
                    "asistencia": true,
                    "presencial": true,
                    "representa": [
                              {
                                        "id": "p79",
                                        "nombre": "Cesped Guadalupe Ailen"
                              },
                              {
                                        "id": "p268",
                                        "nombre": "Rios José Antonio"
                              },
                              {
                                        "id": "p342",
                                        "nombre": "Gamboa Nancy Fabiana"
                              }
                    ]
          },
          {
                    "id": "q4",
                    "role": "Querella",
                    "name": "Dr. Hipólito Fernández",
                    "dni": "",
                    "asistencia": true,
                    "presencial": true,
                    "representa": [
                              {
                                        "id": "p7",
                                        "nombre": "Aguilera Nahuel Natanael"
                              }
                    ]
          },
          {
                    "id": "q5",
                    "role": "Querella",
                    "name": "Dr. Eduardo Sait",
                    "dni": "",
                    "asistencia": true,
                    "presencial": true,
                    "representa": [
                              {
                                        "id": "p202",
                                        "nombre": "Montaño Alvarez Naira Daiana"
                              }
                    ]
          },
          {
                    "id": "q6",
                    "role": "Querella",
                    "name": "Dra. Fabiana Salinas",
                    "dni": "",
                    "asistencia": true,
                    "presencial": true,
                    "representa": [
                              {
                                        "id": "p193",
                                        "nombre": "Molina Leonela Elizabeth"
                              },
                              {
                                        "id": "p234",
                                        "nombre": "Orellano Guadalupe Agustina"
                              }
                    ]
          },
          {
                    "id": "q7",
                    "role": "Querella",
                    "name": "Dr. Julio César Castro",
                    "dni": "",
                    "asistencia": true,
                    "presencial": true,
                    "representa": [
                              {
                                        "id": "p282",
                                        "nombre": "Rojas Perez Jorge Luis"
                              }
                    ]
          },
          {
                    "id": "q8",
                    "role": "Querella",
                    "name": "Dra. Maria Filomena Noriega",
                    "dni": "",
                    "asistencia": true,
                    "presencial": true,
                    "representa": [
                              {
                                        "id": "p35",
                                        "nombre": "Balmaceda Gisella Daiana"
                              }
                    ]
          },
          {
                    "id": "q9",
                    "role": "Querella",
                    "name": "Dr. Mario Padilla",
                    "dni": "",
                    "asistencia": true,
                    "presencial": true,
                    "representa": [
                              {
                                        "id": "p61",
                                        "nombre": "Carrera Baigorria Oscar David"
                              },
                              {
                                        "id": "p72",
                                        "nombre": "Castro Maria Isabel"
                              },
                              {
                                        "id": "p173",
                                        "nombre": "Maldonado Lepez Jonathan Agustin"
                              },
                              {
                                        "id": "p242",
                                        "nombre": "Palacio Carrizo Luciana Valentina"
                              },
                              {
                                        "id": "p253",
                                        "nombre": "Quintana Carla Julieta"
                              }
                    ]
          },
          {
                    "id": "q10",
                    "role": "Querella",
                    "name": "Dr. Andrés Martín Videla",
                    "dni": "",
                    "asistencia": true,
                    "presencial": true,
                    "representa": [
                              {
                                        "id": "p112",
                                        "nombre": "Espejo Jose Guillermo"
                              }
                    ]
          }
]
        };

        try {
            // El usuario quiere guardar múltiples campos hardcodeados.
            // Iteramos sobre las keys del objeto hardcodedData y usamos updateData.
            // En este sistema, updateData (que usa updateDocumentAndObjectField)
            // actualiza típicamente la doc en "audiencias" y el objeto en "audienciasView".
            const keys = Object.keys(hardcodedData);
            for (let field of keys) {
                await updateData(date, selectedAudience, field, hardcodedData[field]);
            }
            
            // Actualizamos la vista local si es necesario
            await updateByDate(date);
            await updateByDateView(date);
            
            setMessage('Datos guardados/sobreescritos exitosamente.');
        } catch (error) {
            console.error(error);
            setMessage(`Error al guardar: ${error.message}`);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className={styles.sectionContainer}>
            <h2 className={styles.title}>Parcheo/Sobreescritura de Datos de Audiencia</h2>
            <div className={styles.inputGroup}>
                <label className={styles.label}>Fecha (DDMMYYYY): </label>
                <input 
                    type="text" 
                    value={date} 
                    onChange={e => setDate(e.target.value)} 
                    placeholder="Ej. 19122025"
                    className={styles.input}
                    maxLength={8}
                />
            </div>
            
            <div className={styles.inputGroup}>
                <label className={styles.label}>Seleccionar Audiencia (desde audienciasView):</label>
                <select 
                    value={selectedAudience} 
                    onChange={e => setSelectedAudience(e.target.value)}
                    className={styles.select}
                >
                    <option value="">-- Seleccione una Audiencia --</option>
                    {audiences && audiences.map((aud, idx) => (
                        <option key={aud.id || aud.aId || idx} value={aud.id || aud.aId}>
                            {aud.id || aud.aId} - {aud.caratula ? aud.caratula.slice(0,30) : 'Sin Carátula'}
                        </option>
                    ))}
                </select>
            </div>

            <button 
                onClick={handleSave} 
                disabled={loading || !selectedAudience}
                className={styles.button}
                style={{ marginTop: '15px' }}
            >
                {loading ? 'Guardando...' : 'Guardar/Sobreescribir Datos'}
            </button>
            <p style={{ marginTop: '10px', fontSize: '12px', color: 'gray' }}>
                Nota: El objeto a guardar está hardcodeado en el código (PatchAudienceData.jsx).
            </p>

            {message && <p style={{ marginTop: '15px', color: message.includes('Error') ? 'red' : 'green' }}>{message}</p>}
        </div>
    );
}
