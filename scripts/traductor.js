
 

function loadText(){ 
  let newtexto = "";
  let texto = document.getElementById('texto').value;
  let myP = document.querySelector('p');
  let palabra = "";


    console.log(texto.length);
    var i;
    for(i = 0;i < texto.length; i++){

    
        if(texto[i] !== " " ){
            palabra += texto[i];
        }
        else{
            newtexto += cheemsify(palabra);
            palabra = "";
        }
        
    }
    newtexto += cheemsify(palabra);
    console.log(newtexto);
    myP.innerHTML = newtexto;
   

function isVocal(letra){
    return "aeiouáéíóúüAEIOUÁÉÍÓÚÜyYhH".includes(letra);
}

function cheemsify(palabra){
    let vocaled = false;
    let Ms = 0;
    let newpalabra = ""

    if(palabra.length > 4 && palabra.length <= 12){
        Ms = 1;
    }
    else if(palabra.length > 7){
        Ms = 2;
    }
    console.log("ms:",Ms);
    var i;
    for(i=0;i<palabra.length;i++){
        if(isVocal(palabra[i])){
            vocaled = true;
        }
        else if(vocaled && Ms > 0){
            
            vocaled = false;
            if(i-1<palabra.length){
               if(!(palabra[i] === 'm' || (palabra[i] === 'r' && !(" r".includes(palabra[i+1]))))){
                  
                    Ms--;
                    newpalabra += 'm';
                } 
            }
        }
    newpalabra += palabra[i];
    }
    if(Ms>0 && isVocal(palabra[i-1])){
        newpalabra+='m';
    }
    newpalabra += " ";
    console.log(newpalabra);
    return newpalabra;
}


}
