import { CodeMirror } from './editor/editor.bundle.js';

const elements = {
  selectedIndex: document.getElementById('selectedIndex'),
  treeContainer: document.getElementById('tree'),
  variableInput: document.getElementById('variableInput'),
  connectionButton: document.getElementById('connection-button'),
  makeNodeButton: document.getElementById('create-node'),
  openAppButton: document.getElementById('open-app'),
  connectionA: document.getElementById('connection-node-A'),
  connectionB: document.getElementById('connection-node-B'),
  commentsSection: document.getElementById('comments-section'),
  close: document.getElementById('close'),
  save: document.getElementById('key'),
  // downloadSvgButton: document.getElementById('download-svg'),
  app: document.getElementById('app'),
  consoleElement: document.getElementById('console')
};

const editor = CodeMirror(elements.commentsSection);
editor.setSize(window.innerWidth - 5, window.innerHeight - 5);
elements.commentsSection.style.display = 'none';

const DARK_THEME = {
  type: 'Dark',
  nodes: '#809ac6',
  text: '#809ac6',
  stroke: '#809ac6',
  nodesBG: '#809ac6',
  edges: '#809ac6',
  selection: '#7e7edd',
  selectionOutgoing: '#f44d8d',
  selectionIncoming: '#4df47a',
  selectionBox: '#7e7edd',
  styles: {
    '--background-primary': '#140401',
    '--color-primary': '#ebbb8b',
    '--color-secondary': '#d43e3e',
    '--color-outgoing': '#2d9248',
    '--color-incomming': '#336d99',
    '--color-inverted': '#ebbb8b'
  }
};
const PAN_STEP = 50;
const ZOOM_STEP = 0.1;
const TUTORIAL_GIFS = 9;
const CURRENT_THEME = { ...DARK_THEME };
const CURVES = {
  composition1: 'unbundled-bezier',
  composition2: 'bezier',
  morphism: 'bezier'
};
const DEFAULT_TOKEN = '⦁';
const memo = {
  lastSelection: { id: undefined, type: 'node', label: '', comment: '' },
  nodePairsSelections: [],
  mousePosition: { x: 0, y: 0 },
  nodeIndex: 0,
  edgeIndex: 0
};

const changeTheme = theme => {
  for (const key in CURRENT_THEME) CURRENT_THEME[key] = theme[key];
  const style = document.documentElement.style;
  for (const color in CURRENT_THEME.styles) {
    style.setProperty(color, CURRENT_THEME.styles[color]);
  }
};
const debounce = func => {
  let timer;
  return event => {
    if (timer) clearTimeout(timer);
    timer = setTimeout(func, 100, event);
  };
};
const cy = cytoscape({
  elements: [],
  container: elements.treeContainer,
  style: [
    {
      selector: 'core',
      style: {
        'selection-box-opacity': 0.5,
        'selection-box-color': CURRENT_THEME.selectionBox,
        'selection-box-border-color': 'transparent',
        'active-bg-color': CURRENT_THEME.selectionBox,
        'active-bg-opacity': 0.8,
        'active-bg-size': 10,
        'selection-box-border-width': 0,
        'outside-texture-bg-color': 'transparent',
        'outside-texture-bg-opacity': 0.5
      }
    },
    // {
    //   selector: '.autorotate',
    //   style: { 'edge-text-rotation': 'autorotate' }
    // },
    {
      selector: 'edge',
      style: {
        width: 1,
        'target-arrow-fill': 'filled',
        'target-arrow-shape': 'triangle',
        'target-arrow-color': CURRENT_THEME.edges,
        'curve-style': CURVES.morphism,
        'line-color': CURRENT_THEME.edges,
        color: CURRENT_THEME.text
      }
    },
    {
      selector: 'node',
      style: {
        shape: 'rectangle',
        // 'border-style': 'solid',
        // 'border-color': CURRENT_THEME.stroke,
        // 'border-width': '2',
        'background-opacity': 0,
        content: 'data(label)'
      }
    },
    {
      selector: 'node[label]',
      style: {
        color: CURRENT_THEME.text,
        'text-outline-color': CURRENT_THEME.selection,
        'text-outline-width': 0,
        'text-valign': 'center',
        'font-size': '15px'
      }
    },
    {
      selector: 'node:selected',
      style: {
        'text-outline-color': CURRENT_THEME.selection,
        'text-outline-width': 3
      }
    },
    {
      selector: 'node:active',
      style: {
        'text-outline-width': 3
      }
    }
  ],
  layout: { name: 'breadthfirst' },
  // initial viewport state:
  zoom: 1,
  pan: { x: 0, y: 0 },
  // interaction options:
  minZoom: 0.4,
  maxZoom: 6,
  zoomingEnabled: true,
  userZoomingEnabled: true,
  panningEnabled: true,
  userPanningEnabled: true,
  boxSelectionEnabled: true,
  selectionType: 'single',
  touchTapThreshold: 8,
  desktopTapThreshold: 8,
  autolock: false,
  autoungrabify: false,
  autounselectify: false,
  // rendering options:
  headless: false,
  styleEnabled: true,
  hideEdgesOnViewport: false,
  textureOnViewport: false,
  motionBlur: false,
  motionBlurOpacity: 0.2,
  pixelRatio: 'auto'
});
const setIndex = v => {
  memo.nodeIndex = +v;
  memo.edgeIndex += memo.nodeIndex;
};
const incIndex = (v = 1) => {
  memo.nodeIndex += v;
};
const addNode = (coordinates, label) => {
  const data = {
    index: memo.nodeIndex,
    label,
    comment: '',
    id: 'n' + memo.nodeIndex,
    type: 'node',
    variant: 'Object'
  };
  const node = cy
    .add({
      group: 'nodes',
      data
    })
    .position({ x: coordinates.x, y: coordinates.y });
  incIndex();
  return node;
};
const addEdge = (vertex, label) => {
  const data = {
    id: `e${memo.edgeIndex}`,
    index: memo.edgeIndex,
    label,
    comment: '',
    source: `${vertex.source}`,
    target: `${vertex.target}`,
    type: 'edge',
    variant: 'Morphism'
  };
  const edge = cy.add({
    group: 'edges',
    // classes: 'autorotate',
    data
  });
  memo.edgeIndex += 1;
  return edge;
};
const inspectSelectionIndex = (selection, opt = '') => {
  elements.selectedIndex.style.display = 'block';
  elements.variableInput.style.display = 'block';
  elements.selectedIndex.textContent = `${selection.type} ${opt}`;
};
const deselectIndex = () => {
  elements.selectedIndex.textContent = '';
  elements.selectedIndex.style.display = 'none';
  elements.variableInput.style.display = 'none';
};
const clickEdges = e => {
  // resetColorOfSelectedNodes();
  clearSelection();
  const { label, comment } = e.target.data();
  memo.lastSelection = {
    type: 'edge',
    id: e.target.id(),
    label: label ?? '',
    comment: comment ?? ''
  };
  elements.variableInput.value = memo.lastSelection.label;
  memo.nodePairsSelections.length = 0;
};

const getPredecessorCode = (leafId = memo.lastSelection.id) => {
  const comment = editor.getValue();
  const current = cy.nodes(`#${leafId}`);
  current.data({
    comment
  });
  return (
    current
      .predecessors('node')
      .map(x => x.data().comment.trim())
      .reverse()
      .join('\n') + comment
  );
};
const updateApp = () => {
  const appDocument = elements.app.contentWindow.document;
  const code = getPredecessorCode();
  appDocument.location.reload();
  appDocument.write(code);
};
const openAppWindow = () => {
  const current = cy.nodes(`#${memo.lastSelection.id}`);
  current.data({
    comment: editor.getValue()
  });
  if (elements.app.style.display === 'none') {
    elements.app.style.display = 'block';
    updateApp();
    elements.consoleElement.value = '';
  } else {
    elements.app.style.display = 'none';
  }

  // appDocument.close();
};
const connectNodes = (couple = memo.nodePairsSelections, label) => {
  if (!couple[0] && !couple[1]) {
    // resetColorOfSelectedNodes(couple);
    clearSelection();
  } else if (couple.length > 1) {
    const edge = addEdge({ source: couple[0], target: couple[1] }, label);
    // resetColorOfSelectedNodes(couple);
    clearSelection();
    return edge;
  }
};
const clickNodes = e => {
  deselectEdges();
  deselectNodes();
  const current = e.target.data();
  memo.lastSelection = {
    type: current.type,
    id: e.target.id(),
    label: current.label ?? '',
    comment: current.comment ?? ''
  };
  elements.variableInput.value =
    current.label === DEFAULT_TOKEN ? '' : current.label;
  editor.setValue(current.comment);
  memo.nodePairsSelections.push(memo.lastSelection.id);
  const couple = memo.nodePairsSelections;
  const incomming = cy.nodes(`#${couple[0]}`).first();
  const outgoing = cy.nodes(`#${couple[1]}`).first();
  incomming.style({
    'text-outline-width': 3,
    'text-outline-color': CURRENT_THEME.selectionIncoming
  });
  outgoing.style({
    'text-outline-width': 3,
    'text-outline-color': CURRENT_THEME.selectionOutgoing
  });
  inspectSelectionIndex(
    memo.lastSelection,
    couple[1]
      ? '[ ' + incomming.data().label + ' -> ' + outgoing.data().label + ' ]'
      : '[ ' + incomming.data().label + ' -> ? ]'
  );
  if (memo.nodePairsSelections.length === 2) {
    const A = incomming.data().label;
    const B = outgoing.data().label;
    elements.connectionA.textContent = A;
    elements.connectionB.textContent = B;
    elements.connectionButton.style.display = 'block';
    positionAbsoluteElement(
      elements.connectionButton,
      offsetPosition(memo.mousePosition, -25, 50)
    );
  } else if (memo.nodePairsSelections.length > 2) {
    clearSelection();
    clickNodes(e);
  }
};
const hasEdges = id => cy.nodes(`#${id}`).connectedEdges().size();
const removeNode = id => {
  cy.nodes(`#${id}`).remove();
};
const removeNodeEdges = id => {
  cy.nodes(`#${id}`).connectedEdges().remove();
};
const removeEdge = id => {
  cy.edges(`#${id}`).remove();
};
const resetColorOfSelectedNodes = (nodes = memo.nodePairsSelections) => {
  nodes.map(id =>
    cy.nodes(`#${id}`).style({
      'text-outline-width': 0,
      'text-outline-color': CURRENT_THEME.selection
    })
  );
};
const offsetPosition = (position, x, y) => ({
  x: position.x + x,
  y: position.y + y
});
const positionAbsoluteElement = (element, coordinates) => {
  element.style.left = coordinates.x + 'px';
  element.style.top = coordinates.y + 'px';
};
const deselectNodes = () =>
  cy.nodes().map(n =>
    n
      .style({
        'text-outline-width': 0,
        'text-outline-color': CURRENT_THEME.selection
      })
      .unselect()
  );
const deselectEdges = () =>
  cy.edges().map(e =>
    e
      .style({
        'line-color': CURRENT_THEME.edges,
        width: 1
      })
      .unselect()
  );
const clearSelection = () => {
  // elements.commentsSection.style.display = 'none';
  resetColorOfSelectedNodes();
  elements.connectionButton.style.display = 'none';
  deselectNodes();
  deselectEdges();
  memo.nodePairsSelections.length = 0;
  memo.lastSelection.id = undefined;
  // popupContainer.innerHTML = '';
};
const renameVariable = (value = DEFAULT_TOKEN) => {
  if (memo.lastSelection.type === 'node') {
    const label = value.trim();
    cy.nodes(`#${memo.lastSelection.id}`)
      .first()
      .data({
        label: label === '' ? DEFAULT_TOKEN : label
      });
  }
};
const eraseCharacter = () =>
  elements.variableInput.value.substring(
    0,
    elements.variableInput.value.length - 1
  );
const clearTree = (nodes = true, edges = true) => {
  if (nodes) {
    cy.nodes().remove();
    memo.nodeIndex = 0;
  }
  if (edges) {
    cy.edges().remove();
    memo.edgeIndex = 0;
  }
};
const offsetElementsIndexes = elements => {
  const N = memo.nodeIndex;
  const E = memo.edgeIndex;
  const { nodes, edges } = elements;
  let maxNodeIndex = 0;
  let maxEdgeIndex = 0;
  const offsetNodes = nodes?.map(n => {
    n.data.index += N;
    n.data.id = 'n' + n.data.index;
    maxNodeIndex = Math.max(maxNodeIndex, n.data.index);
    return n;
  });
  const offsetEdges = edges?.map(e => {
    const index = Number(e.data.id.substr(1)) + E;
    e.data.id = 'e' + index;
    e.data.source = `n${Number(e.data.source.substr(1)) + N}`;
    e.data.target = `n${Number(e.data.target.substr(1)) + N}`;
    maxEdgeIndex = Math.max(maxEdgeIndex, index, E);
    return e;
  });
  incIndex(maxNodeIndex);
  memo.edgeIndex = Math.max(maxEdgeIndex, memo.edgeIndex) + 1;
  return { nodes: offsetNodes || [], edges: offsetEdges || [] };
};
const invertEdges = () => {
  const allEdges = cy.edges();
  const edges = allEdges.filter(edge => edge.selected());
  edges.forEach(edge => {
    const { target, source, label, id, ...rest } = edge.data();
    const vertex = { target: source, source: target };
    edge.remove();
    let newLabel;
    newLabel = label;
    const newEdge = addEdge(vertex, newLabel);
    newEdge.data(rest);
  });
};
const seedGraph = (nodes, edges) => {
  edges?.length ? cy.add([...nodes, ...edges]) : cy.add([...nodes]);
};
const graphFromJson = input => {
  const data = input;
  // clearTree();
  offsetElementsIndexes(data.elements);
  if (data.elements.nodes) {
    seedGraph(data.elements.nodes, data.elements.edges);
    cy.zoom(data.zoom);
    cy.pan(data.pan);
    incIndex();
  }
};
const getElementOffset = element => {
  const rect = element.getBoundingClientRect();
  return {
    left: rect.left,
    top: rect.top
  };
};
cy.on('dblclick', 'node', () => {
  elements.commentsSection.style.display = 'block';
  elements.connectionButton.style.display = 'none';
});

cy.ready(() => {
  // elements.downloadSvgButton.addEventListener('click', () => {
  //   const a = document.createElement('a');
  //   const canvasContainer =
  //     elements.app.contentWindow.document.getElementById('canvas-container');

  //   const temp = canvasContainer.firstChild.style.border;
  //   canvasContainer.firstChild.style.border = 'none';
  //   a.href = window.URL.createObjectURL(
  //     new Blob(
  //       [
  //         canvasContainer.innerHTML.replace(
  //           '<svg',
  //           '<svg xmlns="http://www.w3.org/2000/svg"'
  //         )
  //       ],
  //       {
  //         type: 'text/svg'
  //       }
  //     )
  //   );
  //   a.setAttribute('download', 'gearbit.svg');
  //   a.click();
  //   window.URL.revokeObjectURL(a.href);
  //   canvasContainer.firstChild.style.border = temp;
  // });
  elements.makeNodeButton.addEventListener('click', () => {
    if (elements.commentsSection.style.display === 'block') {
      elements.commentsSection.style.display = 'none';
    } else if (memo.lastSelection.id) {
      elements.commentsSection.style.display = 'block';
      elements.connectionButton.style.display = 'none';
    } else {
      const zoom = cy.zoom();
      const pan = cy.pan();
      const start = 90;
      const end = 150;
      addNode(
        {
          x: (Math.floor(start + Math.random() * end) - pan.x) / zoom,
          y: (Math.floor(start + Math.random() * end) - pan.y) / zoom
        },
        DEFAULT_TOKEN
      );
    }
  });
  elements.openAppButton.addEventListener('click', () => {
    if (memo.lastSelection.id) {
      elements.app.style.display = 'block';
      updateApp();
      elements.consoleElement.value = '';
    } else {
      openAppWindow();
    }
  });
  elements.connectionButton.addEventListener('click', () => {
    if (memo.nodePairsSelections.length === 2) {
      connectNodes(memo.nodePairsSelections);
    }
  });
  document.addEventListener('mousemove', e => {
    memo.mousePosition = {
      x: e.clientX,
      y: e.clientY
    };
  });
  document.addEventListener('dblclick', () => {
    if (
      document.activeElement === document.body &&
      !memo.nodePairsSelections.length &&
      !memo.lastSelection.id
    ) {
      deselectIndex();
      clearSelection();
      const zoom = cy.zoom();
      const pan = cy.pan();
      return addNode(
        {
          x: (memo.mousePosition.x - pan.x) / zoom,
          y: (memo.mousePosition.y - pan.y) / zoom
        },
        DEFAULT_TOKEN
      );
    }
  });
  const saveFile = () => {
    clearSelection();
    const diryJson = cy.json();
    delete diryJson.style;
    delete diryJson.data;
    delete diryJson.zoomingEnabled;
    delete diryJson.minZoom;
    delete diryJson.maxZoom;
    delete diryJson.panningEnabled;
    delete diryJson.boxSelectionEnabled;
    delete diryJson.renderer;
    delete diryJson.hideEdgesOnViewport;
    delete diryJson.textureOnViewport;
    delete diryJson.motionBlur;
    delete diryJson.userPanningEnabled;
    delete diryJson.userZoomingEnabled;
    const data = diryJson;
    const json = JSON.stringify({
      GRAPH: { main: data }
    });
    const a = document.createElement('a');
    const blob = new Blob([json], { type: 'text/json' });
    const url = window.URL.createObjectURL(blob);
    a.href = url;
    a.download = 'tree.json';
    a.click();
    window.URL.revokeObjectURL(url);
  };
  const loadFile = () => {
    const upload = document.createElement('input');
    document.body.appendChild(upload);
    upload.style.display = 'none';
    upload.type = 'file';
    upload.name = 'tree.json';
    const reader = new FileReader();
    reader.onload = async e =>
      graphFromJson(JSON.parse(e.target.result.toString()).GRAPH.main);
    upload.addEventListener('change', e =>
      reader.readAsText(e.currentTarget.files[0])
    );
    upload.click();
  };
  const dropfile = file => {
    const reader = new FileReader();
    reader.onload = async e =>
      graphFromJson(JSON.parse(e.target.result.toString()).GRAPH.main);
    reader.readAsText(file, 'UTF-8');
  };
  elements.treeContainer.ondragover = e => {
    e.preventDefault();
  };
  elements.treeContainer.ondrop = e => {
    e.preventDefault();
    const file = e.dataTransfer.files[0];
    dropfile(file);
  };
  const scroll = (x = 0, y = 0, step) => {
    const pan = cy.pan();
    cy.pan({ x: pan.x + step * x, y: pan.y + step * y });
  };

  const onClose = () => {
    elements.commentsSection.style.display = 'none';
    clearSelection();
    deselectIndex();
    elements.consoleElement.value = '';
    // const appDocument = elements.app.contentWindow;
    elements.app.style.display = 'none';
  };

  elements.save.addEventListener('click', () => saveFile());
  elements.close.addEventListener('click', onClose);
  // elements.load.addEventListener('click', () => loadFile());
  document.addEventListener('keydown', e => {
    if (e.key === 'Escape') {
      e.preventDefault();
      e.stopPropagation();
      clearSelection();
      deselectIndex();
      // onClose();
    }
    if (elements.commentsSection.style.display === 'none') {
      if (e.key.toLowerCase() === 's' && (e.ctrlKey || e.metaKey)) {
        e.preventDefault();
        e.stopPropagation();
        if (memo.lastSelection.id) {
          updateApp();
          clearSelection();
          deselectIndex();
        }
      } else if (e.key === 'Enter') {
        e.preventDefault();
        e.stopPropagation();
        renameVariable(elements.variableInput.value);
        elements.variableInput.value = '';
        clearSelection();
      } else if (
        (memo.nodePairsSelections.length === 1 ||
          memo.lastSelection.type === 'edge') &&
        e.key !== 'Shift' &&
        e.key !== 'Command' &&
        e.key !== 'Alt' &&
        e.key !== 'Meta' &&
        e.key !== 'CapsLock' &&
        e.key !== 'Tab' &&
        e.key !== 'Escape' &&
        e.key !== 'Delete' &&
        e.key !== 'Control' &&
        !e.key.includes('Arrow')
      ) {
        if (e.key === 'Backspace') {
          elements.variableInput.value = eraseCharacter();
        } else {
          elements.variableInput.value += e.key;
        }
      }
      if (e.key === 'Delete' || (e.ctrlKey && e.key === 'Backspace')) {
        cy.elements().forEach(el => {
          if (el.selected()) el.remove();
        });
        clearSelection();
        deselectIndex();
      }
    } else {
      if (e.key.toLowerCase() === 's' && (e.ctrlKey || e.metaKey)) {
        e.preventDefault();
        e.stopPropagation();
        if (elements.app.style.display === 'block') {
          updateApp();
        }
      }
    }
  });
  cy.on('dragfree', 'node', e => {
    clearSelection();
    deselectIndex();
  });
  cy.on('select', 'edge', e => {
    e.target.style({ 'line-color': CURRENT_THEME.selection, width: 3 });
  });
  cy.on('select', 'node', e => e.target.style('text-outline-width', 3));
  cy.on('click', 'node', clickNodes);
  cy.on('click', 'edge', e => {
    clickEdges(e);
    const data = e.target.data();
    const incomming = cy.nodes(`#${data.source}`).first();
    const outgoing = cy.nodes(`#${data.target}`).first();
    inspectSelectionIndex(
      memo.lastSelection,
      '[ ' + incomming.data().label + ' -> ' + outgoing.data().label + ' ]'
    );
  });
  window.addEventListener('resize', () =>
    editor.setSize(window.innerWidth - 5, window.innerHeight - 5)
  );
  elements.treeContainer.focus();
});
