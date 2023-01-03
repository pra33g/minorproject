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
    <button class="inc" type="button" onclick="incIndent(this, this.parentElement, this.parentElement.parentElement)" >[+->]</button>
    <button class="dec" type="button" onclick="decIndent(this, this.parentElement, this.parentElement.parentElement)" >[<+-]</button>
    <input class="pno"  type="number" onblur="checkPno(this)">
    <input class="name" type="text" onblur="checkName(this)">
    <button class="new" type="button" onclick="addBmFieldBelow(this.parentElement.id)">[+]</button>
    <button class="del" type="button" onclick="deleteThisBm(this.parentElement.parentElement.id, this.parentElement.id)" >[-]</button>
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
        child.style.marginLeft = `${child.dataset.tablevel * 20}px`;
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
        ePreviewPdf.setAttribute("src", `/download?name=${name}`);
    } else {
        ePreviewPdf.setAttribute("src", `null`);
        ePreviewPdf.style.show = "none";
    }
}
function showPageCount(count){
    let pPageCountInfo = document.getElementById("pMessage");
    pages = count;
    // log(pages);
    pPageCountInfo.innerHTML = `Pages: ${count}`;
}

function completeUpload(data){

    if(data.http == 201){
        showPageCount(data.pages);
        previewPdf(data.name);
        bmInputContainer.style.display = "block";
        addBmButton.style.display = "block";
        
    }
    else {
        showPageCount(data.message);
        previewPdf(undefined);
        bmInputContainer.style.display = "none";
        addBmButton.style.display = "none";
    }
}


const source = new EventSource('/sse');
source.addEventListener("message", message => {
    let got = JSON.parse(message.data);
    console.log("Got ", got);
    
    if ("SSE" in got){
    } else {
        displayMessage.innerText = got.message;
        
    }
});
// bmInputContainer.style.display = "block";
// addBmFieldBelow("bmno_1");
function generateBmInfo(){
    let ret = [];
    for (let child of bmInputContainer.children){
        let rret = {};
        rret["tabs"] = child.dataset.tablevel;
        rret[child.querySelector(".pno").value] = child.querySelector(".name").value;
        ret.push(rret);
    }
    return ret;
}

function sendBmJson(){
    let ret = generateBmInfo();
    if(ret && Object.keys(ret).length === 0 && Object.getPrototypeOf(ret) === Object.prototype){
        displayMessage.innerText = "Empty bookmarks";
        return;
    }
    ret.data = ret;
    let xhr = new XMLHttpRequest();
    xhr.open("POST", "/add");
    xhr.responseType = "json";
    xhr.setRequestHeader("Content-Type", "application/json;charset=UTF-8");
    xhr.send(JSON.stringify(ret));
    log(ret);

    xhr.onreadystatechange = ()=>{
        if(xhr.readyState == XMLHttpRequest.DONE){
            log(xhr.response);
        }
    };

}