// Performance-optimized patches for 3D-Visualization/main.js

// 1. Optimized star field generation with fewer stars and efficient updates
function createOptimizedStarField() {
  // Reduce star count from 3000 to 1200 for better performance
  const starCount = 1200;
  
  // Use Float32Arrays for better performance
  const positions = new Float32Array(starCount * 3);
  const colors = new Float32Array(starCount * 3);
  const sizes = new Float32Array(starCount);
  
  // Simplified star color types (fewer variations = better performance)
  const starColors = [
    { color: new THREE.Color(0xaabfff), size: 0.08, prob: 0.05 }, // Blue
    { color: new THREE.Color(0xffffff), size: 0.06, prob: 0.25 }, // White
    { color: new THREE.Color(0xfff4ea), size: 0.05, prob: 0.40 }, // Yellow-white
    { color: new THREE.Color(0xffaa88), size: 0.04, prob: 0.30 }  // Red
  ];
  
  // Pre-calculate color distribution
  let probSum = 0;
  const colorProbThresholds = starColors.map(sc => {
    probSum += sc.prob;
    return probSum;
  });
  
  // Distribute stars in a sphere instead of a cube for more realistic space feel
  for (let i = 0; i < starCount; i++) {
    // Use spherical distribution (more realistic)
    const radius = 1000;
    const theta = Math.random() * Math.PI * 2; // Horizontal angle
    const phi = Math.acos(2 * Math.random() - 1); // Vertical angle
    
    // Convert spherical to cartesian coordinates
    positions[i * 3] = radius * Math.sin(phi) * Math.cos(theta);
    positions[i * 3 + 1] = radius * Math.sin(phi) * Math.sin(theta);
    positions[i * 3 + 2] = radius * Math.cos(phi);
    
    // Select star color and size based on probability distribution
    // More efficient than checking each type individually
    const rand = Math.random();
    let selectedType;
    for (let j = 0; j < colorProbThresholds.length; j++) {
      if (rand <= colorProbThresholds[j]) {
        selectedType = starColors[j];
        break;
      }
    }
    
    colors[i * 3] = selectedType.color.r;
    colors[i * 3 + 1] = selectedType.color.g;
    colors[i * 3 + 2] = selectedType.color.b;
    
    // Add subtle size variation
    sizes[i] = selectedType.size * (0.8 + Math.random() * 0.4);
  }
  
  // Create geometry with buffers
  const geometry = new THREE.BufferGeometry();
  geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
  geometry.setAttribute('customColor', new THREE.BufferAttribute(colors, 3));
  geometry.setAttribute('size', new THREE.BufferAttribute(sizes, 1));
  
  // Use a simpler shader material for better performance
  const material = new THREE.ShaderMaterial({
    uniforms: {
      time: { value: 0 },
      twinkleSpeed: { value: 0.05 }, // Controls speed of twinkling
      twinkleAmount: { value: 0.3 }  // Controls intensity of twinkling
    },
    vertexShader: `
      attribute float size;
      attribute vec3 customColor;
      varying vec3 vColor;
      uniform float time;
      uniform float twinkleSpeed;
      uniform float twinkleAmount;
      
      void main() {
        vColor = customColor;
        
        // Calculate twinkling effect in shader instead of updating buffer
        // This is much more efficient
        float twinkle = sin(time * twinkleSpeed + position.x * 0.01 + position.y * 0.01) * twinkleAmount + 1.0;
        
        vec4 mvPosition = modelViewMatrix * vec4(position, 1.0);
        gl_PointSize = size * twinkle * (300.0 / -mvPosition.z);
        gl_Position = projectionMatrix * mvPosition;
      }
    `,
    fragmentShader: `
      varying vec3 vColor;
      
      void main() {
        // Circular point shape with soft edge
        float r = 0.5 * length(2.0 * gl_PointCoord - 1.0);
        float alpha = 1.0 - smoothstep(0.5, 1.0, r);
        
        gl_FragColor = vec4(vColor, alpha);
      }
    `,
    blending: THREE.AdditiveBlending,
    depthTest: false,
    transparent: true
  });
  
  // Create the points system
  return new THREE.Points(geometry, material);
}

// 2. Optimized animation loop with time-based updates and symbol effects
function createOptimizedAnimationLoop(renderer, scene, camera, controls, starField, dodecahedron) {
  let lastTime = 0;
  const updateInterval = 1000 / 30; // Cap updates at 30fps for smoother performance
  
  // Cache DOM elements
  const positionElement = document.getElementById('position');
  const fpsDisplay = document.getElementById('fps');
  
  // Add zoom level indicator to the UI
  const zoomIndicator = document.createElement('div');
  zoomIndicator.id = 'zoom-indicator';
  zoomIndicator.style.position = 'absolute';
  zoomIndicator.style.bottom = '20px';
  zoomIndicator.style.right = '20px';
  zoomIndicator.style.padding = '8px 12px';
  zoomIndicator.style.backgroundColor = 'rgba(0, 0, 0, 0.5)';
  zoomIndicator.style.color = 'white';
  zoomIndicator.style.borderRadius = '4px';
  zoomIndicator.style.fontFamily = 'sans-serif';
  zoomIndicator.style.fontSize = '14px';
  zoomIndicator.style.userSelect = 'none';
  document.body.appendChild(zoomIndicator);
  
  // FPS counter
  let frameCount = 0;
  let lastFpsUpdate = 0;
  
  // Flag to detect camera movement for symbol reactions
  let lastCameraPosition = new THREE.Vector3().copy(camera.position);
  let lastCameraDirection = new THREE.Vector3();
  camera.getWorldDirection(lastCameraDirection);
  
  // Animation frame handler
  function animate(currentTime) {
    requestAnimationFrame(animate);
    
    // Convert time to seconds
    const timeInSeconds = currentTime / 1000;
    
    // Update FPS counter every second
    frameCount++;
    if (currentTime - lastFpsUpdate >= 1000) {
      const fps = Math.round(frameCount * 1000 / (currentTime - lastFpsUpdate));
      if (fpsDisplay) fpsDisplay.textContent = fps;
      frameCount = 0;
      lastFpsUpdate = currentTime;
    }
    
    // Update controls
    controls.update();
    
    // Update star twinkling via shader uniform instead of buffer updates
    // This is much more efficient than updating geometry attributes
    if (starField && starField.material.uniforms) {
      starField.material.uniforms.time.value = timeInSeconds;
    }
    
    // Check if camera has moved or rotated
    const currentPosition = new THREE.Vector3().copy(camera.position);
    const currentDirection = new THREE.Vector3();
    camera.getWorldDirection(currentDirection);
    
    const hasMoved = !currentPosition.equals(lastCameraPosition);
    const hasRotated = !currentDirection.equals(lastCameraDirection);
    
    // Update symbols based on camera position (zoom level)
    if (dodecahedron && dodecahedron.updateSymbolsBasedOnZoom && (hasMoved || hasRotated)) {
      dodecahedron.updateSymbolsBasedOnZoom(camera);
      
      // Update the zoom indicator
      const distance = camera.position.length();
      const zoomLevel = Math.round(100 / distance);
      
      // Update zoom indicator text based on what's currently visible
      if (distance < 8) {
        zoomIndicator.textContent = `ZOOMED IN: ${zoomLevel}%`;
        // Make it red when Depression is starting to appear
        if (distance < 8) {
          const redIntensity = Math.min(255, Math.round(255 * (1 - (distance - 3) / 5)));
          zoomIndicator.style.backgroundColor = `rgba(${redIntensity}, 0, 0, 0.7)`;
        }
      } else if (distance > 25) {
        zoomIndicator.textContent = `ZOOMED OUT: ${zoomLevel}%`;
        // Make it blue when Balance is starting to appear
        if (distance > 25) {
          const blueIntensity = Math.min(255, Math.round(255 * ((distance - 25) / 15)));
          zoomIndicator.style.backgroundColor = `rgba(0, 0, ${blueIntensity}, 0.7)`;
        }
      } else {
        zoomIndicator.textContent = `ZOOM: ${zoomLevel}%`;
        zoomIndicator.style.backgroundColor = 'rgba(0, 0, 0, 0.5)';
      }
      
      // Store current position for next frame comparison
      lastCameraPosition.copy(currentPosition);
      lastCameraDirection.copy(currentDirection);
    }
    
    // Throttle other updates to improve performance
    if (currentTime - lastTime > updateInterval) {
      lastTime = currentTime;
      
      // Update position display
      if (positionElement) {
        positionElement.textContent = `X: ${camera.position.x.toFixed(2)}, Y: ${camera.position.y.toFixed(2)}, Z: ${camera.position.z.toFixed(2)}`;
      }
    }
    
    // Render scene
    renderer.render(scene, camera);
  }
  
  return animate;
}

// 3. Optimized event handlers with debouncing and throttling
function setupOptimizedEventHandlers(camera, renderer, controls, dodecahedron) {
  // Debounced resize handler
  const resizeHandler = debounce(() => {
    const container = document.getElementById('container');
    const width = container.clientWidth;
    const height = container.clientHeight;
    
    camera.aspect = width / height;
    camera.updateProjectionMatrix();
    
    renderer.setSize(width, height);
  }, 100);
  
  // Don't use devicePixelRatio > 1 on high-DPI displays for better performance
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1));
  
  // Add optimized event listeners
  window.addEventListener('resize', resizeHandler);
  
  // Track orbit mode state
  let orbitMode = false;
  
  // Track click timing for double-click detection
  let lastClickTime = 0;
  const doubleClickInterval = 300; // ms between clicks to count as double-click
  
  // Add double-click handler for orbit mode toggle
  const container = document.getElementById('container');
  container.addEventListener('dblclick', (event) => {
    event.preventDefault();
    toggleOrbitMode();
  });
  
  // Alternative way to detect double-clicks manually (for browsers with poor dblclick support)
  container.addEventListener('mousedown', (event) => {
    const currentTime = new Date().getTime();
    const timeDiff = currentTime - lastClickTime;
    
    if (timeDiff < doubleClickInterval && timeDiff > 0) {
      // Double click detected
      event.preventDefault();
      toggleOrbitMode();
    }
    
    lastClickTime = currentTime;
  });
  
  // Function to toggle orbit mode
  function toggleOrbitMode() {
    orbitMode = !orbitMode;
    
    // Update controls based on orbit mode
    controls.enableRotate = true; // Always enable rotation
    
    if (orbitMode) {
      // In orbit mode, the camera moves around the object
      controls.enablePan = false;
      
      // Visual feedback - "shake" the object
      shakeObject(dodecahedron);
      
      // Update UI to show orbit mode is active
      const modeIndicator = document.getElementById('mode-indicator') || createModeIndicator();
      modeIndicator.textContent = 'ORBIT MODE';
      modeIndicator.style.backgroundColor = 'rgba(0, 100, 255, 0.7)';
    } else {
      // In normal mode, enable panning
      controls.enablePan = true;
      
      // Update UI to show normal mode
      const modeIndicator = document.getElementById('mode-indicator');
      if (modeIndicator) {
        modeIndicator.textContent = 'NORMAL MODE';
        modeIndicator.style.backgroundColor = 'rgba(100, 100, 100, 0.7)';
        
        // Fade out after 2 seconds
        setTimeout(() => {
          modeIndicator.style.opacity = '0';
        }, 2000);
      }
    }
  }
  
  // Create a mode indicator element
  function createModeIndicator() {
    const indicator = document.createElement('div');
    indicator.id = 'mode-indicator';
    indicator.style.position = 'absolute';
    indicator.style.top = '20px';
    indicator.style.left = '50%';
    indicator.style.transform = 'translateX(-50%)';
    indicator.style.padding = '8px 16px';
    indicator.style.backgroundColor = 'rgba(0, 100, 255, 0.7)';
    indicator.style.color = 'white';
    indicator.style.borderRadius = '4px';
    indicator.style.fontFamily = 'sans-serif';
    indicator.style.fontSize = '14px';
    indicator.style.fontWeight = 'bold';
    indicator.style.zIndex = '1000';
    indicator.style.pointerEvents = 'none';
    indicator.style.transition = 'opacity 0.5s ease-out';
    container.appendChild(indicator);
    return indicator;
  }
  
  // Function to create a "shake" effect on the object
  function shakeObject(object) {
    if (!object) return;
    
    // Store original position
    const originalPosition = object.position.clone();
    const originalRotation = object.rotation.clone();
    
    // Small random offsets for position
    const posOffset = 0.2;
    const rotOffset = 0.05;
    
    // Define shake animation
    let shakeStep = 0;
    const maxSteps = 10;
    
    function performShake() {
      if (shakeStep >= maxSteps) {
        // Reset to original position/rotation at the end
        object.position.copy(originalPosition);
        object.rotation.copy(originalRotation);
        return;
      }
      
      // Calculate shake intensity (strongest at start, diminishing)
      const intensity = 1 - (shakeStep / maxSteps);
      
      // Apply random position offset
      object.position.set(
        originalPosition.x + (Math.random() - 0.5) * posOffset * intensity,
        originalPosition.y + (Math.random() - 0.5) * posOffset * intensity,
        originalPosition.z + (Math.random() - 0.5) * posOffset * intensity
      );
      
      // Apply random rotation offset
      object.rotation.set(
        originalRotation.x + (Math.random() - 0.5) * rotOffset * intensity,
        originalRotation.y + (Math.random() - 0.5) * rotOffset * intensity,
        originalRotation.z + (Math.random() - 0.5) * rotOffset * intensity
      );
      
      // Increment step and schedule next frame
      shakeStep++;
      requestAnimationFrame(performShake);
    }
    
    // Start the shake animation
    performShake();
  }
  
  // Utility debounce function
  function debounce(func, wait) {
    let timeout;
    return function() {
      const context = this;
      const args = arguments;
      clearTimeout(timeout);
      timeout = setTimeout(() => {
        func.apply(context, args);
      }, wait);
    };
  }
}

// 4. Create dodecahedron with symbols on faces plus special zoom-based symbols
function createOptimizedDodecahedron() {
  // Create a group to hold all objects
  const dodecGroup = new THREE.Group();
  
  // Create the base dodecahedron with a simple material
  const geometry = new THREE.DodecahedronGeometry(5, 0);
  
  // Use MeshLambertMaterial instead of MeshStandardMaterial for better performance
  const material = new THREE.MeshLambertMaterial({
    color: 0x3366cc,
    emissive: 0x112244,
    transparent: true,
    opacity: 0.85, // Make slightly transparent to better see the symbols
    flatShading: true
  });
  
  const baseDodec = new THREE.Mesh(geometry, material);
  dodecGroup.add(baseDodec);
  
  // Extract face information
  const positions = geometry.getAttribute('position');
  const faces = [];
  
  // A dodecahedron has 12 faces, each with 3 vertices
  for (let i = 0; i < positions.count; i += 3) {
    // Calculate face center
    const face = {
      center: new THREE.Vector3(),
      normal: new THREE.Vector3()
    };
    
    // Collect vertices for this face
    const v1 = new THREE.Vector3(positions.getX(i), positions.getY(i), positions.getZ(i));
    const v2 = new THREE.Vector3(positions.getX(i+1), positions.getY(i+1), positions.getZ(i+1));
    const v3 = new THREE.Vector3(positions.getX(i+2), positions.getY(i+2), positions.getZ(i+2));
    
    // Calculate face center by averaging vertices
    face.center.add(v1).add(v2).add(v3).divideScalar(3);
    
    // Calculate face normal using cross product
    const edge1 = new THREE.Vector3().subVectors(v2, v1);
    const edge2 = new THREE.Vector3().subVectors(v3, v1);
    face.normal.crossVectors(edge1, edge2).normalize();
    
    // Extend center to position symbol on the surface
    const centerPos = face.center.clone().normalize().multiplyScalar(5.05);
    face.position = centerPos;
    
    // Calculate rotation to face outward
    face.rotation = new THREE.Euler();
    const upVector = new THREE.Vector3(0, 1, 0);
    
    // Create a quaternion from our normal to the up vector
    const quaternion = new THREE.Quaternion().setFromUnitVectors(
      upVector, 
      face.normal
    );
    
    // Convert quaternion to euler angles
    face.rotation.setFromQuaternion(quaternion);
    
    faces.push(face);
  }
  
  // Define symbol files from the Desktop directory - excluding Balance and Depression as they'll be handled separately
  const symbolFiles = [
    'Elation-Pleasure.png',
    'Fear-Anxiety.png',
    'Gain-Pride.png',
    'Misery.png',
    'Pain.png',
    'Return-Give.png',
    'Var-Response.png',
    'Want-Take.png'
  ];
  
  // Define text files that need placeholder visuals
  const textFiles = [
    'Empathy.txt',
    'Enmity.txt',
    'Loss-Shame.txt'
  ];
  
  // Missing 12th symbol placeholder (noted in wiki)
  const missingSymbolText = 'MISSING SYMBOL';
  
  // Function to create text-based symbol texture
  function createTextSymbol(text, bgColor = '#3366cc', textColor = '#ffffff', border = true) {
    // Create a canvas
    const canvas = document.createElement('canvas');
    canvas.width = 256;
    canvas.height = 256;
    const context = canvas.getContext('2d');
    
    // Draw background
    context.fillStyle = bgColor;
    context.fillRect(0, 0, canvas.width, canvas.height);
    
    // Draw border if needed
    if (border) {
      context.strokeStyle = textColor;
      context.lineWidth = 8;
      context.strokeRect(10, 10, canvas.width - 20, canvas.height - 20);
    }
    
    // Draw text
    context.fillStyle = textColor;
    context.font = 'bold 36px Arial';
    context.textAlign = 'center';
    context.textBaseline = 'middle';
    
    // Wrap text if needed
    const words = text.split(' ');
    const lineHeight = 40;
    let y = canvas.height / 2 - ((words.length - 1) * lineHeight) / 2;
    
    words.forEach(word => {
      context.fillText(word, canvas.width / 2, y);
      y += lineHeight;
    });
    
    // Create texture
    const texture = new THREE.CanvasTexture(canvas);
    return texture;
  }
  
  // Create placeholder textures for text files
  const textSymbols = {};
  textFiles.forEach(filename => {
    const basename = filename.replace('.txt', '');
    textSymbols[basename] = createTextSymbol(basename);
  });
  
  // Add missing symbol placeholder
  const missingTexture = createTextSymbol(missingSymbolText, '#990000');
  
  // Add a symbol to each face
  // Calculate how many faces we have to fill: 12 total
  // We have 8 image files (excluding Balance and Depression), 3 text files, and 1 missing symbol
  const totalSymbols = symbolFiles.length + Object.keys(textSymbols).length + 1; // +1 for missing symbol
  
  faces.forEach((face, index) => {
    let texture;
    let symbolName;
    
    if (index < symbolFiles.length) {
      // Use image symbols for first 8 faces
      symbolName = symbolFiles[index];
      
      // Load from Desktop directory
      const loader = new THREE.TextureLoader();
      loader.crossOrigin = 'anonymous';
      
      // In browser context, we need to use a relative path or URL
      // The actual files will need to be served by the web server
      // For development, we'll map this path in the server configuration
      texture = loader.load(`/symbols/${symbolName}`);
      
      // Note: When running the actual implementation, this will need to be configured
      // to access files from ~/Desktop/symbols-copy/ via the web server
      
    } else if (index < symbolFiles.length + Object.keys(textSymbols).length) {
      // Use text placeholders for the next 3 faces
      const textIndex = index - symbolFiles.length;
      const textName = Object.keys(textSymbols)[textIndex];
      symbolName = textName + '.txt';
      texture = textSymbols[textName];
      
    } else {
      // Use missing symbol placeholder for the 12th face
      symbolName = "Missing Symbol";
      texture = missingTexture;
    }
    
    // Create a plane geometry for the symbol
    const symbolGeometry = new THREE.PlaneGeometry(2, 2);
    const symbolMaterial = new THREE.MeshBasicMaterial({
      map: texture,
      transparent: true,
      opacity: 0.9,
      side: THREE.DoubleSide // Show from both sides
    });
    
    // Store original opacity and symbol name for animation and interaction
    symbolMaterial.userData = { 
      baseOpacity: 0.9,
      symbolName: symbolName 
    };
    
    const symbol = new THREE.Mesh(symbolGeometry, symbolMaterial);
    symbol.name = `symbol_${index}`;
    
    // Position the symbol on the face
    symbol.position.copy(face.position);
    symbol.rotation.copy(face.rotation);
    
    // Add the symbol to the group
    dodecGroup.add(symbol);
  });
  
  // Special handling for Balance (zoom out) and Depression (zoom in)
  
  // 1. Create Balance symbol (outer sphere that appears when zooming out)
  const balanceLoader = new THREE.TextureLoader();
  balanceLoader.crossOrigin = 'anonymous';
  const balanceTexture = balanceLoader.load('/symbols/Balance.png'); // Will be served via web server
  
  // Create a large sphere around everything
  const balanceSphereGeometry = new THREE.SphereGeometry(50, 32, 32);
  const balanceSphereMaterial = new THREE.MeshBasicMaterial({
    map: balanceTexture,
    transparent: true,
    opacity: 0,
    side: THREE.BackSide, // Show on inside
    userData: { symbolName: 'Balance' }
  });
  
  const balanceSphere = new THREE.Mesh(balanceSphereGeometry, balanceSphereMaterial);
  balanceSphere.name = 'balance_sphere';
  dodecGroup.add(balanceSphere);
  
  // 2. Create Depression symbol (inner core that appears when zooming in)
  const depressionLoader = new THREE.TextureLoader();
  depressionLoader.crossOrigin = 'anonymous';
  const depressionTexture = depressionLoader.load('/symbols/Depression.png'); // Will be served via web server
  
  // Create a small sphere at the center
  const depressionSphereGeometry = new THREE.SphereGeometry(1, 32, 32);
  const depressionSphereMaterial = new THREE.MeshBasicMaterial({
    map: depressionTexture,
    transparent: true,
    opacity: 0,
    userData: { symbolName: 'Depression' }
  });
  
  const depressionSphere = new THREE.Mesh(depressionSphereGeometry, depressionSphereMaterial);
  depressionSphere.name = 'depression_sphere';
  dodecGroup.add(depressionSphere);
  
  // Add methods to the group to handle special zoom effects
  dodecGroup.updateSymbolsBasedOnZoom = function(camera) {
    // Calculate distance from camera to center
    const distance = camera.position.length();
    
    // Handle Balance (outer) symbol - appears when zooming out
    const balanceSphere = this.getObjectByName('balance_sphere');
    if (balanceSphere) {
      // Start appearing at distance 25, fully visible at 40
      const balanceOpacity = Math.max(0, Math.min(1, (distance - 25) / 15));
      balanceSphere.material.opacity = balanceOpacity;
    }
    
    // Handle Depression (inner) symbol - appears when zooming in
    const depressionSphere = this.getObjectByName('depression_sphere');
    if (depressionSphere) {
      // Start appearing at distance 8, fully visible at 3
      const depressionOpacity = Math.max(0, Math.min(1, 1 - (distance - 3) / 5));
      depressionSphere.material.opacity = depressionOpacity;
    }
    
    // Update which symbol is being looked at for glow effect
    this.updateSymbolGlow(camera);
  };
  
  // Method to make symbols glow when centered
  dodecGroup.updateSymbolGlow = function(camera) {
    // Cast a ray from camera to center to find which face is being looked at
    const raycaster = new THREE.Raycaster();
    raycaster.set(camera.position, camera.getWorldDirection(new THREE.Vector3()));
    
    // Find intersections with all symbol meshes
    const symbols = this.children.filter(obj => obj.name && obj.name.startsWith('symbol_'));
    const intersects = raycaster.intersectObjects(symbols);
    
    // Reset all symbols to base opacity
    symbols.forEach(symbol => {
      if (symbol.material && symbol.material.userData && symbol.material.userData.baseOpacity) {
        symbol.material.opacity = symbol.material.userData.baseOpacity;
      }
    });
    
    // Make intersected symbol glow
    if (intersects.length > 0) {
      const symbol = intersects[0].object;
      
      // Pulse effect for glowing
      const time = Date.now() * 0.001; // Convert to seconds
      const pulse = Math.sin(time * 3) * 0.1 + 0.9;
      
      // Apply glow effect
      symbol.material.opacity = Math.min(1.0, symbol.material.userData.baseOpacity * 1.2) * pulse;
    }
  };
  
  return dodecGroup;
}

// 5. Simplified lighting setup
function createOptimizedLighting(scene) {
  // Use fewer lights for better performance
  const ambientLight = new THREE.AmbientLight(0x444466, 1);
  scene.add(ambientLight);
  
  // Single directional light instead of multiple lights
  const directionalLight = new THREE.DirectionalLight(0xffffff, 1);
  directionalLight.position.set(10, 10, 10);
  scene.add(directionalLight);
  
  // Remove any existing lights beyond these two
}

/*
Implementation steps:
1. Replace the existing starfield creation with createOptimizedStarField()
2. Replace animation loop with createOptimizedAnimationLoop()
3. Add setupOptimizedEventHandlers() after initializing controls
4. Replace dodecahedron creation with createOptimizedDodecahedron()
5. Replace lighting setup with createOptimizedLighting()
6. Use THREE.Clock for time-based animations instead of framerate-based
7. Remove excessive logging and debug info from main rendering loop
*/