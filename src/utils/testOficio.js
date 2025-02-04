export const testOficio = (aud) =>{
    if(aud.resuelvoText && aud.imputado && aud.mpf && aud.defensa){
        return true
    }else{
        return false
    }
}