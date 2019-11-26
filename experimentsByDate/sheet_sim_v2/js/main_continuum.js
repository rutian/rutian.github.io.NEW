// GLOBALS

var scene, camera, renderer;

var gui; // for dat.gui

var stats; // for the built in telemetry

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
 
    //constructor( unstructuredMesh, density, thickness ); 
    sheet = new sheetContinuumModel( M_UnstructuredMesh, 1, 1 );

    scene.add(sheet.mesh);

    // make the GUI
    // monitor kinetic energy for now
    gui = new dat.GUI({ width: 600 } );

    var f1 = gui.addFolder('About');
    f1.add( sheet, 'modelType' );
    f1.add( sheet, 'solver' );
    f1.add( this, 'GLOBAL_DAMPENING_RATIO', 0, .1);
    f1.open();
   
    var f2 = gui.addFolder( 'Material Properties');
    f2.add(this, 'YOUNGS', 1, 100); 
    f2.add(this, 'NU', 0, 1);
    f2.open();

 
    gui.add(this, 'GLOBAL_D_RATIO', 0, 1);
    gui.add(this, 'INPLANE_FORCE_VIEW_EN');
    gui.add(this, 'OUTPLANE_FORCE_VIEW_EN');


    gui.add(this, 'GRAVITY_EN');
    gui.add(this, 'PRESSURE', -1, 1).step(0.05);
    gui.add(sheet, 'totalKE' );

    // get some testing for the bending forces


    // initialize some force vector visualiztions


//    var inPlaneLineMaterial  = new THREE.LineBasicMaterial({ color: 0x000000 });
//    var outPlaneLineMaterial = new THREE.LineBasicMaterial({ color: 0x00ff00 });
//
//
//    inPlaneForceVectorGeometry  = new THREE.Geometry();
//    outPlaneForceVectorGeometry = new THREE.Geometry();
//
//    var j_unit= new THREE.Vector3(0,1,0);
//
//    for ( var i = 0; i < test_sheet.model.n; i ++ ) {
//         
//        var lineStart = new THREE.Vector3(0,0,0);
//        var lineEnd   = new THREE.Vector3(0,0,0); 
//
//        lineStart.fromArray(test_sheet.model.x_list, i * 3);
//        lineEnd.fromArray(test_sheet.model.x_list, i * 3);
//        lineEnd.add(j_unit);
//
//        outPlaneForceVectorGeometry.vertices.push(lineStart);
//        outPlaneForceVectorGeometry.vertices.push(lineEnd);
//    
//        inPlaneForceVectorGeometry.vertices.push(lineStart); // both start at same place
//        inPlaneForceVectorGeometry.vertices.push(lineEnd); 
//        
//
//    } 
//
//    outPlaneForceVectors = new THREE.LineSegments(outPlaneForceVectorGeometry, outPlaneLineMaterial);
//    scene.add(outPlaneForceVectors); 
//
//
//    inPlaneForceVectors = new THREE.LineSegments(inPlaneForceVectorGeometry, inPlaneLineMaterial);
//    scene.add(inPlaneForceVectors);
//
}


function initForceVectorVisualization( sheet ) {
}



function updateForceVectorVisualization() {



}



// visual debugging tool


function updateDebuggingVis() {


    for ( var i = 0; i < test_sheet.model.n ; i++ ) {

        // for all the particles
        var in_fvec_start = new THREE.Vector3(0,0,0);
        var in_fvec_end   = new THREE.Vector3(0,0,0);

        in_fvec_start.fromArray(test_sheet.model.x_list, i*3);
        in_fvec_end.fromArray(test_sheet.model.f_list_internal_inPlane, i*3);
    
        // offset from origin
        in_fvec_end.add(in_fvec_start);

        inPlaneForceVectorGeometry.vertices[i*2] = in_fvec_start;
        inPlaneForceVectorGeometry.vertices[i*2 + 1] = in_fvec_end;

        var out_fvec_end = new THREE.Vector3(0,0,0);
        out_fvec_end.fromArray(test_sheet.model.f_list_internal_outPlane, i*3);
        out_fvec_end.add(in_fvec_start);

//  
        outPlaneForceVectorGeometry.vertices[i*2] = in_fvec_start; // all forces start at teh same place
        outPlaneForceVectorGeometry.vertices[i*2 + 1] = out_fvec_end;

        // signal update

        outPlaneForceVectorGeometry.verticesNeedUpdate = true; 
        inPlaneForceVectorGeometry.verticesNeedUpdate = true; 

        if (INPLANE_FORCE_VIEW_EN) {
            inPlaneForceVectors.visible = true;
        } else {
            inPlaneForceVectors.visible = false;
        }

        if (OUTPLANE_FORCE_VIEW_EN) {
            outPlaneForceVectors.visible = true;
        } else {
            outPlaneForceVectors.visible = false;
        }

    
    
        //forceDir1.vertices[0] = n1_new_start;
        //forceDir1.vertices[1] = n1_new_end;
        //
        //forceDir2.vertices[0] = n2_new_start;
        //forceDir2.vertices[1] = n2_new_end;
    
        //forceDir1.verticesNeedUpdate = true;
        //forceDir2.verticesNeedUpdate = true;





    }
    

}

function render() {  // runs at 60 fps... 

    
    stats.begin();
       
    // monitored code begin


    //updateDebuggingVis();

    
    var tke = sheet.verletStep(TIME_ONE_FRAME);

    
    renderer.render( scene, camera );

    // monitored code end

    // Iterate over all controllers on the GUI (specifically for KE) 
    for (var i in gui.__controllers) {
      gui.__controllers[i].updateDisplay();
    }

    stats.end();


    //TODO uncomment when rendering correctly
    requestAnimationFrame( render );

	
}



function onWindowResize() {

    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize( window.innerWidth, window.innerHeight );

}


 

