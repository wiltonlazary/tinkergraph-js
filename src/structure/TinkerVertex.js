import { inherits } from 'util';

import _ from 'lodash';

import * as ElementHelper from '../ElementHelper';
import * as TinkerHelper from './TinkerHelper';
import TinkerElement from './TinkerElement';
import TinkerVertexProperty from './TinkerVertexProperty';


class TinkerVertex extends TinkerElement {
  constructor(id, label, graph) {
    super(id, label, graph);
    this.id = id;
    this.label = label;
    this.graph = graph;

    this.outEdges = new Map(); // <Label, Array<Edge>>
    this.inEdges = new Map(); // <Label, Array<Edge>>
    this.iterators = new TinkerVertex.Iterators();
  }

  /**
   * This method is overloaded in Java and handles both set/get operations.
   * We added getProperty/setProperty methods to the prototype (see below) to
   * handle these operations.
   */
  property(key, value, keyValues) {
    var list;
    if (arguments.length === 1) { // todo: improve check?
      return this.getProperty(key);
    } else {
      return this.setProperty(key, value, keyValues);
    }
  };

  // JS specific method for getting a property (see property method above)
  getProperty(key) { // JS specific method
    if (this.properties.has(key)) {
      const list = this.properties.get(key);

      if (list.length > 1) {
        throw new Error('Vertex.Exceptions.multiplePropertiesExistForProvidedKey(key)');
      }
      return list[0];
    }

    // return VertexProperty.empty();
    return {}; // temp fix
  };

  // JS specific method for setting a property (see property method above)
  setProperty(key, value, keyValues = []) {
    // ElementHelper.legalPropertyKeyValueArray(keyValues);

    // let vertexProperty;
    // var optionalId = ElementHelper.getIdValue(keyValues);
    let optionalId; // temp
    // ElementHelper.validateProperty(key, value);

    const vertexProperty = optionalId
      ? new TinkerVertexProperty(optionalId.get(), this, key, value)
      : new TinkerVertexProperty(this, key, value);

    const list = this.properties.get(key) || [];
    list.push(vertexProperty);

    this.properties.set(key, list);
    // this.graph.vertexIndex.autoUpdate(key, value, null, this); //todo: implemented index

    ElementHelper.attachProperties(vertexProperty, keyValues);

    return vertexProperty;
  };

  addEdge(label, vertex, keyValues) { //...keyValues
    const edge = TinkerHelper.addEdge(this.graph, this, vertex, label, keyValues);

    return edge;
  };

  remove() {
    const edges = [];
    this.getIterators().edges(Direction.BOTH, Number.MAX_SAFE_INTEGER).forEach(edges.push);
    edges.forEach(Edge.remove);
    this.properties.clear();
    this.graph.vertexIndex.removeElement(this);
    this.graph.vertices.delete(this.id);
  };

  getIterators() {
    return this.iterators;
  };

}


TinkerVertex.Iterators = function TinkerVertexIterators() {
};

inherits(TinkerVertex.Iterators, TinkerElement.Iterators); // extends
// _.extend(TinkerVertex.Iterators.prototype, Vertex.Iterators.prototype, {
//   // properties: function() {

//   // },

//   // hiddens: function() {

//   // },

//   edges: function(direction, branchFactor, labels, element) {
//     var edges = TinkerHelper.getEdges(element, direction, branchFactor, labels);
//     return edges;
//   },

//   vertices: function(direction, branchFactor, labels, element) {
//     var vertices = TinkerHelper.getVertices(element, direction, branchFactor, labels);

//     return vertices;
//   },
// }); // implements




module.exports = TinkerVertex;