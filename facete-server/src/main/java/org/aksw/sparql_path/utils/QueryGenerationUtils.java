package org.aksw.sparql_path.utils;

import java.util.Collection;
import java.util.List;

import org.aksw.sparql_path.core.domain.Concept;
import org.aksw.sparqlify.core.algorithms.GeneratorBlacklist;

import com.hp.hpl.jena.graph.Triple;
import com.hp.hpl.jena.sdb.core.Generator;
import com.hp.hpl.jena.sparql.core.BasicPattern;
import com.hp.hpl.jena.sparql.core.Var;
import com.hp.hpl.jena.sparql.syntax.Element;
import com.hp.hpl.jena.sparql.syntax.ElementTriplesBlock;
import com.hp.hpl.jena.sparql.syntax.PatternVars;

public class QueryGenerationUtils {
	/**
	 * Takes a concept and adds
	 * 
	 * @return
	 */
	public static Concept createPropertyQuery(Concept concept) {
		Collection<Var> vars = PatternVars.vars(concept.getElement());
		List<String> varNames = VarUtils.getVarNames(vars);
		
		Var s = concept.getVar();
		
		Generator gen = GeneratorBlacklist.create("v", varNames);
		Var p = Var.alloc(gen.next());
		Var o = Var.alloc(gen.next());
		
		
		Triple triple = new Triple(s, p, o);
		
		BasicPattern bp = new BasicPattern();
		bp.add(triple);
		
		List<Element> elements = concept.getElements();
		elements.add(new ElementTriplesBlock(bp));
		
		Concept result = new Concept(elements, p);
		
		return result;
	}
}
