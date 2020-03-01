//lifestyle console
function toggleConsole() {
	console.log('toggleConsole')
	var conCon = document.getElementById('consoleContents');
	var conIco = document.getElementById('consoleIcon');
	var conSta = document.getElementById('consolestatus');

	var open = function(){
		conCon.style.display = 'block';
		conSta.style.display = 'block';
		conIco.onclick = close;
	};
	var close = function(){
		conCon.style.display = 'none';
		conIco.onclick = open;
	};
	conIco.onclick = open;


};

window.onload = function(){
	toggleConsole();
};
