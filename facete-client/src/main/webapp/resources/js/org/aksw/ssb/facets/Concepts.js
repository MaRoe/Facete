(function() {
	
	var ns = Namespace("org.aksw.ssb.facets");

	ns.ConceptType = {
			'Unknown': 0,
			'Extensional': 1,
			'Intensional': 2
	};

	ns.Concept = function(conceptType) {
		this.conceptType = conceptType ? conceptType : ns.ConceptType.Unknown;
	};
	
	ns.Concept.prototype = {
		constructor: ns.Concept,

		getConceptType: function() {
			return this.conceptType;
		},

		isIntensional: function() {
			return this.conceptType == ns.ConceptType.Intensional;
		},
		
		isExtensional: function() {
			return this.conceptType == ns.ConceptType.Extensional;
		}
	};
	

	
	/**
	 * Returns a new array of those triples, that are directly part of the given array of elements.
	 * 
	 */
	ns.getElementsDirectTriples = function(elements) {
		var result = [];
		for(var i = 0; i < elements.length; ++i) {
			var element = elements[i];
			if(element instanceof sparql.ElementTriplesBlock) {
				result.push.apply(result, element.triples);
			}
		}
		
		return result;
	};
	
	
	/**
	 * Combines the elements of two concepts, yielding a new concept.
	 * The new concept used the variable of the second argument.
	 * 
	 */
	ns.createCombinedConcept = function(baseConcept, tmpConcept) {
		// TODO The variables of baseConcept and tmpConcept must match!!!
		// Right now we just assume that.
		
		
		// Check if the concept of the facetFacadeNode is empty
		var tmpElements = tmpConcept.getElements();
		var baseElement = baseConcept.getElement();
		
		// Small workaround (hack) with constraints on empty paths:
		// In this case, the tmpConcept only provides filters but
		// no triples, so we have to include the base concept
		var hasTriplesTmp = tmpConcept.hasTriples();
		
		var e;
		if(tmpElements.length > 0) {

			if(hasTriplesTmp && baseConcept.isSubjectConcept()) {
				e = tmpConcept.getElement();
			} else {
				var baseElements = baseConcept.getElements();

				var newElements = [];
				newElements.push.apply(newElements, baseElements);
				newElements.push.apply(newElements, tmpElements);
				
				e = new sparql.ElementGroup(newElements);
			}
		} else {
			e = baseElement;
		}
		
		
		var concept = new facets.ConceptInt(e, tmpConcept.getVariable());

		return concept;
	};


	ns.ConceptInt = function(element, variable) {
		ns.Concept.call(this, ns.ConceptType.Intensional);
		this.element = element;
		this.variable = variable;
	};

	
	/**
	 * Array version constructor
	 * 
	 */
	ns.ConceptInt.createFromElements = function(elements, variable) {
		var element;
		if(elements.length == 1) {
			element = elements[0];
		} else {
			element = new sparql.ElementGroup(elements);
		}
		
		var result = new ns.ConceptInt(element, variable);
		
		return result;
	};

	
	ns.ConceptInt.prototype = new ns.Concept();
	_.extend(ns.ConceptInt.prototype, {
			constructor: ns.ConceptInt,
			
			toJson: function() {
				var result = {
						element: JSON.parse(JSON.stringify(this.element)),
						variable: this.variable
				};
				
				return result;
			},
			
			getElement: function() {
				return this.element;
			},
			
			hasTriples: function() {
				var elements = this.getElements();
				var triples = ns.getElementsDirectTriples(elements);
				var result = triples.length > 0;
				
				return result;
			},
			
			/**
			 * Convenience method to get the elements as an array.
			 * Resolves sparql.ElementGroup
			 * 
			 */
			getElements: function() {
				var result;
				
				if(this.element instanceof sparql.ElementGroup) {
					result = this.element.elements;
				} else {
					result = [ this.element ];
				}
				
				return result;
			},
	
			getVar: function() {
				return this.variable;				
			},
			
			getVariable: function() {
				
				if(!this.warningShown) {				
					//console.log('[WARN] Deprecated. Use .getVar() instead');
					this.warningShown = true;
				}
				
				return this.getVar();
			},
			
			toString: function() {
				return "" + this.element + "; " +  this.variable;
			},
			
			// Whether this concept is isomorph to (?s ?p ?o, ?s)
			isSubjectConcept: function() {
				var result = false;
				
				var v = this.variable;
				var e = this.element;
				
				if(e instanceof sparql.ElementTriplesBlock) {
					var ts = e.triples;
					
					if(ts.length === 1) {
						var t = ts[0];
						
						var s = t.getSubject();
						var p = t.getProperty();
						var o = t.getObject();
						
						result = v.equals(s) && p.isVar() && o.isVar();
					}
				}

				
				return result;
			},

			combineWith: function(that) {
				var result = ns.createCombinedConcept(this, that);
				return result;
			},
			
			createOptimizedConcept: function() {
				var element = this.getElement();
				var newElement = element.flatten();
				
				var result = new ns.ConceptInt(newElement, this.variable);

				return result;
			},
			
			/**
			 * Remove unnecessary triple patterns from the element:
			 * Example:
			 * ?s ?p ?o
			 * ?s a :Person
			 *  
			 *  We can remove ?s ?p ?o, as it does not constraint the concepts extension.
			 */
			getOptimizedElement: function() {

				/* This would become a rather complex function, the method isSubjectConcept is sufficient for our use case */
				
				
			}
	});

	
	/**
	 * Extensional concept, expressed as a list of resources (sparql.Node objects)
	 * 
	 * An extensional concept may have a reference to the intensional concept it was created from.
	 * 
	 */
	ns.ConceptExt = function(resources, conceptInt) {
		ns.Concept.call(this, ns.ConceptType.Extensional);
		this.resources = resources;
		this.conceptInt = conceptInt;
	};
	
	
	ns.ConceptExt.prototype = new ns.Concept();
	_.extend(ns.ConceptExt.prototype, {
			constructor: ns.ConceptExt,

			getResources: function() {
				return this.resources;
			},
			
			getIntensionalConcept: function() {
				return conceptInt;
			}
	});

})();

