
// function for defining a THREE.parametricGeometry

function plane( width, height) {

	return function( u, v ) {

		var x = ( u ) * width;
		var y = 0;
		var z = ( v ) * height;

		return new THREE.Vector3( x, y, z );

	};

}


// sheet class contains:
// (1)  sheet GEOMETRY: how the sheet is displayed via three.js
// (2)  sheet MODEL: how the forces are modeled (particle system, 
// (3)  
// (4)


class sheet {

    /***********************
     object constructor
    ***********************/

    // PARTICLES PER EDGE = DIVISION + 1 !!!!!!!!
  
    constructor( width, height, mass, division, sheetModel ) {

        this.w = width;
        this.h = height;
        this.d = division;

        // default no max stretch
        this.max_strain_enabled = false;
        this.max_strain_amount = 0;

        this.modelType = sheetModel; 

        // if starting off flat 
        
        // create the geometry which will be rendered 
        this.sheetGeometry = new THREE.ParametricBufferGeometry( plane(width,height), division, division);
        this.sheetGeometry.dynamic = true;
        
        // Adding color attribute to vertices
        var color = new Float32Array(this.sheetGeometry.attributes.position.array.length);
        for(var i in color) color[i] = 1.0
        this.sheetGeometry.addAttribute( 'color', new THREE.BufferAttribute (color, 3));


        // create the particles that the simulation will actually act on
        var particles_per_edge = division + 1; 
        
        this.num_particles = particles_per_edge * particles_per_edge;
        
        var m = mass ; 

        // TODO: all particles have same mass
        // TODO: ideally, ones at the edges weigh less
        
        // material can only 
        
        // where will the sheet be held

        // forces array should live in the sheetModel, don't know how it will be implemented

        // initialize the appropriate sheet model


        switch( sheetModel ) {

            case "particle":
                
                this.model = new sheetParticleModel(width, height, particles_per_edge, m/this.num_particles);
                this.model.constrain_corners(); 
                this.model.enableMaxStrain( MAX_STRAIN );
               
                break;

            case "simpleContinuum":
                this.model = new sheetSimpleContinuumModel(width, height, particles_per_edge, m);


                break;

            case "CauchyGreen":

                // let's get fancy

                break;

            default:

                console.error( "That sheet material model is not supported" );

        }

    
        
    }



    /***********************
     update the simulation 
    ***********************/

    step( timeStep, solver ) {
    
        // update the forces 
        
        this.model.clearForce();
        this.model.getYoShitTogether();
        
        if (GRAVITY_EN) {
            this.model.applyGravityForce();
        }

        this.model.applyGlobalDampeningForce();
        this.model.applyForceObjects(); 
        
       
        // solve the system 
        switch(solver) {

            case "implicit":
                // don't have one yet; 
                break;
            case "explicit":
                this.model.totalKE = explicitSolver( this.model, timeStep );
                break;
            case "verlet":
                this.model.totalKE = verletSolver( this.model, timeStep, this.modelType );
                break;
            default:
                console.log( "that solver is not supported" );

        }


        // strain limiting for the particle model
        if ( this.modelType === 'particle' ) {
            
            if ( ENFORCE_MAX_STRAIN ) {

                this.model.enforceMaxStrainDumb( MAX_STRAIN );

            }

        }
        
        
        // sync the model state with the state of the displayed geometry
        this.synchModel2Geometry();

    }


    /***************************
    * synchronize particle state
    * to sheet display
    ****************************/

    synchModel2Geometry() {
        // position update 
        this.sheetGeometry.attributes.position.array = new Float32Array(this.model.x_list)
        this.sheetGeometry.attributes.position.needsUpdate = true;
        // color update
        this.sheetGeometry.attributes.color.array = new Float32Array(this.model.x_list.slice(0))
        this.sheetGeometry.attributes.color.needsUpdate = true;
    }

  } // end sheet class
