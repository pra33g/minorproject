/*jshint esversion: 8 */
//send file to server
$('#form_bookmark').submit(
    function( e ) {
        e.preventDefault();
        let formData = new FormData(this);
        console.log(formData);
        let xhr = new XMLHttpRequest();
        xhr.upload.addEventListener("progress", progressHandler);
        xhr.open("POST", "/bookmark");
        xhr.responseType = 'json';
        xhr.send(formData);
        xhr.upload.addEventListener("load", successUpload);

        //get response from server in json and log it
        xhr.onreadystatechange = ()=>{
            if(xhr.readyState == XMLHttpRequest.DONE){
                console.log(xhr.response);
            }
        };

    } 
);
//listen for progress updates
function progressHandler(event){
    let totalSize = event.total;
    let loadedSize = event.loaded;

    let pUploadedBytesInfo = document.getElementById("pUploadedBytesInfo");
    pUploadedBytesInfo.innerHTML = `
        Uploaded: ${(loadedSize/(1024*1024)).toFixed(1)}MB 
        of ${(totalSize/(1024*1024)).toFixed(1)}MB(${loadedSize/totalSize * 100}%)
        `; 
}
//successful completion
function successUpload(event){
    let pUploadedBytesInfo = document.getElementById("pUploadedBytesInfo");
    pUploadedBytesInfo += "DONE";
}

const source = new EventSource('/bookmark/bookmarkStatus');
source.addEventListener("message", message => {
    console.log("Got ", JSON.parse(message.data));
});
