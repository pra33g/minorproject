/*jshint esversion: 8 */
const bmInputContainer = document.querySelector(".bmInputContainer");
const log = console.log.bind(console);
function checkPno(id){
    const elem = document.getElementById(id);
    let val = parseInt(elem.value);
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
function checkName(id){
    const elem = document.getElementById(id);
    const maxLen = 80;
    if (elem.value.length > maxLen){
        elem.value = elem.value.substring(0, maxLen);
    }
}
function addBmFieldBelow(id){
    const elem = document.getElementById(id);
    const parent = elem.parentElement;
    const regex = /\d+/;
    let nextIdNo = parseInt(id.match(regex)[0]) + 1;
    let text = `
    <div id="bmno_${nextIdNo}">
        <button id="bmno_${nextIdNo}_inc" type="button" onclick="">[+->]</button>
        <input id="bmno_${nextIdNo}_pno"  type="number" onblur="checkPno(this.id)">
        <input id="bmno_${nextIdNo}_name" type="text" onblur="checkName(this.id)">
        <button id="bmno_${nextIdNo}_new" type="button" onclick="addBmFieldBelow(this.id)">[+]</button>
        <button id="bmno_${nextIdNo}_del" type="button" onclick="" >[-]</button>
    </div>
    `;
    parent.insertAdjacentHTML("afterend", text);
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
    
    // updateDiv("dPreviewPdf");

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