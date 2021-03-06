/**
 * A widget for displaying/browsing a set of resources.
 * 
 * 
 * 
 */
(function($) {

	var facets = Namespace("org.aksw.ssb.facets");

	var stringUtils = Namespace("org.aksw.ssb.utils.strings");
	var queryUtils = Namespace("org.aksw.ssb.facets.QueryUtils");
	var labelUtils = Namespace("org.aksw.ssb.utils");
	var talisJsonUtils = Namespace("org.aksw.ssb.utils.talis-json");
	var sparql = Namespace("org.aksw.ssb.sparql.syntax");

	var rdfAuthor = Namespace("org.aksw.ssb.plugins.RDFauthor");

	
	var ns = Namespace("org.aksw.ssb.widgets"); 

	var widgets = ns;
	
	(function() {
	
		
		
		this.ListViewTable = widgets.ListViewBase.extend({
			cols: 3,
			
			initialize: function(options) {

				if(typeof options === 'undefined') {
					options = {};
				}
				
				
				if(options.cols) {
					this.cols = options.cols;
				}

				
				//this.constructor.__super__.initialize.apply(this, options);
				widgets.ListViewBase.prototype.initialize.call(this, options);
			},
			
			appendRow: function(targetEl) {
		    	var result = $('<tr></tr>');
		    	$(targetEl).append(result);
		    	
		    	return result;
			},
			
			
			
		    appendElement: function(elItem) {
		    	
				//console.log("Number of columns: ", this.cols);
		    	var el = this.el;
		    	
		    	var tbodies = $(el).find("> tbody");
		    	
		    	// Append a tbody element if not there yet
		    	var tbody;
		    	if(tbodies.size() == 0) {
		    		tbody = $('<tbody></tbody>');
		    		$(el).append(tbody);
		    	} else {
		    		tbody = tbodies.get(0);
		    	}
		    	
		    	
		    	// Locate the last tr; create a new tr if full or not there
		    	var lastTr = $(tbody).find("> tr:last");

		    	var tr;
		    	
		    	if(lastTr.size() == 0) {
		    		tr = this.appendRow(tbody);
		    	} else {
		    		tr = lastTr.get(0);
		    		
		    		var tds = $(tr).find("> td");
		    		
		    		//console.log("tds.size()", tds.size(), this.cols);
		    		
		    		if(tds.size() >= this.cols) {
		    			tr = this.appendRow(tbody);
		    		}
		    	}
		    			    	
		    	
		    	//console.log("Appending ", lastTr);
		    	
		    	
		    	$(tr).append(elItem);
		    }

		});
		
		/*
		this.ListTableView = Backbone.View.extend({
			tagName: 'table',

		    initialize: function() {
		      _.bindAll(this, 'render', 'unrender', 'remove'); // every function that uses 'this' as the current object should be in here

		    	this.collection.on('add', this.addModel, this);
		    	this.collection.on('reset', this.clear, this);
		    	//this.collection.remove('remove', this.unrender, this);
		    	
		    	this.render();
		    },
		    render: function(){	    	

		    	
		    	
		    	
		      $(this.el).html(html); 
		      return this;
		    },
		    unrender: function() {
		      $(this.el).remove();
		    },
		    remove: function() {
		      this.model.destroy();
		    }
		});*/		
		
	}).apply(ns);
	
	
	
	
	
	
	
	ns.EmptyTable = function(rowCount, columnCount, value) {
		this.rowCount = rowCount;
		this.columnCount = columnCount;
		this.value = value;
	};

	ns.EmptyTable.prototype = {
			getColumnCount: function() {
				return this.columnCount;
			},
	
			getRowCount: function() {
				return this.rowCount;
			},
	
			get: function(row, col) {
				return this.value;
			}
	};
	


	/*
	 * Helper functions 
	 */
	
	
	ns.getRowCount = function(itemCount, columnCount) {
		return Math.ceil(itemCount / columnCount);
	};
	
	ns.getItemIndex = function(row, col, columnCount) {
		return row * columnCount + col;
	};
	
	ns.getItemIndexTransposed = function(row, col, rowCount) {
		return col * rowCount + row;
	};

	
	/*
	 * Index calculation
	 */
	
	/**
	 * 
	 * 
	 * @param list
	 * @param numColumns
	 * @param transpose toggles between row-wise(false) and column-wise(true) fill up.
	 * @param fillValue
	 * @returns {ns.ListTable}
	 */
	ns.ListTableIndex = function(itemCount, columnCount, transposed) {
		this.itemCount = itemCount;
		this.columnCount = columnCount;
		this.transposed = transposed;
		
		this.rowCount = ns.getRowCount(itemCount, columnCount);
	};
	
	ns.ListTableIndex.prototype.get = function(row, col) {
		var result = transposed
			? ns.getItemIndexTransposed(row, col, this.rowCount)
			: ns.getItemIndex(row, col, this.columnCount);
			
		return result;
	};
	
	/*
	 * Data storage 
	 */
	
	ns.ListTable = function(list, tableIndex, fillValue) {
		this.list = list;
		this.tableIndex = tableIndex;
		this.fillValue = fillValue ? fillValue : null;
	};

	ns.ListTable.create = function(list, columnCount, transposed, fillValue) {
		var tableIndex = new ns.ListTableIndex(list.length, columnCount, transposed);		
		var result = new ns.ListTable(list, tableIndex);
		return result;
	};
	
	ns.ListTable.prototype = {
			getColumnCount: function() {
				return this.tableIndex.columnCount;
			},
	
			getRowCount: function() {
				return this.tableIndex.rowCount;
			},
	
			get: function(row, col) {
				get(row, col);
		
				var result = index in list ? list[index] : this.fillValue;
				return result;
			}
	};
	
	ns.getItem = function(list, columnCount, row, col, fillValue) {
		var index = row * columnCount + col;
		if(index > list.length) {
			return fillValue ? fillValue : null;
		}
		
		return list[index];
	};
	
	ns.listToTable = function(list, columnCount, fillValue) {
		var result = [];				
		var numRows = Math.floor(list.length / columnCount);
		
		for(var i = 0; i < numRows; ++i) {
			var row = [];
			for(var j = 0; j < columnCount; ++i) {
				row[j] = ns.getItem(list, columnCount, i, j, fillValue);
			}
			
			result.push(row);
		}
		
		return result;
	};
	
	ns.get = function(obj, key, def) {
		if(!obj) {
			return def;
		}
		
		var val = obj[key];
		return val ? val : def; 
	};
	
	ns.createHtmlTableStr = function(table, attrs) {
		var result;
		
		result = "<table " + ns.get(attrs, "table", "") + ">\n";
		var rowCount = table.getRowCount();
		var columnCount = table.getColumnCount();

		for(var i = 0; i < rowCount; ++i) {
			
			result += "<tr>";
			
			for(var j = 0; j < columnCount; ++j) {
				var item = table.get(i, j);
				
				var idPrefix = ns.get(attrs.idPrefix, null);
				var id = idPrefix ? " id='" + idPrefix + "_" + i + "_" + j + "'" : "";
				
				result += "<td" + id + ">" + item + "</td>";
			}
		
		
			result += "</tr>\n";
		}
		result += "</table>";
		
		return result;		
	};
	
	

	/**
	 * 
	 * 
	 * @param resourceList
	 * @param fnCreateItem
	 * @returns
	 */
	ns.createResourceTable = function(resources, labelFetcher, numColumns, options) {
		
		var resourceStrs = _.map(resources, function(x) { return x.value; });
		//var labels = labelFetcher.fetch(resourceStrs);
		
		return labelFetcher.fetch(resourceStrs).pipe(function(labelInfo) {

			var uriToLabel = labelInfo.uriToLabel;
			
			var list = [];
			_.each(uriToLabel, function(label, uriStr) {
				list.push({uri: sparql.Node.uri(uriStr), label: label});
			});
			
			// For each item create an agility object
			var columnCount = 3;
			var rowCount = ns.getRowCount(resources.length, columnCount);
			
			var idPrefix = "ssb.widget.resourceList";
			
			var dataTable = new ns.EmptyTable(rowCount, columnCount, "");
			var htmlTable = ns.createHtmlTableStr(dataTable, {idPrefix: idPrefix});

			var window = $$({}, htmlTable, {});

			/*
			var div = document.createElement('div');
			div.innerHTML = s;
			var elements = div.childNodes;

			$(window)
			*/
			
			
			
			var cellItems = _.map(list, function(item) {
				
				var model = {uri: item.uri, label: item.label.value};
				
				var result = $$(
						model,
						"<div><span data-bind='label' /></div>",
						'& span { cursor:pointer; }',
						{
							'click span': function() {

								var uri = this.model.get("uri");
								
								if(options) {
									if(options.onClick) {
										options.onClick(uri);
									}
								}
								//alert("Uri: " + uri);
							}
						}
				);
				
				return result;
			});
			
			
			// TODO transpose the cell items
			var cells = window.view.$("td");

			for(var i = 0; i < cellItems.length; ++i) {
				var cell = cells[i];
				var cellItem = cellItems[i];
				
				$$.document.append(cellItem, cell);
				//cell.append(cellItem);				
			}
			
			return window;
		});

	};
	
	ns.ResourceListBackendSparql = function(sparqlService, concept, labelFetcher) {
		this.sparqlService = sparqlService;
		this.concept = concept;
		this.labelFetcher = labelFetcher;
	};
	
	/*
	ns.ResourceListBackendSparql.prototype.fetchLabels = function(nodes) {
		var uriStrs = _.map(nodes, function(node) { return node.value; });
		
		return this.labelFetcher.fetch
	};*/
	
	ns.ResourceListBackendSparql.prototype.fetchResources = function(searchString, options) {

		var element = new sparql.ElementGroup();
		element.elements.push(this.concept.element);
		
		if(searchString) {
			var searchElement = queryUtils.createElementLabelRegex(this.concept.variable, searchString);
			
			element.elements.push(searchElement);
		}
		var newDriver = new facets.ConceptInt(element, this.concept.variable);
		
		
		var query = queryUtils.createQuerySelect(newDriver, options);		
		var result = queryUtils.fetchList(this.sparqlService, query, newDriver.variable);
		
		return result;
		
		//return queryUtils.loadFacetValues(this.sparqlService, this.labelFetcher, facetState, breadcrumb, searchString);
		/*
		.pipe(function(data) {
			//child.facetValues = data.facetValues;
			//console.log("So far got", facetValues);
		}));
		*/
	};
	
	ns.ResourceListBackendSparql.prototype.fetchCountResource = function(searchString) {
		
		var countLimit = 1001;
		var countVar = sparql.Node.v("__c");
		var baseElement = facetState.concept.element;

		var query = queryUtils.createQueryCountFacetValues(baseElement, breadcrumb, searchString, countLimit, countVar);


		return queryUtils.fetchInt(this.sparqlService, query.toString(), countVar).pipe(function(value) {
			return {count: value, countLimit: countLimit};
		});		
	};

	
	// TODO First create a div, then make it a dialog, then append the widget to it...
	ns.createResourceListWidget = function(backend, options) {

		
		
		var widget =
			$$({backend: backend, options: options},
//				"<div class='box-test'>" +
					"<div class='resource-list-widget-wrapper'>" +
						"Search: <input type='text' data-bind='searchString' />" +
						"<div class='resource-list-widget-content' />" +
					"</div>",
//				"</div>",
				{
					'create': function() {
						//this.view.$(".resource-list-widget-wrapper").resizable();
						//$("#box-test").resizable();
						//this.view.$().resizable();
						//this.view.$().dialog();
						//console.log(this.view);
						
						//$(this.view.$(".resource-list-widget-wrapper")).dialog();
						
						this.controller.refresh();
					},
				
					'change': function() {
						this.controller.refresh();
					},					
					
					'refresh': function() {
						var self = this;
						
						var backend = this.model.get("backend");
						var searchString = this.model.get("searchString");
						var options = this.model.get("options");
						
						
						backend.fetchResources(searchString, {limit: 100}).pipe(function(list) {
							self.each(function(i, child){ child.destroy(); });
							
							ns.createResourceTable(list, backend.labelFetcher, 3, options).pipe(function(agilityTable) {
								//self.append(agilityTable);
								self.append(agilityTable, self.view.$(".resource-list-widget-content"));
							});
							
						});
					}
				});

				return widget;
	
	};
	
	ns.xxx = function() {
		var template =
			"{.section items}" +
			"<table>" +
			"{.repeated section @}" +
			"<li>" +
			"{label} ({count})</li>{.end}</table>{.or}<p>(No matching instances)</p>{.end}";

		
		var nCols = 3;
		
		for(var i = 0; i < resources.length; ++i) {
			
		}
		
	};
	
	
	ns.createBrowseBox = function() {
		
	};
	
	
	
	
	
	

})(jQuery);
