
let imgElement = document.getElementById('imageSrc');
let inputElement = document.getElementById('fileInput');
let maskElement = document.getElementById('canvasOutput');
let radioAngulo = document.getElementsByName('angulo');
let radioOrientacion = document.getElementsByName('orientacion');
let radioTipotex = document.getElementsByName('tipotex');

let texElement = new Image();
let bocaElement = new Image();
let bocamaskElement = new Image();



inputElement.addEventListener('change',(e) => {
    imgElement.onload = todolisto;
    imgElement.onerror = fail;
    imgElement.src = URL.createObjectURL(e.target.files[0]);
   // console.log(imgElement.src);
},false);






function todolisto(){
    document.getElementById('ok').style.display = 'block';
}

document.getElementById('ok').addEventListener('click', function(){
    proceso();
})

document.getElementById('default').addEventListener('click',function(){
    document.getElementById('minR').value = 0
    document.getElementById('minG').value = 133

    document.getElementById('maxB').value = 127

    document.getElementById('rangeX').value = 0
    document.getElementById('rangeY').value = 0

    document.getElementById('size').value = 100
})


function proceso(){


    switch(document.querySelector('input[name="tipotex"]:checked').value){
        case "cheems":  texElement.src = cheemsTexSrc;
                        switch(document.querySelector('input[name="orientacion"]:checked').value){

                            case "izqboca": bocaElement.src = cheemsBocaLSrc;
                                            bocamaskElement.src = cheemsBocamaskLSrc;
                                            break;
                                            
                            case "derboca": bocaElement.src = cheemsBocaRSrc;
                                            bocamaskElement.src = cheemsBocamaskRSrc;
                                            break;                     
                        }
                        break;
        case "ramirez": texElement.src = ramirezTexSrc;
                        bocaElement.src = ramirezBocaSrc;
                        bocamaskElement.src = ramirezBocamaskSrc;
                        break;
        case "curicerdo":texElement.src = cerdoTexSrc;
                         bocaElement.src = cerdoBocaSrc;
                         bocamaskElement.src = cerdoBocamaskSrc;
                        break;
    }

  
    
    let minR = Math.round(document.getElementById('minR').value)
    let minG = Math.round(document.getElementById('minG').value)
    let minB = 77

    let maxR = 235
    let maxG = 173
    let maxB = Math.round(document.getElementById('maxB').value)
    
    
    let img = cv.imread(imgElement);
   
    let size0 = new cv.Size(img.cols,img.rows);


    let size = new cv.Size(1000,1000);
    cv.resize(img,img,size);  
    let YCrcB = new cv.Mat(img.rows,img.cols,img.type());
    

    cv.cvtColor(img,YCrcB,cv.COLOR_RGB2YCrCb, 0);

    let min = new cv.Mat(YCrcB.rows, YCrcB.cols, YCrcB.type(), [minR, minG, minB, 0]);
    let max = new cv.Mat(YCrcB.rows,img.cols,YCrcB.type(), [maxR,maxG,maxB,255]);
    let mask = new cv.Mat();

    cv.inRange(YCrcB,min,max,mask);
 
    //cv.imshow("canvasOutput",mask);



    let tex_image = cv.imread(texElement);
    cv.resize(tex_image,tex_image,size);
    //cv.imshow("textureCanvas",tex_image);
    
    let piel = new cv.Mat();
    let nopiel = new cv.Mat();

    cv.bitwise_and(tex_image,tex_image,piel,mask);
    cv.bitwise_not(mask,mask); //invertir mascara
    cv.bitwise_and(img,img,nopiel,mask);
    cv.bitwise_not(mask,mask);

    let merged = new cv.Mat();
    cv.add(piel,nopiel,merged);
    //cv.imshow("mergedCanvas",merged);

  

    let leftflag=1
    let rightflag=1
    let upperflag=1
    let lowerflag=1

    let leftborder=0
    let rightborder=1000
    let upperborder=0
    let lowerborder=1000


   
    let i=0
    while(i<500){

    //    console.log(mask.ucharAt(500,(500-i)*mask.channels()!=255));
        
        
        if(mask.ucharAt(500,1000-i*mask.channels())!=0 && leftflag===1 ){
            leftborder=1000-i;
            leftflag=0;
        }
        if(mask.ucharAt(500,i*mask.channels())!=0 && rightflag===1 ){
            rightborder=i;
            rightflag=0;
        }
        i = i + 1;
  //      console.log(mask.ucharAt(500,(500-i)*mask.channels()));
    }
    i=0
    let ptmedio=Math.round((leftborder+rightborder)/2);


    while(i<500){
        if(mask.ucharAt(1000-i,ptmedio*mask.channels())!=0 && upperflag===1){
            upperborder=1000-i;
            upperflag=0;
        }
        if(mask.ucharAt(i,ptmedio*mask.channels())!=0 && lowerflag===1){
            lowerborder=i;
            lowerflag=0;
        }
        i = i + 1;
    }


    let auto_x = 500.0;
    let auto_y = 500.0;



    switch(document.querySelector('input[name="angulo"]:checked').value){
        case "izquierda":   auto_x=rightborder+60;
                            break;
        case "derecha":     auto_x=leftborder-60;
                            break;
        case "frente":      auto_x=ptmedio;
                            break;
    }
    
    auto_y=Math.round((lowerborder+upperborder)/2)-30;

    //console.log(leftborder+rightborder)
    //console.log(auto_x,auto_y);

    let faceLargo = Math.round(Math.abs(leftborder-rightborder));
    let faceAlto = Math.round(Math.abs(lowerborder-upperborder));
    //console.log(faceLargo,faceAlto);
    


    let boca = cv.imread(bocaElement);
    let bocamask = cv.imread(bocamaskElement);

    
    let bocaLargo = Math.round(   (((faceLargo*4)/5)*document.getElementById('size').value)/100    );
    let bocaAlto = Math.round(    (((faceAlto*5)/16)*document.getElementById('size').value)/100    );
  
    let bocaSize = new cv.Size(bocaLargo,bocaAlto);
    //console.log(bocaSize)

    cv.resize(boca,boca,bocaSize);
    cv.resize(bocamask,bocamask,bocaSize);

   

    let posx=auto_x + parseInt(document.getElementById('rangeX').value);
    let posy=auto_y - parseInt(document.getElementById('rangeY').value);
   // console.log(posx,posy)
    boca_centered = new cv.Mat(1000, 1000, merged.type(), [0,0,0,255]);
    bocamask_centered = new cv.Mat(1000, 1000, merged.type(), [0,0,0,255]);


    centerx=Math.round(boca.cols/2);
    centery=Math.round(boca.rows/2);

    i=0;
    let j=0;
    let pixel = boca_centered.ucharPtr(0,0);
    while(i<boca.rows){
        while(j<boca.cols){

            pixel = boca_centered.ucharPtr(i+posy-centery,j+posx-centerx);
            pixel[0] = boca.ucharAt(i,j*boca.channels())    //R
            pixel[1] = boca.ucharAt(i,j*boca.channels()+1)  //G
            pixel[2] = boca.ucharAt(i,j*boca.channels()+2)  //B
            pixel[3] = 255  //A

            pixel = bocamask_centered.ucharPtr(i+posy-centery,j+posx-centerx);
            pixel[0] = bocamask.ucharAt(i,j*bocamask.channels())    //R
            pixel[1] = bocamask.ucharAt(i,j*bocamask.channels()+1)  //G
            pixel[2] = bocamask.ucharAt(i,j*bocamask.channels()+2)  //B
            pixel[3] = 255  //A

            j = j+1;
        }
        
        i = i+1;
        j=0
       
    }
   
    //cv.imshow("bocaCanvas", boca_centered);
    

    let maskmin = new cv.Mat(boca_centered.rows, boca_centered.cols, boca_centered.type(), [0, 32, 32, 0]);
    let maskmax = new cv.Mat(boca_centered.rows, boca_centered.cols, boca_centered.type(), [255, 255, 255, 255]);

    bocamasked = new cv.Mat()

    cv.inRange(bocamask_centered,maskmin,maskmax,bocamasked);

    //cv.imshow("bocamaskCanvas",bocamasked);
    let noboca = new cv.Mat();
    //console.log(bocamasked.type(),merged.type());
    cv.bitwise_not(bocamasked,bocamasked);
    cv.bitwise_and(merged,merged,noboca,bocamasked);
    cv.bitwise_not(bocamasked,bocamasked);
    cv.add(noboca,boca_centered,merged);


 
    //cv.resize(merged,merged,size0);


    cv.imshow("finalCanvas",merged);

    let finalImage = document.getElementById('finalCanvas').toDataURL("image/png");
    document.getElementById('finalImage').src = finalImage;

    img.delete();YCrcB.delete();min.delete();max.delete();mask.delete();tex_image.delete();
    piel.delete();nopiel.delete();merged.delete();boca.delete();bocamask.delete();boca_centered.delete();
    bocamask_centered.delete();noboca.delete();
    maskmin.delete();maskmax.delete();bocamasked.delete();
    
    

};




 function fail(){
     console.error("algo salio mal");
 }
    



function onOpenCvReady(){
    document.getElementById('status').innerHTML = '<h4 style="color:#ffffff">Listo :) </h4>';
}