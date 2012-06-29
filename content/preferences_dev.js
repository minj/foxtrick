function initLoader(){
	setModuleNames();
	setupSearch();
	setupNavigation();
	setupModules();
}

function setModuleNames(){
	for (var i in Foxtrick.modules)
		Foxtrick.modules[i].MODULE_NAME = i;
}

function setupSearch(){
	var search = document.getElementById("modulelist");
	for (var i in Foxtrick.modules){
		var option = document.createElement("option");
		option.setAttribute("value", Foxtrick.modules[i].MODULE_NAME);
		search.appendChild(option);
	}
}
function setupNavigation(){
	var pages = document.getElementById("tablist").getElementsByTagName("option");
	var list = document.getElementById("navigation-list");
	for(var p = 0; p < pages.length; p++){
		var li = document.createElement("li");
		var link = document.createElement("a");
		link.href = "javascript:void(0)";
		link.textContent = pages[p].getAttribute("value"); 
		li.appendChild(link);
		list.appendChild(li);
	}
}
function setupModules(){
	var modulecontainer = document.getElementById("modules");
	for (var i in Foxtrick.modules){
		var module = document.createElement("div");
		module.className = "module";
		var module_header = document.createElement("div");
		var module_header_name_label = document.createElement("label");
		var module_header_name_label_checkbox = document.createElement("p");
		module_header_name_label_checkbox.textContent = Foxtrick.modules[i].MODULE_NAME;
		module_header_name_label.appendChild(module_header_name_label_checkbox);
		module_header.appendChild(module_header_name_label);
		module.appendChild(module_header_name_label);
		modulecontainer.appendChild(module);
	}
}
