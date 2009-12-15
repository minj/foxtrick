prefhelp_init = function () {
    var label = document.getElementById('HelpLabel');
    var desc = document.getElementById('HelpDesc');

    if (window.arguments[0]) {
        label.textContent = window.arguments[0];
    } else {
        label.textContent = 'Label';
    }

    if (window.arguments[1]) {
        desc.textContent=window.arguments[1];
    } else {
        desc.textContent = 'Desc';
    }
    sizeToContent();
}