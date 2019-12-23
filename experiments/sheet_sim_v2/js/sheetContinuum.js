// full continuum sheet model yo!!! that shit cray...

// slightly different setup from the other sheet models
// stores everything ( geometry + model info ) with BufferGeometryObject


var YOUNGS = 100;  // Young's Modulus
var NU = 0.5; // Poisson's ratio




class sheetContinuumModel{ 
    
    constructor( unstructuredMesh, density, thickness ) { // density per unit area


        // info about model
       
        this.totalKE = 0;
        this.modelType = 'St. Venant-Kirschhoff';
        this.solver = 'Verlet';

 
        // VERTICES 

        var numVertices  = unstructuredMesh.vertices.length/2 ; // remove the bounding box (from matlab code)         
        this.n = numVertices; // take out the bounding box
        
        this.vertices = new Float32Array( numVertices * 3 ); // this is like our xlist
        this.vertices_prev = new Float32Array( numVertices * 3); // xprevlist

        // go from 2D to 3D vertices
        for ( var i = 0 ; i < numVertices ; i++ ) {
            
            this.vertices[i*3] = unstructuredMesh.vertices[i*2];
            this.vertices_prev[i*3] = unstructuredMesh.vertices[i*2];
            // y is zero
            this.vertices[i*3+2] = unstructuredMesh.vertices[i*2 + 1];
            this.vertices_prev[i*3+2] = unstructuredMesh.vertices[i*2 + 1];
        
        }

           
        // FORCE ACCUMULATORS 
 
        this.f_int_inplane  = new Float32Array( numVertices * 3 );  // sheet internal forces ( shear and stretch ) 
        this.f_int_outplane = new Float32Array( numVertices * 3 );  // sheet internal bending
        this.f_ext          = new Float32Array( numVertices * 3 );  // all external forces

        // FORCE OBJECT ARRAYS

        this.triangleForceObjects = []; 
        this.edgeForceObjects = [];

        // STATE

        this.mass = new Float32Array(numVertices * 1);
        this.v    = new Float32Array(numVertices * 3); // velocity
        this.vp   = new Float32Array(numVertices * 3); // previous velocity

        // FIXED VERTICES - fix all on boundary for now 

        this.fixed_list = new Uint8Array( numVertices * 3 );
        var numFixed = unstructuredMesh.fixedPoints.length; 

        for ( var i = 0; i < numFixed; i ++ ) {

            var fixedPointIndex = 3 * unstructuredMesh.fixedPoints[i];
            this.fixed_list[fixedPointIndex + 0] = 1;
            this.fixed_list[fixedPointIndex + 1] = 1;
            this.fixed_list[fixedPointIndex + 2] = 1;

        }  


        // TRIANGLES AND NORMALS (GEOMETRY)
    
        this.numTriangles = unstructuredMesh.triangles.length / 3; 
        console.log(this.n); 
        console.log(this.numTriangles); 
 

        // indices is for buffer geometry to render... 
        this.indices = new Uint32Array(this.numTriangles * 3);// unstructuredMesh.triangles;

        for ( var i = 0; i < this.numTriangles; i ++ ) {
        
            // point A
            this.indices[i * 3 + 0] = unstructuredMesh.triangles[i * 3]; // 
            this.indices[i * 3 + 1] = unstructuredMesh.triangles[i * 3 + 1];
            this.indices[i * 3 + 2] = unstructuredMesh.triangles[i * 3 + 2];

        }
       
        // INITIALIZE TRIANGLE OBJECTS


        var currTriangle;
        var ti = 0;
        var tj = 0;
        var tk = 0; 
        var thirdMass = 0; // 1/3 of the triangle's mass

        for (var i = 0; i < this.numTriangles; i++ ) {
       
            ti = unstructuredMesh.triangles[i * 3]; 
            tj = unstructuredMesh.triangles[i * 3 + 1];
            tk = unstructuredMesh.triangles[i * 3 +2 ];
            currTriangle = new ContinuumTriangle( this.vertices, ti, tj, tk, density, thickness  );
            
            // accumulate the mass
            
            thirdMass = currTriangle.mass / 3;
            this.mass[ti] = thirdMass;
            this.mass[tj] = thirdMass;
            this.mass[tk] = thirdMass;

            this.triangleForceObjects.push( currTriangle );

        }



        // DONT FORGET THE MASS of the vertices in the bounding box

        for ( var i = 0; i < this.mass.length; i ++ ) {

            if ( this.mass[i] === 0 ) {

                this.mass[i] = Number.POSITIVE_INFINITY; 

            }   

        }



        // loop through the triangles, accumulate third of mass into each
       
        // INITIALIZE THE BUFFER GEOMETRY
    
        this.geometry = new THREE.BufferGeometry();

        this.geometry.addAttribute( 'position', new THREE.BufferAttribute( this.vertices, 3 ) );
        this.geometry.setIndex( new THREE.BufferAttribute( this.indices, 1 ) ); // TODO doesn't this.indices, 3 make more sense? ????


        this.geometry.dynamic = true;

        // CREATE THE THREE.js OBJECT THAT WILL BE RENDERED

        var material = new THREE.MeshBasicMaterial( { color: 0xf99820} ); // orange yo
        material.wireframe = true;
        this.mesh = new THREE.Mesh( this.geometry, material );  // mesh can be added to scene; combo material and geometry









        // TODO: INITIALIZE EDGE OBJECTS/forces



        







        



    }


    clearForces() {

        for ( var i = 0; i < this.n * 3; i += 3 ) {

            // a little unrolling

            this.f_int_inplane[i]  = 0;
            this.f_int_inplane[i+1]  = 0;
            this.f_int_inplane[i+2]  = 0;

            this.f_int_outplane[i] = 0;
            this.f_int_outplane[i+1] = 0;
            this.f_int_outplane[i+2] = 0;

            this.f_ext[i] = 0;
            this.f_ext[i+1] = 0;
            this.f_ext[i+2] = 0;

        }

    }


    getYoShitTogether() {
    
    }



    applyPressure(){
        
        var cur_tri;
        var normal;
        var force = [0,0,0];
        var forceMagnitude = 0; 

        for (var i = 0; i < this.numTriangles; i ++ ) {

            // p = f/a; p*a = f
            cur_tri = this.triangleForceObjects[i];
            normal = cur_tri.normal;
            forceMagnitude = cur_tri.area * PRESSURE; 
    
            // project the force onto normal
            force =  scalar_mult( forceMagnitude / 3, normal ); // for one third of the force
            accumulate3( this.f_ext, cur_tri.pindexI * 3  , force); // for offset
            accumulate3( this.f_ext, cur_tri.pindexJ * 3  , force); // for offset
            accumulate3( this.f_ext, cur_tri.pindexK * 3  , force); // for offset


        }
    }


    applyGravity(){ 

        if (GRAVITY_EN) {

            for (var i = 0; i < this.n; i ++ ) {

                if (Number.isFinite(this.mass[i])) { // bonus verices of the bounding box were assigned infinite mass

                    this.f_ext[i*3 + 1] = GRAVITY * this.mass[i]; 

                }
            }
        }
    }

   
    // internal stresses from the strains

    applyInternalForces() {
       
        for (var i = 0; i < sheet.triangleForceObjects.length; i ++ ) {

            sheet.triangleForceObjects[i].applyForce(this.f_int_inplane); 

        } 

        // TODO gotta do the edges too


    } 
    // take a verlet step
    verletStep( timestep ) {

        //update all forces and params before doing anything

        this.updateTriangleParams(); // update the normals/areas/partialDerivs/etc

        // after last function, normals/areas/thickness, strain, and strain derivatives are up-to-date

        this.clearForces();
        this.applyGravity();
        this.applyPressure(); 
        

        this.applyInternalForces(); // strains and stuff
        

 
        var tke = 0;
    
        var a, mass, x_curr, x_prev, x_next;
    
        for ( var i = 0; i < this.f_ext.length; i++ ) {
    
            // retrieve the unpadded stuff
            mass = this.mass[ Math.floor(i / 3) ];
    
            // componentwise accel and position
            a = (this.f_ext[i] + this.f_int_inplane[i] + this.f_int_outplane[i]) / mass;
    
    
            x_curr = this.vertices[i];
            x_prev = this.vertices_prev[i];
    
            // verlet integration step
            x_next = 2 * x_curr - x_prev + a * timestep * timestep ; 
    
            // update only if not fixed
    
            if ( ! this.fixed_list[i] ) {
    
                this.vertices[i] = x_next;
                this.vertices_prev[i] = x_curr;

                this.v[i] = ( x_next - x_curr ) / timestep; 

            }
           
            // kinetic energy stunt double 
   
            if ( Number.isFinite(mass) ) { // again, for the infinite massed particles at the edges
 
                var v = this.v[i]; 
                tke += mass * v * v; 

            }
    
        }
   
        this.geometry.attributes.position.needsUpdate = true;

        this.totalKE = tke;

    }




    implicitStep( timestep ) {


        //TODO but ain't nobody got time for dat


    }



    // update normal/area/thickness etc
    updateTriangleParams() {

        for ( var i = 0; i < this.numTriangles; i ++ ) {

            this.triangleForceObjects[i].updateNormalAreaThickness();
            this.triangleForceObjects[i].updateStrain();
            this.triangleForceObjects[i].updateStrainDerivs(); 
        }

    }

}



