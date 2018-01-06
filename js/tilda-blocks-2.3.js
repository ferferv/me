 
function t121_setHeight(recid){
    var div=$("#youtubeiframe"+recid);
    var height=div.width() * 0.5625;
    div.height(height);
    div.parent().height(height);         
} 
function t117_appendGoogleMap(recid, key) {
	var grecid = recid;
	if (typeof google === 'object' && typeof google.maps === 'object') {
		t117_handleGoogleApiReady(grecid);
	} else {
		if(window.googleapiiscalled!==true){
		
			var runfunc = 'window.t117_handleGoogleApiReady_'+grecid+' = function () { t117_handleGoogleApiReady("'+grecid+'") }';
			eval(runfunc);
			
			var script = document.createElement("script");
			script.type = "text/javascript";
			script.src = "//maps.google.com/maps/api/js?key="+jQuery.trim(key)+"&callback=t117_handleGoogleApiReady_"+grecid;
			document.body.appendChild(script);
			window.googleapiiscalled=true;
		} else {
		  setTimeout(function(){
			t117_appendGoogleMap(grecid,key);
		  },200);
	  }
	}
}

function t117_handleGoogleApiReady(recid){
	$('#rec'+recid).find('.t117_map').each(function(index,Element) {
		var el=$(Element);
		var arMarkers = window['arMapMarkers'+recid];
		window.isDragMap = $isMobile ? false : true;
			
		if(el.attr('data-map-style')!=''){var mapstyle=eval(el.attr('data-map-style'));}else{var mapstyle='[]';}
		var myLatLng = arMarkers.length > 0 ? new google.maps.LatLng(parseFloat(arMarkers[0].lat), parseFloat(arMarkers[0].lng)) : false;
		var myOptions = {
			zoom: parseInt(el.attr('data-map-zoom')),
			center:myLatLng,
			scrollwheel: false,
			draggable: window.isDragMap,
			zoomControl: true,
			styles: mapstyle
		};
		
		var map = new google.maps.Map(Element, myOptions);
	
		var i, mrk, marker, markers=[], infowindow;
		var bounds = new google.maps.LatLngBounds();
		for(i in arMarkers) {
			mrk = arMarkers[i];
			myLatLng = new google.maps.LatLng(parseFloat(mrk.lat), parseFloat(mrk.lng));
			marker = new google.maps.Marker({
				position: myLatLng,
				map: map,
				title: mrk.title
			});
			bounds.extend(myLatLng);

			if (mrk.descr > '') {
				attachInfoMessage(marker, mrk.descr);
			} else {
				attachInfoMessage(marker, mrk.title);
			}

			markers[markers.length] = marker;
			infowindow='';
			marker='';
		}
		
		function attachInfoMessage(marker, descr) {
			var infowindow = new google.maps.InfoWindow({
				content:  $("<textarea/>").html(descr).text()
			});
		  
			marker.addListener('click', function() {
				infowindow.open(marker.get('map'), marker);
			});
		}
		
		if (arMarkers.length > 1) {
			map.fitBounds(bounds);
			if (map.getZoom() > parseInt(el.attr('data-map-zoom'))) {
				map.setZoom(parseInt(el.attr('data-map-zoom')));
			}
		}

		// Resizing the map for responsive design
		google.maps.event.addDomListener(window, "resize", function() {
			var center = map.getCenter();
			google.maps.event.trigger(map, "resize");
			map.setCenter(center); 
		});
	  
		// DBL Click - activate on mobile      
		if ($isMobile) {
		  google.maps.event.addDomListener(window, "dblclick", function() {
			if (window.isDragMap) {
				window.isDragMap = false;
			} else {
				window.isDragMap = true;
			}
			map.setOptions({draggable: window.isDragMap});
		  }); 
		}
	  
	});	
}


function t117_appendYandexMap(recid,key) {
	var yarecid = recid;
	if (typeof ymaps === 'object' && typeof ymaps.Map === 'function') {
		t117_handleYandexApiReady(recid);
	} else {
		if(window.yandexmapsapiiscalled!==true){
			var runfunc = 'window.t117_handleYandexApiReady_'+yarecid+' = function () { return t117_handleYandexApiReady("'+yarecid+'") }';
			eval(runfunc);

			var script = document.createElement("script");
			script.type = "text/javascript";
			script.src = "https://api-maps.yandex.ru/2.1/?lang=ru-RU&coordorder=latlong&onload=t117_handleYandexApiReady_"+yarecid;
			if (key > '') {
				script.src = script.src + '&apikey='+key;
			}
			document.body.appendChild(script);
			window.yandexmapsapiiscalled=true;
		} else {
		  setTimeout(function(){
			t117_appendYandexMap(yarecid,key);
		  },200);
	  }
	}
}

function t117_handleYandexApiReady(recid){
	$('#rec'+recid).find('.t117_map').each(function(index,Element) {
		var el=$(Element);
		var arMarkers = window['arMapMarkers'+recid];
		window.isDragMap = $isMobile ? false : true;
			
		if(el.attr('data-map-style')!=''){var mapstyle=eval(el.attr('data-map-style'));}else{var mapstyle='[]';}
		var myLatlng = arMarkers.length > 0 ? [parseFloat(arMarkers[0].lat), parseFloat(arMarkers[0].lng)] : false;
		var myStates = {
			zoom: parseInt(el.attr('data-map-zoom')),
			center:myLatlng,
			scrollZoom: false,
			controls: ['typeSelector','zoomControl'],
			drag: window.isDragMap
		};

		var map = new ymaps.Map(Element, myStates), i, mrk, marker;
		var myGroup = new ymaps.GeoObjectCollection({}) ;
		
		map.behaviors.disable('scrollZoom');

		for(i in arMarkers) {
			mrk = arMarkers[i];
			myLatlng = [parseFloat(mrk.lat), parseFloat(mrk.lng)];

			myGroup.add(new ymaps.Placemark(myLatlng, { hintContent: mrk.title, balloonContent: mrk.descr > '' ? $("<textarea/>").html(mrk.descr).text() : mrk.title }));			
		}
		map.geoObjects.add(myGroup);
		if (arMarkers.length > 1) {
			map.setBounds(myGroup.getBounds(), {checkZoomRange: true}) ;
		}
		$(window).resize(function(){
			map.container.fitToViewport();
		});

		// DBL Click - activate on mobile      
		if ($isMobile) {
			$(window).dblclick(function() {
				if (window.isDragMap) {
					window.isDragMap = false;
				} else {
					window.isDragMap = true;
				}
				if (window.isDragMap) {
					map.behaviors.enable('drag');
				} else {
					map.behaviors.disable('drag');
				}
			});
		}

	});
} 
if (! window.yashare2scriptLoaded){
    var scriptService = document.createElement('script');
    scriptService .src = "https://yastatic.net/share2/share.js";
    scriptService .type = "text/javascript";
    scriptService .charset = "UTF-8";
    document.documentElement.appendChild(scriptService);

    window.yashare2scriptLoaded = true;
}
 
function t142_checkSize(recid){
  var el=$("#rec"+recid).find(".t142__submit");
  if(el.length){
    var btnheight = el.height() + 5;
    var textheight = el[0].scrollHeight;
    if (btnheight < textheight) {
      var btntext = el.text();
      el.addClass("t142__submit-overflowed");
      el.html("<span class=\"t142__text\">" + btntext + "</span>");
    }
  }
} 
function t190_scrollToTop(){
    $('html, body').animate({scrollTop: 0}, 700);								
}	  
 
function t199_showMenu(recid){
  var el=$("#rec"+recid);
  el.find('.t199__js__menu').each(function() {
    var $toggler = el.find('.t199__js__menu-toggler'),
    $menu = $(this),
    $body = $('body'),
    CLASS_MENU = 't199__is__menu';
      
  $menu.find('.t199__menu-item').each(function() {
    if($(this).attr('href').indexOf('#') > -1 ){
      $(this).on('click', function(e) {
        $body.removeClass(CLASS_MENU);
        });
    }
  });      

    $toggler.on('click', function(e) {
      e.stopPropagation();
      e.preventDefault();
      $body.toggleClass(CLASS_MENU);
    });

    $(document).on('click', function() {
      $body.removeClass(CLASS_MENU);
    });

    $menu.on('click', function(e) {
      e.stopPropagation();
    });
  })
}

function t199_positionHeader(recid){
  var el=$("#rec"+recid);
  var $header = el.find('.t199__js__header'),

    isScrolling = false,

    CLASS_ACTIVE = 't199__is__active';

  function updateHeader() {
    isScrolling = true;

    if ($(window).scrollTop() > 0) $header.addClass(CLASS_ACTIVE);
    else $header.removeClass(CLASS_ACTIVE);
  }

  setInterval(function() {
    if(isScrolling) {
      isScrolling = false;
    }
  }, 100);

  $(window).on('scroll', updateHeader)
  updateHeader();
}

function t199_setPath(pageid){
}

function t199_highlight(recid){
  var url=window.location.href;
  var pathname=window.location.pathname;
  if(url.substr(url.length - 1) == "/"){ url = url.slice(0,-1); }
  if(pathname.substr(pathname.length - 1) == "/"){ pathname = pathname.slice(0,-1); }
  if(pathname.charAt(0) == "/"){ pathname = pathname.slice(1); }
  if(pathname == ""){ pathname = "/"; }
  $(".t199__menu a[href='"+url+"']").addClass("t-active");
  $(".t199__menu a[href='"+url+"/']").addClass("t-active");
  $(".t199__menu a[href='"+pathname+"']").addClass("t-active");
  $(".t199__menu a[href='/"+pathname+"']").addClass("t-active");
  $(".t199__menu a[href='"+pathname+"/']").addClass("t-active");
  $(".t199__menu a[href='/"+pathname+"/']").addClass("t-active");
}
 
function t213_init(recid){
    var el = $("#t213-marker"+recid);
    var cotimer;
    var wnd=$(window);
    var bdy=$('body');
    var needcolor=el.attr("data-bg-color");
    bdy.css("transition", "background-color 1000ms linear");
    if(window.t213higher===undefined)window.t213higher=1000000;
    if(window.t213higher>el.offset().top){
        window.t213higher=el.offset().top;
        window.t213higher_id=recid;
    }
    var bodydefcolor=bdy.css("background-color");
    var timer_count=0;

    wnd.scroll(function() {
        if(cotimer) {
            window.clearTimeout(cotimer);
            if(timer_count>=15){
                t212_timer_do(el,wnd,bdy,needcolor,bodydefcolor,recid);
            }
            timer_count++;
        }
        cotimer = window.setTimeout(function() {
            t212_timer_do(el,wnd,bdy,needcolor,bodydefcolor,recid);
            timer_count=0;
        }, 100);
    });        

    wnd.scroll();         
}

function t212_timer_do(el,wnd,bdy,needcolor,bodydefcolor,recid){
    var a,c,d,bc;
    a = el.offset().top;
    c = wnd.scrollTop();
    d = wnd.height();                  
    bc = bdy.attr("data-bg-color");

    if((c+d) >= a){
      bdy.css("background-color",needcolor);
    }else{
      if(window.t213higher_id==recid){
        bdy.css("background-color",bodydefcolor);
      }
    }    
} 
function t228_highlight(){
  var url=window.location.href;
  var pathname=window.location.pathname;
  if(url.substr(url.length - 1) == "/"){ url = url.slice(0,-1); }
  if(pathname.substr(pathname.length - 1) == "/"){ pathname = pathname.slice(0,-1); }
  if(pathname.charAt(0) == "/"){ pathname = pathname.slice(1); }
  if(pathname == ""){ pathname = "/"; }
  $(".t228__list_item a[href='"+url+"']").addClass("t-active");
  $(".t228__list_item a[href='"+url+"/']").addClass("t-active");
  $(".t228__list_item a[href='"+pathname+"']").addClass("t-active");
  $(".t228__list_item a[href='/"+pathname+"']").addClass("t-active");
  $(".t228__list_item a[href='"+pathname+"/']").addClass("t-active");
  $(".t228__list_item a[href='/"+pathname+"/']").addClass("t-active");
}

function t228_setPath(){
}

function t228_setWidth(recid){
  var window_width=$(window).width();
  if(window_width>980){
    $(".t228").each(function() {
      var el=$(this);
      var left_exist=el.find('.t228__leftcontainer').length;
      var left_w=el.find('.t228__leftcontainer').outerWidth(true);
      var max_w=left_w;
      var right_exist=el.find('.t228__rightcontainer').length;
      var right_w=el.find('.t228__rightcontainer').outerWidth(true);
	  var items_align=el.attr('data-menu-items-align');
      if(left_w<right_w)max_w=right_w;
      max_w=Math.ceil(max_w);
      var center_w=0;
      el.find('.t228__centercontainer').find('li').each(function() {
        center_w+=$(this).outerWidth(true);
      });
      //console.log(max_w);
      //console.log(center_w);
      var padd_w=40;
      var maincontainer_width=el.find(".t228__maincontainer").outerWidth(true);
      if(maincontainer_width-max_w*2-padd_w*2>center_w+20){
          //if(left_exist>0 && right_exist>0){
		  if(items_align=="center" || typeof items_align==="undefined"){
            el.find(".t228__leftside").css("min-width",max_w+"px");
            el.find(".t228__rightside").css("min-width",max_w+"px");
            el.find(".t228__list").css("opacity", "1");
          }
       }else{
          el.find(".t228__leftside").css("min-width","");
          el.find(".t228__rightside").css("min-width","");  
          
      }
    });
  }
}

function t228_setBg(recid){
  var window_width=$(window).width();
  if(window_width>980){
    $(".t228").each(function() {
      var el=$(this);
      if(el.attr('data-bgcolor-setbyscript')=="yes"){
        var bgcolor=el.attr("data-bgcolor-rgba");
        el.css("background-color",bgcolor);             
      }
      });
      }else{
        $(".t228").each(function() {
          var el=$(this);
          var bgcolor=el.attr("data-bgcolor-hex");
          el.css("background-color",bgcolor);
          el.attr("data-bgcolor-setbyscript","yes");
      });
  }
}

function t228_appearMenu(recid) {
      var window_width=$(window).width();
      if(window_width>980){
           $(".t228").each(function() {
                  var el=$(this);
                  var appearoffset=el.attr("data-appearoffset");
                  if(appearoffset!=""){
                          if(appearoffset.indexOf('vh') > -1){
                              appearoffset = Math.floor((window.innerHeight * (parseInt(appearoffset) / 100)));
                          }

                          appearoffset=parseInt(appearoffset, 10);

                          if ($(window).scrollTop() >= appearoffset) {
                            if(el.css('visibility') == 'hidden'){
                                el.finish();
                                el.css("top","-50px");  
                                el.css("visibility","visible");
                                el.animate({"opacity": "1","top": "0px"}, 200,function() {
                                });       
                            }
                          }else{
                            el.stop();
                            el.css("visibility","hidden");
                          }
                  }
           });
      }

}

function t228_changebgopacitymenu(recid) {
  var window_width=$(window).width();
  if(window_width>980){
    $(".t228").each(function() {
      var el=$(this);
      var bgcolor=el.attr("data-bgcolor-rgba");
      var bgcolor_afterscroll=el.attr("data-bgcolor-rgba-afterscroll");
      var bgopacityone=el.attr("data-bgopacity");
      var bgopacitytwo=el.attr("data-bgopacity-two");
      var menushadow=el.attr("data-menushadow");
      if(menushadow=='100'){
        var menushadowvalue=menushadow;
      }else{
        var menushadowvalue='0.'+menushadow;
      }
      if ($(window).scrollTop() > 20) {
        el.css("background-color",bgcolor_afterscroll);
        if(bgopacitytwo=='0' || menushadow==' '){
          el.css("box-shadow","none");
        }else{
          el.css("box-shadow","0px 1px 3px rgba(0,0,0,"+ menushadowvalue +")");
        }
      }else{
        el.css("background-color",bgcolor);
        if(bgopacityone=='0.0' || menushadow==' '){
          el.css("box-shadow","none");
        }else{
          el.css("box-shadow","0px 1px 3px rgba(0,0,0,"+ menushadowvalue +")");
        }
      }
    });
  }
}

function t228_createMobileMenu(recid) {
  var window_width=$(window).width();
  var el=$("#rec"+recid);
  var menu = el.find(".t228");
  var burger = el.find(".t228__mobile");
  if(980>window_width){
    burger.click(function(e){
      menu.fadeToggle(300);
      $(this).toggleClass("t228_opened");
    });
  }
}



 
window.t256showvideo = function(recid){
    $(document).ready(function(){
        var el = $('#coverCarry'+recid);
        var videourl = '';

        var youtubeid=$("#rec"+recid+" .t256__video-container").attr('data-content-popup-video-url-youtube');
        if(youtubeid > '') {
            videourl = 'https://www.youtube.com/embed/' + youtubeid;
        }

        $("body").addClass("t256__overflow");
		$("#rec"+recid+" .t256__cover").addClass( "t256__hidden");
        $("#rec"+recid+" .t256__video-container").removeClass( "t256__hidden");
        $("#rec"+recid+" .t256__video-carier").html("<iframe id=\"youtubeiframe"+recid+"\" class=\"t256__iframe\" width=\"100%\" height=\"540\" src=\"" + videourl + "?autoplay=1\" frameborder=\"0\" allowfullscreen></iframe><a class=\"t256__close-link\" href=\"javascript:t256hidevideo('"+recid+"');\"><div class=\"t256__close\"></div></a>");
    });
}

window.t256hidevideo = function(recid){
    $(document).ready(function(){
        $("body").removeClass("t256__overflow");
        $("#rec"+recid+" .t256__cover").removeClass( "t256__hidden");
        $("#rec"+recid+" .t256__video-container").addClass( "t256__hidden");
        $("#rec"+recid+" .t256__video-carier").html("<div class=\"t256__video-bg2\"></div>");
    });
} 
function t260_init(){
	$(".t260").each(function() {
		var el=$(this);
		if(el.attr('data-block-init')=='yes'){
		}else{
		  el.attr('data-block-init','yes');

          var toggler = el.find(".t260__header");
          var content = el.find(".t260__content");

          toggler.click(function() {
			$(this).toggleClass("t260__opened");
			if($(this).hasClass("t260__opened")==true){
				content.slideDown();
			}else{
				content.slideUp();
			}
          })

		}
	});
} 
window.t266showvideo = function(recid){
    $(document).ready(function(){
        var el = $('#coverCarry'+recid);
        var videourl = '';

        var youtubeid=$("#rec"+recid+" .t266__video-container").attr('data-content-popup-video-url-youtube');
        if(youtubeid > '') {
            videourl = 'https://www.youtube.com/embed/' + youtubeid;
        }

        $("body").addClass("t266__overflow");
		$("#rec"+recid+" .t266__cover").addClass("t266__hidden");
        $("#rec"+recid+" .t266__video-container").removeClass("t266__hidden");
        $("#rec"+recid+" .t266__video-carier").html("<iframe id=\"youtubeiframe"+recid+"\" class=\"t266__iframe\" width=\"100%\" height=\"540\" src=\"" + videourl + "?autoplay=1\" frameborder=\"0\" allowfullscreen></iframe><a class=\"t266__close-link\" href=\"javascript:t266hidevideo('"+recid+"');\"><div class=\"t266__close\"></div></a>");
    });
}

window.t266hidevideo = function(recid){
    $(document).ready(function(){
        $("body").removeClass("t266__overflow");
        $("#rec"+recid+" .t266__cover").removeClass("t266__hidden");
        $("#rec"+recid+" .t266__video-container").addClass("t266__hidden");
        $("#rec"+recid+" .t266__video-carier").html("<div class=\"t266__video-bg2\"></div>");
    });
} 
function t268_init(recid){
  var el=$("#rec"+recid);
  el.find(".t268__col-left").css({'height':(el.find(".t268__col-right").height()+'px')});

  $(window).resize(function(){
    el.find(".t268__col-left").css({'height':(el.find(".t268__col-right").height()+'px')});
  });
}
 
    var t279 = {};
    
    t279.equalheight = function(recid) {

        var currentTallest = 0,
            currentRowStart = 0,
            rowDivs = new Array(),
            $el,
            topPosition = 0;
            
        $('#rec'+recid+' .t279__textwrapper').each(function() {
     
            $el = $(this);
            $($el).height('auto')
            topPostion = $el.position().top;
       
            if (currentRowStart != topPostion) {
                for (currentDiv = 0 ; currentDiv < rowDivs.length ; currentDiv++) {
                    rowDivs[currentDiv].height(currentTallest);
                }
                rowDivs.length = 0;
                currentRowStart = topPostion;
                currentTallest = $el.height();
                rowDivs.push($el);
            } else {
                rowDivs.push($el);
                currentTallest = (currentTallest < $el.height()) ? ($el.height()) : (currentTallest);
            }
            for (currentDiv = 0 ; currentDiv < rowDivs.length ; currentDiv++) {
                rowDivs[currentDiv].height(currentTallest);
            }
        });
    };
 
function t281_showPopup(recid){
  var el=$('#rec'+recid).find('.t281');
  $('body').addClass('t281__body_popupshowed');
  if(el.find('.t281__popup').attr('style') && el.find('.t281__popup').attr('style') > '') {
    el.find('.t281__popup').attr('style','');
  }
  el.addClass('t281__popup_show');
  el.find('.t281__close, .t281__content, .t281__bg').click(function(){
  t281_closePopup();
  });
  $('.t281__mainblock').click(function( event ) {
    event.stopPropagation();
  });
  $(document).keydown(function(e) {
    if (e.keyCode == 27) {
     $('body').removeClass('t281__body_popupshowed');
      $('.t281').removeClass('t281__popup_show');
    }
  });
}

function t281_closePopup(){
  $('body').removeClass('t281__body_popupshowed');
  $('.t281').removeClass('t281__popup_show');
  $('.t281__mainblock').click(function( event ) {
    event.stopPropagation();
  });
}

function t281_resizePopup(recid){
  var el = $("#rec"+recid);
  var div = el.find(".t281__mainblock").height();
  var win = $(window).height() - 170;
  var popup = el.find(".t281__content");
  if (div > win ) {
    popup.addClass('t281__content_static');
  }
  else {
    popup.removeClass('t281__content_static');
  }
}

function t281_initPopup(recid){
  var el=$('#rec'+recid).find('.t281');
  var hook=el.attr('data-tooltip-hook');
  if(hook!==''){
      var obj = $('a[href="'+hook+'"]');
      obj.click(function(e){
        t281_showPopup(recid);
        t281_resizePopup(recid);
        e.preventDefault();
      });
  }
} 
function t282_showMenu(recid){
  var el=$("#rec"+recid);
  el.find('.t282__burger, .t282__menu__item:not(".tooltipstered"), .t282__overlay').click(function(){
    $('body').toggleClass('t282_opened');
    el.find('.t282__menu__container, .t282__overlay').toggleClass('t282__closed');
    el.find(".t282__menu__container").css({'top':(el.find(".t282__container").height()+'px')});
  });
}

function t282_changeSize(recid){
  var el=$("#rec"+recid);
  var bottomheight = el.find(".t282__menu__container");
  var headerheight = el.find(".t282__container");
  var menu = bottomheight.height() + headerheight.height();
  var win = $(window).height();
  if (menu > win ) {
    $("#nav"+recid).addClass('t282__menu_static');
  }
  else {
    $("#nav"+recid).removeClass('t282__menu_static');
  }
}

function t282_changeBgOpacityMenu(recid) {
 var window_width=$(window).width();
 var record = $("#rec"+recid);
 record.find(".t282__container__bg").each(function() {
    var el=$(this);
    var bgcolor=el.attr("data-bgcolor-rgba");
    var bgcolor_afterscroll=el.attr("data-bgcolor-rgba-afterscroll");
    var bgopacity=el.attr("data-bgopacity");
    var bgopacity_afterscroll=el.attr("data-bgopacity2");
    var menu_shadow=el.attr("data-menu-shadow");
    if ($(window).scrollTop() > 20) {
        el.css("background-color",bgcolor_afterscroll);
        if (bgopacity_afterscroll != "0" && bgopacity_afterscroll != "0.0") {
          el.css('box-shadow',menu_shadow);
        } else {
          el.css('box-shadow','none');
        }
    }else{
        el.css("background-color",bgcolor);
        if (bgopacity != "0" && bgopacity != "0.0") {
          el.css('box-shadow',menu_shadow);
        } else {
          el.css('box-shadow','none');
        }
    }
 });
}

function t282_highlight(recid){
  var url=window.location.href;
  var pathname=window.location.pathname;
  if(url.substr(url.length - 1) == "/"){ url = url.slice(0,-1); }
  if(pathname.substr(pathname.length - 1) == "/"){ pathname = pathname.slice(0,-1); }
  if(pathname.charAt(0) == "/"){ pathname = pathname.slice(1); }
  if(pathname == ""){ pathname = "/"; }
  $(".t282__menu a[href='"+url+"']").addClass("t-active");
  $(".t282__menu a[href='"+url+"/']").addClass("t-active");
  $(".t282__menu a[href='"+pathname+"']").addClass("t-active");
  $(".t282__menu a[href='/"+pathname+"']").addClass("t-active");
  $(".t282__menu a[href='"+pathname+"/']").addClass("t-active");
  $(".t282__menu a[href='/"+pathname+"/']").addClass("t-active");
}

function t282_appearMenu(recid) {
      var window_width=$(window).width();
           $(".t282").each(function() {
                  var el=$(this);
                  var appearoffset=el.attr("data-appearoffset");
                  if(appearoffset!=""){
                          if(appearoffset.indexOf('vh') > -1){
                              appearoffset = Math.floor((window.innerHeight * (parseInt(appearoffset) / 100)));
                          }

                          appearoffset=parseInt(appearoffset, 10);

                          if ($(window).scrollTop() >= appearoffset) {
                            if(el.css('visibility') == 'hidden'){
                                el.finish();
                                el.css("top","-50px");  
                                el.css("visibility","visible");
                                el.animate({"opacity": "1","top": "0px"}, 200,function() {
                                });       
                            }
                          }else{
                            el.stop();
                            el.css("visibility","hidden");
                          }
                  }
           });

}

 
function t330_showPopup(recid){
  var el=$('#rec'+recid).find('.t330');
  $('body').addClass('t330__body_popupshowed');
  if(el.find('.t330__popup').attr('style') && el.find('.t330__popup').attr('style') > '') {
    el.find('.t330__popup').attr('style','');
  }
  el.addClass('t330__popup_show');
  el.find('.t330__close, .t330__content, .t330__bg').click(function(){
  t330_closePopup();
  });
  $('.t330__mainblock').click(function( event ) {
    event.stopPropagation();
  });
  $(document).keydown(function(e) {
    if (e.keyCode == 27) {
     $('body').removeClass('t330__body_popupshowed');
      $('.t330').removeClass('t330__popup_show');
    }
});
}

function t330_closePopup(){
  $('body').removeClass('t330__body_popupshowed');
  $('.t330').removeClass('t330__popup_show');
  $('.t330__mainblock').click(function( event ) {
    event.stopPropagation();
  });
}

function t330_resizePopup(recid){
  var el = $("#rec"+recid);
  var div = el.find(".t330__mainblock").height();
  var win = $(window).height() - 170;
  var popup = el.find(".t330__content");
  if (div > win ) {
    popup.addClass('t330__content_static');
  }
  else {
    popup.removeClass('t330__content_static');
  }
}

function t330_initPopup(recid){
  var el=$('#rec'+recid).find('.t330');
  var hook=el.attr('data-tooltip-hook');
  if(hook!==''){
      var obj = $('a[href="'+hook+'"]');
      obj.click(function(e){
        t330_showPopup(recid);
        t330_resizePopup(recid);
        e.preventDefault();
      });
  }
} 
function t331_setHeight(recid){
  var el=$('#rec'+recid);
  var div = el.find(".t331__video-carier");
  var height=div.width() * 0.5625;
  div.height(height);
  div.parent().height(height);
}

function t331_showPopup(recid){
  var el=$('#rec'+recid).find('.t331');
  $('body').addClass('t331__body_popupshowed');
  var youtubeid = el.find(".t331__youtube").attr('data-content-popup-video-url-youtube');
  var videourl = 'https://www.youtube.com/embed/' + youtubeid;
  el.find(".t331__video-carier").html("<iframe id=\"youtubeiframe"+recid+"\" class=\"t331__iframe\" width=\"100%\" height=\"100%\" src=\"" + videourl + "?autoplay=1\" frameborder=\"0\" allowfullscreen></iframe>");
  el.addClass('t331__popup_show');
  el.find('.t331__close, .t331__bg').click(function(){
    t331_closePopup(recid);
  });
  $(document).keydown(function(e) {
    if (e.keyCode == 27) {
     $('body').removeClass('t331__body_popupshowed');
      $('.t331').removeClass('t331__popup_show');
      $("#rec"+recid+" .t331__video-carier").html("");
    }
  });
}

function t331_closePopup(recid){
  $('body').removeClass('t331__body_popupshowed');
  $('.t331').removeClass('t331__popup_show');
  $(".t331__video-carier").html("");
}

function t331_initPopup(recid){
  var el=$('#rec'+recid).find('.t331');
  var hook=el.attr('data-tooltip-hook');
  if(hook!==''){
      var obj = $('a[href="'+hook+'"]');
      obj.click(function(e){
        t331_showPopup(recid);
        t331_resizePopup(recid);
        e.preventDefault();
      });
  }
}

function t331_resizePopup(recid){
  var el = $("#rec"+recid);
  var div = el.find(".t331__mainblock").height();
  var win = $(window).height();
  var popup = el.find(".t331__content");
  if (div > win ) {
    popup.addClass('t331__content_static');
  }
  else {
    popup.removeClass('t331__content_static');
  }
} 
var t334 = {};
t334.initeffect = function (recid){
    $('#rec'+recid).find(".t334__cell").hover(function(){
      var sizer = $(this).find(".t334__button-container").height();
      $(this).find(".t334__textwrapper__content").css({'padding-bottom':(sizer+'px')});
      $(this).find(".t334__button-container").addClass("t334__button-container_show");
    }, function(){
      $(this).find(".t334__textwrapper__content").css("padding-bottom","0");
      $(this).find(".t334__button-container").removeClass("t334__button-container_show");
    });
};
  
 
	var t335 = {};
    t335.initeffect = function(recid) {
        $('#rec'+recid).find(".t335__cell").hover(function(){
            var sizer = $(this).find(".t335__button-container").height();
            $(this).find(".t335__textwrapper__content").css({'padding-bottom':(sizer+'px')});
            $(this).find(".t335__button-container").addClass("t335__button-container_show");
        }, function(){
            $(this).find(".t335__textwrapper__content").css("padding-bottom","0");
            $(this).find(".t335__button-container").removeClass("t335__button-container_show");
        });
    };
 
    var t336 = {};
    t336.initeffect = function(recid){
        $('#rec'+recid).find(".t336__cell").hover(function(){
            var sizer = $(this).find(".t336__button-container").height();
            $(this).find(".t336__textwrapper__content").css({'padding-bottom':(sizer+'px')});
            $(this).find(".t336__button-container").addClass("t336__button-container_show");
        }, function(){
            $(this).find(".t336__textwrapper__content").css("padding-bottom","0");
            $(this).find(".t336__button-container").removeClass("t336__button-container_show");
        });
    };
    
 
function t341_showCaptions(recid){
  var el=$("#t-carousel"+recid);
  var caption = el.find('.item:nth-child(1) .t-carousel__caption-inside');
  var captioncontainer = el.find('.t-carousel__caption__container');
  captioncontainer.html(caption.html());
  caption.css('display','none');

  $("#t-carousel"+recid).on('slide.bs.carousel', function(evt) {
    var el=$("#t-carousel"+recid);
    var caption = el.find('.item:nth-child(' + ($(evt.relatedTarget).index()+1) + ') .t-carousel__caption-inside');
    var captioncontainer = el.find('.t-carousel__caption__container');
    captioncontainer.html(caption.html());
    caption.css('display','none');
  });
}

function t341_checkSize(recid){
  var el=$("#rec"+recid);
  var containerinside = el.find(".t-carousel__arrows__container_inside");
  var containeroutside = el.find(".t-carousel__arrows__container_outside");
  var inner = el.find(".t-carousel__inner");
  var arrowleft = el.find(".t-carousel__arrow_left");
  var arrowright = el.find(".t-carousel__arrow_right");
  containeroutside.css({'max-width':(arrowleft.width()+arrowright.width()+inner.width()+ 60 +'px')});
  containerinside.css({'max-width':(inner.width()+'px')});

  var sizer = el.find('.t-carousel__height');
  var height = sizer.height();
  var width = sizer.width();
  if (width==0) {
    var width = $(window).width();
  }
  var ratio = width/height;
  var gallerywrapper = el.find(".t-carousel__checksize");
  var gallerywidth = gallerywrapper.width();

  if (height != $(window).height()) {
    gallerywrapper.css({'height':((gallerywidth/ratio)+'px')});
  }
} 
function t341_sendPaymentEventToStatistics(product, price) {
    var virtPage = '/tilda/order/?product='+product+'&price='+price;
    var virtTtitle = 'Order: '+product+' = '+price;
    if(ga) {
        if (window.mainTracker == 'tilda') {
            ga('tilda.send', {'hitType':'pageview', 'page':virtPage,'title':virtTtitle});
        } else {
            ga('send', {'hitType':'pageview', 'page':virtPage,'title':virtTtitle});
        }
    }
    
    if (window.mainMetrika > '' && window[window.mainMetrika]) {
        window[window.mainMetrika].hit(virtPage, {title: virtTtitle,referer: window.location.href});
    }
}

function t341_initStripePayment(recid, publishableapi, companyname, logo) {
	
	if (typeof StripeCheckout === 'object' ) {
		t341_handleStripeApiReady(recid,publishableapi, companyname, logo);
	} else {
		if(window.stripeapiiscalled!==true){
			var script = document.createElement("script");
			script.type = "text/javascript";
			script.src = "https://checkout.stripe.com/checkout.js";
			document.body.appendChild(script);
			window.stripeapiiscalled=true;
		}
		
		setTimeout(function(){
			t341_initStripePayment(recid, publishableapi, companyname, logo)
		}, 10);
	}

}

function t341_handleStripeApiReady(recid,publishableapi, companyname, logo) {
	if(! window.stripehandler) {
		window.stripehandler = StripeCheckout.configure({
			key: publishableapi,
			image: logo,
			name: (companyname ? companyname : window.location.host),
			locale: 'auto',
			token: function(token) {
				if (token && token.id) {
					t341_sendPaymentEventToStatistics($('#rec'+recid+' .js-product-name').val(), parseInt($('#rec'+recid+' .js-amount').val())*100);

					var data = {};
					data.projectid = $('#allrecords').attr('data-tilda-project-id');
					data.token = token.id;
					if (token.email) {
						data.email = token.email;
					}
					data.amount = parseInt($('#rec'+recid+' .js-amount').val())*100;
					data.products = [{
						product: $('#rec'+recid+' .js-product-name').val(),
						amount: parseInt($('#rec'+recid+' .js-amount').val())*100
						}
					];
					data.currency = $('#rec'+recid+' .js-currency').val();
					
					$.post('https://forms.tildacdn.com/payment/stripe/', data, function(json){
						},
						'json'
					);

					if ($('#rec'+recid+' .js-success-url').val() > '') {
						window.location.href = $('#rec'+recid+' .js-success-url').val();
					} else {
						$('#rec'+recid+' .t341__submit').val('Payed');
					}

				}
			}
		});
		// Close Checkout on page navigation:
		$(window).on('popstate', function() {
			window.stripehandler.close();
		});
	}
	
	$('#rec'+recid+' .t341__submit').on('click', function(e) {
		e.preventDefault();
		// Open Checkout with further options:
		window.stripehandler.open({
			name: companyname,
			image: logo,
			description: $('#rec'+recid+' .js-product-name').val(),
			amount: parseInt($('#rec'+recid+' .js-amount').val()*100),
			currency: $('#rec'+recid+' .js-currency').val(),
			shippingAddress: $('#rec'+recid+' .js-need-shipping').val() == '1' ? true : false,
			billingAddress: $('#rec'+recid+' .js-need-shipping').val() == '1' ? true : false,
		});
	});
}


function t341_initCloudPayments(recid, publishableapi) {
	
	if (typeof cp == "object" && typeof cp.CloudPayments == "function") {
		t341_handleCloudPaymentsApiReady(recid,publishableapi);
	} else {
		if(window.cloudpaymentsapiiscalled!==true){
			var script = document.createElement("script");
			script.type = "text/javascript";
			script.src = "https://widget.cloudpayments.ru/bundles/cloudpayments";
			document.body.appendChild(script);
			window.cloudpaymentsapiiscalled=true;
		}
		
		setTimeout(function(){
			t341_initCloudPayments(recid, publishableapi);
		}, 10);
	}

}

function t341_handleCloudPaymentsApiReady(recid,publishableapi) {
	
	$('#rec'+recid+' .t341__submit').on('click', function(e) {
		e.preventDefault();
		
		var currency = $('#rec'+recid+' .js-currency').val();
		if(! window.cloudpaymentshandler) {
			var lang='';
			if ( $('#rec'+recid+' .js-language').length > 0) {
				lang = $('#rec'+recid+' .js-language').val();
			}
			if (lang == '') {
				lang = (currency == 'RUB' || currency == 'BYR' ? 'ru-RU' : 'en-US');
			}
			window.cloudpaymentshandler = new cp.CloudPayments({language: lang});
		}

		/* Open Checkout with further options:*/
		window.cloudpaymentshandler.charge(
			{
				publicId: publishableapi, 
				description: $('#rec'+recid+' .js-product-name').val(), 
				amount: parseFloat($('#rec'+recid+' .js-amount').val()),
				currency: currency, 
			},
			function (options) { /* success*/
				//действие при успешной оплате
				t341_sendPaymentEventToStatistics($('#rec'+recid+' .js-product-name').val(), parseInt($('#rec'+recid+' .js-amount').val()));
				if ($('#rec'+recid+' .js-success-url').val() > '') {
					window.location.href = $('#rec'+recid+' .js-success-url').val();
				} else {
					$('#rec'+recid+' .t341__submit').val('Payed');
				}
				
			},
			function (reason, options) { // fail
				if ($('#rec'+recid+' .js-failure-url').val() > '') {
					window.location.href = $('#rec'+recid+' .js-failure-url').val();
				}
			}
		);
	});
}
 
function t342_sendPaymentEventToStatistics(product, price) {
	var virtPage = '/tilda/order/?product='+product+'&price='+price;
	var virtTtitle = 'Order: '+product+' = '+price;
	if(ga) {
		if (window.mainTracker == 'tilda') {
			ga('tilda.send', {'hitType':'pageview', 'page':virtPage,'title':virtTtitle});
		} else {
			ga('send', {'hitType':'pageview', 'page':virtPage,'title':virtTtitle});
		}
	}
	
	if (window.mainMetrika > '' && window[window.mainMetrika]) {
		window[window.mainMetrika].hit(virtPage, {title: virtTtitle,referer: window.location.href});
	}
}

function t342_initStripePayment(recid, publishableapi, companyname, logo) {
	
	if (typeof StripeCheckout === 'object' ) {
		t342_handleStripeApiReady(recid,publishableapi, companyname, logo);
	} else {
		if(window.stripeapiiscalled!==true){
			var script = document.createElement("script");
			script.type = "text/javascript";
			script.src = "https://checkout.stripe.com/checkout.js";
			document.body.appendChild(script);
			window.stripeapiiscalled=true;
		}
		
		setTimeout(function(){
			t342_initStripePayment(recid, publishableapi, companyname, logo)
		}, 10);
	}

}

function t342_handleStripeApiReady(recid, publishableapi, companyname, logo) {
	if(! window.stripehandler) {
		window.stripehandler = StripeCheckout.configure({
			key: publishableapi,
			image: logo,
			name: (companyname ? companyname : window.location.host),
			locale: 'auto'
		});
		// Close Checkout on page navigation:
		$(window).on('popstate', function() {
			window.stripehandler.close();
		});
	}
	
	$('[href^="#price"]').click(function(e){
		e.preventDefault();

		var t342click = $(this);
		var tmp = $(this).attr('href');
		// format:  #price:Cost:Product name
		var arParam = tmp.split(':');
		var productprice = parseInt(arParam[1].replace(/[^0-9\.]/g,''));
		var productname = arParam[2];
		if (! productname) {
			var tmp=$(this).closest('.r').find('.title');
			if (tmp.length > 0) {
				productname = tmp.text();
			}
			productname = $(this).text();
		}
		
		window.stripehandler.open({
			name: companyname,
			image: logo,
			description: productname,
			amount: parseInt(productprice)*100,
			currency: $('#rec'+recid+' .js-stripe-currency').val(),
			shippingAddress: $('#rec'+recid+' .js-stripe-need-shipping').val() == '1' ? true : false,
			billingAddress: $('#rec'+recid+' .js-stripe-need-shipping').val() == '1' ? true : false,
			token: function(token, args) {
				if (token && token.id) {
					t342_sendPaymentEventToStatistics(productname, productprice*100);

					var data = {};
					data.projectid = $('#allrecords').attr('data-tilda-project-id');
					data.token = token.id;
					if (token.email) {
						data.email = token.email;
					}
					data.amount = parseInt(productprice)*100;
					data.products = [{
						product: productname,
						amount: parseInt(productprice)*100
						}
					];
					data.currency = $('#rec'+recid+' .js-stripe-currency').val();
					
					$.post('https://forms.tildacdn.com/payment/stripe/', data, function(json){
							if ($('#rec'+recid+' .js-success-url').val() > '') {
								window.location.href = $('#rec'+recid+' .js-success-url').val();
							} else {
								t342click.html('<span style="vertical-align: middle;">Payed</span>');
							}

						},
						'json'
					).fail(function(){

						if ($('#rec'+recid+' .js-success-url').val() > '') {
							window.location.href = $('#rec'+recid+' .js-success-url').val();
						} else {
							t342click.html('<span style="vertical-align: middle;">Try, again</span>');
						}
					});
				}
			}
			
		});

	});
}

function t342_initCloudPayments(recid, publishableapi) {
	
	if (typeof cp == "object" && typeof cp.CloudPayments == "function") {
		t342_handleCloudPaymentsApiReady(recid,publishableapi);
	} else {
		if(window.cloudpaymentsapiiscalled!==true){
			var script = document.createElement("script");
			script.type = "text/javascript";
			script.src = "https://widget.cloudpayments.ru/bundles/cloudpayments";
			document.body.appendChild(script);
			window.cloudpaymentsapiiscalled=true;
		}
		
		setTimeout(function(){
			t342_initCloudPayments(recid, publishableapi);
		}, 10);
	}

}

function t342_handleCloudPaymentsApiReady(recid,publishableapi) {
	
	$('[href^="#price"]').click(function(e){
		e.preventDefault();

		var currency = $('#rec'+recid+' .js-currency').val();
		if(! window.cloudpaymentshandler) {
			var lang='';
			if ( $('#rec'+recid+' .js-language').length > 0) {
				lang = $('#rec'+recid+' .js-language').val();
			}
			if (lang == '') {
				lang = (currency == 'RUB' || currency == 'BYR' ? 'ru-RU' : 'en-US');
			}
			window.cloudpaymentshandler = new cp.CloudPayments({language: lang});
		}

		var t342click = $(this);
		var tmp = $(this).attr('href');
		// format:  #price:Cost:Product name
		var arParam = tmp.split(':');
		var productprice = parseFloat(arParam[1].replace(/[^0-9\.]/g,''));
		var productname = arParam[2];
		if (! productname) {
			var tmp=$(this).closest('.r').find('.title');
			if (tmp.length > 0) {
				productname = tmp.text();
			}
			productname = $(this).text();
		}

		/* Open Checkout with further options:*/
		window.cloudpaymentshandler.charge(
			{
				publicId: publishableapi, 
				description: productname, 
				amount: productprice,
				currency: currency, 
			},
			function (options) { /* success*/
				//действие при успешной оплате
				t342_sendPaymentEventToStatistics(productname, productprice);
				if ($('#rec'+recid+' .js-success-url').val() > '') {
					window.location.href = $('#rec'+recid+' .js-success-url').val();
				} else {
					t342click.html('OK');
				}
				
			},
			function (reason, options) { // fail
				if ($('#rec'+recid+' .js-failure-url').val() > '') {
					window.location.href = $('#rec'+recid+' .js-failure-url').val();
				}
			}
		);
	});
}

function t342_initPayment(recid){
	if ($('#allrecords').find('.t362').length == 0) {

		if ($('.js-stripe-publishable-key').length > 0) {
			t342_initStripePayment(recid, $('.js-stripe-publishable-key').val(), $('.js-stripe-company-name').val(), $('.js-stripe-logo').val());
		} else {
			if ($('.js-cp-key').length > 0) {
				t342_initCloudPayments(recid, $('.js-cp-key').val());
			} else {
				$('[href^="#price"]').click(function(e){
					e.preventDefault();
		
					var tmp = $(this).attr('href');
					// format:  #price:Cost:Product name
					var arParam = tmp.split(':');
					var price = parseInt(arParam[1].replace(/[^0-9\.]/g,''));
					var name = arParam[2];
					if (! name) {
						var tmp=$(this).closest('.r').find('.title');
						if (tmp.length > 0) {
							name = tmp.text();
						}
						name = $(this).text();
					}
			
					var $form = $('#formpayment'+recid);
					$form.find('.js_payment_product').val(name);
					$form.find('.js_payment_price').val(price);
					
					var $yabox = $('.js-yapayment-paymentbox');
					if ( $yabox.length > 0) {
						var $parent = $(this).parent();
						$($parent).css('position','relative');
						$('.js-yapayment-paymentbox').appendTo($parent);
						$('.js-yapayment-paymentbox').show();
		
						$('.r').click(function(){ $('.js-yapayment-paymentbox').hide(); $('.r').off('click'); return false; });
		
						$('.js-yapayment-paymentbox a').click(function(){
							$form.find('input[name=paymentType]').val($(this).data('payment-currency'));
							var $ctrl=$form.find('[name=customerNumber]');
							if($ctrl.length > 0) {
								$ctrl.val(new Date().getTime());
							}
							t342_sendPaymentEventToStatistics(name,price);
							$form.submit();
							return false;
						});
					} else {
						t342_sendPaymentEventToStatistics(name,price);
						$form.submit();
					}
					return false;
				});
			}
		}
	}
} 
function t349_floating_init(el){
    console.log('floating_init');

    var wnd=$(window);
    var col=el.parent();

    el.css('max-width',el.width());
    el.css('width','100%');
    col.css('min-height',el.height());

    var timer;
    var timer_count=0;
    var timer_react=5;

    wnd.scroll(function() {
        if(timer) {
            window.clearTimeout(timer);
            if(timer_count>=timer_react){
                t349_floating_scroll(el,wnd,col);
                timer_count=0;
            }
            timer_count++;
        }

        timer = window.setTimeout(function() {
                t349_floating_scroll(el,wnd,col);
                timer_count=0;    
        }, 50);
    });        


    wnd.resize(function() {
         wnd.scroll();
    });

    wnd.scroll();
}

function t349_floating_scroll(el,wnd,col){
    var wnd_height = wnd.height();
    var wnd_width = wnd.width();

    if(wnd_width<=1024){
        el.removeClass('t349__fixedTop');
        el.removeClass('t349__fixedBottom');
        el.removeClass('t349__floating');
        return('');
    }

    el.css('max-width',col.width());

    if(col.height()<el.height() && col.height()>0){
        col.height(el.height());
    }

    var el_height = el.height();
    var col_top = col.offset().top;
    var col_width = col.width();
    var col_height = col.height();
    var col_bottom = col_top + col_height;

    var wnd_top = wnd.scrollTop();
    var wnd_bottom = wnd_top + wnd_height;  

    if(wnd_top+el_height+50 >= col_bottom){
        //console.log('fixedbottom');
        el.addClass('t349__fixedBottom');
        el.removeClass('t349__fixedTop');
        el.removeClass('t349__floating');
    }else if(wnd_top+50 > col_top){
        //console.log('floating');
        el.addClass('t349__floating');
        el.removeClass('t349__fixedBottom');
        el.removeClass('t349__fixedTop');
    }else{
        //console.log('fixedtop');
        el.addClass('t349__fixedTop');
        el.removeClass('t349__fixedBottom');  
        el.removeClass('t349__floating');
    }
} 
function t351_setSize(recid){
  var el=$("#rec"+recid);
  var height = el.find(".t351__sizer").height();
  var width = el.find(".t351__sizer").width();
  var ratio = width/height;
  var imgwrapper = el.find(".t351__imgwrapper");
  var imgwidth = imgwrapper.width();
  imgwrapper.css({'height':((imgwidth/ratio)+'px')});
} 
function t368_alignVertical(recid){
  var el=$("#rec"+recid);
  el.find(".t368__video").css({'padding-bottom':(el.find(".t368__text").height()+12+'px')});
} 
function t381_appearMenu(recid) {
    var window_width=$(window).width();
    if(window_width>980){
         $(".t381").each(function() {
                var el=$(this);
                var appearoffset=el.attr("data-appearoffset");
                var hideoffset=el.attr("data-hideoffset");
                if(appearoffset!=""){
                        if(appearoffset.indexOf('vh') > -1){
                            appearoffset = Math.floor((window.innerHeight * (parseInt(appearoffset) / 100)));
                        }

                        appearoffset=parseInt(appearoffset, 10);

                        if ($(window).scrollTop() >= appearoffset) {
                          if(el.css('visibility') == 'hidden'){
                              el.finish();
                              el.css("visibility","visible");
                              el.animate({"opacity": "1"}, 300,function() {
                              });       
                          }
                        }else{
                          el.stop();
                          el.css("visibility","hidden");
                        }
                }

                if(hideoffset!=""){
                        if(hideoffset.indexOf('vh') > -1){
                            hideoffset = Math.floor((window.innerHeight * (parseInt(hideoffset) / 100)));
                        }

                        hideoffset=parseInt(hideoffset, 10);

                        if ($(window).scrollTop()+$(window).height() >= $(document).height() - hideoffset) {
                          if(el.css('visibility') != 'hidden'){
                              el.finish();
                              el.css("visibility","hidden");
                          }
                        }else{
                          if (appearoffset!="") {
                              if($(window).scrollTop() >= appearoffset){
                                el.stop();
                                el.css("visibility","visible");
                              }
                          }else{
                              el.stop();
                              el.css("visibility","visible");
                          }
                        }
                }
         });
    }
}

 
function t389_scrollToTop(){
  $('html, body').animate({scrollTop: 0}, 700);								
}	  
function t391_checkSize(recid){
  var el=$("#rec"+recid);
  var cover = el.find('.t-cover');
  var carrier = el.find('.t-cover__carrier');
  var filter = el.find('.t-cover__filter');
  var height = el.find('.t391__firstcol').height() + el.find('.t391__secondcol').height();
  if (window.matchMedia('(max-width: 960px)').matches) {
    cover.css('height',height);
    carrier.css('height',height);
    filter.css('height',height);
  }
} 
function t395_init(recid){
  var el=$('#rec'+recid);
  el.find('.t395__tab').click(function() {
    el.find('.t395__tab').removeClass('t395__tab_active');
    $(this).addClass('t395__tab_active');
  t395_alltabs_updateContent(recid);
    t395_updateSelect(recid);
    $('.t347').trigger('displayChanged');
    $('.t346').trigger('displayChanged');
    $('.t351, .t353, .t341, .t404, .t385, .t386, .t409, .t384, .t279, .t349, .t433, .t418').trigger('displayChanged');
    setTimeout(function(){
      $('.t351, .t353, .t341, .t404, .t385, .t386, .t409, .t384, .t279, .t349, .t410, .t433, .t418').trigger('displayChanged');
    },50);
  });
  t395_alltabs_updateContent(recid);
  t395_updateContentBySelect(recid);
  var bgcolor=el.css("background-color");
  var bgcolor_target=el.find(".t395__select, .t395__firefoxfix");
  bgcolor_target.css("background", bgcolor);
}

function t395_alltabs_updateContent(recid){
  var el=$('#rec'+recid);
  el.find(".t395__tab").each(function (i) {
    var rec_ids = $(this).attr('data-tab-rec-ids').split(',');
  rec_ids.forEach(function(rec_id, i, arr) {
    var rec_el=$('#rec'+rec_id);
    rec_el.attr('data-connect-with-tab','yes');
    rec_el.attr('data-animationappear','off');
    rec_el.addClass('t379__off');
  });
  });

  el.find(".t395__tab_active").each(function (i) {
    var rec_ids = $(this).attr('data-tab-rec-ids').split(',');
  rec_ids.forEach(function(rec_id, i, arr) {
    //console.log(rec_id);
    var rec_el=$('#rec'+rec_id);
    rec_el.removeClass('t379__off');
    rec_el.css('opacity','');
  });
  });
}

function t395_updateContentBySelect(recid) {
  var el=$('#rec'+recid);
  el.find(".t395__select").change(function() {
    var select_val = el.find(".t395__select").val();
    var tab_index = el.find(".t395__tab[data-tab-rec-ids='" + select_val + "']");
    tab_index.trigger('click');
  });
}

function t395_updateSelect(recid) {
  var el=$('#rec'+recid);
  var current_tab = el.find(".t395__tab_active").attr('data-tab-rec-ids');
  var el_select=el.find(".t395__select");
  el_select.val(current_tab);
}
 

function t396_init(data,recid){var res=t396_detectResolution();t396_initTNobj();t396_switchResolution(res);t396_updateTNobj();t396_artboard_build(data,recid);$( window ).resize(function () {tn_console('>>>> t396: Window on Resize event >>>>');t396_waitForFinalEvent(function(){var ww=$(window).width();var res=t396_detectResolution();var ab=$('#rec'+recid).find('.t396__artboard');t396_switchResolution(res);t396_updateTNobj();t396_ab__renderView(ab);t396_allelems__renderView(ab);}, 500, 'resizeruniqueid'+recid);});$( window ).load(function() {var ab=$('#rec'+recid).find('.t396__artboard');t396_allelems__renderView(ab);});}function t396_detectResolution(){var ww=$(window).width();var res;res=1200;if(ww<1200){res=960;}if(ww<960){res=640;}if(ww<640){res=480;}if(ww<480){res=320;}return(res);}function t396_initTNobj(){tn_console('func: initTNobj');window.tn={};window.tn.canvas_min_sizes = ["320","480","640","960","1200"];window.tn.canvas_max_sizes = ["480","640","960","1200",""];window.tn.ab_fields = ["height","width","bgcolor","bgimg","bgattachment","bgposition","filteropacity","filtercolor","filteropacity2","filtercolor2","height_vh","valign"];}function t396_updateTNobj(){tn_console('func: updateTNobj');window.tn.window_width = parseInt($(window).width());window.tn.window_height = parseInt($(window).height());if(window.tn.curResolution==1200){window.tn.canvas_min_width = 1200;window.tn.canvas_max_width = window.tn.window_width;}if(window.tn.curResolution==960){window.tn.canvas_min_width = 960;window.tn.canvas_max_width = 1200;}if(window.tn.curResolution==640){window.tn.canvas_min_width = 640;window.tn.canvas_max_width = 960;}if(window.tn.curResolution==480){window.tn.canvas_min_width = 480;window.tn.canvas_max_width = 640;}if(window.tn.curResolution==320){window.tn.canvas_min_width = 320;window.tn.canvas_max_width = 480;}window.tn.grid_width = window.tn.canvas_min_width;window.tn.grid_offset_left = parseFloat( (window.tn.window_width-window.tn.grid_width)/2 );}var t396_waitForFinalEvent = (function () {var timers = {};return function (callback, ms, uniqueId) {if (!uniqueId) {uniqueId = "Don't call this twice without a uniqueId";}if (timers[uniqueId]) {clearTimeout (timers[uniqueId]);}timers[uniqueId] = setTimeout(callback, ms);};})();function t396_switchResolution(res,resmax){tn_console('func: switchResolution');if(typeof resmax=='undefined'){if(res==1200)resmax='';if(res==960)resmax=1200;if(res==640)resmax=960;if(res==480)resmax=640;if(res==320)resmax=480;}window.tn.curResolution=res;window.tn.curResolution_max=resmax;}function t396_artboard_build(data,recid){tn_console('func: t396_artboard_build. Recid:'+recid);tn_console(data);/* set style to artboard */var ab=$('#rec'+recid).find('.t396__artboard');var ab_fields=window.tn.ab_fields;ab_fields.forEach(function(field, i, arr) {var value=data['ab_'+field];/* default values of undefined fields */if( typeof value=='undefined' ){value='';if(field=='filteropacity')value='0.5';if(field=='filteropacity2')value='0.5';if(field=='bgattachment')value='scroll';if(field=='bgposition')value='center center';if(field=='valign')value='center';}t396_ab__setFieldValue(ab,field,value,'1200');/* set other resolutions */var r;r=data['ab_'+field+'-res-960'];if(typeof r!=='undefined')t396_ab__setFieldValue(ab,field,r,'960');r=data['ab_'+field+'-res-640'];if(typeof r!=='undefined')t396_ab__setFieldValue(ab,field,r,'640');r=data['ab_'+field+'-res-480'];if(typeof r!=='undefined')t396_ab__setFieldValue(ab,field,r,'480');r=data['ab_'+field+'-res-320'];if(typeof r!=='undefined')t396_ab__setFieldValue(ab,field,r,'320');});t396_ab__renderView(ab);/* create elements */for(var key in data){var item=data[key];if(item.elem_type=='text'){t396_addText(ab,item);}if(item.elem_type=='image'){t396_addImage(ab,item);}if(item.elem_type=='shape'){t396_addShape(ab,item);}if(item.elem_type=='button'){t396_addButton(ab,item);}}}function t396_ab__renderView(ab){var fields = window.tn.ab_fields;fields.forEach(function(field, i, arr) {t396_ab__renderViewOneField(ab,field);});var ab_min_height=t396_ab__getFieldValue(ab,'height');var ab_max_height=t396_ab__getHeight(ab);var offset_top=0;if(ab_min_height==ab_max_height){offset_top=0;}else{var ab_valign=t396_ab__getFieldValue(ab,'valign');if(ab_valign=='top'){offset_top=0;}else if(ab_valign=='center'){offset_top=parseFloat( (ab_max_height-ab_min_height)/2 ).toFixed(1);}else if(ab_valign=='bottom'){offset_top=parseFloat( (ab_max_height-ab_min_height) ).toFixed(1);}else if(ab_valign=='stretch'){offset_top=0;ab_min_height=ab_max_height;}else{offset_top=0;}}ab.attr('data-artboard-proxy-min-offset-top',offset_top);ab.attr('data-artboard-proxy-min-height',ab_min_height);ab.attr('data-artboard-proxy-max-height',ab_max_height);}function t396_addText(ab,data){tn_console('func: addText');if( typeof data.rotate=='undefined' ) data.rotate='0';if( typeof data.opacity=='undefined' ) data.opacity='1';if( typeof data.container=='undefined' ) data.container='grid';if( typeof data.axisy=='undefined' ) data.axisy='top';if( typeof data.axisx=='undefined' ) data.axisx='left';if( typeof data.link=='undefined' ) data.link='';if( typeof data.linktarget=='undefined' ) data.linktarget='';if( typeof data.borderwidth=='undefined' ) data.borderwidth='';if( typeof data.borderstyle=='undefined' ) data.borderstyle='';if( typeof data.bordercolor=='undefined' ) data.bordercolor='';if( typeof data.borderradius=='undefined' ) data.borderradius='';if( typeof data.animtriggerhook=='undefined' ) data.animtriggerhook='';if( typeof data.animduration=='undefined' ) data.animduration='';if( typeof data.animoffset=='undefined' ) data.animoffset='';if( typeof data.leftunits=='undefined' ) data.leftunits='';if( typeof data.topunits=='undefined' ) data.topunits='';if( typeof data.widthunits=='undefined' ) data.widthunits='';if( typeof data.tag=='undefined' ) data.tag='div';if( typeof data.align=='undefined' ) data.align='left';if( typeof data.letterspacing=='undefined' ) data.letterspacing='0';if( typeof data.text=='undefined' ) data.text='';var elem_id=data.elem_id;var elem_type=data.elem_type;/* add wrapper */ab.append("<div class='t396__elem tn-elem' data-elem-id='"+elem_id+"' data-elem-type='"+elem_type+"'></div>");var el=ab.find("[data-elem-id="+elem_id+"]");if(data.link!=''){el.html("<a class='tn-atom'></a>");}else if(data.tag=='h1'){el.html("<h1 class='tn-atom'></h1>");}else{el.html("<div class='tn-atom' field='tn_text_"+data.elem_id+"'></div>");}/* ekranirovanie */if(data.link!=''){var link=data.link; link.t396_replaceAll('"', '&quot;' ); data.link=link;}else{var link='';}el.find(".tn-atom").html(data['text']);/* add data atributes */var fields_str='top,left,align,fontsize,width,color,fontfamily,lineheight,fontweight,letterspacing,opacity,rotate,zindex,container,axisx,axisy,tag,link,linktarget,animtriggerhook,animduration,animoffset,animparallax,widthunits,leftunits,topunits';var fields=fields_str.split(',');el.attr('data-fields',fields_str);/* set field values */fields.forEach(function(field, i, arr) {var value=data[field];t396_elem__setFieldValue(el,field,value,'','','1200');/* set other resolutions */var r;r=data[field+'-res-960'];if(typeof r!=='undefined')t396_elem__setFieldValue(el,field,r,'','','960');r=data[field+'-res-640'];if(typeof r!=='undefined')t396_elem__setFieldValue(el,field,r,'','','640');r=data[field+'-res-480'];if(typeof r!=='undefined')t396_elem__setFieldValue(el,field,r,'','','480');r=data[field+'-res-320'];if(typeof r!=='undefined')t396_elem__setFieldValue(el,field,r,'','','320');});/* render elem view */t396_elem__renderView(el);}function t396_addImage(ab,data){tn_console('func: addImage');if( typeof data.rotate=='undefined' ) data.rotate='0';if( typeof data.opacity=='undefined' ) data.opacity='1';if( typeof data.container=='undefined' ) data.container='grid';if( typeof data.axisy=='undefined' ) data.axisy='top';if( typeof data.axisx=='undefined' ) data.axisx='left';if( typeof data.link=='undefined' ) data.link='';if( typeof data.linktarget=='undefined' ) data.linktarget='';if( typeof data.borderwidth=='undefined' ) data.borderwidth='';if( typeof data.borderstyle=='undefined' ) data.borderstyle='';if( typeof data.bordercolor=='undefined' ) data.bordercolor='';if( typeof data.borderradius=='undefined' ) data.borderradius='';if( typeof data.animtriggerhook=='undefined' ) data.animtriggerhook='';if( typeof data.animduration=='undefined' ) data.animduration='';if( typeof data.animoffset=='undefined' ) data.animoffset='';if( typeof data.lock=='undefined' ) data.lock='';if( typeof data.leftunits=='undefined' ) data.leftunits='';if( typeof data.topunits=='undefined' ) data.topunits='';if( typeof data.widthunits=='undefined' ) data.widthunits='';if( typeof data.alt=='undefined' ) data.alt='';if( typeof data.filewidth=='undefined' ) data.filewidth='';if( typeof data.fileheight=='undefined' ) data.fileheight='';var elem_id=data.elem_id;var elem_type=data.elem_type;/* add wrapper */ab.append("<div class='t396__elem tn-elem' data-elem-id='"+elem_id+"' data-elem-type='"+elem_type+"'></div>");var el=ab.find("[data-elem-id="+elem_id+"]");/* ekranirovanie */if(data.alt!=''){var alt=data.alt; alt.t396_replaceAll('"', '&quot;' ); data.alt=alt;}else{var alt='';}if(data.link!=''){var link=data.link; link.t396_replaceAll('"', '&quot;' ); data.link=link;}else{var link='';}/* add element html and fish content */if(data.link!=''){el.html("<a class='tn-atom'></a>");}else{el.html("<div class='tn-atom'></div>");}el.find(".tn-atom").html("<img src='' class='tn-atom__img' imgfield='tn_img_"+elem_id+"'>");/* add data atributes */var fields_str='img,width,filewidth,fileheight,top,left,opacity,rotate,zindex,container,axisx,axisy,link,linktarget,borderwidth,borderradius,bordercolor,borderstyle,shadowcolor,shadowopacity,shadowblur,shadowspread,shadowx,shadowy,alt,animtriggerhook,animduration,animoffset,animparallax,widthunits,leftunits,topunits';var fields=fields_str.split(',');el.attr('data-fields',fields_str);/* set field values */fields.forEach(function(field, i, arr) {var value=data[field];t396_elem__setFieldValue(el,field,value,'','','1200');/* set other resolutions */var r;r=data[field+'-res-960'];if(typeof r!=='undefined')t396_elem__setFieldValue(el,field,r,'','','960');r=data[field+'-res-640'];if(typeof r!=='undefined')t396_elem__setFieldValue(el,field,r,'','','640');r=data[field+'-res-480'];if(typeof r!=='undefined')t396_elem__setFieldValue(el,field,r,'','','480');r=data[field+'-res-320'];if(typeof r!=='undefined')t396_elem__setFieldValue(el,field,r,'','','320');});/* render elem view */t396_elem__renderView(el);el.find('img').one("load", function() {t396_elem__renderViewOneField(el,'top');}).each(function() {if(this.complete) $(this).load();}); el.find('img').on('tuwidget_done', function(e, file) { t396_elem__renderViewOneField(el,'top');});}function t396_addShape(ab,data){tn_console('func: addShape');if( typeof data.rotate=='undefined' ) data.rotate='0';if( typeof data.opacity=='undefined' ) data.opacity='1';if( typeof data.container=='undefined' ) data.container='grid';if( typeof data.axisy=='undefined' ) data.axisy='top';if( typeof data.axisx=='undefined' ) data.axisx='left';if( typeof data.link=='undefined' ) data.link='';if( typeof data.linktarget=='undefined' ) data.linktarget='';if( typeof data.borderwidth=='undefined' ) data.borderwidth='';if( typeof data.borderstyle=='undefined' ) data.borderstyle='';if( typeof data.bordercolor=='undefined' ) data.bordercolor='';if( typeof data.borderradius=='undefined' ) data.borderradius='';if( typeof data.animtriggerhook=='undefined' ) data.animtriggerhook='';if( typeof data.animduration=='undefined' ) data.animduration='';if( typeof data.animoffset=='undefined' ) data.animoffset='';if( typeof data.lock=='undefined' ) data.lock='';if( typeof data.leftunits=='undefined' ) data.leftunits='';if( typeof data.topunits=='undefined' ) data.topunits='';if( typeof data.bgimg=='undefined' ) data.bgimg='';if( typeof data.bgattachment=='undefined' )data.bgattachment='static';if( typeof data.bgposition=='undefined' )data.bgposition='center center';if( typeof data.heightunits=='undefined' ) data.heightunits='';if( typeof data.widthunits=='undefined' ) data.widthunits='';if( typeof data.bgcolor=='undefined' ) data.bgcolor='';var elem_id=data.elem_id;var elem_type=data.elem_type;/* add wrapper */ab.append("<div class='t396__elem tn-elem' data-elem-id='"+elem_id+"' data-elem-type='"+elem_type+"'></div>");var el=ab.find("[data-elem-id="+elem_id+"]");/* add element html and fish content */if(data.link!=''){el.html("<a class='tn-atom'></a>");}else{el.html("<div class='tn-atom'></div>");}/* ekranirovanie */if(data.link!=''){var link=data.link; link.t396_replaceAll('"', '&quot;' ); data.link=link;}else{var link='';}/* add data atributes */var fields_str='width,height,bgcolor,bgimg,bgattachment,bgposition,top,left,opacity,';fields_str+='rotate,zindex,container,axisx,axisy,link,linktarget,borderwidth,borderradius,bordercolor,borderstyle,shadowcolor,shadowopacity,shadowblur,shadowspread,shadowx,shadowy,animtriggerhook,animduration,animoffset,animparallax,widthunits,heightunits,leftunits,topunits';var fields=fields_str.split(',');el.attr('data-fields',fields_str);/* set field values */fields.forEach(function(field, i, arr) {var value=data[field];t396_elem__setFieldValue(el,field,value,'','','1200');/* set other resolutions */var r;r=data[field+'-res-960'];if(typeof r!=='undefined')t396_elem__setFieldValue(el,field,r,'','','960');r=data[field+'-res-640'];if(typeof r!=='undefined')t396_elem__setFieldValue(el,field,r,'','','640');r=data[field+'-res-480'];if(typeof r!=='undefined')t396_elem__setFieldValue(el,field,r,'','','480');r=data[field+'-res-320'];if(typeof r!=='undefined')t396_elem__setFieldValue(el,field,r,'','','320');});/* render elem view */t396_elem__renderView(el);}function t396_addButton(ab,data){tn_console('func: addButton');if( typeof data.rotate=='undefined' ) data.rotate='0';if( typeof data.opacity=='undefined' ) data.opacity='1';if( typeof data.container=='undefined' ) data.container='grid';if( typeof data.axisy=='undefined' ) data.axisy='top';if( typeof data.axisx=='undefined' ) data.axisx='left';if( typeof data.link=='undefined' ) data.link='';if( typeof data.linktarget=='undefined' ) data.linktarget='';if( typeof data.borderwidth=='undefined' ) data.borderwidth='';if( typeof data.borderstyle=='undefined' ) data.borderstyle='';if( typeof data.bordercolor=='undefined' ) data.bordercolor='';if( typeof data.borderradius=='undefined' ) data.borderradius='';if( typeof data.animtriggerhook=='undefined' ) data.animtriggerhook='';if( typeof data.animduration=='undefined' ) data.animduration='';if( typeof data.animoffset=='undefined' ) data.animoffset='';if( typeof data.lock=='undefined' ) data.lock='';if( typeof data.leftunits=='undefined' ) data.leftunits='';if( typeof data.topunits=='undefined' ) data.topunits='';if( typeof data.topunits=='undefined' ) data.topunits='';if( typeof data.letterspacing=='undefined' ) data.letterspacing='0';if( typeof data.align=='undefined' ) data.align='left';if( typeof data.colorhover=='undefined' ) data.colorhover='';if( typeof data.bordercolorhover=='undefined' ) data.bordercolorhover='';if( typeof data.bgcolorhover=='undefined' ) data.bgcolorhover='';if( typeof data.speedhover=='undefined' ) data.speedhover='';if( typeof data.color=='undefined' ) data.color='';if( typeof data.bgcolor=='undefined' ) data.bgcolor='';if( typeof data.caption=='undefined' ) data.caption='';var elem_id=data.elem_id;var elem_type=data.elem_type;/* add wrapper */ab.append("<div class='t396__elem tn-elem' id='"+elem_id+"' data-elem-id='"+elem_id+"' data-elem-type='"+elem_type+"'></div>");var el=ab.find("[data-elem-id="+elem_id+"]");/* add element html and fish content */if(data.link!=''){el.html("<a class='tn-atom'></a>");}else{el.html("<div class='tn-atom'></div>");}/* ekranirovanie */if(data.link!=''){var link=data.link; link.t396_replaceAll('"', '&quot;' ); data.link=link;}else{var link='';}if(data.caption!=''){var caption=data.caption; caption.t396_replaceAll('"', '&quot;' ); data.caption=caption;}else{var caption='';}el.find(".tn-atom").html("" + data.caption + "");/* add data atributes */var fields_str='top,left,align,fontsize,width,height,color,fontfamily,lineheight,fontweight,letterspacing,bgcolor,opacity,rotate,zindex,container,axisx,axisy,caption,link,linktarget,borderwidth,borderradius,bordercolor,borderstyle,shadowcolor,shadowopacity,shadowblur,shadowspread,shadowx,shadowy,animtriggerhook,animduration,animoffset,animparallax,bgcolorhover,bordercolorhover,colorhover,speedhover,leftunits,topunits';var fields=fields_str.split(',');el.attr('data-fields',fields_str);/* set field values */fields.forEach(function(field, i, arr) {var value=data[field];t396_elem__setFieldValue(el,field,value);/* set other resolutions */var r;r=data[field+'-res-960'];if(typeof r!=='undefined')t396_elem__setFieldValue(el,field,r,'','','960');r=data[field+'-res-640'];if(typeof r!=='undefined')t396_elem__setFieldValue(el,field,r,'','','640');r=data[field+'-res-480'];if(typeof r!=='undefined')t396_elem__setFieldValue(el,field,r,'','','480');r=data[field+'-res-320'];if(typeof r!=='undefined')t396_elem__setFieldValue(el,field,r,'','','320');});/* render elem view */t396_elem__renderView(el);return(el);}function t396_elem__setFieldValue(el,prop,val,flag_render,flag_updateui,res){if(res=='')res=window.tn.curResolution;if(res<1200 && prop!='zindex'){el.attr('data-field-'+prop+'-res-'+res+'-value',val);}else{el.attr('data-field-'+prop+'-value',val);}if(flag_render=='render')elem__renderViewOneField(el,prop);if(flag_updateui=='updateui')panelSettings__updateUi(el,prop,val);}function t396_elem__getFieldValue(el,prop){var res=window.tn.curResolution;var r;if(res<1200){if(res==960){r=el.attr('data-field-'+prop+'-res-960-value');if(typeof r=='undefined'){r=el.attr('data-field-'+prop+'-value');}}if(res==640){r=el.attr('data-field-'+prop+'-res-640-value');if(typeof r=='undefined'){r=el.attr('data-field-'+prop+'-res-960-value');if(typeof r=='undefined'){r=el.attr('data-field-'+prop+'-value');}}}if(res==480){r=el.attr('data-field-'+prop+'-res-480-value');if(typeof r=='undefined'){r=el.attr('data-field-'+prop+'-res-640-value');if(typeof r=='undefined'){r=el.attr('data-field-'+prop+'-res-960-value');if(typeof r=='undefined'){r=el.attr('data-field-'+prop+'-value');}}}}if(res==320){r=el.attr('data-field-'+prop+'-res-320-value');if(typeof r=='undefined'){r=el.attr('data-field-'+prop+'-res-480-value');if(typeof r=='undefined'){r=el.attr('data-field-'+prop+'-res-640-value');if(typeof r=='undefined'){r=el.attr('data-field-'+prop+'-res-960-value');if(typeof r=='undefined'){r=el.attr('data-field-'+prop+'-value');}}}}}}else{r=el.attr('data-field-'+prop+'-value');}return(r);}function t396_elem__renderView(el){tn_console('func: elem__renderView');var fields=el.attr('data-fields');if(! fields) {return false;}fields = fields.split(',');/* set to element value of every fieldvia css */fields.forEach(function(field, i, arr) {t396_elem__renderViewOneField(el,field);});}function t396_elem__renderViewOneField(el,field){var value=t396_elem__getFieldValue(el,field);if(field=='left'){value = t396_elem__convertPosition__Local__toAbsolute(el,field,value);el.css('left',parseFloat(value).toFixed(1)+'px');}if(field=='top'){value = t396_elem__convertPosition__Local__toAbsolute(el,field,value);el.css('top',parseFloat(value).toFixed(1)+'px');}if(field=='width'){value = t396_elem__getWidth(el,value);el.css('width',parseFloat(value).toFixed(1)+'px');}if(field=='height'){value=t396_elem__getHeight(el,value);el.css('height', parseFloat(value).toFixed(1)+'px');}if(field=='color'){el.css('color',value);el.find('.tn-atom').css('color',value);}if(field=='align')el.css('text-align',value);if(field=='fontfamily')el.find('.tn-atom').css('font-family',value);if(field=='fontsize')el.find('.tn-atom').css('font-size',parseInt(value)+'px');if(field=='lineheight')el.find('.tn-atom').css('line-height',parseFloat(value));if(field=='fontweight')el.find('.tn-atom').css('font-weight',parseInt(value));if(field=='letterspacing')el.find('.tn-atom').css('letter-spacing',parseFloat(value)+'px');if(field=='zindex')el.css('z-index',parseInt(value));if(field=='bgcolor')el.find('.tn-atom').css('background-color',value);if(field=='bgattachment'){var res=window.tn.curResolution;if(res<=960)value='scroll';el.find('.tn-atom').css('background-attachment',value);}if(field=='bgposition')el.find('.tn-atom').css('background-position',value);if(field=='borderwidth')el.find('.tn-atom').css('border-width',parseInt(value)+'px');if(field=='borderradius'){el.find('.tn-atom__img').css('border-radius',parseInt(value)+'px');el.find('.tn-atom').css('border-radius',parseInt(value)+'px');}if(field=='bordercolor'){if(value=='')value='transparent';el.find('.tn-atom').css('border-color',value);}if(field=='borderstyle'){if(value=='')value='solid';el.find('.tn-atom').css('border-style',value);}if(field=='container'){t396_elem__renderViewOneField(el,'left');t396_elem__renderViewOneField(el,'top');}if(field=='opacity'){el.find('.tn-atom').css('opacity',parseFloat(value).toFixed(2));}if(field=='rotate'){var e=el.find('.tn-atom');e.css({ 'WebkitTransform': 'rotate(' + parseInt(value) + 'deg)'});e.css({ '-moz-transform': 'rotate(' + parseInt(value) + 'deg)'});}if(field=='img'){el.find('.tn-atom__img').attr('src',value);}if(field=='bgimg'){if(typeof value=='undefined')value='';el.find('.tn-atom').css('background-image','url(' + value + ')');el.find('.tn-atom').css('background-size','cover');el.find('.tn-atom').css('background-repeat','no-repeat');}if(field=='alt'){el.find('.tn-atom__img').attr('alt',value);}if(field=='link'){el.find('.tn-atom').attr('href',value);}if(field=='linktarget'){el.find('.tn-atom').attr('target',value);}if(field=='shadowcolor' || field=='shadowopacity' || field=='shadowx' || field=='shadowy' || field=='shadowblur' || field=='shadowspread'){var s_c=t396_elem__getFieldValue(el,'shadowcolor');var s_o=parseFloat(t396_elem__getFieldValue(el,'shadowopacity'));var s_x=parseInt(t396_elem__getFieldValue(el,'shadowx'));var s_y=parseInt(t396_elem__getFieldValue(el,'shadowy'));var s_b=parseInt(t396_elem__getFieldValue(el,'shadowblur'));var s_s=parseInt(t396_elem__getFieldValue(el,'shadowspread'));if(isNaN(s_o))s_o=1;if(isNaN(s_x))s_x=0;if(isNaN(s_y))s_y=0;if(isNaN(s_b))s_b=0;if(isNaN(s_s))s_s=0;if(s_o!=1 && typeof s_c!='undefined' && s_c!=''){var s_rgb=t396_hex2rgb(s_c);s_c="rgba("+s_rgb[0]+","+s_rgb[1]+","+s_rgb[2]+","+s_o+")";}if(typeof s_c=='undefined' || s_c==''){el.find('.tn-atom').css('box-shadow', 'none');}else{el.find('.tn-atom').css('box-shadow', ''+s_x+'px '+s_y+'px '+s_b+'px '+s_s+'px '+s_c+'');}}if(field=='caption'){el.find('.tn-atom').html(value);}if(field=='bgcolorhover'){el.hover(function() {if(value=='')value=t396_elem__getFieldValue(el,'bgcolor');if(value=='' || typeof value=='undefined')value='transparent';el.find('.tn-atom').css('background-color',value);}, function() {var bgpre=t396_elem__getFieldValue(el,'bgcolor');el.find('.tn-atom').css('background-color',bgpre);});}if(field=='bordercolorhover'){el.hover(function() {if(value=='')value=t396_elem__getFieldValue(el,'bordercolor');if(value=='' || typeof value=='undefined')value='transparent';el.find('.tn-atom').css('border-color',value);}, function() {var colorpre=t396_elem__getFieldValue(el,'bordercolor');if(colorpre=='')colorpre='transparent';el.find('.tn-atom').css('border-color',colorpre);});}if(field=='colorhover'){el.hover(function() {if(value=='')value=t396_elem__getFieldValue(el,'color');if(value=='' || typeof value=='undefined')value='transparent';el.find('.tn-atom').css('color',value);}, function() {var colorpre=t396_elem__getFieldValue(el,'color');if(colorpre=='')colorpre='transparent';el.find('.tn-atom').css('color',colorpre);});}if(field=='speedhover'){if(value>-1){el.find('.tn-atom').css({transition : 'background-color '+parseFloat(value)+'s ease-in-out, color '+parseFloat(value)+'s ease-in-out, border-color '+parseFloat(value)+'s ease-in-out'});}}if(field=='width' || field=='height' || field=='fontsize' || field=='fontfamily' || field=='letterspacing' || field=='fontweight' || field=='img'){t396_elem__renderViewOneField(el,'left');t396_elem__renderViewOneField(el,'top');}}function t396_elem__convertPosition__Local__toAbsolute(el,field,value){value = parseInt(value);if(field=='left'){var el_container,offset_left,el_container_width,el_width;var container=t396_elem__getFieldValue(el,'container');if(container=='grid'){el_container = 'grid';offset_left = window.tn.grid_offset_left;el_container_width = window.tn.grid_width;}else{el_container = 'window';offset_left = 0;el_container_width = window.tn.window_width;}/* fluid or not*/var el_leftunits=t396_elem__getFieldValue(el,'leftunits');if(el_leftunits=='%'){value = tn_roundFloat( el_container_width * value/100 );}value = offset_left + value;var el_axisx=t396_elem__getFieldValue(el,'axisx');if(el_axisx=='center'){el_width = t396_elem__getWidth(el);value = el_container_width/2 - el_width/2 + value;}if(el_axisx=='right'){el_width = t396_elem__getWidth(el);value = el_container_width - el_width + value;}}if(field=='top'){var ab=el.parent();var el_container,offset_top,el_container_height,el_height;var container=t396_elem__getFieldValue(el,'container');if(container=='grid'){el_container = 'grid';offset_top = parseFloat( ab.attr('data-artboard-proxy-min-offset-top') );el_container_height = parseFloat( ab.attr('data-artboard-proxy-min-height') );}else{el_container = 'window';offset_top = 0;el_container_height = parseFloat( ab.attr('data-artboard-proxy-max-height') );}/* fluid or not*/var el_topunits=t396_elem__getFieldValue(el,'topunits');if(el_topunits=='%'){value = ( el_container_height * (value/100) );}value = offset_top + value;var el_axisy=t396_elem__getFieldValue(el,'axisy');if(el_axisy=='center'){/* var el_height=parseFloat(el.innerHeight()); */el_height=t396_elem__getHeight(el);value = el_container_height/2 - el_height/2 + value;}if(el_axisy=='bottom'){/* var el_height=parseFloat(el.innerHeight()); */el_height=t396_elem__getHeight(el);value = el_container_height - el_height + value;} }return(value);}function t396_ab__setFieldValue(ab,prop,val,res){/* tn_console('func: ab__setFieldValue '+prop+'='+val);*/if(res=='')res=window.tn.curResolution;if(res<1200){ab.attr('data-artboard-'+prop+'-res-'+res,val);}else{ab.attr('data-artboard-'+prop,val);}}function t396_ab__getFieldValue(ab,prop){var res=window.tn.curResolution;var r;if(res<1200){if(res==960){r=ab.attr('data-artboard-'+prop+'-res-960');if(typeof r=='undefined'){r=ab.attr('data-artboard-'+prop+'');}}if(res==640){r=ab.attr('data-artboard-'+prop+'-res-640');if(typeof r=='undefined'){r=ab.attr('data-artboard-'+prop+'-res-960');if(typeof r=='undefined'){r=ab.attr('data-artboard-'+prop+'');}}}if(res==480){r=ab.attr('data-artboard-'+prop+'-res-480');if(typeof r=='undefined'){r=ab.attr('data-artboard-'+prop+'-res-640');if(typeof r=='undefined'){r=ab.attr('data-artboard-'+prop+'-res-960');if(typeof r=='undefined'){r=ab.attr('data-artboard-'+prop+'');}}}}if(res==320){r=ab.attr('data-artboard-'+prop+'-res-320');if(typeof r=='undefined'){r=ab.attr('data-artboard-'+prop+'-res-480');if(typeof r=='undefined'){r=ab.attr('data-artboard-'+prop+'-res-640');if(typeof r=='undefined'){r=ab.attr('data-artboard-'+prop+'-res-960');if(typeof r=='undefined'){r=ab.attr('data-artboard-'+prop+'');}}}}}}else{r=ab.attr('data-artboard-'+prop);}return(r);}function t396_ab__renderViewOneField(ab,field){var value=t396_ab__getFieldValue(ab,field);if(field=='height'){value=parseFloat(value).toFixed(1);ab.css('height',value+'px');ab.find('.t396__filter').css('height',value+'px');ab.find('.t396__carrier').css('height',value+'px');}if(field=='bgcolor')ab.css('background-color',value);if(field=='bgimg'){var carrier=ab.find('.t396__carrier');carrier.css('background-image','url(' + value + ')');carrier.css('background-size','cover');carrier.css('background-repeat','no-repeat');}if(field=='bgattachment'){var carrier=ab.find('.t396__carrier');var res=window.tn.curResolution;if(res<=960)value='scroll';carrier.css('background-attachment',value);}if(field=='bgposition'){var carrier=ab.find('.t396__carrier');carrier.css('background-position',value);}if(field=='filtercolor'){var filter=ab.find(".t396__filter");if(value!='' && typeof value!='undefined'){var rgb=t396_hex2rgb(value);filter.attr('data-filtercolor-rgb',rgb[0]+','+rgb[1]+','+rgb[2]);}else{filter.attr('data-filtercolor-rgb','');}t396_ab__filterUpdate(ab);}if(field=='filtercolor2'){var filter=ab.find(".t396__filter");if(value!='' && typeof value!='undefined'){var rgb=t396_hex2rgb(value);filter.attr('data-filtercolor2-rgb',rgb[0]+','+rgb[1]+','+rgb[2]);}else{filter.attr('data-filtercolor2-rgb','');}t396_ab__filterUpdate(ab);}if(field=='filteropacity'){var filter=ab.find(".t396__filter");if(value!='' && typeof value!='undefined'){filter.attr('data-filteropacity',value);}else{filter.attr('data-filteropacity','1');}t396_ab__filterUpdate(ab);}if(field=='filteropacity2'){var filter=ab.find(".t396__filter");if(value!='' && typeof value!='undefined'){filter.attr('data-filteropacity2',value);}else{filter.attr('data-filteropacity2','1');}t396_ab__filterUpdate(ab);}if(field=='height_vh'){if(value!=''){value=parseFloat( t396_ab__getHeight(ab) ).toFixed(1);ab.css('height',value+'px');ab.find('.t396__filter').css('height',value+'px');ab.find('.t396__carrier').css('height',value+'px');}}}function t396_allelems__renderView(ab){tn_console('func: allelems__renderView: abid:'+ab.attr('data-artboard-recid'));ab.find(".tn-elem").each(function() {t396_elem__renderView($(this));});}function t396_ab__filterUpdate(ab){var filter=ab.find('.t396__filter');var c1=filter.attr('data-filtercolor-rgb');var c2=filter.attr('data-filtercolor2-rgb');var o1=filter.attr('data-filteropacity');var o2=filter.attr('data-filteropacity2');if((typeof c2=='undefined' || c2=='') && (typeof c1!='undefined' && c1!='')){filter.css("background-color", "rgba("+c1+","+o1+")");}else if((typeof c1=='undefined' || c1=='') && (typeof c2!='undefined' && c2!='')){filter.css("background-color", "rgba("+c2+","+o2+")");}else if(typeof c1!='undefined' && typeof c2!='undefined' && c1!='' && c2!=''){filter.css({background: "-webkit-gradient(linear, left top, left bottom, from(rgba("+c1+","+o1+")), to(rgba("+c2+","+o2+")) )" });}else{filter.css("background-color", 'transparent');}}function t396_ab__getHeight(ab, ab_height){if(typeof ab_height=='undefined')ab_height=t396_ab__getFieldValue(ab,'height');ab_height=parseFloat(ab_height);/* get Artboard height (fluid or px) */var ab_height_vh=t396_ab__getFieldValue(ab,'height_vh');if(ab_height_vh!=''){ab_height_vh=parseFloat(ab_height_vh);if(isNaN(ab_height_vh)===false){var ab_height_vh_px=parseFloat( window.tn.window_height * parseFloat(ab_height_vh/100) );if( ab_height < ab_height_vh_px ){ab_height=ab_height_vh_px;}}} return(ab_height);} function t396_hex2rgb(hexStr){/*note: hexStr should be #rrggbb */var hex = parseInt(hexStr.substring(1), 16);var r = (hex & 0xff0000) >> 16;var g = (hex & 0x00ff00) >> 8;var b = hex & 0x0000ff;return [r, g, b];}String.prototype.t396_replaceAll = function(search, replacement) {var target = this;return target.replace(new RegExp(search, 'g'), replacement);};function t396_elem__getWidth(el,value){if(typeof value=='undefined')value=parseFloat( t396_elem__getFieldValue(el,'width') );var el_widthunits=t396_elem__getFieldValue(el,'widthunits');if(el_widthunits=='%'){var el_container=t396_elem__getFieldValue(el,'container');if(el_container=='window'){value=parseFloat( window.tn.window_width * parseFloat( parseInt(value)/100 ) );}else{value=parseFloat( window.tn.grid_width * parseFloat( parseInt(value)/100 ) );}}return(value);}function t396_elem__getHeight(el,value){if(typeof value=='undefined')value=t396_elem__getFieldValue(el,'height');value=parseFloat(value);if(el.attr('data-elem-type')=='shape'){var el_heightunits=t396_elem__getFieldValue(el,'heightunits');if(el_heightunits=='%'){var ab=el.parent();var ab_min_height=parseFloat( ab.attr('data-artboard-proxy-min-height') );var ab_max_height=parseFloat( ab.attr('data-artboard-proxy-max-height') );var el_container=t396_elem__getFieldValue(el,'container');if(el_container=='window'){value=parseFloat( ab_max_height * parseFloat( value/100 ) );}else{value=parseFloat( ab_min_height * parseFloat( value/100 ) );}}}else if(el.attr('data-elem-type')=='button'){value = value;}else{value =parseFloat(el.innerHeight());}return(value);}function tn_roundFloat(n){n = Math.round(n * 100) / 100;return(n);}function tn_console(str){if(window.tn_comments==1)console.log(str);} 
 
function t397_init(recid){
  var el=$('#rec'+recid);
  el.find('.t397__tab').click(function() {
    el.find('.t397__tab').removeClass('t397__tab_active');
    $(this).addClass('t397__tab_active');
	t397_alltabs_updateContent(recid);
    t397_updateSelect(recid);
    $('.t347').trigger('displayChanged');
    $('.t346').trigger('displayChanged');
    $('.t351, .t353, .t341, .t404, .t385, .t386, .t412, .t268, .t425, .t409, .t384, .t279, .t428, .t418, .t433, .t121').trigger('displayChanged');
    setTimeout(function(){
      $('.t351, .t353, .t341, .t404, .t385, .t386, .t412, .t268, .t425, .t409, .t384, .t279, .t428, .t433').trigger('displayChanged');
    },50);
  });
  t397_alltabs_updateContent(recid);
  t397_updateContentBySelect(recid);
  var bgcolor=el.css("background-color");
  var bgcolor_target=el.find(".t397__select, .t397__firefoxfix");
  bgcolor_target.css("background-color", bgcolor);
}

function t397_alltabs_updateContent(recid){
  var el=$('#rec'+recid);
  el.find(".t397__tab").each(function (i) {
    var rec_ids = $(this).attr('data-tab-rec-ids').split(',');
	rec_ids.forEach(function(rec_id, i, arr) {
	  var rec_el=$('#rec'+rec_id);
	  rec_el.attr('data-connect-with-tab','yes');
	  rec_el.attr('data-animationappear','off');
	  rec_el.addClass('t379__off');
	});
  });

  el.find(".t397__tab_active").each(function (i) {
    var rec_ids = $(this).attr('data-tab-rec-ids').split(',');
	rec_ids.forEach(function(rec_id, i, arr) {
	  //console.log(rec_id);
	  var rec_el=$('#rec'+rec_id);
	  rec_el.removeClass('t379__off');
	  rec_el.css('opacity','');
	});
  });
}

function t397_updateContentBySelect(recid) {
  var el=$('#rec'+recid);
  el.find(".t397__select").change(function() {
    var select_val = el.find(".t397__select").val();
    var tab_index = el.find(".t397__tab[data-tab-rec-ids='" + select_val + "']");
    tab_index.trigger('click');
  });
}

function t397_updateSelect(recid) {
  var el=$('#rec'+recid);
  var current_tab = el.find(".t397__tab_active").attr('data-tab-rec-ids');
  var el_select=el.find(".t397__select");
  el_select.val(current_tab);
}
 
function t399_init(recid){
  var el=$("#rec"+recid);
  var clickable = el.find(".t399__blockimg");
  var gallery = el.find(".t399__gallery");
  gallery.fadeOut(0);
  clickable.click( function() {
    var slidenumber = $(this).attr('data-slide-number');
    var indicator = el.find(".t-carousel__indicator[data-slide-to='" + slidenumber + "']");
    indicator.trigger('click');
    gallery.fadeIn(100);
    // console.log(indicator);
  });
} 
function t400_init(recid){
  var el=$('#rec'+recid);
  el.find('.t400__submit').click(function() {
    var rec_ids = $(this).attr('data-hidden-rec-ids').split(',');
	rec_ids.forEach(function(rec_id, i, arr) {
	  var rec_el=$('#rec'+rec_id);
	  rec_el.removeClass('t400__off');
	  rec_el.css('opacity','');
	});
    $('.t351, .t353, .t341, .t385').trigger('displayChanged');
    setTimeout(function(){
      $('.t351, .t353, .t341, .t410, .t385').trigger('displayChanged');
    },50);
    el.hide();
  });
  t400_alltabs_updateContent(recid);
  t400_checkSize(recid);
}

function t400_alltabs_updateContent(recid){
  var el=$('#rec'+recid);
  el.find(".t400__submit").each(function (i) {
    var rec_ids = $(this).attr('data-hidden-rec-ids').split(',');
	rec_ids.forEach(function(rec_id, i, arr) {
	  var rec_el=$('#rec'+rec_id);
	  rec_el.attr('data-animationappear','off');
	  rec_el.addClass('t400__off');
	});
  });
}

function t400_checkSize(recid){
  var el=$("#rec"+recid).find(".t400__submit");
  if(el.length){
    var btnheight = el.height();
    var textheight = el[0].scrollHeight;
    if (btnheight < textheight) {
      var btntext = el.text();
      el.addClass("t400__submit-overflowed");
      el.html("<span class=\"t400__text\">" + btntext + "</span>");
    }
  }
} 
function t403_showMore(recid) {
  var el=$('#rec'+recid).find(".t403");
  el.find(".t403__container-table").hide();
  cards_size = el.find(".t403__container-table").size();
  cards_count=parseInt(el.attr("data-show-count"));
  x=cards_count;
  y=cards_count;
  el.find('.t403__container-table:lt('+x+')').show();
  el.find('.t403__showmore').click(function () {
      x= (x+y <= cards_size) ? x+y : cards_size;
      el.find('.t403__container-table:lt('+x+')').show();
      if(x == cards_size){
          el.find('.t403__showmore').hide();
      }
  });
} 
function t404_unifyHeights() {
    $('.t404 .t-container').each(function() {
        var highestBox = 0;
        $('.t404__title', this).each(function(){
          $(this).css("height","auto");
            if($(this).height() > highestBox)highestBox = $(this).height(); 
        });  
        if($(window).width()>=960){
          $('.t404__title',this).css('height', highestBox);   
        }else{
          $('.t404__title',this).css('height', "auto");    
        }
        
        var highestBox = 0;
        $('.t404__descr', this).each(function(){
            if($(this).height() > highestBox)highestBox = $(this).height(); 
        });  
        if($(window).width()>=960){
          $('.t404__descr',this).css('height', highestBox);   
        }else{
          $('.t404__descr',this).css('height', "auto");    
        }
                
    });
}

function t404_unifyHeightsTextwrapper() {
    $('.t404 .t-container').each(function() {
        var highestBox = 0;
        $('.t404__textwrapper', this).each(function(){
          $(this).css("height","auto");
            if($(this).height() > highestBox)highestBox = $(this).height(); 
        });  
        if($(window).width()>=960){
          $('.t404__textwrapper',this).css('height', highestBox);   
        }else{
          $('.t404__textwrapper',this).css('height', "auto");    
        }      
    });
}

function t404_showMore(recid) {
  var el=$('#rec'+recid).find(".t404");
  el.find(".t-col").hide();
  var cards_size = el.find(".t-col").size();
  var cards_count=parseInt(el.attr("data-show-count"));
  var x=cards_count;
  var y=cards_count;
  el.find('.t-col:lt('+x+')').show();
  el.find('.t404__showmore').click(function () {
      x= (x+y <= cards_size) ? x+y : cards_size;
      el.find('.t-col:lt('+x+')').show();
      if(x == cards_size){
          el.find('.t404__showmore').hide();
      }
      $('.t404').trigger('displayChanged');
      setTimeout(function(){
        $('.t404').trigger('displayChanged');
      },50);
  });
}



 
function t418_checkSize(recid){
  var el=$("#rec"+recid);
  var sizer = el.find('.t418__height');
  var height = sizer.height();
  var width = sizer.width();
  var ratio = width/height;
  var gallerywrapper = el.find(".t418__checksize");
  var gallerywidth = gallerywrapper.width();
  gallerywrapper.css({'height':((gallerywidth/ratio)+'px')});

  var maxwidth = el.find(".t418__height").width();
  var windowwidth  = $(window).width();
  var value = windowwidth - 80;
  if (maxwidth > windowwidth) {
    el.find(".t418__item").css("max-width", value + "px");
    el.find(".t418__img").css("left", "20px");
    el.find(".t418__img").css("right", "20px");
  } else {
    el.find(".t418__item").css("max-width", "");
    el.find(".t418__img").css("left", "");
    el.find(".t418__img").css("right", "");
  }
}

function t418_init(recid){
  var el=$('#rec'+recid);
  var pos = 0;
  var t418_doResize;
  var totalSlides = el.find('.t418__item').length;
  var sliderWidth = el.find('.t418__item').width();

  $(window).resize(function() {
    if (t418_doResize) clearTimeout(t418_doResize);
    t418_doResize = setTimeout(function() {
      sliderWidth = el.find('.t418__slider').width();
      el.find('.t418__slidecontainer').width(sliderWidth*totalSlides);
      console.log(sliderWidth);
    }, 200); 
  });
  
  el.find('.t418__slidecontainer').width(sliderWidth*totalSlides);
  
  el.find('.t418__next').click(function(){
    slideRight(recid);
  });

  el.find('.t418__previous').click(function(){
    slideLeft(recid);
  });

  function slideLeft(recid){
    var el=$('#rec'+recid);
    pos--;
    if(pos==-1){ pos = totalSlides-1; }
    el.find('.t418__slidecontainer').css({transform: 'translate(-' + (sliderWidth*pos) + 'px, 0)'})
    el.find('.t418__slidecontainer').css("transition-duration", ".3s");
  }

  function slideRight(recid){
    var el=$('#rec'+recid);
    pos++;
    if(pos==totalSlides){ pos = 0; }
    el.find('.t418__slidecontainer').css({transform: 'translate(-' + (sliderWidth*pos) + 'px, 0)'})
    el.find('.t418__slidecontainer').css("transition-duration", ".3s");
  }

  var swipeOptions = {
      triggerOnTouchEnd: true,
      swipeStatus: swipeStatus,
      allowPageScroll: "vertical",
      threshold: 75
  };

  el.find(".t418__slidecontainer").swipe(swipeOptions);
  el.find(".t418__slidecontainer").swipe( {
    tap:function(event, target) {
      slideRight(recid);
    }
  });

  function swipeStatus(event, phase, direction, distance) {
      if (phase == "move" && (direction == "left" || direction == "right")) {
          var duration = 0;

          if (direction == "left") {
              scrollImages((sliderWidth * pos) + distance, duration);
          } else if (direction == "right") {
              scrollImages((sliderWidth * pos) - distance, duration);
          }

      } else if (phase == "cancel") {
          scrollImages(sliderWidth * pos);
      } else if (phase == "end") {
          if (direction == "right") {
              slideLeft(recid);
          } else if (direction == "left") {
              slideRight(recid);
          }
      }
  }

  function scrollImages(distance, duration) {
      //el.find(".t418__slidecontainer").css("transition-duration", "0s");
      el.find(".t418__slidecontainer").css("transition-duration", (duration / 1000).toFixed(1) + "s");
      var value = (distance < 0 ? "" : "-") + Math.abs(distance).toString();
      el.find(".t418__slidecontainer").css("transform", "translate(" + value + "px, 0)");
  }
}

                               
 
t422_setHeight = function(recid) {
  if ($(window).width()>960) {
    t422_checkEqualHeight(recid);
  } else {
    $('#rec'+recid+' .t422__img-mobile').height(200);
    $('#rec'+recid+' .t422__text').height('auto');
  }
};

t422_checkEqualHeight = function(recid) {
  var t422__txtel=$('#rec'+recid+' .t422__text');
  var t422__imgel=$('#rec'+recid+' .t422__img');
  var t422__borderwidth = 0;
  if (t422__txtel.css("border-top-width") && t422__txtel.css("border-top-width")[1]!='p') {
    t422__borderwidth = + (t422__txtel.css("border-top-width")[0] + t422__txtel.css('border-top-width')[1]);
  }else{if (t422__txtel.css("border-width"))
    	t422__borderwidth = +(t422__txtel.css("border-width")[0]);
  }
  if (t422__imgel.height() < (t422__txtel.height() + t422__borderwidth*2)) {
      t422__imgel.height(t422__txtel.height() + t422__borderwidth*2);
  }else{if ((t422__imgel.height() - t422__borderwidth*2) > t422__txtel.height()) {
        t422__txtel.height(t422__imgel.height() - t422__borderwidth*2);
    }
  }
}; 
function t425_unifyHeights(recid) {       	
    $('#rec'+recid+' .t425 .t-container').each(function() {
        var t425__highestBox = 0;
        $('.t425__col', this).each(function(){						
			var t425__curcol=$(this);	
			var t425__curcolchild=t425__curcol.find('.t425__col-wrapper');
			if(t425__curcol.height() < t425__curcolchild.height())t425__curcol.height(t425__curcolchild.height());
            if(t425__curcol.height() > t425__highestBox)t425__highestBox = t425__curcol.height();			
        });  
        if($(window).width()>=960){
        	$('.t425__col',this).css('height', t425__highestBox); 
        }else{
	        $('.t425__col',this).css('height', "auto");    
        }
    });
}; 
t431_createTable = function(recid,tablehead,tabledata,tablecolsize,hastargetblank,btnstyles,t431__tdstyles,t431__thstyles,t431__oddrowstyles,t431__evenrowstyles){
	var t431__arrayColSize = t431_parseData(tablecolsize);
	var t431__arrayHead = t431_parseData(tablehead);
    var t431__arrayData = t431_parseData(tabledata);

	var t431__maxcolnumber = t431__findMaxRowLengthInTable(t431__arrayHead,t431__arrayData);
	var t431__colWidth = t431__setColumnsWidth(t431__arrayColSize,t431__maxcolnumber,recid);
	if (t431__colWidth[0].myText && t431__colWidth[0].myText[t431__colWidth[0].myText.length - 1] == "%") {
		for (var i=0; i<t431__colWidth.length; i++) {
			t431__colWidth[i].myText = t431__colWidth[i].myText.slice(0,-1);
			t431__colWidth[i].myText += "vw";
		}
	}

	var t431__container = $('#rec'+recid+' .t431 .t-container .t431__table');
	var t431__htmlTable = "";
	if (t431__arrayHead) { t431__htmlTable += t431__generateHtml(recid,t431__arrayHead,"th",hastargetblank,t431__colWidth,btnstyles,t431__thstyles,null,null,t431__maxcolnumber);}
	t431__container.append(t431__htmlTable);
	t431__htmlTable = "";
	if (t431__arrayData) { t431__htmlTable += t431__generateHtml(recid,t431__arrayData,"td",hastargetblank,t431__colWidth,btnstyles,t431__tdstyles,t431__oddrowstyles,t431__evenrowstyles,t431__maxcolnumber);}
    t431__container.append(t431__htmlTable);
};


/*add display:block to thead and tbody for vertical scroll, set th width to fix unequal col width*/
t431_setHeadWidth = function(recid) {
	if ($(window).width()>960){
        var t431__tbody = $('#rec'+recid+' .t431 .t431__tbody');
        var t431__thead = $('#rec'+recid+' .t431 .t431__thead');
		t431__tbody.css("display","block");
		t431__thead.css("display","block");

		var t431__colWidth = $('#rec'+recid+' .t431 .t431__tbody tr:first').children().map(function() {
            return $(this).width();
        });

		if($('#rec'+recid+' .t431 .t431__tbody tr td:first').css('border-left-width').length>=3) {
			var t431__verticalborder = $('#rec'+recid+' .t431 .t431__tbody tr td:first').css('border-left-width').slice(0,-2);
		}

        $('#rec'+recid+' .t431 .t431__thead tr').children().each(function(i, v) {
            if ($(v).is(":last-child")) {
                $(v).width(t431__colWidth[i] + (t431__tbody.width() - $('#rec'+recid+' .t431 .t431__tbody tr:first').width()));
            } else {
                $(v).width(t431__colWidth[i] + (+t431__verticalborder));
            }
        });
	}
};


t431__findMaxRowLengthInTable = function(arrayhead, arraydata) {
	var t431__headmaxlength = 0;
	var t431__datamaxlength = 0;
	if (arrayhead) {
		t431__headmaxlength = t431__findMaxRowLengInArray(arrayhead);
	}
	if (arraydata) {
		t431__datamaxlength = t431__findMaxRowLengInArray(arraydata);
	}
	if (t431__datamaxlength>t431__headmaxlength) {
		return t431__datamaxlength;
	} else {
		return t431__headmaxlength;
	}
};


t431__findMaxRowLengInArray = function(curarray) {
	var t431__maxlength = 0;
	for (var i=0; i<curarray.length; i++) {
		if (curarray[i].length>t431__maxlength) {
			t431__maxlength = curarray[i].length;
		}
	}
	return t431__maxlength;
};


t431__setColumnsWidth = function(t431__colwidth,t431__colsnumber,recid) {
		if (t431__colwidth) {
			return t431__colwidth[0];
		}	else {
			var t431__tablewidth = $('#rec'+recid+' .t431 .t-container .t-col').width();
			return (t431__tablewidth/t431__colsnumber + "px");
		}
};


t431__generateHtml = function(recid,arrayValues,coltag,hastargetblank,colWidth,btnstyles,colstyles,oddrowstyles,evenrowstyles,maxcolnumber) {
	var t431__htmlpart = "";


	if (coltag == "td") {
		var t431__theadorbodytag = "tbody";
	} else {
		var t431__theadorbodytag = "thead";
	}
	t431__htmlpart += "<" + t431__theadorbodytag + " class=\"t431__" + t431__theadorbodytag + "\">";

	//remove forst body row top border, if table head has bottom border
	if($('#rec'+recid+' .t431 .t-container .t431__thead th').length>0 && $('#rec'+recid+' .t431 .t-container .t431__thead th').css("border-bottom-width")[0]!="0") {
		var t431__firstbodyrowstyle = "border-top: 0 !important;";
	}

	for (var i=0; i<arrayValues.length; i++) {

		//add classes for striped table
		if (coltag == "td") {
			if ((i + 1) % 2 > 0) {
				t431__htmlpart += "<tr class=\"t431__oddrow\"" + "style=\"" + oddrowstyles + "\">";
			} else { t431__htmlpart += "<tr class=\"t431__evenrow\"" + "style=\"" + evenrowstyles + "\">";}
		} else {
			t431__htmlpart += "<tr>";
		}

		var t431__addingcols = 0;
		if (arrayValues[i].length<maxcolnumber) {
			t431__addingcols = maxcolnumber - arrayValues[i].length;
        }
		for (var j=0; j<(arrayValues[i].length + t431__addingcols); j++) {
			if (arrayValues[i][j]) {
				//define col width
                if(Array.isArray(colWidth) && colWidth[j]) {
                    var t431__curWidth = colWidth[j].myText;
                } else { var t431__curWidth = colWidth;}

				 if (i==0 && coltag=="td") {
					var t431__colwithattr = "<" + coltag + " class=\"t431__" + coltag + "\" style=\"width:" + t431__curWidth + ";" + colstyles + t431__firstbodyrowstyle + "\">";
				} else {
					var t431__colwithattr = "<" + coltag + " class=\"t431__" + coltag + "\" style=\"width:" + t431__curWidth + ";" + colstyles + "\">";
				}

                if (arrayValues[i][j].myHref) {
                    var t431__tblank = "";
                    if (hastargetblank) {var t431__tblank = "target=\"_blank\"";}
                    //define link type
                    if (arrayValues[i][j].myHrefType == "link") {
                        var t431__linkwithattr = "<a href=\"" + arrayValues[i][j].myHref + "\"" + t431__tblank + ">";
                        var t431__linkclosetag = "</a>";
                    } else {
                        var t431__linkwithattr = "<div class=\"t431__btnwrapper\"><a href=\"" + arrayValues[i][j].myHref + "\"" + t431__tblank + " class=\"t-btn\" style=\"" + btnstyles + "\"><table style=\"width:100%; height:100%;\"><tr><td>";
                        var t431__linkclosetag = "</td></tr></table></a></div>";
                    }
                    t431__htmlpart += t431__colwithattr + t431__linkwithattr + arrayValues[i][j].myText + t431__linkclosetag + "</" + coltag + ">";
                } else {
                    t431__htmlpart += t431__colwithattr + arrayValues[i][j].myText + "</" + coltag + ">";
                }
			} else {
					t431__htmlpart += "<" + coltag + " class=\"t431__" + coltag + "\" style=\"width:" + t431__curWidth + ";" + colstyles + "\">" + "</" + coltag + ">";
			}
		}
		t431__htmlpart += "</tr>";
	}
	t431__htmlpart += "</" + t431__theadorbodytag + ">";
	return t431__htmlpart;
};


t431_parseData = function(t431__data) {
  if (t431__data!="" && typeof t431__data!='undefined')
  {
	t431__data = t431__addBrTag(t431__data);
    var t431__arrayTable = new Array();
    var t431__arrayRow = new Array();
    var t431__curItem = {myText:"", myHref:"", myHrefType:""};
	var t431__HasLink = "";
	var t431__HasLinkWithSpace = "";
    var t431__HasBtn = "";
	var t431__HasBtnWithSpace = "";
	var t431__EndOfLine = "";
    for (var i=0; i<t431__data.length; i++)
    {
	  //col end and check of special symbols: «>», «<» and «&»
      if (t431__data[i] == ";" && !((t431__data[i-1]&&(t431__data[i-1]=="t")) && (t431__data[i-2]&&(t431__data[i-2]=="g" || t431__data[i-2]=="l")) && (t431__data[i-3]&&(t431__data[i-3]=="&"))) && !((t431__data[i-1]&&(t431__data[i-1]=="p")) && (t431__data[i-2]&&(t431__data[i-2]=="m")) && (t431__data[i-3]&&(t431__data[i-3]=="a")) && (t431__data[i-4]&&(t431__data[i-4]=="&")))) {
          t431__arrayRow.push(t431__curItem);
          var t431__curItem = {myText:"", myHref:""};
          t431__HasLink = "";
          t431__HasLinkWithSpace = "";
          t431__HasBtn = "";
          t431__HasBtnWithSpace = "";
      } else {
        if(t431__HasLink == "link=" || t431__HasLinkWithSpace == " link=" || t431__HasBtn == "button=" || t431__HasBtnWithSpace == " button=") {
		  if (t431__curItem.myHref=="" && t431__HasLink == "link=") {
			t431__curItem.myText = t431__curItem.myText.slice(0,-5);
			t431__curItem.myHrefType = "link";
		  } else { if (t431__curItem.myHref=="" && t431__HasLinkWithSpace == " link=") {
			t431__curItem.myText = t431__curItem.myText.slice(0,-6);
            t431__curItem.myHrefType = "link";
		  } else {if (t431__curItem.myHref=="" && t431__HasBtn == "button=") {
			t431__curItem.myText = t431__curItem.myText.slice(0,-7);
			t431__curItem.myHrefType = "btn";
		  } else { if (t431__curItem.myHref=="" && t431__HasBtnWithSpace == " button=") {
			t431__curItem.myText = t431__curItem.myText.slice(0,-8);
			t431__curItem.myHrefType = "btn";
		  }}}}
		  t431__curItem.myHref += (t431__data[i]);
		} else {
		  t431__curItem.myText += (t431__data[i]);
		  t431__HasLink = t431__checkSubstr("link=",t431__HasLink,t431__data[i]);
		  t431__HasLinkWithSpace = t431__checkSubstr(" link=",t431__HasLinkWithSpace,t431__data[i]);
		  t431__HasBtn = t431__checkSubstr("button=",t431__HasBtn,t431__data[i]);
		  t431__HasBtnWithSpace = t431__checkSubstr(" button=",t431__HasBtnWithSpace,t431__data[i]);
		}
		t431__EndOfLine = t431__checkSubstr("<br />",t431__EndOfLine,t431__data[i]);
        if (t431__EndOfLine == "<br />") {
          if (t431__curItem.myHref) {
			t431__curItem.myHref = t431__curItem.myHref.slice(0,-6);
		  } else {
			t431__curItem.myText = t431__curItem.myText.slice(0,-6);
		  }
          t431__arrayRow.push(t431__curItem);
          t431__arrayTable.push(t431__arrayRow);
          var t431__curItem = {myText:"", myHref:""};
		  t431__HasLink = "";
		  t431__HasLinkWithSpace = "";
		  t431__HasBtn = "";
		  t431__HasBtnWithSpace = "";
          t431__arrayRow = new Array();
        }
      }
    }
	if (t431__arrayRow.length > 0 || t431__curItem.myText!="") {
		if (t431__curItem!="") {
			t431__arrayRow.push(t431__curItem);
		}
		t431__arrayTable.push(t431__arrayRow);
	}
  }
  return t431__arrayTable;
};


// checking a step by step combining of t431__targetSubstr
t431__checkSubstr = function(t431__targetSubstr,t431__curSubstr,t431__curSymbol){
	if (!t431__curSubstr && t431__curSymbol == t431__targetSubstr[0]) {
    return t431__curSymbol;
  } else {
    if (t431__curSubstr) {
		for (var i=0; i<(t431__targetSubstr.length-1); i++) {
			if (t431__curSubstr[t431__curSubstr.length - 1] == t431__targetSubstr[i] && t431__curSymbol == t431__targetSubstr[i+1]) {
				return (t431__curSubstr += t431__curSymbol);
            }
        }
    }
  }
};


t431__addBrTag = function(t431__oldStringItem){
	if(typeof t431__oldStringItem=='undefined')return;
	var t431__newStringItem = "";
	for (var i=0; i < t431__oldStringItem.length; i++) {
		if (t431__oldStringItem[i] == "\n" || t431__oldStringItem[i] == "\r") {
			t431__newStringItem += "<br />";
		} else {
			t431__newStringItem += t431__oldStringItem[i];
		}
	}
	return t431__newStringItem;
};
 
function t433_appendGoogleMap(recid, key) {
	var grecid = recid;

	if (typeof google === 'object' && typeof google.maps === 'object') {
		t433_handleGoogleApiReady(grecid);
	} else {
		if(window.googleapiiscalled!==true){
			var runfunc = 'window.t433_handleGoogleApiReady_'+grecid+' = function () { t433_handleGoogleApiReady("'+grecid+'") }';
			eval(runfunc);

			var script = document.createElement("script");
			script.type = "text/javascript";
			script.src = "//maps.google.com/maps/api/js?key="+jQuery.trim(key)+"&callback=t433_handleGoogleApiReady_"+grecid;
			document.body.appendChild(script);
			window.googleapiiscalled=true;
		} else {
			setTimeout(function(){
			  t433_appendGoogleMap(grecid, key);
			},200);
		}
	}
}

function t433_setMapHeight(recid) {
	var el=$('#rec'+recid);
	var map = el.find('.t433__map');
	var textwrapper = el.find('.t433__col_text').height();
	map.css('height', textwrapper);
}

function t433_handleGoogleApiReady(recid){
	$('#rec'+recid).find('.t433__map').each(function(index,Element) {
		var el=$(Element);
		var arMarkers = window['arMapMarkers'+recid];
		window.isDragMap = $isMobile ? false : true;
	
		var myLatLng = arMarkers.length > 0 ? new google.maps.LatLng(parseFloat(arMarkers[0].lat), parseFloat(arMarkers[0].lng)) : false;
		var myOptions = {
			zoom: parseInt(el.attr('data-map-zoom')),
			center:myLatLng,
			scrollwheel: false,
			draggable: window.isDragMap,
			zoomControl: true
		};

		var map = new google.maps.Map(Element, myOptions);

		var i, mrk, marker, markers=[], infowindow;
		var bounds = new google.maps.LatLngBounds();
		for(i in arMarkers) {
			mrk = arMarkers[i];
			myLatLng = new google.maps.LatLng(parseFloat(mrk.lat), parseFloat(mrk.lng));
			marker = new google.maps.Marker({
				position: myLatLng,
				map: map,
				title: mrk.title
			});
			bounds.extend(myLatLng);

			if (mrk.descr > '') {
				attachInfoMessage(marker, mrk.descr);
			} else {
				attachInfoMessage(marker, mrk.title);
			}

			markers[markers.length] = marker;
			infowindow='';
			marker='';
		}
		
		function attachInfoMessage(marker, descr) {
			var infowindow = new google.maps.InfoWindow({
				content:  $("<textarea/>").html(descr).text()
			});
		  
			marker.addListener('click', function() {
				infowindow.open(marker.get('map'), marker);
			});
		}
		
		if (arMarkers.length > 1) {
			map.fitBounds(bounds);
			if (map.getZoom() > parseInt(el.attr('data-map-zoom'))) {
				map.setZoom(parseInt(el.attr('data-map-zoom')));
			}
		}

	  
		// Resizing the map for responsive design
		google.maps.event.addDomListener(window, "resize", function() {
			var center = map.getCenter();
			google.maps.event.trigger(map, "resize");
			map.setCenter(center); 
		}); 

		// DBL Click - activate on mobile      
		if ($isMobile) {
			google.maps.event.addDomListener(window, "dblclick", function() {
				if (window.isDragMap) {
					window.isDragMap = false;
				} else {
					window.isDragMap = true;
				}
				map.setOptions({draggable: window.isDragMap});
			}); 
		}

	}); 
}


function t433_appendYandexMap(recid,key) {
	var yarecid = recid;
	if (typeof ymaps === 'object' && typeof ymaps.Map === 'function') {
		t433_handleYandexApiReady(recid);
	} else {
		if(window.yandexmapsapiiscalled!==true){
			var runfunc = 'window.t433_handleYandexApiReady_'+yarecid+' = function () { return t433_handleYandexApiReady("'+yarecid+'") }';
			eval(runfunc);

			var script = document.createElement("script");
			script.type = "text/javascript";
			script.src = "https://api-maps.yandex.ru/2.1/?lang=ru-RU&coordorder=latlong&onload=t433_handleYandexApiReady_"+yarecid;
			if (key > '') {
				script.src = script.src + '&apikey='+key;
			}
			document.body.appendChild(script);
			window.yandexmapsapiiscalled=true;
		} else {
		  setTimeout(function(){
			t433_appendYandexMap(yarecid,key);
		  },200);
	  }
	}
}

function t433_handleYandexApiReady(recid){
	$('#rec'+recid).find('.t433__map').each(function(index,Element) {
		var el=$(Element);
		var arMarkers = window['arMapMarkers'+recid];

		window.isDragMap = $isMobile ? false : true;
			
		if(el.attr('data-map-style')!=''){var mapstyle=eval(el.attr('data-map-style'));}else{var mapstyle='[]';}
		var myLatlng = arMarkers.length > 0 ? [parseFloat(arMarkers[0].lat), parseFloat(arMarkers[0].lng)] : false;
		var myStates = {
			zoom: parseInt(el.attr('data-map-zoom')),
			center:myLatlng,
			scrollZoom: false,
			controls: ['typeSelector','zoomControl'],
			drag: window.isDragMap
		};

		var map = new ymaps.Map(Element, myStates), i, mrk, marker;
		var myGroup = new ymaps.GeoObjectCollection({}) ;
		
		map.behaviors.disable('scrollZoom');

		for(i in arMarkers) {
			mrk = arMarkers[i];
			myLatlng = [parseFloat(mrk.lat), parseFloat(mrk.lng)];

			myGroup.add(new ymaps.Placemark(myLatlng, { hintContent: mrk.title, balloonContent: mrk.descr > '' ? $("<textarea/>").html(mrk.descr).text() : mrk.title }));			
		}
		map.geoObjects.add(myGroup);
		if (arMarkers.length > 1) {
			map.setBounds(myGroup.getBounds(), {checkZoomRange: true}) ;
		}
		
		$(window).resize(function(){
			map.container.fitToViewport();
		});

		// DBL Click - activate on mobile      
		if ($isMobile) {
			$(window).dblclick(function() {
				if (window.isDragMap) {
					window.isDragMap = false;
				} else {
					window.isDragMap = true;
				}
				if (window.isDragMap) {
					map.behaviors.enable('drag');
				} else {
					map.behaviors.disable('drag');
				}
			});
		}

	});
} 
function t446_setLogoPadding(recid){
	if($(window).width()>980){			  
        var t446__menu = $('#rec'+recid+' .t446');
        var t446__logo=t446__menu.find('.t446__logowrapper');	  
        var t446__leftpart=t446__menu.find('.t446__leftwrapper');
        var t446__rightpart=t446__menu.find('.t446__rightwrapper');
        t446__leftpart.css("padding-right",t446__logo.width()/2+50);
        t446__rightpart.css("padding-left",t446__logo.width()/2+50);			        
	}
}

function t446_checkOverflow(recid, menuheight){    
  var t446__menu = $('#rec'+recid+' .t446');
  var t446__rightwr=t446__menu.find('.t446__rightwrapper');	  
  var t446__rightmenuwr=t446__rightwr.find('.t446__rightmenuwrapper');
  var t446__rightadditionalwr=t446__rightwr.find('.t446__additionalwrapper');
  var t446__burgeroverflow=t446__rightwr.find('.t446__burgerwrapper_overflow');  
  var t446__burgerwithoutoverflow=t446__rightwr.find('.t446__burgerwrapper_withoutoverflow');      

  if (menuheight>0) {var t446__height = menuheight;} else {var t446__height = 80;}  

  if($(window).width()>980 && (t446__rightmenuwr.width() + t446__rightadditionalwr.width()) > t446__rightwr.width()){    	  	  	  	  	  	  
		t446__menu.css("height", t446__height*2);
		t446__rightadditionalwr.css("float","right");

		t446__burgeroverflow.css("display","table-cell");
		t446__burgerwithoutoverflow.css("display","none");				
  } else {
		if(t446__menu.height()>t446__height) {t446__menu.css("height",t446__height);}
		if(t446__rightadditionalwr.css("float")=="right") {t446__rightadditionalwr.css("float","none");}

		t446__burgeroverflow.css("display","none");
		t446__burgerwithoutoverflow.css("display","table-cell");		
  }
}

function t446_highlight(){
  var url=window.location.href;
  var pathname=window.location.pathname;
  if(url.substr(url.length - 1) == "/"){ url = url.slice(0,-1); }
  if(pathname.substr(pathname.length - 1) == "/"){ pathname = pathname.slice(0,-1); }
  if(pathname.charAt(0) == "/"){ pathname = pathname.slice(1); }
  if(pathname == ""){ pathname = "/"; }
  $(".t446__list_item a[href='"+url+"']").addClass("t-active");
  $(".t446__list_item a[href='"+url+"/']").addClass("t-active");
  $(".t446__list_item a[href='"+pathname+"']").addClass("t-active");
  $(".t446__list_item a[href='/"+pathname+"']").addClass("t-active");
  $(".t446__list_item a[href='"+pathname+"/']").addClass("t-active");
  $(".t446__list_item a[href='/"+pathname+"/']").addClass("t-active");
}

function t446_setPath(){
}

function t446_setBg(recid){
  var window_width=$(window).width();
  if(window_width>980){
    $(".t446").each(function() {
      var el=$(this);
      if(el.attr('data-bgcolor-setbyscript')=="yes"){
        var bgcolor=el.attr("data-bgcolor-rgba");
        el.css("background-color",bgcolor);
      }
      });
      }else{
        $(".t446").each(function() {
          var el=$(this);
          var bgcolor=el.attr("data-bgcolor-hex");
          el.css("background-color",bgcolor);
          el.attr("data-bgcolor-setbyscript","yes");
      });
  }
}

function t446_appearMenu(recid) {
      var window_width=$(window).width();
      if(window_width>980){
           $(".t446").each(function() {
                  var el=$(this);
                  var appearoffset=el.attr("data-appearoffset");
                  if(appearoffset!=""){
                          if(appearoffset.indexOf('vh') > -1){
                              appearoffset = Math.floor((window.innerHeight * (parseInt(appearoffset) / 100)));
                          }

                          appearoffset=parseInt(appearoffset, 10);

                          if ($(window).scrollTop() >= appearoffset) {
                            if(el.css('visibility') == 'hidden'){
                                el.finish();
                                el.css("top","-50px");
                                el.css("visibility","visible");
                                el.animate({"opacity": "1","top": "0px"}, 200,function() {
                                });
                            }
                          }else{
                            el.stop();
                            el.css("visibility","hidden");
                          }
                  }
           });
      }

}

function t446_changebgopacitymenu(recid) {
  var window_width=$(window).width();
  if(window_width>980){
    $(".t446").each(function() {
      var el=$(this);
      var bgcolor=el.attr("data-bgcolor-rgba");
      var bgcolor_afterscroll=el.attr("data-bgcolor-rgba-afterscroll");
      var bgopacityone=el.attr("data-bgopacity");
      var bgopacitytwo=el.attr("data-bgopacity-two");
      var menushadow=el.attr("data-menushadow");
      if(menushadow=='100'){
        var menushadowvalue=menushadow;
      }else{
        var menushadowvalue='0.'+menushadow;
      }
      if ($(window).scrollTop() > 20) {
        el.css("background-color",bgcolor_afterscroll);
        if(bgopacitytwo=='0' || menushadow==' '){
          el.css("box-shadow","none");
        }else{
          el.css("box-shadow","0px 1px 3px rgba(0,0,0,"+ menushadowvalue +")");
        }
      }else{
        el.css("background-color",bgcolor);
        if(bgopacityone=='0.0' || menushadow==' '){
          el.css("box-shadow","none");
        }else{
          el.css("box-shadow","0px 1px 3px rgba(0,0,0,"+ menushadowvalue +")");
        }
      }
    });
  }
}

function t446_createMobileMenu(recid) {
  var window_width=$(window).width();
  var el=$("#rec"+recid);
  var menu = el.find(".t446");
  var burger = el.find(".t446__mobile");
  if(980>window_width){
    burger.click(function(e){
      menu.fadeToggle(300);
      $(this).toggleClass("t446_opened");
    });
  }
} 
function t448_setHeight(recid) {
  var el=$("#rec"+recid);
  var coverheight = el.find(".t-cover").height();
  var coverwrapper = el.find(".t448-cover__wrapper");
  var textheight = el.find(".t448__wrapper").innerHeight();
  var imgheight = el.find(".t448__screenshot").height();
  var height = textheight + imgheight;
  var newheight = coverheight - imgheight;
  var container = el.find(".t448");
  var attr = container.attr("data-crop-image");

  if (typeof attr !== typeof undefined && attr !== false) {
    container.addClass("t448__no-overflow");
    container.css("height", coverwrapper.height());
  }

  if (coverheight > height) {
    el.addClass("t448__stretched");
    coverwrapper.css("height",newheight);
    if (typeof attr !== typeof undefined && attr !== false) {
      container.removeClass("t448__no-overflow");
      container.css("height", "");
    }
  } else {
    el.removeClass("t448__stretched");
    coverwrapper.css("height","");
  }
} 
function t453_highlight(){
  var url=window.location.href;
  var pathname=window.location.pathname;
  if(url.substr(url.length - 1) == "/"){ url = url.slice(0,-1); }
  if(pathname.substr(pathname.length - 1) == "/"){ pathname = pathname.slice(0,-1); }
  if(pathname.charAt(0) == "/"){ pathname = pathname.slice(1); }
  if(pathname == ""){ pathname = "/"; }
  $(".t453__list_item a[href='"+url+"']").addClass("t-active");
  $(".t453__list_item a[href='"+url+"/']").addClass("t-active");
  $(".t453__list_item a[href='"+pathname+"']").addClass("t-active");
  $(".t453__list_item a[href='/"+pathname+"']").addClass("t-active");
  $(".t453__list_item a[href='"+pathname+"/']").addClass("t-active");
  $(".t453__list_item a[href='/"+pathname+"/']").addClass("t-active");
}   

function t453_appearMenu(recid) {
      var window_width=$(window).width();
      var record = $("#rec"+recid);
           record.find(".t453").each(function() {
                  var el=$(this);
                  var appearoffset=el.attr("data-appearoffset");
console.log(appearoffset)
                  if(appearoffset!=""){
                          if(appearoffset.indexOf('vh') > -1){
                              appearoffset = Math.floor((window.innerHeight * (parseInt(appearoffset) / 100)));
                          }

                          appearoffset=parseInt(appearoffset, 10);

                          if ($(window).scrollTop() >= appearoffset) {
                            if(el.hasClass('t453__beforeready')){
                                el.removeClass('t453__beforeready');
                            }
                          }else{
                            el.addClass('t453__beforeready');
                          }
                  }
           });

}