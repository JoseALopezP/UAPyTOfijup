import React, { createContext, useState } from "react";
import getCollection from "@/firebase/firestore/getCollection";
import addData from "@/firebase/firestore/addData";
import removeFromArray from "@/firebase/firestore/removeFromArray";
import removeData from "@/firebase/firestore/removeData";
import getDocument from "@/firebase/firestore/getDocument";
import checkDoc from "@/firebase/firestore/checkDoc";
import addOrUpdateDocument from "@/firebase/firestore/addOrUpdateDocument";
import pushToHitos from "@/firebase/firestore/pushToHitos";
import updateListItem from "@/firebase/firestore/updateListItem";
import getList from "@/firebase/firestore/getList";
import addStringToList from "@/firebase/firestore/addStringToList";
import { todayFunction } from "@/utils/dateUtils";
import updateRealTimeFunction from "@/firebase/firestore/updateRealTimeFunction";
import updateDocumentListener from "@/firebase/firestore/updateDocumentListener";
import removeStringFromList from "@/firebase/firestore/removeStringFromList";
import getDocumentGeneral from "@/firebase/firestore/getDocumentGeneral";

export const DataContext = createContext({});

const { Provider } = DataContext;

export const DataContextProvider = ({ defaultValue = [], children }) => {
  const [today, setToday] = useState(defaultValue);
  const [dateToUse, setDateToUse] = useState("");
  const [desplegables, setDesplegables] = useState(defaultValue);
  const [modelosMinuta, setModelosMinuta] = useState(defaultValue);
  const [realTime, setRealTime] = useState(null);
  const [años, setAños] = useState(defaultValue);
  const [jueces, setJueces] = useState(defaultValue);
  const [bydate, setBydate] = useState(defaultValue);
  const [byLegajo, setByLegajo] = useState(defaultValue);
  const [informacion, setInformacion] = useState(defaultValue);
  const [userType, setUsertype] = useState("");
  const [sorteoList, setSorteoList] = useState([]);

  const updateRealTime = async () => {
    setRealTime(await updateRealTimeFunction());
  };

  const updateJueces = async () => {
    const data = await getDocument("audiencias", "jueces");
    setJueces(data || []);
  };

  const updateAños = async () => {
    const data = await getDocument("audiencias", "años");
    setAños(data || []);
  };

  const updateToday = async () => {
    const data = await getList("audiencias", todayFunction());
    setToday(data || []);
  };

  const updateByLegajo = async (leg) => {
    const documentData = await getDocument("legajos", leg);
    if (!documentData) {
      setByLegajo([0]);
    } else {
      setByLegajo(documentData);
    }
  };

  const updateByDate = async (date) => {
    const data = await getList("audiencias", date);
    setBydate(data || []);
  };


  const getByDate = async (date) => {
    return await getList("audiencias", date);
  };

  const updateByDateSorteo = async (date) => {
    const data = await getDocument("sorteos", date);
    setSorteoList(data || []);
  };

  const updateByDateListener = (date) => {
    const unsubscribe = updateDocumentListener("audiencias", date, (updatedData) => {
      setBydate(updatedData);
    });
    return unsubscribe;
  };

  const updateInformacion = async () => {
    const data = await getCollection("informacion");
    setInformacion(data || []);
  };

  const updateDesplegables = async () => {
    const docData = await getDocumentGeneral('desplegables', 'desplegables');
    if (docData) {
      setDesplegables(docData);
    } else {
      setDesplegables({});
    }
  };


  const updateModelosMinuta = async () => {
    const docData = await getDocumentGeneral("desplegables", "modelosMinuta");
    if (docData) {
      setModelosMinuta(docData);
    } else {
      setModelosMinuta({});
    }
  };

  const pushtToArray = async (date, searchValLeg, searchValHora, newValue) => {
    await pushToHitos("audiencias", date, searchValHora, searchValLeg, newValue);
    await pushToHitos("legajos", searchValLeg, date, searchValHora, newValue);
  };

  const updateData = async (date, searchValLeg, searchValHora, property, newValue) => {
    await updateListItem("audiencias", date, {
      hora: searchValHora,
      numeroLeg: searchValLeg,
      [property]: newValue,
    });
    await updateListItem("legajos", searchValLeg, {
      hora: searchValHora,
      fecha: date,
      [property]: newValue,
    });
  };

  const updateDataToday = async (searchValLeg, searchValHora, property, newValue) => {
    const todayId = new Date()
      .toLocaleDateString("es-AR", {
        day: "2-digit",
        month: "2-digit",
        year: "numeric",
      })
      .split("/")
      .join("");
    await updateListItem("audiencias", todayId, {
      hora: searchValHora,
      numeroLeg: searchValLeg,
      [property]: newValue,
    });
    await updateListItem("legajos", searchValLeg, {
      hora: searchValHora,
      fecha: todayId,
      [property]: newValue,
    });
  };

  const docExists = async (id) => {
    return checkDoc("audiencias", id);
  };

  const addAudiencia = async (data, date) => {
    await addOrUpdateDocument("audiencias", date, data);
    await addStringToList("legajos", data.numeroLeg, "list", { ...data, fecha: date });
  };

  const addSorteo = async (data, date) => {
    await addOrUpdateDocument("sorteos", date, data);
  };

  const addDesplegable = async (type, data) => {
    await addStringToList("desplegables", "desplegables", type, data);
  };

  const deleteDesplegable = async (type, data) => {
    await removeStringFromList("desplegables", "desplegables", type, data);
  };

  const deleteAudiencia = async (date, searchValLeg, searchValHora) => {
    const sanitizedHora = searchValHora.replace(/:/g, '');
    const docId = sanitizedHora + searchValLeg;
    await removeFromArray("audiencias", date, searchValHora, searchValLeg);
    await removeStringFromList("legajos", docId, "list", {
      hora: searchValHora,
      numeroLeg: searchValLeg,
      fecha: date,
    });
  };

  const addInfo = async (data) => {
    await addData("informacion", data);
  };

  const deleteInfo = async (id) => {
    await removeData("informacion", id);
  };

  const addUser = async (data) => {
    await addOrUpdateDocument("users", "listaUsuarios", data);
  };

  const checkUserType = async (userId) => {
    const userList = await getDocument("users", "listaUsuarios");
    const user = userList?.find((item) => item["userId"] === userId);
    setUsertype(user?.type || "");
  };

  const context = {
    updateToday,
    updateByDate,
    updateInformacion,
    docExists,
    addAudiencia,
    addSorteo,
    deleteAudiencia,
    addInfo,
    deleteInfo,
    updateJueces,
    updateAños,
    updateData,
    updateDataToday,
    pushtToArray,
    addUser,
    checkUserType,
    updateRealTime,
    updateDesplegables,
    updateModelosMinuta,
    addDesplegable,
    setDateToUse,
    updateByDateListener,
    deleteDesplegable,
    getByDate,
    updateByDateSorteo,
    updateByLegajo,
    modelosMinuta,
    dateToUse,
    desplegables,
    realTime,
    userType,
    años,
    today,
    bydate,
    byLegajo,
    informacion,
    jueces,
    sorteoList,
  };

  return <Provider value={context}>{children}</Provider>;
};
