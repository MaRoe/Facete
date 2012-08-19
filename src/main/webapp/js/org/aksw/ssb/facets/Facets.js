/**
 * Core classes of the facet system:
 * 
 * PathManager
 * PathNode
 * 
 * TODO Breadcrumb (encapsulates a path and supports generating a query element from it)
 * 
 */
(function($) {

	var ns = Namespace("org.aksw.ssb.facets");
	var sparql = Namespace("org.aksw.ssb.sparql.syntax");


	/**
	 * Another class that mimics Jena's behaviour.
	 * 
	 * @param prefix
	 * @param start
	 * @returns {ns.GenSym}
	 */
	ns.GenSym = function(prefix, start) {
		this.prefix = prefix ? prefix : "v";
		this.nextValue = start ? start : 0;
	};
	
	ns.GenSym.prototype.next = function() {
		++this.nextValue;
		
		var result = this.prefix + "_" + this.nextValue;
		
		return result;
	};
	
	
	/*
	ns.FacetValue = function(node, count) {
		this.node = node;
		this.count = count;
	};
	*/
	
	/*
	ns.DriverProvider = function(label, driver) {
		this.label = label;
		this.driver = driver;
	};

	ns.DriverProvider.prototype.getDriver = function() {
		return this.driver;
	};

	ns.DriverProvider.prototype.getLabel = function() {
		return this.label;
	};*/

	
	
	
	/**
	 * Object holding a query element and a variable (of the query element).
	 * 
	 * @param variable
	 * @param element
	 * @returns {ns.Driver}
	 */
	ns.Driver = function(element, variable) {
		this.element = element;
		this.variable = variable;
	};
	
	ns.Driver.prototype.getVariable = function() {
		return this.variable;
	};
	
	ns.Driver.prototype.getElement = function() {
		return this.element;
	};
	
	ns.Driver.prototype.toString = function() {
		return "" + this.getElement() + " with " + this.getVariable(); 
	};
	
	ns.PathNodeFactoryDefault = function() {
	};
	
	ns.PathNodeFactoryDefault.prototype.create = function(pathManager, variable) {
		return new ns.PathNode(pathManager, variable);
	};

	
	/**
	 * 
	 * @param variable A variable name (string)
	 * @param nodeFactory
	 * @returns {ns.PathManager}
	 */
	ns.PathManager = function(variable, nodeFactory) {
		this.nextVariableId = 1;
		
		if(!nodeFactory) {
			nodeFactory = new ns.PathNodeFactoryDefault();
		}
		
		this.nodeFactory = nodeFactory;
		
		this.root = nodeFactory.create(this, variable); //
	};
	
	ns.PathManager.prototype.newNode = function(variable) {
		if(!variable) {
			variable = this.nextVariable();
		}
		
		return this.nodeFactory.create(this, variable);
	};
	
	ns.PathManager.prototype.getRoot = function() {
		return this.root;
	};
	
	
	ns.PathManager.prototype.nextVariable = function() {
		return "v_" + (this.nextVariableId++);
	};
	
	/**
	 * Converts a path string to a list of path elements
	 * 
	 * Variables will be created as needed.
	 * 
	 * e.g.
	 * "fts:beneficiary fts:city owl:sameAs geo:long" 
	 * "fts:beneficiary fts:city owl:sameAs geo:lat"
	 * 
	 * { ?s fts:beneficiary ?v1 . ?v1 fts:city ?v2 . ?v3 owl:sameAs ?v4 . 
	 * Operators:
	 * 
	 * <: Inverse <fts:beneficiary
	 * ^: To property
	 * 
	 * 
	 * @param pathStr
	 */
	ns.PathManager.prototype.toTriples = function(path) {
		var result = this.toTriplesRec(this.root, path);
		
		return result;
	};
	
	
	ns.PathManager.prototype.getNode = function(path) {
		var result = this.root;

		//console.log("PATH", path);
		
		var steps = path.getSteps();

		for(var i = 0; i < steps.length; ++i) {
			var stepStr = "" + steps[i];
			
			result = result.getOrCreate(stepStr);
		}
		
		return result;
	};
		
	
	
	/*
	ns.PathManager.prototype.getNode = function(pathStr) {
		var items = pathStr.split(" ");
		
		var result = this.getNodeRec(this.root, items);
		
		return result;
	};
	*/

	
	/* TODO Not used
	ns.PathManager.prototype.toTriplesRec = function(node, path) {
		var result = [];
		
		var steps = path.getSteps();
		
		for(var i = 0; i < steps.length; ++i) {
			var step = steps[i];
			var stepStr = "" + step;
			
			
			var nextNode = node.getOrCreate(stepStr);
			var s = ssb.Node.v(node.variable);
			var p = ssb.Node.uri(step.getPropertyName());
			var o = ssb.Node.v(nextNode.variable);
			
			var triple = new ssb.Triple(s, p, o);
			result.push(triple);

			node = nextNode;
		}
		
		return result;
	};
	*/
	
	
	/**
	 * 
	 * Variable is a string
	 * 
	 * @param variable
	 * @returns {ns.PathNode}
	 */
	ns.PathNode = function(pathManager, variable) {
		this.pathManager = pathManager;
		if(!variable) {
			variable = pathManager.nextVariable();
		}
		this.variable = variable;
		
		// A map from property name to another path node
		this.outgoing = {};

		this.incoming = {};
	};
	

	/*
	ns.PathNode.prototype.toTriple = function(propertyName) {
		//var propertyName = items[offset];
		
		var nextNode = this.getOrCreate(propertyName);
		
		var s = ssb.Node.v(this.variable);
		var p = ssb.Node.uri(propertyName);
		var o = ssb.Node.v(nextNode.variable);
		
		return new ssb.Triple(s, p, o);
	};
	*/
	
	/**
	 * Gets or create a new outgoing node.
	 * 
	 * FIXME The "outgoing" refers to reachable successor via some label.
	 * The label can also indicate an inverse property step. 
	 */
	ns.PathNode.prototype.getOrCreate = function(propertyName) {
		var node = this.outgoing[propertyName];
		if(!node) {
			node = this.pathManager.newNode(); //new ns.PathNode(this.pathManager);

			this.outgoing[propertyName] = node;
			node.incoming[propertyName] = this;
		} else {
			// Nothing to do
		}
		
		return node;
	};

	
	/**
	 * A step to the set of facets (properties) of a set of resources
	 * Symbol is ^ 
	 * 
	 * Use <^ or >^ to navigate to incoming/outgoing uris only.
	 * 
	 * 
	 * @param direction: <0 incoming, =0 both; >0 outgoing
	 */
	ns.StepFacet = function(direction) {
		this.direction = direction;
	};
	
	ns.StepFacet.prototype.toString = function() {
		if(this.direction < 0) {
			return "<^";
		} else if(this.direction > 0) {
			return ">^";
		} else {
			return "^";
		}
	};
	
	ns.StepFacet.prototype.equals = function(other) {
		return _.isEquals(this, other);
	};

	
	
	/**
	 * 
	 * @param direction
	 * @param resource
	 * @returns {ns.Step}
	 */
	ns.Step = function(propertyName, isInverse) {
		this.type = "property";
		this.propertyName = propertyName;
		this._isInverse = isInverse;
	};
	
	ns.Step.prototype.getPropertyName = function() {
		return this.propertyName;
	};
	
	ns.Step.prototype.isInverse = function() {
		return this._isInverse;
	};
	
	ns.Step.fromString = function(str) {
		if(str.startsWith("<")) {
			return new ns.Step(str.substring(1), true);
		} else {
			return new ns.Step(str, false);
		}
	};

	
	ns.Step.prototype.equals = function(other) {
		return _.isEquals(this, other);
	};
	
	ns.Step.prototype.toString = function() {
		if(this._isInverse) {
			return "<" + this.propertyName;
		} else {
			return this.propertyName;
		}
	};
	

	/**
	 * A path is a sequence of steps
	 * 
	 * @param steps
	 * @returns {ns.Path}
	 */
	ns.Path = function(steps) {
		this.steps = steps ? steps : [];
	};
	
	ns.Path.prototype.toString = function() {
		return this.steps.join(" ");		
	};
	
	ns.Path.fromString = function(pathStr) {
		pathStr = pathStr.trim();
		
		var items = pathStr.length !== 0 ? pathStr.split(" ") : [];		
		var steps = _.map(items, function(item) {
			
			if(item === "<^") {
				return new ns.StepFacet(-1);
			} else if(item === "^" || item === ">^") {
				return new ns.StepFacet(1);
			} else {
				return ns.Step.fromString(item);
			}
		});
		
		var result = new ns.Path(steps);
		
		return result;
	};
	
	
	ns.Path.prototype.concat = function(other) {
		return new ns.Path(this.steps.concat(other.steps));
	};
	
	ns.Path.prototype.getSteps = function() {
		return this.steps;
	};
	
	ns.Path.prototype.equals = function() {
		var n = this.steps.length;
		if(n != other.steps.length) {
			return false;
		}
		
		for(var i = 0; i < n; ++i) {
			if(!this.steps[i].equals(other.steps[i])) {
				return false;
			}
		}
		
		return true;
	};
	
	

	// Create a new path with a step appended
	ns.Path.prototype.copyAppendStep = function(step) {
		var newSteps = this.steps.slice(0);
		newSteps.push(step);
		
		var result = new ns.Path(newSteps);
		
		return result;
	};

	
	/**
	 * A breadcrumb is a path that has been resolved against a path manager.
	 * 
	 * 
	 * 
	 * TODO: Either treat an array of steps as a path, or create a specific path object.
	 * 
	 * 
	 * A breadcrumb encapsulates a path across RDF properties.
	 * A breadcrumb can be converted into a set of sparql.Triple objects.
	 * Additionally, it grants access to the source and target nodes
	 * (according to a PathManager), which correspond to sparql variables.
	 * TODO Improve description
	 * 
	 * @param pathManager
	 * @param step
	 * @param sourceNode
	 * @param targetNode
	 * @returns {ns.Breadcrumb}
	 */
	ns.Breadcrumb = function(pathManager, path) {//, sourceNode, targetNode) {
		this.pathManager = pathManager;
		//this.step = step;
		//this.items = step;
		//this.steps = steps;
		this.path = path ? path : new ns.Path();
		
		
		// Cache source and target node
		this.sourceNode = this.pathManager.getRoot(); //sourceNode;
		this.targetNode = this.pathManager.getNode(this.path);
	};
	
	ns.Breadcrumb.prototype.getPath = function() {
		return this.path;
	};
	
	// TODO Why did I add a clone method? Breadcrumbs should be considered immutable.
	ns.Breadcrumb.prototype.clone = function() {
		return new ns.Breadcrumb(this.pathManager, this.path, this.sourceNode, this.targetNode);
	};
	
	/**
	 * Returns a new breadcrumb that is the concatenation of the given two
	 * 
	 */
	ns.Breadcrumb.prototype.concat = function(other) {
		if(this.pathManager !== other.pathManager) {
			throw "Only breadcrumbs with the same path manager can be concatenated";
		};
		
		var path = this.path.concat(other.path);
		
		var sourceNode = this.pathManager.root;
		var targetNode = ns.Breadcrumb.getTargetNode(this.pathManager, path);
		
		var result = new ns.Breadcrumb(
				this.pathManager,
				path,
				sourceNode,
				targetNode
				);
				
		return result;
	};
	
	ns.Breadcrumb.prototype.makeStep = function(step) {
		var newPath = this.path.copyAppendStep(step);
		var result = ns.Breadcrumb.fromPath(this.pathManager, newPath);
		
		return result;
	};
	
	ns.Breadcrumb.fromString = function(pathManager, pathStr) {
		var path = ns.Path.fromString(pathStr);
		
		var result = ns.Breadcrumb.fromPath(pathManager, path);
		
		return result;
	};
	
	/*
	ns.Breadcrumb.fromSteps = function(pathManager, steps) {
		var path = new ns.Path(steps);
		var result = this.fromPath(path);
		
		return result;
	};
	*/
	
	ns.Breadcrumb.fromPath = function(pathManager, path) {
		var sourceNode = pathManager.root;
		var targetNode = ns.Breadcrumb.getTargetNode(pathManager, path);
		
		var result = new ns.Breadcrumb(pathManager, path, sourceNode, targetNode);
		return result;		
	};
	
	// Create a new breadcrumb with a step performed
	/*
	ns.Breadcrumb.prototype.makeStep = function(step) {
		var newSteps = this.steps.slice(0);
		newSteps.push(step);
		
		var result = ns.Breadcrumb.fromSteps(this.pathManager, newSteps);
		
		return result;
	};*/
	
	ns.Breadcrumb.getTargetNode = function(pathManager, path) {
		var result = pathManager.root;
		var steps = path.getSteps();
		
		for(var i = 0; i < steps.length; ++i) {
			var step = steps[i];
			
			var stepStr = step.toString();
			//var propertyName = items[i];
			
			result = result.getOrCreate(stepStr);
		}
		
		return result;
	};
	
	ns.Breadcrumb.prototype.getTargetVariable = function() {
		//var node = this.getTargetNode();
		
		var result = sparql.Node.v(this.targetNode.variable);//node.variable);
		
		return result;
	};
	
	
	ns.Breadcrumb.prototype.createTriplesStep = function(generator, step, startVar, endVar) {
		if(step instanceof ns.Step) {
			return this.createTriplesStepProperty(generator, step, startVar, endVar);
		} else if(step instanceof ns.StepFacet) {
			return this.createTriplesStepFacets(generator, step, startVar, endVar);
		} else {
			console.error("Should not happen");
		}
	};
	
	ns.Breadcrumb.prototype.createTriplesStepProperty = function(generator, step, startVar, endVar) {
		var s = startVar;
		var p = sparql.Node.uri(step.propertyName);
		var o = endVar;
		
		// Swap subject-object if inverse step
		if(step.isInverse()) {
			var tmp = s;
			s = o;
			o = tmp;
		}
		
		
		var triple = new sparql.Triple(s, p, o);
		
		return [triple];
	};
	
	ns.Breadcrumb.prototype.createTriplesStepFacets = function(generator, step, startVar, endVar) {
		
		//console.log("Generator:", generator);
		var s = startVar;
		var p = endVar;
		var o = sparql.Node.v(generator.next()); // TODO Create a new unique var name
		
		// Swap subject-object if inverse step
		if(step.direction < 0) {
			var tmp = s;
			s = o;
			o = tmp;
		}
		
		
		var triple = new sparql.Triple(s, p, o);
		
		return [triple];
		
	};

	/**
	 * Converts the breadcrumb into a set of triple patterns.
	 * Variables are assigned based on the underlying path manager.
	 * 
	 * 
	 * @returns {Array}
	 */
	ns.Breadcrumb.prototype.getTriples = function(generator) {
		var result = [];
		
		
		if(!generator) {
			generator = new ns.GenSym("v");
		}
		
		var node = this.pathManager.getRoot();	
		var steps = this.path.getSteps();
		//console.log("Steps", steps);

		for(var i = 0; i < steps.length; ++i) {
			var step = steps[i];
			
			var stepStr = step.toString();
			var nextNode = node.getOrCreate(stepStr);
			
			var startVar = sparql.Node.v(node.variable);
			var endVar = sparql.Node.v(nextNode.variable);
			
			var triples = this.createTriplesStep(generator, step, startVar, endVar);
			//console.log("triples", triples);
			result = result.concat(triples);
		
			/*
			var s = sparql.Node.v(node.variable);
			var p = sparql.Node.uri(step.propertyName);
			var o = sparql.Node.v(nextNode.variable);
			
			// Swap subject-object if inverse step
			if(step.isInverse) {
				var tmp = s;
				s = o;
				o = tmp;
			}
			
			
			var triple = new sparql.Triple(s, p, o);
			result.push(triple);
			*/

			node = nextNode;
		}
		
		return result;
	};
	
	/*
	ns.Breadcrumb.prototype.addStep = function(step) {
		
	}
	*/
	
	ns.Breadcrumb.prototype.toString = function() {
		//return this.steps.join(" ");
		return this.path.toString();
	};
	
	

//		var step = ns.Step.fromString(pathManager, pathStr);
	
	

})(jQuery);