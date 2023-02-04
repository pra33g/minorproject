/*jshint esversion: 8 */
/*jshint sub:true*/
const bmInputContainer = document.querySelector("#bmInputContainer");
const addBmButton = document.getElementById("sendInput");
const displayMessage = document.getElementById("pMessage");
const log = console.log.bind(console);
function checkPno(elem){
    let val = parseInt(elem.value);
    if (isNaN(val)){
        elem.value = 0;
        
    }
    if (val > pages){
        elem.value = pages;
        displayMessage.innerText = `Can't bookmark over maximum (${pages}) pages`;
    }
    if (val < 0){
        elem.value = 0;
        displayMessage.innerText = "Can't bookmark negative pages"

    }
    
}
function checkName(elem){
    const maxLen = 30;
    if (elem.value.length > maxLen){
        elem.value = elem.value.substring(0, maxLen);
        displayMessage.innerText = `Max bookmark name length is ${maxLen} characters.`;
    }
}

function deleteThisBm(elemParentParentId, elemParentId){
    // log(elemParentId, elemParentParentId);
    const ep = document.getElementById(elemParentId);
    const epp = document.getElementById(elemParentParentId);
    let count = epp.children.length;
    if (count > 1){
        epp.removeChild(ep);
        for(let i = 0; i < epp.children.length; i++){
            epp.children[i].id = `bmno_${i+1}`;
        }
    } else {
        displayMessage.innerText = "Can not remove.\nAt least one bookmark required.";
    }
    fixTabs(epp);
    showIndents();
}
function incIndent(elem, parentElem, parentParentElem){
    let tablevel =  parseInt(parentElem.dataset.tablevel);
    tablevel++;
    parentElem.dataset.tablevel = tablevel;
    fixTabs(parentParentElem);
    showIndents();
}
function decIndent(elem, parentElem, parentParentElem){
    let tablevel =  parseInt(parentElem.dataset.tablevel);
    tablevel--;
    if(tablevel < 0){
        parentElem.dataset.tablevel = 0;

    } else {
        parentElem.dataset.tablevel = tablevel;
        fixTabs(parentParentElem);
    }
    showIndents();
}
function addBmFieldBelow(elemParentId){
    // log(elemParentId);
    const parent = document.getElementById(elemParentId);

    const regex = /\d+/;
    let nextIdNo = parseInt(elemParentId.match(regex)[0]) + 1;
    // log(nextIdNo);

    let text = `
    <div id="bmno_${nextIdNo}" data-tablevel="${parent.dataset.tablevel}">
    <button class="join-btn" type="button" onclick="incIndent(this, this.parentElement, this.parentElement.parentElement)" >[->]</button>
    <button class="join-btn" type="button" onclick="decIndent(this, this.parentElement, this.parentElement.parentElement)" >[<-]</button>
    <input id="pno" class="join-btn"  type="number" onblur="checkPno(this)">
    <input id="name" id="pno"class="join-btn" type="text" onblur="checkName(this)">
    <button class="join-btn" type="button" onclick="addBmFieldBelow(this.parentElement.id)">[+]</button>
    <button class="join-btn" type="button" onclick="deleteThisBm(this.parentElement.parentElement.id, this.parentElement.id)" >[-]</button>
    </div>
    `;
    parent.insertAdjacentHTML("afterend", text);
    //fix any elem ids after this id
    let selection = document.querySelectorAll("[id^=bmno_]");
    for (let i = 0; i < selection.length; i++){
        selection[i].id = `bmno_${i+1}`;
    }
    showIndents();
}

function showIndents(){
    for(var child of bmInputContainer.children){
        child.style.marginLeft = `${child.dataset.tablevel * 40}px`;
    }
}

function fixTabs(bmInputContainer){
    // console.clear()
    let tabArr = [];
    for(let child of bmInputContainer.children){
        tabArr.push([child.id, parseInt(child.dataset.tablevel)]);
    }
    // log(tabArr);
    let lastTabLevel = -1;

    //-1 0 0 1 1 2 3 4 6 
    for (let i = 0; i < tabArr.length; i++){
        let tablevel = tabArr[i][1];
        if (tablevel - lastTabLevel > 1){
            tabArr[i][1] = lastTabLevel + 1;
        } else {
            //fine
        }
        // log(tabArr[i][1], lastTabLevel,  tabArr[i][1] - lastTabLevel);
        lastTabLevel = tabArr[i][1];
    }
    let i = 0;
    for(let child of bmInputContainer.children){
        child.dataset.tablevel = tabArr[i][1];
        i++;
    }
    // for(let i of tabArr){
    //     log(i);
    // }

}

const maxSize = 20 * 1024 * 1024;
let pages = 10;
$('#form_bookmark').submit(
    function( e ) {
        e.preventDefault();
        let formData = new FormData(this);
        let xhr = new XMLHttpRequest();
        xhr.upload.addEventListener("progress", progressHandler);
        xhr.open("POST", "/upload");
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
function resetBmInputContainer(){
    let count = bmInputContainer.children.length;
    for(let i = 0; i < count - 1; i++){
        bmInputContainer.removeChild(bmInputContainer.lastChild);
    }
    bmInputContainer.style.display = "none";
}
$(document).ready(function() {
    $('#pdfbm_upload').on('change', function(evt) {
        let size = this.files[0].size;
        let pUploadedBytesInfo = document.getElementById("pMessage");
        let uploadButton = document.getElementById("uploadButton");
        if(size <= maxSize){
            pUploadedBytesInfo.innerHTML = "Click to upload";
            uploadButton.style.display = "block";
        } else {
            pUploadedBytesInfo.innerHTML = `Max size ${maxSize/(1024*1024)}mb`;
            uploadButton.style.display = "none";
        }
        resetUpload();
    });
});

function resetUpload(){
    addBmButton.style.display = "none";  
    resetBmInputContainer();
    previewPdf(undefined);
}

//listen for progress updates
function progressHandler(event){
    let totalSize = event.total;
    let loadedSize = event.loaded;

    let pUploadedBytesInfo = document.getElementById("pMessage");
    pUploadedBytesInfo.innerHTML = `Uploaded: ${(loadedSize/(1024*1024)).toFixed(1)}MB of ${(totalSize/(1024*1024)).toFixed(1)}MB(${(loadedSize/totalSize * 100).toFixed(1)}%)`; 
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
    ePreviewPdf.style.display = "block";
    
    if (name){
        ePreviewPdf.setAttribute("src", `/download?name=${name}`);
    } else {
        ePreviewPdf.style.display = "none";
        ePreviewPdf.style.show = "none";
    }
}
function showPageCount(count){
    let pPageCountInfo = document.getElementById("pMessage");
    pages = count;
    // log(pages);
    pPageCountInfo.innerHTML = `Pages: ${count}`;
}
let upFileName="";
function completeUpload(data){

    if(data.http == 201){
        upFileName = data.name;
        showPageCount(data.pages);
        previewPdf(data.name);
        bmInputContainer.style.display = "block";
        document.getElementById("bmno_1").querySelector("#new").click();
        document.getElementById("bmno_1").querySelector("#del").click();
        addBmButton.style.display = "block";

        document.getElementById("form_bookmark").style.display = "none";

        
    }
    else {
        // showPageCount(data.message);
        previewPdf(undefined);
        bmInputContainer.style.display = "none";
        addBmButton.style.display = "none";
    }
}

let convertedName = "";
const source = new EventSource('/sse');
source.addEventListener("message", message => {
    let got = JSON.parse(message.data);
    displayMessage.innerText = got.message;
    displayMessage.style.display = "block"
    console.log("Got ", got);
    
    if (got.message == "conversion-done"){
         displayMessage.innerText = "Downloading file, Please wait.\nRefresh page to start again.";
        
        convertedName = got.name;
        downloadPDF(convertedName);
    } 
    if(got.message == "processing-file"){
        displayMessage.innerText = "Server is processing file, please wait.";
        
    }
    if(got.message == "pages"){
        displayMessage.innerText = `Pages: ${pages}`;

    }
    if(got.message == "Format unacceptable"){
        displayMessage.innerText = `Format unacceptable`;

    }
});
// bmInputContainer.style.display = "block";
// addBmFieldBelow("bmno_1");

function downloadPDF(file){
    let xhr = new XMLHttpRequest();


    xhr.open("GET", `/download?name=${file}`);
    xhr.send();
    xhr.responseType = "blob";
    xhr.onload = function(e) {
        if (this.status == 200) {
            // Create a new Blob object using the 
            //response data of the onload object
            var blob = new Blob([this.response], {type: 'image/pdf'});
            //Create a link element, hide it, direct 
            //it towards the blob, and then 'click' it programatically
            let a = document.createElement("a");
            a.style = "display: none";
            document.body.appendChild(a);
            //Create a DOMString representing the blob 
            //and point the link element towards it
            let url = window.URL.createObjectURL(blob);
            a.href = url;
            a.download = 'myFile.pdf';
            //programatically click the link to trigger the download
            a.click();
            //release the reference to the file by revoking the Object URL
            window.URL.revokeObjectURL(url);
        }else{
            //deal with your error state here
        }
}


}

function generateBmInfo(){
    let ret = [];
    for (let child of bmInputContainer.children){
        let pno = child.querySelector("#pno").value;
        let title = child.querySelector("#name").value;
        if(pno==='' || title ==='' ){
            return -1;
        }
        let rret = {};
        rret.tabs = child.dataset.tablevel;
        rret.pno = pno;
        rret.title = title;
        ret.push(rret);
    }
    
    return ret;
}
/*
{[{},{},{}], title}

*/
function sendBmJson(){
    let bmInfo = generateBmInfo();
    if(bmInfo == -1){
        displayMessage.innerText = "Remove empty bookmarks first";
        return;
    }
    let ret = {};
    ret.data = bmInfo;
    ret.name = upFileName;
    log(ret);
    let xhr = new XMLHttpRequest();
    xhr.open("POST", "/add");
    xhr.responseType = "json";
    xhr.setRequestHeader("Content-Type", "application/json;charset=UTF-8");
    xhr.send(JSON.stringify(ret));

    xhr.onreadystatechange = ()=>{
        if(xhr.readyState == XMLHttpRequest.DONE){
            log(xhr.response);
        }
    };

}
