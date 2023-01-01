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
        xhr.send(formData);
        xhr.upload.addEventListener("load", successUpload);

        //get response from server in json and log it
        xhr.onreadystatechange = ()=>{
            if(xhr.readyState == XMLHttpRequest.DONE){
                xhr.responseType = 'json';
                console.log(xhr.response);
            }
        };

    } 
);
//listen for progress updates
function progressHandler(event){
    let totalSize = event.total;
    let loadedSize = event.loaded;

    let pStatus = document.getElementById("uploadedBytes");
    pStatus.innerHTML = `Uploaded: ${loadedSize/totalSize * 100}`; 
}
//successful completion
function successUpload(event){
    let pStatus = document.getElementById("uploadedBytes");
    pStatus += "DONE";
}

const source = new EventSource('/bookmark/bookmarkStatus');
source.addEventListener("message", message => {
    console.log("Got ", JSON.parse(message.data));
});
