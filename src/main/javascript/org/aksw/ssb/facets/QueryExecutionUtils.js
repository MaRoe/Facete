(function($) {

	var sparql = Namespace("org.aksw.ssb.sparql.syntax");
	var facets = Namespace("org.aksw.ssb.facets");
	var labelUtils = Namespace("org.aksw.ssb.utils");

	
	// TODO Possible separate namespaces for query generation and execution
	var ns = Namespace("org.aksw.ssb.facets.QueryUtils"); 


	/**
	 * 
	 * 
	 */
	ns.loadDefaultFacets = function(sparqlService, config, callback) {
		var autoFacetVar = 1;
		
		var s = config.driverVar;
		
		q = ns.FacetUtils.createQueryLoadDefaults(config);
		
		if(!callback) {
			callback = ns.DummyCallback;
		}
		
		console.log("Fetching facets: " + q);
		
		sparqlService.executeSelect(q.toString(), {
			failue: function() { callback.failure(); },
			success: function(jsonRs) {
				// Update the model (and thereby the view)
				var map = jsonRdfResultSetToMap(jsonRs, "__p", "__c");

				for(var propertyName in map) {
					//var count = map[propertyName];
					var propertyNode = sparql.Node.uri(propertyName);
					var objectNode = sparql.Node.v("var" + autoFacetVar);
					
					
					/*
					var facetDesc = new sparql.facets.FacetDesc
					(
							propertyName,
							propertyNode,
							new sparql.ElementTriplesBlock([new sparql.Triple(self.config.driverVar, propertyNode, objectNode)])
					);
					*/
					
					var element = new sparql.ElementTriplesBlock([new sparql.Triple(s, propertyNode, objectNode)]);
					
					var newFacet = new ns.Facet(config.getRoot(), propertyNode.value, element, s.value);
					
					config.addFacet(newFacet);
					
					//self.knownFacets.push(facetDesc);
					//var facets = config.getRoot().getSubFacets();					
				}
				callback.success();
			}
		});
	};


	/**
	 * Fetches label for the facets
	 * 
	 * 
	 */
	ns.processFacets = function(state, jsonRs, labelFetcher, callback) {
		//console.log("Facet result set", jsonRs);
		
		var result = state; 
		var map = jsonRdfResultSetToMap(jsonRs, "__p", "__c");
	
		//console.log("labelFetcher", $.ssb);
		return labelFetcher.fetch(_.keys(map), true).pipe(function(idToLabel) {
															
			for(var propertyName in map) {
				
				var label = propertyName;
				if(propertyName in idToLabel) {
					label = idToLabel[propertyName].value;
				}
													
				var count = map[propertyName];
				
				var node = result.pathManager.getRoot().getOrCreate(propertyName);

				node.data = {count: count, label: label};
			}
			
			if(callback) {
				callback.success(result);
			}
			
			return result;
		});		
	};

	

	/**
	 * 
	 * 
	 * @returns A promise for the action
	 * 
	 */
	ns.loadFacetValues = function(sparqlService, labelFetcher, state, breadcrumb, callback) {
		//var self = this;

		var baseElement = state.driver.element;
		
		var queryData = ns.createFacetValuesQuery(baseElement, breadcrumb, state.config.sampleSize);

		var query = queryData.query;
		query.limit = 10;
		
		//console.debug("Values query:", queryData);
		
		// Test query
		//query.elements.push(new sparql.ElementString("?s rdfs:label ?var1 . Filter(regex(?var1, '199')) ."));
		
		// The result is a list of facet values:
		// (valueNode, label, count)
		var result = {}; //[];
		
		return sparqlService.executeSelect(query.toString()).pipe(function(jsonRs) {
				//console.debug("Binding", jsonRs);
				
				var outputVar = breadcrumb.targetNode.variable;
				
				var bindings = jsonRs.results.bindings;
				
				for(var i = 0; i < bindings.length; ++i) {
					var binding = bindings[i];
					var val = binding[outputVar];
					
					var valueNode = sparql.Node.fromJson(val);
					var count = binding["__c"].value;// TODO Maybe parse as int
					
					var facetValue = new facets.FacetValue(valueNode, count);
					result[valueNode] = facetValue;
					//result.push();
				}
					
				
				//console.log("Raw facet values:", result);
				//var vars = jsonRs.head.vars;
				
				// TODO We need a discriminator column so we know which facet the values correspond to
				//var map = jsonRdfResultSetToMap(jsonRs, "var1", "__c");
		
				var uris = [];
				for(key in result) {
					var node = result[key].node;

					if(node.isUri()) {						
						uris.push(node.value);
					}
				}
				
				//console.debug("Value URIs", uris, result);
				
				//var labelFetcher = new labelUtils.LabelFetcher(sparqlService);
				return labelFetcher.fetch(uris, true).pipe(function(uriToLabel) {

					//console.log("Facet value uris", uris, uriToLabel);

					for(var i in result) {						
						var facetValue = result[i];
						var node = result[i].node;
						
						var label = uriToLabel[node.value];
						if(!label) {
							label = node;
						}
						
						facetValue.label = label;
						
						//console.debug("Using facet value label", facetValue.label);
					}
					
					/*
					for(var i = 0; i < result.length; ++i) {						
						var val = result[i].node;
						
						var label = idToLabel[val.value];
						if(!label) {
							label = val;
						}
						
						result[i].label = label;					
					}
					*/

					if(callback) {
						callback.success(result, uriToLabel);
					}
					
					return {facetValues:result, uriToLabel: uriToLabel};
				});
			});
	};

	/**
	 * 
	 * 
	 * @param node
	 * @param item
	 */
	ns.fetchFacetCountsGeomRec = function(sparqlService, labelFetcher, facetState, node, propertyNameToItem) {
		
		//var self = this;
		var driver = facetState.driver;
		var query = ns.createFacetQueryCount(driver.element, driver.variable);

		// Return a promise so we can react if the callback finishes
		var result = sparqlService.executeSelect(query.toString()).pipe(function(jsonRs) {

				//console.log("jsonRs for facet counts", jsonRs);
				return ns.processFacets(facetState, jsonRs, labelFetcher).pipe(function(facetState) {
												
					var countTasks = [];

					$.each(node.outgoing, function(propertyName, child) {
						var item = propertyNameToItem[propertyName];
						
						if(item) {
							
							var breadcrumb = item.model.get("breadcrumb");
							
							countTasks.push(ns.loadFacetValues(sparqlService, labelFetcher, facetState, breadcrumb).pipe(function(data) {
								child.facetValues = data.facetValues;
								//console.log("So far got", facetValues);
							}));

							//console.log("Need to fetch: ", item);
						}							
					});
					
					return $.when.apply(window, countTasks).then(function() {
						return facetState;				
					});					
				});
		});
		
		return result;
	};

	/**
	 * Fetches the first column of the first row of a result set and parses it as int.
	 * 
	 */
	ns.fetchInt = function(sparqlService, query, variable) {
		
		var result = sparqlService.executeSelect(query.toString()).pipe(function(data) {
			var count = parseInt(data.results.bindings[0][variable.value].value);
			
			return count;
		});
	
		return result;
	};

})(jQuery);