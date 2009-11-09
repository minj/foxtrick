function gotoElmentID(elementID) {
    if (elementID === '') {
        scroll(0, 0);
    } else {
        var element = document.getElementById(elementID);
        element.scrollTop = element.offsetTop;
        alert(element.textContent);
    }
}