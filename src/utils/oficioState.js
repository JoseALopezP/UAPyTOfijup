export const oficioState = (item) =>{
    if(item.hitos){
        if(item.estado==='FINALIZADA'){
            if(item.resuelvo){
                if(item.control){
                    if(item.control === 'controlado'){
                        return 'controlado'
                    }else{
                        return 'error'
                    }
                }else{
                    return 'nocontrolado'
                }
            }else{
                return 'finalizado'
            }
        }else{
            return 'vacio'
        }
    }else{
        return 'vacio'
    }
}