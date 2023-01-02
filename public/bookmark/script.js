/*jshint esversion: 8 */
const bmInputContainer = document.querySelector(".bmInputContainer");
const log = console.log.bind(console);
function checkPno(elem){
    let val = parseInt(elem.value);
    log(elem.value)
    if (isNaN(val)){
        elem.value = 0;
    }
    if (val > pages){
        elem.value = pages;
    }
    if (val < 0){
        elem.value = 0;
    }
    
}
function checkName(elem){
    const maxLen = 10;
    if (elem.value.length > maxLen){
        elem.value = elem.value.substring(0, maxLen);
    }
}
function addBmFieldBelow(elemParentId, elem){
    // log(elemParentId);
    const parent = document.getElementById(elemParentId);
    const regex = /\d+/;
    let nextIdNo = parseInt(elemParentId.match(regex)[0]) + 1;
    // log(nextIdNo);

    let text = `
    <div id="bmno_${nextIdNo}">
        <button id="inc" type="button" onclick="">[+->]</button>
        <input id="pno"  type="number" onblur="checkPno(this)">
        <input id="name" type="text" onblur="checkName(this)">
        <button id="new" type="button" onclick="addBmFieldBelow(this.parentElement.id)">[+]</button>
        <button id="del" type="button" onclick="" >[-]</button>
    </div>
    `;
    parent.insertAdjacentHTML("afterend", text);
    //fix any elem ids after this id
    let selection = document.querySelectorAll("[id^=bmno_]");
    for (let i = 0; i < selection.length; i++){
        selection[i].id = `bmno_${i+1}`;
    }
}


const maxSize = 20 * 1024 * 1024;
let pages = 10;
$('#form_bookmark').submit(
    function( e ) {
        e.preventDefault();
        let formData = new FormData(this);
        let xhr = new XMLHttpRequest();
        xhr.upload.addEventListener("progress", progressHandler);
        xhr.open("POST", "/bookmark");
        xhr.responseType = 'json';


        xhr.send(formData);
        xhr.upload.addEventListener("load", successUpload);

        //get response from server in json and log it
        xhr.onreadystatechange = ()=>{
            if(xhr.readyState == XMLHttpRequest.DONE){
                completeUpload(xhr.response);
            }
        };

    } 
);
$(document).ready(function() {
    $('#pdfbm_upload').on('change', function(evt) {
        let size = this.files[0].size;
        let pUploadedBytesInfo = document.getElementById("pUploadedBytesInfo");
        let uploadButton = document.getElementById("uploadButton");
        if(size <= maxSize){
            pUploadedBytesInfo.innerHTML = "Click to upload";
            uploadButton.style.display = "block";
        } else {
            pUploadedBytesInfo.innerHTML = `Max size ${maxSize/(1024*1024)}mb`;
            uploadButton.style.display = "none";           
        }
        

    });
  });
//listen for progress updates
function progressHandler(event){
    let totalSize = event.total;
    let loadedSize = event.loaded;

    let pUploadedBytesInfo = document.getElementById("pUploadedBytesInfo");
    pUploadedBytesInfo.innerHTML = `Uploaded: ${(loadedSize/(1024*1024)).toFixed(1)}MB of ${(totalSize/(1024*1024)).toFixed(1)}MB(${loadedSize/totalSize * 100}%)`; 
}
//successful completion
function successUpload(event){
    let pUploadedBytesInfo = document.getElementById("pUploadedBytesInfo");
    pUploadedBytesInfo += "DONE";

}

//preview pdf
function previewPdf(name){
    //show pdf
    
    let ePreviewPdf = document.getElementById("ePreviewPdf");
    
    if (name){
        ePreviewPdf.setAttribute("src", `/preview?name=${name}`);
    } else {
        ePreviewPdf.setAttribute("src", `null`);
        ePreviewPdf.style.show = "none";
    }
}
function showPageCount(count){
    let pPageCountInfo = document.getElementById("pPageCountInfo");
    pages = count;
    log(pages)
    pPageCountInfo.innerHTML = `Pages: ${count}`;
}

function completeUpload(data){

    if(data.http == 201){
        showPageCount(data.pages);
        previewPdf(data.name);
        
    }
    else {
        showPageCount(data.message);
        previewPdf(undefined);
    }
}


const source = new EventSource('/bookmarkStatus');
source.addEventListener("message", message => {
    console.log("Got ", JSON.parse(message.data));
});