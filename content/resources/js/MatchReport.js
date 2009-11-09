function gotoElmentID(elementID) {
    if (elementID === '') {
        scroll(0, 0);
    } else {
        var element = document.getElementById(elementID);
        alert('before: ' + element.scrollTop +"|"+ element.offsetTop);
        element.scrollTop = element.offsetTop;
        //alert(element.textContent);
        alert('after: ' + element.scrollTop +"|"+ element.offsetTop);
    }
}