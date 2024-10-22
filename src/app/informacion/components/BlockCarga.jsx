'use client'
import styles from './informacion.module.css'
import { useState } from 'react';

export function BlockCarga () {
    const [title, setTitle] = useState("");
    const [inicio, setInicio] = useState("");
    const [fin, setFin] = useState("");
    const [body, setBody] = useState("");
    const [image, setImage] = useState(null);
    const [uploading, setUploading] = useState(false);
    const handleFileClick = () =>{
        document.getElementById('getFile').click()
    }

    const handleSubmit = (event) =>{
        event.preventDefault();
        if (!title || !body || !image) {
            alert("Please fill in all fields.");
            return;
        }
        setUploading(true);
        // Upload image to Firebase Storage
        const storageRef = ref(storage, `images/${image.name}`);
        const uploadTask = uploadBytesResumable(storageRef, image);
        uploadTask.on(
            "state_changed",
            (snapshot) => {
              // Progress function
              const progress =
                (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
              console.log("Upload is " + progress + "% done");
            },
            (error) => {
              // Error function
              console.error(error);
              setUploading(false);
            },
            () => {
              // Complete function
              getDownloadURL(uploadTask.snapshot.ref).then(async (downloadURL) => {
                try {
                  // Save post data to Firestore
                  await addDoc(collection(db, "posts"), {
                    title,
                    body,
                    imageUrl: downloadURL,
                    createdAt: new Date(),
                  });
                  setTitle("");
                  setBody("");
                  setImage(null);
                  alert("Post created successfully!");
                } catch (error) {
                  console.error("Error adding document: ", error);
                  alert("Error creating post.");
                }
                setUploading(false);
              });
            }
        );
    }
    return(
        <section className={`${styles.cargaSection}`}>
            <div className={`${styles.inputDiv}`}>
            <h2 className={`${styles.inputPresentation}`}>AGREGAR UN NUEVO DOCUMENTO</h2>
            <form action="" className={`${styles.inputForm}`}>
                <label className={`${styles.inputTitle}`}>TÍTULO</label>
                <input type="text" className={`${styles.inputText}`}/>
                <label className={`${styles.inputTitle}`}>CUERPO</label>
                <input type="textarea" className={`${styles.inputText}`}/>
                <label className={`${styles.inputTitle}`}>IMÁGEN</label>
                <button type='button' onClick={() => handleFileClick()} className={`${styles.inputButton}`}>SUBIR IMÁGEN</button>
                <input type="file" id='getFile' className={`${styles.inputFile}`}/>
                <label className={`${styles.inputTitle}`}>FECHA INICIO</label>
                <input type="date" className={`${styles.inputText}`}/>
                <label className={`${styles.inputTitle}`}>FECHA FIN</label>
                <input type="date" className={`${styles.inputText}`}/>
                <button type="submit" className={`${styles.submitButton} ${styles.inputButton}`}>AGREGAR</button>
            </form>
            </div>
        </section>
    )
}