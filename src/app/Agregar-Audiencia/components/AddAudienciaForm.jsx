"use client";
import { useState, useContext, useEffect } from "react";
import styles from "./AddAudiencia.module.css";
import { DataContext } from "@/context/DataContext";
import { SelectDate } from "@/app/components/SelectDate";

export function AddAudienciaForm({ dateFunction, date }) {
  const {
    updateByDate,
    updateDesplegables,
    addAudiencia,
    bydate,
    desplegables,
  } = useContext(DataContext);

  const [formData, setFormData] = useState({
    hora: "",
    hora2: "",
    horaProgramada: 45,
    sala: "-",
    legajo1: "MPF-SJ",
    legajo2: "",
    legajo3: "",
    tipo: "",
    tipo2: "",
    tipo3: "",
    colegiado: false,
    juez: "",
    juez2: "",
    juez3: "",
    situacion: "",
  });

  const [errors, setErrors] = useState({});
  const [errorMessage, setErrorMessage] = useState("");
  const [isSaving, setIsSaving] = useState(false);

  const validate = (data) => {
    const errs = {};

    if (!data.hora || !data.hora2) errs.hora = "Hora de inicio incompleta";
    if (!data.sala || data.sala === "") errs.sala = "Sala requerida";

    if (!data.legajo2 || data.legajo2.length > 5) {
      errs.legajo2 = "Legajo medio debe tener hasta 5 dígitos";
    }
    if (!data.legajo3 || data.legajo3.length > 4) {
      errs.legajo3 = "Año inválido (máx. 4 dígitos)";
    }

    if (!data.tipo || !desplegables.tipos.includes(data.tipo)) {
      errs.tipo = "Tipo de audiencia inválido o no seleccionado";
    }

    if (data.colegiado) {
      if (
        !desplegables.jueces?.includes(data.juez) ||
        !desplegables.jueces?.includes(data.juez2) ||
        !desplegables.jueces?.includes(data.juez3)
      ) {
        errs.juez = "Todos los jueces deben ser válidos";
      }
    } else {
      if (!desplegables.jueces?.includes(data.juez)) {
        errs.juez = "Juez inválido o no seleccionado";
      }
    }


    if (data.horaProgramada === "" || isNaN(data.horaProgramada)) {
      errs.horaProgramada = "Duración inválida";
    }
    const formattedHora = `${data.hora.padStart(2, "0")}:${data.hora2.padStart(
      2,
      "0"
    )}`;
    const formattedNumeroLeg = `${data.legajo1}-${data.legajo2.padStart(
      5,
      "0"
    )}-${data.legajo3}`;

    const isDuplicate = bydate.some(
      (el) => el.hora === formattedHora && el.numeroLeg === formattedNumeroLeg
    );
    if (isDuplicate) {
      errs.duplicado = "Ya existe una audiencia con ese número de legajo y hora";
    }

    return errs;
  };

  const updateField = (field, value) => {
    setFormData((prev) => {
      const newData = { ...prev, [field]: value };

      const newErrors = validate(newData);

      setErrors(newErrors);
      return newData;
    });
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    const errs = validate(formData);
    setErrors(errs);

    if (Object.keys(errs).length === 0) {
      setIsSaving(true);
      setErrorMessage("");

      const newAudiencia = {
        aId: `${formData.hora.replace(/:/g, "").padStart(2, "0")}${formData.hora2.replace(/:/g, "").padStart(2, "0")}${formData.legajo1}-${formData.legajo2.padStart(5,"0")}-${formData.legajo3}`,
        hora: `${formData.hora.padStart(2, "0")}:${formData.hora2.padStart(
          2,
          "0"
        )}`,
        horaProgramada: formData.horaProgramada,
        sala: formData.sala,
        numeroLeg: `${formData.legajo1}-${formData.legajo2.padStart(5,"0")}-${formData.legajo3}`,
        tipo: formData.tipo,
        tipo2: formData.tipo2 === "-" ? "" : formData.tipo2,
        tipo3:
          formData.tipo3 === "-" || formData.tipo2 === "" || formData.tipo2 === "-"
            ? ""
            : formData.tipo3,
        juez: formData.colegiado
          ? `${formData.juez}+${formData.juez2}+${formData.juez3}`
          : formData.juez,
        estado: "PROGRAMADA",
        situacion: formData.situacion || "",
      };

      try {
        await addAudiencia(newAudiencia, date);
        document.getElementById("addingForm").reset();
        await updateByDate(date);

        setFormData({
          hora: "",
          hora2: "",
          horaProgramada: 45,
          sala: "-",
          legajo1: "MPF-SJ",
          legajo2: "",
          legajo3: "",
          tipo: "",
          tipo2: "",
          tipo3: "",
          colegiado: false,
          juez: "",
          juez2: "",
          juez3: "",
          situacion: "",
        });
        setErrors({});
      } catch (error) {
        setErrorMessage("Error al guardar audiencia");
      } finally {
        setIsSaving(false);
      }
    } else {
      const msg = Object.values(errs).join(", ");
      setErrorMessage(`Errores: ${msg}`);
      setTimeout(() => setErrorMessage(""), 4000);
    }
  };
  useEffect(() => {
    updateDesplegables();
  }, []);
  const horaError = errors.hora;
  const salaError = errors.sala;
  const legajo2Error = errors.legajo2;
  const tipoError = errors.tipo;
  const juezError = errors.juez;
  const horaProgramadaError = errors.horaProgramada;

  const {
    hora,
    hora2,
    horaProgramada,
    sala,
    legajo1,
    legajo2,
    legajo3,
    tipo,
    tipo2,
    tipo3,
    colegiado,
    juez,
    juez2,
    juez3,
    situacion,
  } = formData;

  return (
    <>
      {errorMessage && (
        <div className={`${styles.errorMessage}`}>
          {errors.duplicado ? "AUDIENCIA DUPLICADA" : errorMessage}
        </div>
      )}

      <form
        id="addingForm"
        onSubmit={handleSubmit}
        className={`${styles.addAudienciaFormBlock}`}
      >
        <SelectDate dateFunction={dateFunction} date={date} />

        <div className={`${styles.inputProgramadaBlock}`}>
          <div className={`${styles.inputHoraProgramada}`}>
            <p className={`${styles.titleInput}`}>DURACIÓN</p>
            <input
              value={horaProgramada}
              onChange={(e) => updateField("horaProgramada", e.target.value)}
            />
            {horaProgramadaError && (
              <small className={styles.errorText}>{horaProgramadaError}</small>
            )}
          </div>

          <div
            className={
              horaError
                ? `${styles.inputHoraBlock} ${styles.inputError} ${styles.inputItemBlock}`
                : `${styles.inputHoraBlock} ${styles.inputItemBlock}`
            }
          >
            <p className={`${styles.titleInput}`}>HORA</p>
            <div className={`${styles.inputTimeBlock}`}>
              <input
                placeholder="00"
                min="0"
                max="24"
                value={hora}
                onChange={(e) => updateField("hora", e.target.value)}
              />
              <p className={`${styles.separatorDots}`}>:</p>
              <input
                placeholder="00"
                min="0"
                max="59"
                value={hora2}
                onChange={(e) => updateField("hora2", e.target.value)}
              />
            </div>
          </div>
        </div>

        <div
          className={
            salaError
              ? `${styles.inputSalaBlock} ${styles.inputItemBlock} ${styles.inputError}`
              : `${styles.inputSalaBlock} ${styles.inputItemBlock}`
          }
        >
          <p className={`${styles.titleInput}`}>SALA</p>
          <span className={`${styles.inputSalaSelectBlock}`}>
            <input
              list="sala2"
              value={sala}
              onChange={(e) => updateField("sala", e.target.value)}
            />
            <datalist id="sala2" className={`${styles.tableCellInput}`}>
              {desplegables.salas &&
                desplegables.salas.map((el) => (
                  <option key={el} value={el}>
                    {el}
                  </option>
                ))}
            </datalist>
          </span>
        </div>

        <div className={`${styles.inputLegajoBlock} ${styles.inputItemBlock}`}>
          <p className={`${styles.titleInput}`}>LEGAJO</p>
          <div className={`${styles.legajoBlock}`}>
            <input
              list="legajoPrefijo"
              value={legajo1}
              className={`${styles.legajo1}`}
              onChange={(e) => updateField("legajo1", e.target.value)}
            />
            <datalist id="legajoPrefijo" className={`${styles.tableCellInput}`}>
              {desplegables.legajosPrefijo &&
                desplegables.legajosPrefijo.map((el) => (
                  <option key={el} value={el}>
                    {el}
                  </option>
                ))}
            </datalist>

            <input
              className={legajo2Error ? `${styles.inputAreaError} ${styles.legajo2}` : `${styles.legajo2}`}
              min="1"
              max="99999"
              id="IngresarNumero"
              placeholder="00000"
              value={legajo2}
              onChange={(e) => updateField("legajo2", e.target.value)}
            />

            <input
              list="anio"
              className={`${styles.legajo3}`}
              placeholder="1970"
              value={legajo3}
              onChange={(e) => updateField("legajo3", e.target.value)}
            />
            <datalist id="anio" className={`${styles.tableCellInput}`}>
              {desplegables.años &&
                desplegables.años.map((el) => (
                  <option key={el} value={el}>
                    {el}
                  </option>
                ))}
            </datalist>
          </div>
        </div>

        <div
          className={
            tipoError
              ? `${styles.inputTipoBlock} ${styles.inputItemBlock} ${styles.inputError}`
              : `${styles.inputTipoBlock} ${styles.inputItemBlock}`
          }
        >
          <p className={`${styles.titleInput}`}>TIPO</p>
          <input
            list="tipo"
            value={tipo}
            className={`${styles.tipoInput}`}
            onChange={(e) => updateField("tipo", e.target.value)}
          />
          {(tipo && tipo !== "-" && tipo !== "") && (
            <>
              <input
                list="tipo"
                value={tipo2}
                className={`${styles.tipoInput}`}
                onChange={(e) => updateField("tipo2", e.target.value)}
              />
              {(tipo2 && tipo2 !== "-" && tipo2 !== "") && (
                <input
                  list="tipo"
                  value={tipo3}
                  className={`${styles.tipoInput}`}
                  onChange={(e) => updateField("tipo3", e.target.value)}
                />
              )}
            </>
          )}
          <datalist id="tipo" className={`${styles.tableCellInput}`}>
            {desplegables.tipos &&
              desplegables.tipos.map((el) => (
                <option key={el} value={el}>
                  {el}
                </option>
              ))}
          </datalist>
        </div>

        <div className={`${styles.inputJuezBlock} ${styles.inputItemBlock}`}>
          <p className={`${styles.titleInput}`}>JUEZ</p>
          <input
            list="jueces"
            className={juezError ? `${styles.inputError} ${styles.tableCellInput}` : `${styles.tableCellInput}`}
            value={juez}
            onChange={(e) => updateField("juez", e.target.value)}
          />
          {colegiado && (
            <>
              <input
                list="jueces"
                className={juezError ? `${styles.inputError} ${styles.tableCellInput}` : `${styles.tableCellInput}`}
                value={juez2}
                onChange={(e) => updateField("juez2", e.target.value)}
              />
              <input
                list="jueces"
                className={juezError ? `${styles.inputError} ${styles.tableCellInput}` : `${styles.tableCellInput}`}
                value={juez3}
                onChange={(e) => updateField("juez3", e.target.value)}
              />
            </>
          )}
          <datalist id="jueces" className={`${styles.tableCellInput}`}>
            {desplegables.jueces &&
              desplegables.jueces.map((el) => (
                <option key={el} value={el}>
                  {el}
                </option>
              ))}
          </datalist>
        </div>
        <div className={`${styles.inputSituacionBlock} ${styles.inputItemBlock}`}>
          <p className={`${styles.titleInput}`}>COLEGIADO</p>
          <input
              type="checkbox" className={`${styles.uniButton}`}
              checked={colegiado}
              onChange={(e) => updateField("colegiado", e.target.checked)}
            />
        </div>
        <div className={`${styles.inputSituacionBlock} ${styles.inputItemBlock}`}>
          <p className={`${styles.titleInput}`}>SITUACIÓN</p>
          <input
            className={`${styles.tableCellInput}`}
            value={situacion}
            onChange={(e) => updateField("situacion", e.target.value)}
          />
        </div>

        <button
          disabled={isSaving}
          className={`${styles.submitButton}`}
          type="submit"
        >
          {isSaving ? "GUARDANDO..." : "AGREGAR"}
        </button>
      </form>
    </>
  );
}
