export const checkCompletion = (aud) =>{
    if(aud.tipo &&
        aud.numeroLeg &&
        aud.caratula &&
        aud.sala &&
        aud.hora &&
        aud.hitos &&
        aud.hitos[aud.hitos.length-1].split(' | ')[1]==='FINALIZADA' &&
        aud.juez &&
        aud.mpf &&
        aud.defensa &&
        aud.minuta &&
        aud.cierre &&
        aud.resuelvoText
    ){
        if(!aud.mpf){
            return 'mpf'
        }else{
            if(!aud.defensa){
                return 'defensa'
            }else{
                return 'completo'
            }
        }
    }else{
        return 'noListo'
    }
}