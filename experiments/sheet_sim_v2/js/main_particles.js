// GLOBALS

var scene, camera, renderer;

var gui; // for dat.gui

var stats; // for the built in telemetry

var raycaster = new THREE.Raycaster();
var mouse = new THREE.Vector2();

function onMouseMove( event ) {

	// calculate mouse position in normalized device coordinates
	// (-1 to +1) for both components

	mouse.x = ( event.clientX / window.innerWidth ) * 2 - 1;
	mouse.y = - ( event.clientY / window.innerHeight ) * 2 + 1;

}


init();
render();




function init() {

    // SCENE 

    scene = new THREE.Scene();
    var light = new THREE.AmbientLight( 0x404040 ); // soft white light
    scene.add( light );

    // CAMERA 
    camera = new THREE.PerspectiveCamera( 75, window.innerWidth / window.innerHeight, 0.1, 1000 );
    // perspective camera: fov, aspect ratio, near and far clipping plane
    camera.position.z = 30;
    camera.position.y = 20;
    camera.position.x = 30;

    camera.lookAt(new THREE.Vector3(0,0,0));
    
    // RENDERER 
    renderer = new THREE.WebGLRenderer();
    renderer.setClearColor( 0xf0f0f0 );
    renderer.setSize( window.innerWidth, window.innerHeight ); // can render at lower resolutions, see getting started
    document.body.appendChild( renderer.domElement );
    
    
    // TELEMETRY

    stats = new Stats();
    stats.showPanel( 0 ); // 0: fps, 1: ms, 2: mb, 3+: custom
    document.body.appendChild( stats.dom );


    // CREATE THE SHEET MATERIAL 
   
    // (width, height, mass, division, modelType 
    test_sheet = new sheet( 20, 20, 1000, 50, "particle" );
    
    //test_sheet = new sheet( 20, 20, 500, 50, "particle" );
    // var material = new THREE.MeshLambertMaterial( { vertexColors: THREE.VertexColors, color: 0xFFFFFF, side: THREE.DoubleSide } );

    var material = new THREE.MeshBasicMaterial( { color: 0x7CC5DE} );
    material.wireframe = true;


    var sheetObject = new THREE.Mesh(test_sheet.sheetGeometry, material);
    sheetObject.castShadow = true;
    sheetObject.receiveShadow = true;
    scene.add(sheetObject);

    


    // make the GUI
    // monitor kinetic energy for now
    gui = new dat.GUI(  { width: 600 } );

    var f1 = gui.addFolder('About');

    f1.add( test_sheet, 'modelType' );
    f1.add(this, 'solverType');
    f1.open();

    var f2 = gui.addFolder('Sheet Parameters');

    f2.add(this, 'PARTICLE_SPRING_KS', 10, 500);
    f2.add(this, 'PARTICLE_SPRING_KD', 0,  2);
    f2.add(this, 'GLOBAL_DAMPENING_RATIO', 0, .1);
    f2.add(this, 'MAX_STRAIN', 0.1, 1);
    f2.open();

    //gui.add(this, 'PARTICLE_GLOBAL_KD_R');
    gui.add(this, 'GRAVITY_EN');
    gui.add( test_sheet.model, 'totalKE' );

}





function render() {  // runs at 60 fps... 

    
    stats.begin();  // monitored code begin

    // TODO add user interaction force

    test_sheet.step(TIME_ONE_FRAME, 'verlet'); // take a step


    // update the picking ray with the camera and mouse position
	raycaster.setFromCamera( mouse, camera );

	// calculate objects intersecting the picking ray
	//var intersects = raycaster.intersectObjects( test_sheet.sheetGeometry );

//	for ( var i = 0; i < intersects.length; i++ ) {
//
//		intersects[ i ].object.material.color.set( 0xff0000 );
//
//	}


    renderer.render( scene, camera );

    // Iterate over all controllers on the GUI // for the KE
    for (var i in gui.__controllers) {
      gui.__controllers[i].updateDisplay();
    }

    stats.end(); // monitored code end


    requestAnimationFrame( render );

	
}



function onWindowResize() {

    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize( window.innerWidth, window.innerHeight );

}


 
