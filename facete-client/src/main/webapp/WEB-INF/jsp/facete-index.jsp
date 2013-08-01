<!DOCTYPE html PUBLIC "-//W3C//DTD XHTML 1.0 Transitional//EN" "http://www.w3.org/TR/xhtml1/DTD/xhtml1-transitional.dtd">
<html class="js" lang="en" dir="ltr" xml:lang="en" xmlns="http://www.w3.org/1999/xhtml">
<head xmlns:update="http://ns.aksw.org/update/">
    
        <meta content="text/html; charset=utf-8" http-equiv="Content-Type">
        <meta http-equiv="Content-Type" content="text/html; charset=UTF-8" />

        <title>${title}</title>
        

        <link rel="stylesheet" href="resources/lib/twitter-bootstrap/2.3.2/css/bootstrap.min.css" />
		<!--[if lt IE 8]>
		<link rel="stylesheet" type="text/css" href="resources/lib/Font-Awesome/current/css/font-awesome-ie7.css" />
		<![endif]-->
		${cssIncludes}
        <link rel="stylesheet" type="text/css" href="resources/lib/select2/3.3.2/select2.css" />
        <link rel="stylesheet" type="text/css" href="resources/lib/jquery-ui/1.10.2/themes/base/jquery-ui.css" />    



        <!-- <script type="text/javascript" src="js/prototypes.js"></script> -->

		<!--[if lt IE 9]>
		<script type="text/javascript" src="resources/lib/html5shiv/67bff28/dist/html5shiv.js"></script>
		<![endif]-->

        <script type="text/javascript" src="resources/lib/JSON-js/json2.js"></script>
        <script type="text/javascript" src="resources/lib/namespacedotjs/a28da387ce/Namespace.js"></script>
        <script type="text/javascript" src="resources/lib/jquery/1.10.1/jquery-1.10.1.js"></script>
        <script type="text/javascript" src="resources/lib/jQuery-ajaxTransport-XDomainRequest/current/jQuery.XDomainRequest.js"></script>
        <script type="text/javascript" src="resources/lib/jquery-ui/1.10.2/ui/jquery-ui.js"></script>
        <script type="text/javascript" src="resources/lib/underscore/1.4.4/underscore.js"></script>
        <script type="text/javascript" src="resources/lib/underscore.string/current/dist/underscore.string.min.js"></script>
        <script type="text/javascript" src="resources/lib/backbone/1.0.0/backbone.js"></script>
        <script type="text/javascript" src="resources/lib/twitter-bootstrap/2.3.2/js/bootstrap.js"></script>
        <script type="text/javascript" src="resources/lib/agility/current/agility.js" charset="utf-8"></script>
        <script type="text/javascript" src="resources/lib/CryptoJS/3.0.2/components/core-min.js"></script>
        <script type="text/javascript" src="resources/lib/CryptoJS/3.0.2/components/enc-utf16-min.js"></script>
        <script type="text/javascript" src="resources/lib/CryptoJS/3.0.2/components/enc-base64-min.js"></script>
        <script type="text/javascript" src="resources/lib/open-layers/2.12/OpenLayers.js"></script>
        <script type="text/javascript" src="resources/lib/json-template/0.85/json-template.js"></script>
        <script type="text/javascript" src="resources/lib/RDFauthor/current/libraries/jquery.rdfquery.rdfa-1.0.js"></script>
        <!-- <script type="text/javascript" src="lib/open-layers/2.10/extensions/OpenStreetMap/OpenStreetMap.js"></script> -->

		<script type="text/javascript" src="resources/lib/doT/current/doT.js"></script>
        <script type="text/javascript" src="resources/lib/select2/3.4.0/select2.js"></script>
        <script type="text/javascript" src="resources/lib/persist-js/0.1.0/persist.js"></script>


	<!-- The actual spatial semantic browsing widgets -->
	${jsIncludes}

	<script type="text/javascript" src="resources/facete-config.js"></script>

    <script type="text/javascript" src="resources/js/main-facets.js"></script>


	<script type="text/javascript">

		$(document).ready(function() {
			
			var store = new Persist.Store('FaceteStore');
			

			
			/*
			 * Intro screen
			 */
			var suppressIntroScreenKey = 'suppressIntroScreen';

			 
			var $showIntroScreen = $('#show-intro-screen');
			$showIntroScreen.click(function(ev) {
				ev.preventDefault();
				
				$introScreen.modal();
			});
			 
			var $introScreen = $('#myModal'); 			 
			var $introScreenCheckbox = $('#introScreenCheckbox');
			
			$introScreen.on('hidden.bs.modal', function () {
				
				var isSuppressed = !($introScreenCheckbox.is(':checked'));
				console.log('[DEBUG] Store data updated to ', isSuppressed);

				store.set(suppressIntroScreenKey, '' + isSuppressed);	

// 				if(isSuppressed) {
// 					store.set(suppressIntroScreenKey, 'true');	
// 				}
// 				else {
// 					store.remove(suppressIntroScreenKey);
// 				}

				$introScreen.css('display', 'none');
			});

			
			store.get(suppressIntroScreenKey, function(ok, val) {
				
				console.log('[DEBUG] Store data: ', ok, val);
				
				var isVisible = (val != 'true');
				$introScreenCheckbox.prop('checked', isVisible);

				if(isVisible) {
					$introScreen.modal();
				}
			});

			
			
			
			
			var layoutUtils = Namespace('org.aksw.utils.layout');
			
			$('.portlet-header').disableSelection();
			
			$('.portlet')
				.addClass('ui-widget') //ui-corner-all ui-widget-content
				.find('.portlet-header')
				//.addClass('ui-widget-header ui-corner-all')
				.addClass('navbar portlet-navbar') // navbar-fixed-top
				.wrapInner(function() {
					//console.log('this', this);
					var str
						= '<div class="navbar-inner" style="min-height:20px; height:20px; position:relative;">'
						+ '<a href="#" class="brand" style="font-size:14px; padding-top: 0px; padding-bottom: 0px;" />'
						+ '<a href="#" class="toggle-minimized" style="position: absolute; top: 4px; right: 20px;">'
						+ '<i class="icon-minus-sign" />'
						+ '</a>'
						+ '<a href="#" class="toggle-context-help" style="position: absolute; top: 4px; right: 5px;" data-title="Popover" data-content="Content" data-trigger="click" data-placement="bottom" rel="popover">'
						+ '<i class="icon-info-sign" />'
						+ '</a>'
						//+ this.nodeValue.text()
						+ '</div>';
					
					return str;
				})
				//.prepend('<span class="ui-icon ui-icon-minusthick"></span>')
				.end()
				.find('.portlet-content');
			
			//$('.portlet-header').children();
			
		    $('.portlet').resizable({
		        //handles: {'s': 'ui-resizable-handle ui-resizable-se ui-icon ui-icon-gripsmall-diagonal-se'},
		        handles: 's',
		        //grid: [25, 25],
		    	//alsoResize: $(this).find('.portlet-content'),
		    	resize: function(event, ui) {
		    		//$(ui.element).find()
		    		
		    		var $elContent = $(this).find('.portlet-content');
		    		
		    		var height = layoutUtils.getDefaultAutoHeight($elContent, false);
		    		$elContent.css('height', (height - 5) + 'px');
		    	}
		    	/*
		    	stop: function(ev, ui) {
		    		//$(ui.element).removeClass('width');
		    	}*/
		    });

		    //.draggable({
//		        grid: [25, 25]
//		    }).);

			
			$('.toggle-minimized').click(function(ev) {
				ev.preventDefault();
				
				$elI = $(this).find('i:first');
				$elI.toggleClass('icon-minus-sign').toggleClass('icon-plus-sign');
				$(this).parents('.portlet:first').toggleClass('portlet-minimized');
			});

			$('.portlet-group').sortable({
				//connectWith: 'portlet-group',
				handle: '.portlet-header'
				/*
				update: function(event, ui) {
		            var orders = new Array();
		            $('.portlet-group .portlet').each(function(i) {
		                var order = $(this).index();                
		                var id = $(this).attr('data-post-id');
		                orders.push(order);
		            });
		            console.log(orders);
		        }
				*/
			});

			
			// Source: http://stackoverflow.com/questions/11703093/how-to-dismiss-a-twitter-bootstrap-popover-by-clicking-outside
			//var $poped = $('.toggle-context-help');
//			$poped.popover();
			
// 			$poped.click(function() {
// 				console.log('[TRACE] click event received');
// 			});
			
			
			// Trigger for the popover
// 			$poped.each(function() {
// 			    var $this = $(this);
// 			    $this.on('hover',function() {
// 			            var popover = $this.data('popover');
// 			            var shown = popover && popover.tip().is(':visible');
// 			            if(shown) return;        // Avoids flashing
// 			            $this.popover('show');
// 			    });
// 			});

			// Trigger for the hiding
// 			 $('html').on('click.popover.data-api',function() {
// 			    $poped.popover('hide');
// 			});

			
			// http://stackoverflow.com/questions/17842121/hiding-bootstrap-popover-on-click-outside-popover
			//var $popover = $('[data-toggle=popover]').popover();
			
			var popoverSelector = '[rel=popover]';
			var $popover = $('[rel=popover]').popover();			

			$(document).on("click", function (e) {
                var $target = $(e.target);
			    //var isPopover = $target.is(popoverSelector);
			    var isPopover = $target.closest(popoverSelector).length > 0;
			    var inPopover = $target.closest('.popover').length > 0;
			    
			    //console.log('state', isPopover, inPopover, $target);
			    
			    //hide only if clicked on button or inside popover
			    if (!isPopover && !inPopover) {
			    	$popover.popover('hide');
			    }
			});

			
			
			//$('.portlet-content').autoHeight();

			//$('.portlet-container').disableSelection();
		});
	
	
	
		var facets = Namespace("org.aksw.ssb.facets");

		$(document).ready(facets.facetTest);
		
		
		
		
	</script>
</head>
<body>
	<div class="container fill">
<!-- 		<div class="row-fluid"> -->
		<!-- <?php include($headerFile); ?> -->
		${headerHtml} 

			<div id="div-settings" class="row-fluid" style="display: none">
				<form>
<!-- 					<label><input type="radio" name="group1" checked="checked"/>Global</label> -->
					<div class="service-config"></div>
					<div class="inline">Service:</div> <div id="sparql-service-selector" class="select2-container inline" style="width: 300px;"></div>
	    			<div class="inline">Datasets:</div> <div id="default-graph-selector" class="select2-container multiple inline" style="width: 600px;"></div>
					<br class="clearBoth" />
					<hr />
<!-- 					<label><input type="radio" name="group1" />Level of Detail</label> -->
<!-- 					<div class="lod-slider inline" style="width: 300px;"></div> -->
<!-- 					<div class="lod-service-condfig"></div> -->
<!-- 					<br class="clearBoth" /> -->
				</form>
			</div>
<!-- 		</div> -->
		
<!-- 		<br class="clearBoth" style="width:0px; height: 0px;" /> -->
		<div class="clearfix"></div>				
		<div class="row-fluid" id="css-index-mainContainer" style="overflow: visible;">
		
			<div class="span3 filler portlet-group ui-sortable" style="background-color:#E9EFF3;">
		
<!-- 				<div class="portlet-group ui-sortable">  row-fluid -->
					<div class="portlet">
						<div class="portlet-header">Facets</div>
						<div class="portlet-content"> <!-- min-height: 300px;  -->
<!-- 							<div style="overflow:auto;">				 -->
								<ul id="facets" class="facet-tree" style="list-style: none; list-style-type:none;"></ul>
<!-- 							</div> -->
						</div>
					</div>
	
					<div class="portlet">
						<div class="portlet-header">Facet Values</div>				
		                <div id="facetValues" class="portlet-content"></div>
					</div>
<!-- 				</div> -->

					<div class="portlet">
						<div class="portlet-header">Filters</div>				
		                <button id="facete-clear-filters" type="submit" class="btn btn-default">Clear filters</button>
		                <div id="constraints" class="portlet-content"></div>
					</div>

			</div>
			
			<div class="span9" style="margin-left: 5px; margin-top: 3px;">
				<div class="portlet-group ui-sortable">
            
                    <table id="css-index-mainTable">
                        <tr>
                            
                            <!-- Left side (Table View) -->
                            <td id="css-index-mainTable-leftSide">
                                <div class="portlet">
                                    <div class="portlet-header">Table View</div>
                                        <div id="instances" class="portlet-content"></div>
            <!-- 						<div class="portlet-content" style="overflow: auto;")> -->
            <!-- 		                	<div id="instances"></div> -->
            <!-- 						</div> -->
                                    
                    <!--                 <a style="display:none" id="exportCsv" href="#">Export CSV</a> -->
                    <!--                 <a style="display:none" id="exportRdf" href="#">Export RDF</a> -->
                                </div>
                            </td>
                            
                            
                            <!-- Right side (Map and Detail View) -->
                            <td id="css-index-mainTable-rightSide">
                                <div class="portlet">
                                    <div class="portlet-header">Map</div>
                                    
                                    <div id="mapNoticeArea"></div>
                                    
                                    <table style="width: 100%">
                                    <tr><td style="width: 1px">Geo-Link:</td><td style="width:100%"><select id="geolink" style="width: 100%"></select></td></tr>
                                    </table>
                                    
                                    <div id="mapContainer" class="portlet-content">
                                        <div id="map" style="height: 300px;"></div>
                                        <a id="centerMapOnPosition" href="#" style="display:none; position:absolute; bottom: 20px; z-index: 1000;">Center on user location</a>
                                    </div>
                                </div>			

                                <div class="portlet">
                                    <div class="portlet-header">Detail view</div>
                                    <div id="detailViewState"></div>
                                    <div id="detailView" class="portlet-content"></div>
                                </div>
                            </td>
                    
                        </tr>
                    
                    </table>

				</div>
				
		<!-- 		<div class="portlet-group ui-sortable row-fluid"> -->

			</div>

 		</div>
		
    </div>
    
<!-- Modal -->
  <div class="modal fade" style="display: none; left: 10%; width: 80%; margin: 0px" id="myModal">
    <div class="modal-dialog">
      <div class="modal-content">
        <div class="modal-header">
          <button type="button" class="close" data-dismiss="modal" aria-hidden="true">&times;</button>
          <h4 class="modal-title">Welcome to SemMap - A tool for exploring (geographical) Linked Data datasets on the Web.</h4>
        </div>
        <div class="modal-body">
          
          
          <img src="resources/images/facete-intro.png"></img>
          
          
        </div>
        <div class="modal-footer">
        	<label style="display: inline"><input id="introScreenCheckbox" type="checkbox" /> Show this introduction on next visit</label>
          <a href="#" class="btn btn-primary" data-dismiss="modal">Close</a>
<!--           <a href="#" class="btn btn-primary">Save changes</a> -->
        </div>
      </div><!-- /.modal-content -->
    </div><!-- /.modal-dialog -->
  </div><!-- /.modal -->
  
</body>
</html>
