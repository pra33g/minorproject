let initLen = document.getElementsByTagName('h1')[0].innerText.length;


async function typeWriter(){
    var i = 0;
    var txt = 'For free!'; /* The text */
    var speed = 50; /* The speed/duration of the effect in milliseconds */
    let elem = document.getElementsByTagName("h1")[0];
    while (i < txt.length) {
        elem.innerHTML += txt.charAt(i);
        i++;
        await new Promise(resolve => setTimeout(resolve, 50));

    }

}

let elem = document.getElementsByTagName('h1')[0];
let ii = -2;
async function removeText(){
    let len = elem.innerText.length;
    while (len > initLen-1){
        elem.innerText = elem.innerText.substring(0, len);
        await new Promise(resolve => setTimeout(resolve, 10));
        console.log(initLen , len);
        len--;  
    }
}