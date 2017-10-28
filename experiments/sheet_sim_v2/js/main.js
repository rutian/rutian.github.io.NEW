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
   
    // (width, height, mass, division, modelType 
    test_sheet = new sheet( 20, 20, 80, 4, "simpleContinuum" );
    
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
    gui = new dat.GUI();
    gui.add( test_sheet.model, 'totalKE' );
    gui.add( test_sheet, 'modelType' );
    gui.add(this, 'GLOBAL_REST_ANGLE', -PI/2, PI/2).step(.2); // Min and max
    gui.add(this, 'BEND_SPRING_KS', 0, 1500);
    gui.add(this, 'BEND_SPRING_KD_RATIO', 0, 1);
    gui.add(this, 'STRETCH_SPRING_KS', 0, 100);
    gui.add(this, 'SHEAR_SPRING_KS', 0, 100);
    gui.add(this, 'GRAVITY_EN');
    gui.add(this, 'INPLANE_FORCE_VIEW_EN');
    gui.add(this, 'OUTPLANE_FORCE_VIEW_EN');


    // get some testing for the bending forces


    // initialize some force vector visualiztions


    var inPlaneLineMaterial  = new THREE.LineBasicMaterial({ color: 0x000000 });
    var outPlaneLineMaterial = new THREE.LineBasicMaterial({ color: 0x00ff00 });


    inPlaneForceVectorGeometry  = new THREE.Geometry();
    outPlaneForceVectorGeometry = new THREE.Geometry();

    var j_unit= new THREE.Vector3(0,1,0);

    for ( var i = 0; i < test_sheet.model.n; i ++ ) {
         
        var lineStart = new THREE.Vector3(0,0,0);
        var lineEnd   = new THREE.Vector3(0,0,0); 

        lineStart.fromArray(test_sheet.model.x_list, i * 3);
        lineEnd.fromArray(test_sheet.model.x_list, i * 3);
        lineEnd.add(j_unit);

        outPlaneForceVectorGeometry.vertices.push(lineStart);
        outPlaneForceVectorGeometry.vertices.push(lineEnd);
    
        inPlaneForceVectorGeometry.vertices.push(lineStart); // both start at same place
        inPlaneForceVectorGeometry.vertices.push(lineEnd); 
        

    } 

    outPlaneForceVectors = new THREE.LineSegments(outPlaneForceVectorGeometry, outPlaneLineMaterial);
    scene.add(outPlaneForceVectors); 


    inPlaneForceVectors = new THREE.LineSegments(inPlaneForceVectorGeometry, inPlaneLineMaterial);
    scene.add(inPlaneForceVectors);

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


    updateDebuggingVis();

    
    test_sheet.step(TIME_ONE_FRAME, 'verlet');

    
    renderer.render( scene, camera );

    // monitored code end

    // Iterate over all controllers on the GUI
    for (var i in gui.__controllers) {
      gui.__controllers[i].updateDisplay();
    }

    stats.end();

    requestAnimationFrame( render );

	
}



function onWindowResize() {

    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize( window.innerWidth, window.innerHeight );

}


 
