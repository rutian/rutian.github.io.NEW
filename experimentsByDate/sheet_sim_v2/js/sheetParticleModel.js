// particle system specifically for holding onto list of particles in cloth simulation
// meant to work in conjuction with the sheet geometry

// always even spacing in x and y for regular mesh

class sheetParticleModel{ 

    constructor( width, height, particlesPerEdge, massPerParticle ) {
        
        this.n = particlesPerEdge * particlesPerEdge;
        
        this.x_list = []; // array that will hold all of the positions
        this.x_prev_list = []; // array of previous locations (used in verlet;
        this.v_list = []; // array for velocities
        this.f_list = []; // array for force accumulator 
        this.m_list = []; // masses 
        this.fixed_list = []; // boolean isfixed

        this.w = width;  // physical dimensions
        this.h = height;
        this.s = particlesPerEdge; // discretization
        this.d = this.s - 1; 
        var row, col; // indices for 2D
        var x, y;     // locations in world/

        this.num_particles = this.s * this.s;

        // create array of force objects which will act on particles 
        this.forces = [];


        // track the kinetic energy of the system    
        this.totalKE= 0;

       // initialize position, velocity, forces
        
        for ( var i = 0; i < this.n; i++ ) {

            // init positions
            row = Math.floor( i / particlesPerEdge);
            col = i % particlesPerEdge;
    
            x = col/( particlesPerEdge - 1 ) * width;
            y = row/( particlesPerEdge - 1 )  * height;
            
            // y is pointed up (cloth needs to be on xz plane)
            this.x_list.push( x, 0, y );
            this.x_prev_list.push( x, 0, y ); 

            // init velocities, forces, masses
            this.v_list.push( 0, 0, 0 );
            this.f_list.push( 0, 0, 0 );
            this.m_list.push( massPerParticle ); 
            this.fixed_list.push(false);

        }



       
        // SET UP ITS SPRINGS
        this.addEdgeSprings( PARTICLE_SPRING_KS, PARTICLE_SPRING_KD ); 
        this.addDiagonalSprings( PARTICLE_SPRING_KS, PARTICLE_SPRING_KD );  



    }



    // handle any updates that need to happen before the next iteration of the integration

    getYoShitTogether() {

        // nothing for particle system yet..

    }
    

    // apply gravity force to the particle system

    applyGravityForce() {

         // canned gravity force gets applied first
       
        for ( var i = 0; i < this.n ; i++ ) {

            this.f_list[i*3 + 1] = this.m_list[i] * GRAVITY;

        }

    }

    
    // global dampening, irrespective of where the force objects are pointing
    
    applyGlobalDampeningForce() {


      for ( var i = 0; i < this.n ; i++ ) {

            // get the velocity for each particle 
            this.f_list[i*3 + 0] += -1 * this.v_list[i*3 + 0] * GLOBAL_D; 
            this.f_list[i*3 + 1] += -1 * this.v_list[i*3 + 1] * GLOBAL_D; 
            this.f_list[i*3 + 2] += -1 * this.v_list[i*3 + 2] * GLOBAL_D; 

        }

    }

   
    applyForceObjects() {
        
        for ( var i = 0; i < this.forces.length ; i++ ) {

            this.forces[i].applyForce( this );

        }

    }
        
    // create force objects for edge springs, and put them into the sheet object.
    // only the vertical and horizontal ones for now
    
    addEdgeSprings( ks, kd ) {

        // rest length from the geometry of the cloth
        // cloth should always be square, not currently enforced 
        var rl = this.w / this.d; 
        
        var last_row_start_index = this.num_particles - this.d - 1;

        var particles_per_edge = this.d + 1;
        
        var spring;

        // add some springs please. the last particle will have it's springs added by neighbors
        for ( var i = 0; i < this.num_particles - 1; i++ ) {


            if ( i % (this.d + 1) === this.d ) {

                // in the last column, only connect downward
                spring = new force_EdgeSpring( i, i + particles_per_edge , rl, ks, kd );                
                this.forces.push(spring); 

            } else if ( i >=  last_row_start_index ) {

                // in the last row
                spring = new force_EdgeSpring( i, i + 1, rl, ks, kd );                
                this.forces.push(spring); 

            } else {

                // normal scenario
                spring = new force_EdgeSpring( i, i + 1, rl, ks, kd );   // to the right
                this.forces.push(spring); 
                spring = new force_EdgeSpring( i, i + particles_per_edge , rl, ks, kd );  // add down
                this.forces.push(spring); 

            }

        }

    }



    
    // add diagonal springs in both directions

    addDiagonalSprings( ks, kd ) {
   
        var rl = this.w / this.d * SQRT2; 
        var last_row_start_index = this.num_particles - this.d - 1;
        var particles_per_edge = this.d + 1;
        
        var spring;


        for ( var i = 0; i < last_row_start_index; i ++ ) {

            if ( i % particles_per_edge === 0   ) { 

                // in first column

                spring = new force_EdgeSpring( i, i + particles_per_edge + 1 , rl, ks, kd );  
                this.forces.push(spring);

            } else if ( i % (this.d + 1) === this.d ) {

                // in last column
                spring = new force_EdgeSpring( i, i + particles_per_edge - 1 , rl, ks, kd );  
                this.forces.push(spring);

            } else   {
                
                // all other

                spring = new force_EdgeSpring( i, i + particles_per_edge + 1 , rl, ks, kd );  
                this.forces.push(spring);
                spring = new force_EdgeSpring( i, i + particles_per_edge - 1 , rl, ks, kd );  
                this.forces.push(spring);

            }

        }

    } // end add diagonla Spring


    // enable max stretch

    enableMaxStrain( strain ) {
        this.max_strain_enabled = true;
        this.max_strain_amount = strain;
    }






    // set the masses more sensibly by weighting 
    // based on adjacent triangles
     
    set_mass_weighted(m) {

        for ( var i = 0; i < this.n ; i++ ) {
            
            //TODO
            //this.m_list = m;
        }    

    }

    // clear all forces // TODO: properly implement with inheritance
 
    clearForce() {
        
        for ( var i = 0; i < this.f_list.length ; i++ ) {
            
            this.f_list[i] = 0;

        }

    }


    // fix all four corners

    constrain_corners() {

        this.fixed_list[0] = true; 
        this.fixed_list[this.fixed_list.length - 1] = true;

        this.fixed_list[this.s - 1] = true; 
        this.fixed_list[this.fixed_list.length  - this.s] = true;

    }


    // 



    /*****************************
    // test method for updating the cloth, only perturb geometry,
    // not the particles
   *******************************/

    perturb(time) {

        //console.log('yolo');


        var l = this.sheetGeometry.vertices.length;
        
        for ( var i = 0; i < l; i++ ) {
            var y = this.sheetGeometry.vertices[i].getComponent(1);
            y += ( Math.random() - 0.5 ) / 20;
            
            if ( y > 3 ) {
                y = 3;
            } else if ( y < -3 ) {
                y = -3; 
            }
           
            this.sheetGeometry.vertices[i].setComponent( 1, y );

        }
    

        this.sheetGeometry.verticesNeedUpdate = true;
    }



  
    // help make more stable by making sure the
    // particles don't exceed a max strain (along the direction of the spring/forces)
    // brute force, not choosing smartly which particle to move

    enforceMaxStrainDumb( maxStrain ) {

   
        // iterate through all the forces, this is the direction of the springs 

        var ind_a = 0;
        var ind_b = 0;
        var rl = 0; // rest length
        var d = 0;  // current distance
        var ab_norm_vector = [0,0,0]; // normalized vector from a to b
        
        var bPosMod= [0,0,0];
        var aPosMod= [0,0,0];
        
        
        for ( var i = 0; i < this.forces.length; i++ ) {

            // get position of the two particles
            ind_a = this.forces[i].ia * 3;
            ind_b = this.forces[i].ib * 3;
           
             
            rl = this.forces[i].l;

            // calculate the distance and vector between them
           
            d = positionArrayDist( this.x_list, ind_a, ind_b ) ;

            var need_fix = Math.abs( d - rl ) > (maxStrain * rl); 
           
            if ( need_fix) {

                var newl = 0; // new length that we want between a to b
                var correction = 0; // correction for b's current location

                if ( d > rl ) {
                    
                    newl = ( maxStrain + 1) * rl;
                    correction = d - newl;

                } else if ( d < rl) {

                    newl = ( 1 - maxStrain ) * rl;
                    correction =  d - newl;
                    
                }

                // only if the particle is free to move

                var a_free = ! this.fixed_list[ind_a/3] ;
                var b_free = ! this.fixed_list[ind_b/3] ;
                
                ab_norm_vector = positionArrayNormVector( this.x_list, ind_a, ind_b );

                if ( a_free && b_free ) {
                    
                    maccumulate3( this.x_list, ind_a, ab_norm_vector, correction/2 );
                    maccumulate3( this.x_list, ind_b, ab_norm_vector, -1 * correction/2 );


                } else if ( a_free ) {

                    maccumulate3( this.x_list, ind_a, ab_norm_vector, correction);

                } else if ( b_free ) {
                    
                    maccumulate3( this.x_list, ind_b, ab_norm_vector, -1 * correction);

                }  // else don't move anything





           } // end if need fix

        } // 
    
    } // end enforce max strian





}
