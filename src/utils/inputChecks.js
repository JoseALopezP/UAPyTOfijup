export const numberCheck = (value, setter, min, max) =>{
        if(value >= min && value <= max){
            setter(true)
        }else{
            setter(false) 
        }
    }
export const listCheck = (value, setter, list) =>{
    if(list.includes(value)){
        setter(true)
    }else{
        setter(false)
    }
}
export const typeCheck = (value, setter, type) =>{
    if(typeof value === type){
        setter(true)
    }else{
        setter(false)
    }
}
export const changeHandler = (value, setter, errorSetter, errorchecker, check1, check2=0) =>{
    setter(value)
    errorchecker(value, errorSetter, check1, check2)
}
export const changeHandlerSplitter = (value, setter, errorSetter, errorchecker, check1, check2, setterCargo, setterCargoError) =>{
    const aux = value.split(' - ')[1]
    setter(value)
    errorchecker(value, errorSetter, check1)
    if(check2.includes(aux)){
        listCheck(aux,setterCargoError, check2)
        setterCargo(aux)
    }else{
        setterCargo('')
    }
}