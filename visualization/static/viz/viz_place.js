
function togglePlist(){
	var btn = document.getElementById('plistbtn');
	var area = document.getElementById('plist_area');

	var open = function(){
		area.style.display= "block";
		btn.onclick = close;
	};
	var close = function(){
		area.style.display= "none";
		btn.onclick = open;
	};

	if (area.style.display === '' || area.style.display === 'none') {
		btn.onclick = open;
	} else if(area.style.display !== 'none'){
		btn.onclick = close;
	}
};


window.onload = function(){
	togglePlist();
};
