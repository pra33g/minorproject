/*jshint esversion: 8 */
//send file to server
const maxSize = 20 * 1024 * 1024;
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
                // console.log(xhr.response);
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
            console.log("here")
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
        console.log("here")
        ePreviewPdf.setAttribute("src", `null`);
        ePreviewPdf.style.show = "none";
    }
    
    // updateDiv("dPreviewPdf");

}
function showPageCount(count){
    let pPageCountInfo = document.getElementById("pPageCountInfo");
    pPageCountInfo.innerHTML = `Pages: ${count}`;
}

function completeUpload(data){

    console.log( data);
    if(data.http == 201){
        showPageCount(data.pages);
        previewPdf(data.name);
        
    }
    else {
        showPageCount(data.message);
        previewPdf(undefined);
    }
}


const source = new EventSource('/bookmark/bookmarkStatus');
source.addEventListener("message", message => {
    console.log("Got ", JSON.parse(message.data));
});
